// =========================================================
// GYTO SUCCESS COMPANY – Database (Supabase Cloud + localStorage fallback)
// All form submissions and reviews save to Supabase cloud.
// localStorage used as backup when offline.
// =========================================================

// ── Supabase credentials ───────────────────────────────────
const SUPABASE_URL = 'https://grafsrwktvhqywxituff.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oHQalxyhWJ8aviDTK257Ug_CgELDRIf';

// ── Supabase REST helper ───────────────────────────────────
// Lightweight fetch wrapper — no SDK needed
async function _sbInsert(table, data) {
  try {
    const res = await fetch(SUPABASE_URL + '/rest/v1/' + table, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Prefer':        'return=minimal'
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.text();
      console.warn('[Supabase] Insert failed:', err);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('[Supabase] Network error:', e.message);
    return false;
  }
}

async function _sbSelect(table, orderBy) {
  try {
    const url = SUPABASE_URL + '/rest/v1/' + table +
                '?order=' + (orderBy || 'created_at.desc');
    const res = await fetch(url, {
      headers: {
        'apikey':        SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY
      }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.warn('[Supabase] Fetch error:', e.message);
    return null;
  }
}

// ── localStorage helpers (offline fallback) ────────────────
const LS_KEYS = {
  enquiries:    'gyto_enquiries',
  applications: 'gyto_applications',
  counter:      'gyto_id_counter'
};

function _lsLoad(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch (e) { return []; }
}

function _lsSave(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function _nextId() {
  let n = parseInt(localStorage.getItem(LS_KEYS.counter) || '1000', 10);
  n++;
  localStorage.setItem(LS_KEYS.counter, n);
  return 'GYTO-' + n;
}

function _timestamp() {
  return new Date().toISOString();
}

// ================================================================
// GYTODB — Enquiries & Applications
// ================================================================
const GYTODB = (function () {

  // ── Save enquiry ─────────────────────────────────────────
  async function saveEnquiry(data) {
    const id     = _nextId();
    const record = {
      id,
      first_name: data.firstName || '',
      last_name:  data.lastName  || '',
      email:      data.email     || '',
      phone:      data.phone     || '',
      company:    data.company   || '',
      service:    data.service   || '',
      message:    data.message   || '',
      status:     'new',
      created_at: _timestamp()
    };

    // Save to Supabase
    const ok = await _sbInsert('enquiries', record);
    if (ok) {
      console.info('[GYTO DB] Enquiry saved to Supabase:', id);
    } else {
      // Fallback to localStorage
      const records = _lsLoad(LS_KEYS.enquiries);
      records.unshift(record);
      _lsSave(LS_KEYS.enquiries, records);
      console.info('[GYTO DB] Enquiry saved to localStorage (offline):', id);
    }
    return id;
  }

  // ── Save application ─────────────────────────────────────
  async function saveApplication(data) {
    const id     = _nextId();
    const record = {
      id,
      first_name:  data.firstName  || '',
      last_name:   data.lastName   || '',
      email:       data.email      || '',
      phone:       data.phone      || '',
      ref1_name:   data.ref1Name   || '',
      ref1_phone:  data.ref1Phone  || '',
      ref2_name:   data.ref2Name   || '',
      ref2_phone:  data.ref2Phone  || '',
      nok1_name:   data.nok1Name   || '',
      nok1_phone:  data.nok1Phone  || '',
      nok2_name:   data.nok2Name   || '',
      nok2_phone:  data.nok2Phone  || '',
      status:      'new',
      created_at:  _timestamp()
    };

    const ok = await _sbInsert('applications', record);
    if (ok) {
      console.info('[GYTO DB] Application saved to Supabase:', id);
    } else {
      const records = _lsLoad(LS_KEYS.applications);
      records.unshift(record);
      _lsSave(LS_KEYS.applications, records);
      console.info('[GYTO DB] Application saved to localStorage (offline):', id);
    }
    return id;
  }

  // ── Get records (from localStorage for admin dashboard) ──
  function getEnquiries()    { return _lsLoad(LS_KEYS.enquiries);    }
  function getApplications() { return _lsLoad(LS_KEYS.applications); }

  function updateStatus(type, id, status) {
    const key     = type === 'enquiry' ? LS_KEYS.enquiries : LS_KEYS.applications;
    const records = _lsLoad(key);
    const idx     = records.findIndex(r => r.id === id);
    if (idx > -1) {
      records[idx].status    = status;
      records[idx].updatedAt = _timestamp();
      _lsSave(key, records);
    }
  }

  function deleteRecord(type, id) {
    const key = type === 'enquiry' ? LS_KEYS.enquiries : LS_KEYS.applications;
    _lsSave(key, _lsLoad(key).filter(r => r.id !== id));
  }

  function exportAll() {
    const payload = {
      exportedAt:   _timestamp(),
      enquiries:    _lsLoad(LS_KEYS.enquiries),
      applications: _lsLoad(LS_KEYS.applications)
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'gyto-database-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportCSV(type) {
    const records = type === 'enquiry'
      ? _lsLoad(LS_KEYS.enquiries)
      : _lsLoad(LS_KEYS.applications);
    if (!records.length) return alert('No records to export.');
    const headers = Object.keys(records[0]);
    const rows    = records.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','));
    const csv     = [headers.join(','), ...rows].join('\n');
    const blob    = new Blob([csv], { type: 'text/csv' });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement('a');
    a.href        = url;
    a.download    = 'gyto-' + type + 's-' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function countNew(type) {
    const records = type === 'enquiry'
      ? _lsLoad(LS_KEYS.enquiries)
      : _lsLoad(LS_KEYS.applications);
    return records.filter(r => r.status === 'new').length;
  }

  return {
    saveEnquiry,
    saveApplication,
    getEnquiries,
    getApplications,
    updateStatus,
    deleteRecord,
    exportAll,
    exportCSV,
    countNew,
    saveReview:    async () => {},
    getReviews:    () => [],
    deleteReview:  () => {},
    getReviewStats: () => ({ avg: 0, total: 0, fiveStar: 0 })
  };

})();

// ================================================================
// GYTOREVIEWSDB — Public Reviews (Supabase cloud)
// ================================================================
const GYTOREVIEWSDB = (function () {

  const LS_KEY = 'gyto_reviews';

  function _lsLoadR() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
    catch (e) { return []; }
  }

  function _nextRevId() {
    let n = parseInt(localStorage.getItem('gyto_review_counter') || '2000', 10);
    n++;
    localStorage.setItem('gyto_review_counter', n);
    return 'REV-' + n;
  }

  // ── Save review to Supabase ───────────────────────────────
  async function saveReview(data) {
    const id     = _nextRevId();
    const record = {
      id,
      name:       data.name    || 'Anonymous',
      company:    data.company || '',
      service:    data.service || '',
      rating:     parseInt(data.rating) || 5,
      text:       data.text    || '',
      created_at: new Date().toISOString()
    };

    const ok = await _sbInsert('reviews', record);
    if (ok) {
      console.info('[GYTO Reviews] Saved to Supabase:', id);
    } else {
      // Offline fallback
      const reviews = _lsLoadR();
      reviews.unshift(record);
      localStorage.setItem(LS_KEY, JSON.stringify(reviews));
      console.info('[GYTO Reviews] Saved to localStorage (offline):', id);
    }
    return id;
  }

  // ── Load reviews from Supabase (live, all devices see them) ─
  async function getReviews() {
    const cloud = await _sbSelect('reviews', 'created_at.desc');
    if (cloud && cloud.length >= 0) {
      // Merge with any offline reviews
      const offline = _lsLoadR();
      const cloudIds = new Set(cloud.map(r => r.id));
      const merged   = [...cloud, ...offline.filter(r => !cloudIds.has(r.id))];
      return merged;
    }
    // Fallback to localStorage if offline
    return _lsLoadR();
  }

  function deleteReview(id) {
    const reviews = _lsLoadR().filter(r => r.id !== id);
    localStorage.setItem(LS_KEY, JSON.stringify(reviews));
  }

  async function getReviewStats() {
    const reviews = await getReviews();
    if (!reviews.length) return { avg: 0, total: 0, fiveStar: 0 };
    const total    = reviews.length;
    const fiveStar = reviews.filter(r => parseInt(r.rating) === 5).length;
    const sum      = reviews.reduce((acc, r) => acc + parseInt(r.rating || 0), 0);
    const avg      = (sum / total).toFixed(1);
    return { avg, total, fiveStar };
  }

  return { saveReview, getReviews, deleteReview, getReviewStats };

})();
