// =========================================
// GYTO SUCCESS COMPANY - Main JavaScript
// =========================================

// ── Cross-browser polyfills (run before DOMContentLoaded) ──────

// 1. Smooth-scroll polyfill for Safari < 15.4 and older Android
//    Native scroll-behavior: smooth is CSS-only and unsupported
//    in Safari until 15.4. This JS version works on all browsers.
(function () {
  if ('scrollBehavior' in document.documentElement.style) return; // already supported
  // Polyfill window.scrollTo with { behavior: 'smooth' }
  var _scrollTo = window.scrollTo;
  window.scrollTo = function (xOrOptions, y) {
    if (typeof xOrOptions === 'object' && xOrOptions.behavior === 'smooth') {
      var targetY = xOrOptions.top !== undefined ? xOrOptions.top : (xOrOptions.y || 0);
      var start   = window.pageYOffset;
      var change  = targetY - start;
      var duration = 500;
      var startTime = null;
      function easeInOut(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var elapsed  = timestamp - startTime;
        var progress = Math.min(elapsed / duration, 1);
        window.scrollBy(0, change * easeInOut(progress) - (window.pageYOffset - start));
        if (elapsed < duration) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    } else {
      _scrollTo.apply(window, arguments);
    }
  };
  // Polyfill anchor smooth scroll
  document.addEventListener('click', function (e) {
    var el = e.target.closest('a[href^="#"]');
    if (!el) return;
    var id = el.getAttribute('href').slice(1);
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    var top = target.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top: top, behavior: 'smooth' });
  });
})();

// 2. requestAnimationFrame polyfill (IE 9, very old Android)
(function () {
  var lastTime = 0;
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback) {
      var now  = Date.now();
      var wait = Math.max(0, 16 - (now - lastTime));
      lastTime = now + wait;
      return setTimeout(function () { callback(now + wait); }, wait);
    };
    window.cancelAnimationFrame = clearTimeout;
  }
})();

// 3. Element.closest polyfill (IE 11)
if (!Element.prototype.closest) {
  Element.prototype.closest = function (selector) {
    var el = this;
    while (el && el.nodeType === 1) {
      if (el.matches ? el.matches(selector) : el.msMatchesSelector(selector)) return el;
      el = el.parentElement || el.parentNode;
    }
    return null;
  };
}

// 4. NodeList.forEach polyfill (IE 11)
if (typeof NodeList !== 'undefined' && NodeList.prototype && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}

// ── Main site code ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {

  // --- Navbar scroll effect ---
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  // --- Mobile nav toggle ---
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu   = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      navMenu.classList.toggle('open');
    });
  }

  // --- Mobile dropdown toggle ---
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    const link     = item.querySelector('.nav-link');
    const dropdown = item.querySelector('.dropdown-menu');
    if (link && dropdown && window.innerWidth <= 768) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        item.classList.toggle('open');
      });
    }
  });

  // --- Active nav link ---
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) link.classList.add('active');
  });

  // --- Scroll to top ---
  const scrollBtn = document.querySelector('.scroll-top');
  if (scrollBtn) {
    window.addEventListener('scroll', () => {
      scrollBtn.classList.toggle('visible', window.scrollY > 300);
    });
    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Stat counter animation ---
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  if (statNumbers.length) {
    const countUp = (el) => {
      const target   = parseFloat(el.dataset.target);
      const suffix   = el.dataset.suffix || '';
      const prefix   = el.dataset.prefix || '';
      const duration = 1800;
      const step     = target / (duration / 16);
      let current    = 0;

      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = prefix + (Number.isInteger(target) ? Math.floor(current) : current.toFixed(1)) + suffix;
      }, 16);
    };

    // Guard: IntersectionObserver not available in IE11 / very old Android
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            countUp(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      statNumbers.forEach(el => observer.observe(el));
    } else {
      // Fallback: run counters immediately on page load
      statNumbers.forEach(el => countUp(el));
    }
  }

  // --- Fade-in on scroll (sections) ---
  const fadeEls = document.querySelectorAll(
    '.service-card, .sector-card, .mv-card, .value-card, .why-point, .contact-card, .tip-category, .about-features .feature-item'
  );

  if (fadeEls.length) {
    // Guard: IntersectionObserver not available in IE11 / very old Android
    if ('IntersectionObserver' in window) {
      const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.style.opacity   = '1';
              entry.target.style.transform = 'translateY(0)';
            }, i * 80);
            fadeObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      fadeEls.forEach(el => {
        el.style.opacity    = '0';
        el.style.transform  = 'translateY(24px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        fadeObserver.observe(el);
      });
    } else {
      // Fallback: show all elements immediately (no animation)
      fadeEls.forEach(el => {
        el.style.opacity   = '1';
        el.style.transform = 'none';
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // CONTACT FORM — save to database + open mailto to deliver email
  // ─────────────────────────────────────────────────────────────────
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const btn          = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      btn.innerHTML      = '<i class="fas fa-spinner fa-spin" style="margin-right:8px;"></i>Sending…';
      btn.disabled       = true;

      // Collect all field values
      const data = {
        firstName: contactForm.firstName.value.trim(),
        lastName:  contactForm.lastName.value.trim(),
        email:     contactForm.email.value.trim(),
        phone:     contactForm.phone.value.trim(),
        company:   contactForm.company.value.trim(),
        service:   contactForm.service.value,
        message:   contactForm.message.value.trim()
      };

      // 1️⃣  Save to local database
      let recordId = '';
      if (typeof GYTODB !== 'undefined') {
        recordId = GYTODB.saveEnquiry(data);
      }

      // 2️⃣  Build mailto: opens user's email client pre-filled,
      //     delivering the enquiry directly to the company inboxes
      const subject = encodeURIComponent(
        'Website Enquiry – ' + data.firstName + ' ' + data.lastName +
        (recordId ? ' [' + recordId + ']' : '')
      );
      const body = encodeURIComponent(
        'New enquiry submitted via the GYTO website.\n\n' +
        '-------------------------------------------\n' +
        'Reference ID : ' + (recordId || 'N/A') + '\n' +
        'Name         : ' + data.firstName + ' ' + data.lastName + '\n' +
        'Email        : ' + data.email + '\n' +
        'Phone        : ' + (data.phone   || 'Not provided') + '\n' +
        'Company      : ' + (data.company || 'Not provided') + '\n' +
        'Service      : ' + (data.service || 'General Enquiry') + '\n' +
        '-------------------------------------------\n\n' +
        'MESSAGE:\n' + data.message + '\n\n' +
        '-------------------------------------------\n' +
        'Submitted: ' + new Date().toLocaleString('en-KE') + '\n'
      );

      // Opens the mail client addressed to both inboxes
      window.location.href =
        'mailto:info@gytosecurity.co.ke,operations@gytosecurity.co.ke' +
        '?subject=' + subject + '&body=' + body;

      // 3️⃣  Update button to confirm
      setTimeout(() => {
        btn.innerHTML  = '<i class="fas fa-check" style="margin-right:8px;"></i>Message Sent!';
        btn.style.background = '#2d7a4f';
        contactForm.reset();

        setTimeout(() => {
          btn.innerHTML        = originalText;
          btn.disabled         = false;
          btn.style.background = '';
        }, 4000);
      }, 800);
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // RECRUITMENT FORM — save to database + open mailto to deliver email
  // ─────────────────────────────────────────────────────────────────
  const recruitForm = document.getElementById('recruitmentForm');
  if (recruitForm) {
    recruitForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const btn          = recruitForm.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      btn.innerHTML      = '<i class="fas fa-spinner fa-spin" style="margin-right:8px;"></i>Submitting…';
      btn.disabled       = true;

      // Collect text fields (file uploads stored as filenames)
      const fileField = (name) => {
        const el = recruitForm.querySelector('[name="' + name + '"]');
        return el && el.files && el.files[0] ? el.files[0].name : 'Not uploaded';
      };

      const data = {
        firstName:       recruitForm.firstName.value.trim(),
        lastName:        recruitForm.lastName.value.trim(),
        email:           recruitForm.email.value.trim(),
        phone:           recruitForm.phone.value.trim(),
        ref1Name:        recruitForm.ref1Name.value.trim(),
        ref1Phone:       recruitForm.ref1Phone.value.trim(),
        ref2Name:        recruitForm.ref2Name.value.trim(),
        ref2Phone:       recruitForm.ref2Phone.value.trim(),
        nok1Name:        recruitForm.nok1Name.value.trim(),
        nok1Phone:       recruitForm.nok1Phone.value.trim(),
        nok2Name:        recruitForm.nok2Name.value.trim(),
        nok2Phone:       recruitForm.nok2Phone.value.trim(),
        // File names only — binary blobs are not stored in localStorage
        photo:           fileField('photo'),
        nationalId:      fileField('nationalId'),
        kraPin:          fileField('kraPin'),
        nssf:            fileField('nssf'),
        nhif:            fileField('nhif'),
        bankAccount:     fileField('bankAccount'),
        applicationLetter: fileField('applicationLetter'),
        certificates:    fileField('certificates'),
        policeClearance: fileField('policeClearance'),
        medicalCert:     fileField('medicalCert'),
        chiefLetter:     fileField('chiefLetter'),
        sketchMap:       fileField('sketchMap'),
        ref1IdCopy:      fileField('ref1IdCopy'),
        ref1Letter:      fileField('ref1Letter'),
        ref2IdCopy:      fileField('ref2IdCopy'),
        ref2Letter:      fileField('ref2Letter'),
        nok1Id:          fileField('nok1Id'),
        nok2Id:          fileField('nok2Id')
      };

      // 1️⃣  Save to local database
      let recordId = '';
      if (typeof GYTODB !== 'undefined') {
        recordId = GYTODB.saveApplication(data);
      }

      // 2️⃣  Build mailto: opens mail client pre-filled to recruitment inbox
      const subject = encodeURIComponent(
        'Job Application – ' + data.firstName + ' ' + data.lastName +
        (recordId ? ' [' + recordId + ']' : '')
      );
      const body = encodeURIComponent(
        'New job application submitted via the GYTO website.\n\n' +
        '-------------------------------------------\n' +
        'Reference ID : ' + (recordId || 'N/A') + '\n' +
        'Name         : ' + data.firstName + ' ' + data.lastName + '\n' +
        'Email        : ' + data.email + '\n' +
        'Phone        : ' + data.phone + '\n' +
        '-------------------------------------------\n' +
        'REFEREE 1    : ' + data.ref1Name + ' – ' + data.ref1Phone + '\n' +
        'REFEREE 2    : ' + data.ref2Name + ' – ' + data.ref2Phone + '\n' +
        '-------------------------------------------\n' +
        'NEXT OF KIN 1: ' + data.nok1Name + ' – ' + data.nok1Phone + '\n' +
        'NEXT OF KIN 2: ' + data.nok2Name + ' – ' + data.nok2Phone + '\n' +
        '-------------------------------------------\n\n' +
        'DOCUMENTS ATTACHED (applicant to email separately):\n' +
        '  • Passport Photo      : ' + data.photo + '\n' +
        '  • National ID         : ' + data.nationalId + '\n' +
        '  • KRA PIN             : ' + data.kraPin + '\n' +
        '  • NSSF                : ' + data.nssf + '\n' +
        '  • NHIF                : ' + data.nhif + '\n' +
        '  • Bank Account        : ' + data.bankAccount + '\n' +
        '  • Application Letter  : ' + data.applicationLetter + '\n' +
        '  • Certificates        : ' + data.certificates + '\n' +
        '  • Police Clearance    : ' + data.policeClearance + '\n' +
        '  • Medical Certificate : ' + data.medicalCert + '\n' +
        '  • Chief Letter        : ' + data.chiefLetter + '\n' +
        '  • Sketch Map          : ' + data.sketchMap + '\n\n' +
        'Submitted: ' + new Date().toLocaleString('en-KE') + '\n'
      );

      window.location.href =
        'mailto:staffing@gytosecurity.co.ke,info@gytosecurity.co.ke' +
        '?subject=' + subject + '&body=' + body;

      // 3️⃣  Update button to confirm
      setTimeout(() => {
        btn.innerHTML        = '<i class="fas fa-check" style="margin-right:8px;"></i>Application Submitted!';
        btn.style.background = '#2d7a4f';

        setTimeout(() => {
          btn.innerHTML        = originalText;
          btn.disabled         = false;
          btn.style.background = '';
          recruitForm.reset();
        }, 5000);
      }, 800);
    });
  }

  // --- File input labels ---
  document.querySelectorAll('.file-upload-area input[type="file"]').forEach(input => {
    input.addEventListener('change', function () {
      const label = this.closest('.file-upload-area').querySelector('p');
      if (label && this.files.length) {
        label.textContent = this.files[0].name;
      }
    });
  });

  // ================================================================
  // REVIEWS — load, display & submit
  // ================================================================

  function starsHTML(n) {
    const full  = Math.round(n);
    let   html  = '';
    for (let i = 1; i <= 5; i++) html += i <= full ? '★' : '☆';
    return html;
  }

  function timeAgo(iso) {
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 60)      return 'Just now';
    if (diff < 3600)    return Math.floor(diff / 60)   + ' min ago';
    if (diff < 86400)   return Math.floor(diff / 3600) + ' hrs ago';
    if (diff < 2592000) return Math.floor(diff / 86400)+ ' days ago';
    return new Date(iso).toLocaleDateString('en-KE', { day:'numeric', month:'short', year:'numeric' });
  }

  function renderReviews() {
    const feed      = document.getElementById('reviewsFeed');
    const empty     = document.getElementById('reviewsEmpty');
    const avgEl     = document.getElementById('avgRating');
    const starsEl   = document.getElementById('avgStars');
    const totalEl   = document.getElementById('totalReviews');
    const fiveEl    = document.getElementById('fiveStarCount');
    if (!feed) return;

    const reviews = typeof GYTOREVIEWSDB !== 'undefined' ? GYTOREVIEWSDB.getReviews() : [];
    const stats   = typeof GYTOREVIEWSDB !== 'undefined' ? GYTOREVIEWSDB.getReviewStats() : { avg:0, total:0, fiveStar:0 };

    // Update stats
    if (avgEl)   avgEl.textContent   = stats.total ? stats.avg : '—';
    if (starsEl) starsEl.textContent = stats.total ? starsHTML(Math.round(stats.avg)) : '☆☆☆☆☆';
    if (totalEl) totalEl.textContent = stats.total;
    if (fiveEl)  fiveEl.textContent  = stats.fiveStar;

    if (!reviews.length) {
      if (empty) empty.style.display = 'block';
      return;
    }
    if (empty) empty.style.display = 'none';

    feed.innerHTML = reviews.map(r => `
      <div class="review-card">
        <div class="review-card-header">
          <span class="review-card-name">${r.name || 'Anonymous'}</span>
          <span class="review-card-stars">${starsHTML(r.rating)}</span>
        </div>
        ${r.service ? `<div class="review-card-service">${r.service}</div>` : ''}
        <div class="review-card-text">"${r.text}"</div>
        <div class="review-card-date">${r.company ? r.company + ' · ' : ''}${timeAgo(r.createdAt)}</div>
      </div>
    `).join('');
  }

  // Initial render
  renderReviews();

  // Review form submit
  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const ratingInput = reviewForm.querySelector('input[name="rating"]:checked');
      if (!ratingInput) {
        alert('Please select a star rating before submitting.');
        return;
      }

      const name = reviewForm.querySelector('[name="reviewName"]').value.trim();
      const text = reviewForm.querySelector('[name="reviewText"]').value.trim();
      if (!name || !text) {
        alert('Please fill in your name and review text.');
        return;
      }

      const data = {
        name,
        company: reviewForm.querySelector('[name="reviewCompany"]').value.trim(),
        service: reviewForm.querySelector('[name="reviewService"]').value,
        rating:  parseInt(ratingInput.value),
        text
      };

      if (typeof GYTOREVIEWSDB !== 'undefined') {
        GYTOREVIEWSDB.saveReview(data);
      }

      // Send email notification to info@gytosecurity.co.ke
      const stars     = '★'.repeat(data.rating) + '☆'.repeat(5 - data.rating);
      const subject   = encodeURIComponent('New Review – ' + data.name + ' (' + stars + ') – GYTO Website');
      const emailBody = encodeURIComponent(
        'A new client review has been submitted on the GYTO website.\n\n' +
        '─────────────────────────────────\n' +
        'Name     : ' + data.name + '\n' +
        'Company  : ' + (data.company || 'Not provided') + '\n' +
        'Service  : ' + (data.service || 'General') + '\n' +
        'Rating   : ' + stars + ' (' + data.rating + '/5)\n' +
        '─────────────────────────────────\n\n' +
        'REVIEW:\n' + data.text + '\n\n' +
        '─────────────────────────────────\n' +
        'Submitted: ' + new Date().toLocaleString('en-KE') + '\n\n' +
        'View all reviews: https://gytosuccess.co.ke/#reviews\n' +
        'Admin dashboard:  https://gytosuccess.co.ke/admin.html\n'
      );
      window.location.href = 'mailto:info@gytosecurity.co.ke?subject=' + subject + '&body=' + emailBody;

      // Show success message
      const btn     = reviewForm.querySelector('.review-submit-btn');
      const success = document.getElementById('reviewSuccess');
      btn.disabled  = true;
      btn.innerHTML = '<i class="fas fa-check" style="margin-right:8px;"></i>Review Published!';
      btn.style.background = '#2d7a4f';
      if (success) success.style.display = 'block';

      reviewForm.reset();
      renderReviews();

      setTimeout(() => {
        btn.disabled         = false;
        btn.innerHTML        = '<i class="fas fa-paper-plane" style="margin-right:8px;"></i>Submit Review';
        btn.style.background = '';
        if (success) success.style.display = 'none';
      }, 4000);
    });
  }

  // ================================================================
  // GYTO AI ASSISTANT
  // Smart knowledge-base chatbot for GYTO Security website
  // ================================================================

  const aiPanel   = document.getElementById('gytoAiPanel');
  const aiFloat   = document.getElementById('gytoAiFloat');
  const aiClose   = document.getElementById('aiPanelClose');
  const aiBody    = document.getElementById('aiChatBody');
  const aiInput   = document.getElementById('aiInput');
  const aiSendBtn = document.getElementById('aiSendBtn');

  if (aiFloat && aiPanel) {

    // Toggle panel
    aiFloat.addEventListener('click', () => {
      aiPanel.classList.toggle('open');
      if (aiPanel.classList.contains('open')) {
        const si = document.getElementById('aiSearchInput');
        setTimeout(() => { if (si) si.focus(); }, 300);
      }
    });

    if (aiClose) aiClose.addEventListener('click', () => aiPanel.classList.remove('open'));

    // ── Search bar ──────────────────────────────────────────
    const aiSearchInput = document.getElementById('aiSearchInput');
    const aiSearchBtn   = document.getElementById('aiSearchBtn');

    function runSearch() {
      const q = (aiSearchInput ? aiSearchInput.value.trim() : '');
      if (!q) return;
      aiSearchInput.value = '';
      processAiQuery(q);
    }

    if (aiSearchBtn)   aiSearchBtn.addEventListener('click', runSearch);
    if (aiSearchInput) {
      aiSearchInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); runSearch(); }
      });
    }

    // Quick chips
    document.querySelectorAll('.ai-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const q = chip.dataset.q;
        if (q) processAiQuery(q);
      });
    });

    // Send on button click
    if (aiSendBtn) aiSendBtn.addEventListener('click', sendAiMessage);

    // Send on Enter key
    if (aiInput) {
      aiInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); sendAiMessage(); }
      });
    }
  }

  function sendAiMessage() {
    if (!aiInput) return;
    const q = aiInput.value.trim();
    if (!q) return;
    aiInput.value = '';
    processAiQuery(q);
  }

  function processAiQuery(question) {
    // Add user bubble
    addAiBubble(question, 'user');

    // Show typing indicator
    const typingId = addAiBubble('…', 'bot typing');

    setTimeout(() => {
      removeAiBubble(typingId);
      const answer = getAiAnswer(question);
      addAiBubble(answer, 'bot');
    }, 700 + Math.random() * 400);
  }

  let _bubbleCounter = 0;
  function addAiBubble(text, type) {
    if (!aiBody) return null;
    const id  = 'bubble-' + (++_bubbleCounter);
    const div = document.createElement('div');
    div.className = 'ai-bubble ' + type;
    div.id        = id;
    div.textContent = text;
    aiBody.appendChild(div);
    aiBody.scrollTop = aiBody.scrollHeight;
    return id;
  }

  function removeAiBubble(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  // ── GYTO AI Knowledge Base ──────────────────────────────────
  function getAiAnswer(q) {
    const query = q.toLowerCase();

    // Services
    if (/service|offer|provide|guard|cctv|patrol|alarm|event|train|k.?9|dog/.test(query)) {
      return 'GYTO Security offers 7 services: Manned Guarding, CCTV & Surveillance, Mobile Patrols, Alarm Systems, Event Security, Security Training, and K-9 Security. Visit our Services page for full details on each.';
    }
    // Quote / pricing
    if (/quote|price|cost|how much|rate|fee|charge/.test(query)) {
      return 'We provide free, customised security quotes based on your specific needs. Click "Get a Free Quote" on our Contact page or call us on 0733 990 247 and our team will respond within 24 hours.';
    }
    // Location / address
    if (/where|location|address|find|office|nairobi|kandara|gatundu/.test(query)) {
      return 'Our offices are at: Junction of Kandara & Gatundu Road, opposite Kenya High School, Nairobi, Kenya. You can find us on Google Maps by searching "Gyto Success Co".';
    }
    // Contact / phone
    if (/contact|phone|call|number|email|reach|talk/.test(query)) {
      return 'You can reach us by:\n📞 Call/WhatsApp: 0733 990 247 or 0729 990 247\n✉️ Email: info@gytosecurity.co.ke\n🕐 Available 24/7 for emergencies.';
    }
    // Hours
    if (/hour|time|open|close|when|operating|schedule/.test(query)) {
      return 'Our office hours are:\n• Mon–Fri: 8:00 AM – 6:00 PM\n• Saturday: 8:00 AM – 1:00 PM\n• Sunday & Public Holidays: By appointment\n• Operations & Emergencies: 24/7';
    }
    // Job / recruitment
    if (/job|apply|work|recruit|hire|vacancy|career|employ|staff/.test(query)) {
      return 'We are always looking for motivated security professionals! Visit our Recruitment page to fill in the application form online. Requirements include a valid National ID, police clearance, and NSSF/NHIF cards. Email: staffing@gytosecurity.co.ke';
    }
    // About / history / experience
    if (/about|who|history|year|experience|kenyan|founded|trust/.test(query)) {
      return 'GYTO Success Company Limited is a Kenyan-owned security firm with over 27 years of experience. We were founded in 1997 and serve 500+ clients across Kenya including government ministries, banks, hospitals, schools, hotels and residential estates.';
    }
    // Manned guarding
    if (/manned|guard|uniform|static|access|concierge|loss/.test(query)) {
      return 'Our Manned Guarding service deploys professionally trained, uniformed security personnel 24/7. We cover static guarding, access control, perimeter security, concierge, retail loss prevention and armed guard deployments.';
    }
    // CCTV
    if (/cctv|camera|surveillance|monitor|footage|clos/.test(query)) {
      return 'We supply, install and maintain HD/4K CCTV systems — indoor, outdoor, night-vision, IP-based and cloud-connected. All systems are monitored 24/7 from our operations centre.';
    }
    // Patrols
    if (/patrol|mobile|vehicle|gps|unlock|lock/.test(query)) {
      return 'Our Mobile Patrol service uses GPS-tracked vehicles for scheduled and random patrols. We also provide rapid alarm response, lock-up/open-up services and estate patrols.';
    }
    // Alarms
    if (/alarm|intruder|panic|fire|sensor|detector|gsm/.test(query)) {
      return 'We design, supply and install advanced intruder alarm systems with 24-hour monitoring. This includes panic buttons, fire detection integration, GSM communicators and regular maintenance.';
    }
    // Event security
    if (/event|concert|crowd|vip|access|steward|usher|conference/.test(query)) {
      return 'Our Event Security team handles crowd management, accreditation, VIP protection, stewarding and emergency response coordination for events of all sizes — from corporate conferences to music concerts.';
    }
    // Training
    if (/train|certif|course|first aid|fire|report|aware/.test(query)) {
      return 'Our Security Training programmes cover: basic security officer certification, first aid & emergency response, fire safety, customer service for security staff, report writing and workplace security awareness.';
    }
    // K-9
    if (/k.?9|dog|canine|german|rottweiler|malinois|doberman|detect/.test(query)) {
      return 'Our K-9 unit deploys trained security dogs (German Shepherd, Rottweiler, Belgian Malinois, Doberman) with certified handlers for perimeter patrol, narcotics/explosive detection, event security and rapid-response deployments.';
    }
    // Reviews
    if (/review|rating|feedback|testimonial|client say/.test(query)) {
      return 'You can read and submit client reviews right here on our home page — scroll down to the "Client Reviews & Ratings" section. All reviews are publicly visible after submission.';
    }
    // Social media
    if (/facebook|instagram|twitter|linkedin|social|follow/.test(query)) {
      return 'Follow us on:\n• Facebook: facebook.com/gytosecuritycompany\n• Instagram: @gytosecurity\n• Twitter/X: @gytosecurity\n• LinkedIn: GYTO Success Company\n• WhatsApp: 0729 990 247';
    }
    // WhatsApp
    if (/whatsapp|whats.?app|chat|message|wa\.me/.test(query)) {
      return 'You can WhatsApp us directly on 0729 990 247. Click the green WhatsApp button on this page to open a chat instantly!';
    }
    // Greetings
    if (/hello|hi |hey|good morning|good afternoon|good evening|howdy/.test(query)) {
      return 'Hello! Welcome to GYTO Security. How can I assist you today? Ask me about our services, pricing, jobs, or anything security-related.';
    }
    // Thank you
    if (/thank|thanks|appreciate|great|awesome|helpful/.test(query)) {
      return 'You are most welcome! Is there anything else I can help you with? Our team is also available 24/7 on 0733 990 247.';
    }
    // Goodbye
    if (/bye|goodbye|see you|take care|exit|close/.test(query)) {
      return 'Thank you for visiting GYTO Security! Stay safe. Feel free to chat anytime or call us on 0733 990 247.';
    }

    // Default fallback
    return 'That is a great question! For detailed information, please contact our team directly:\n📞 0733 990 247\n✉️ info@gytosecurity.co.ke\nOr visit our Contact page and we will respond within 24 hours.';
  }

});
