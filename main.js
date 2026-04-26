/* ── 1. THEME TOGGLE ─────────────────────────────────── */

(function() {
      const saved = localStorage.getItem('theme');
      if (saved) document.documentElement.setAttribute('data-theme', saved);
      else if (window.matchMedia('(prefers-color-scheme: light)').matches) document.documentElement.setAttribute('data-theme', 'light');
      else document.documentElement.setAttribute('data-theme', 'dark');
    })();

(function initTheme() {
  const root   = document.documentElement;
  const toggle = document.getElementById('themeToggle');

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  toggle.addEventListener('click', function () {
    const current = root.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });
})();


/* ── 2. MOBILE NAV ───────────────────────────────────── */
(function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const menu      = document.getElementById('mobileMenu');
  const close     = document.getElementById('mobileClose');
  const backdrop  = document.getElementById('menuBackdrop');
  const links     = menu.querySelectorAll('.mobile-menu__link, .mobile-menu__cta');

  function openMenu() {
    menu.classList.add('is-open');
    backdrop.classList.add('is-visible');
    menu.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    close.focus();
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    backdrop.classList.remove('is-visible');
    menu.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  hamburger.addEventListener('click', openMenu);
  close.addEventListener('click', closeMenu);
  backdrop.addEventListener('click', closeMenu);

  links.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) closeMenu();
  });
})();


/* ── 3. SKILL BAR ANIMATION (IntersectionObserver) ──── */
(function initSkillBars() {
  const bars = document.querySelectorAll('.skill-card__level-bar');

  if (!bars.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-animated');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(function (bar) {
    observer.observe(bar);
  });
})();


/* ── 4. CV DOWNLOAD & UPLOAD ─────────────────────────── */
(function initCV() {
  var CV_KEY      = 'samuel_cv_data';
  var CV_NAME_KEY = 'samuel_cv_name';

  var dlBtns   = [document.getElementById('downloadCvBtn'), document.getElementById('downloadCvBtn2')];
  var fileInput = document.getElementById('cvFileInput');
  var status    = document.getElementById('cvUploadStatus');

  /* Download: if custom CV stored, use it; otherwise note placeholder */
  function handleDownload(e) {
    e.preventDefault();

    var stored = localStorage.getItem(CV_KEY);

    if (stored) {
      /* Reconstruct Blob from stored base64 data URL */
      var name  = localStorage.getItem(CV_NAME_KEY) || 'Samuel_Ibuodinma_CV.pdf';
      var link  = document.createElement('a');
      link.href = stored;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      /* No CV uploaded yet — friendly message */
      alert('CV not uploaded yet. Drop your PDF in the "Owner update" panel to enable downloads.');
    }
  }

  dlBtns.forEach(function (btn) {
    if (btn) btn.addEventListener('click', handleDownload);
  });

  /* Upload: read PDF → store as base64 data URL → persist in localStorage */
  fileInput.addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      status.textContent = '⚠ Only PDF files are accepted.';
      return;
    }

    status.textContent = 'Reading file…';

    var reader = new FileReader();

    reader.onload = function (ev) {
      try {
        localStorage.setItem(CV_KEY, ev.target.result);
        localStorage.setItem(CV_NAME_KEY, file.name);
        status.textContent = '✔ CV saved: ' + file.name + '. Download button is now live.';
      } catch (err) {
        status.textContent = '⚠ File too large to store. Try a compressed PDF under 4 MB.';
      }
    };

    reader.onerror = function () {
      status.textContent = '⚠ Could not read file. Try again.';
    };

    reader.readAsDataURL(file);
  });

  /* Toggle uploader panel visibility */
  var toggleBtn = document.getElementById('toggleUpload');
  var uploadPanel = document.getElementById('cvUploadPanel');

  if (toggleBtn) {
    /* Start expanded — owner can see it */
    var collapsed = false;

    toggleBtn.addEventListener('click', function () {
      collapsed = !collapsed;
      var zone = uploadPanel.querySelector('.cv-upload-panel__zone');
      if (collapsed) {
        zone.style.display = 'none';
        status.style.display = 'none';
        toggleBtn.textContent = '↓ Show uploader';
      } else {
        zone.style.display = '';
        status.style.display = '';
        toggleBtn.textContent = '↑ Hide uploader';
      }
    });
  }
})();


/* ── 5. CONTACT FORM ─────────────────────────────────── */
(function initContactForm() {
  var form    = document.getElementById('contactForm');
  var msgEl   = document.getElementById('formStatus');

  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var data = new FormData(form);

    var name  = form.querySelector('#contactName').value.trim();
    var email = form.querySelector('#contactEmail').value.trim();
    var msg   = form.querySelector('#contactMsg').value.trim();

    msgEl.style.color = 'var(--clr-accent)';
    msgEl.textContent = 'Sending…';

    /* Basic validation */
    if (!name || !email || !msg) {
      msgEl.style.color = '#ff6b6b';
      msgEl.textContent = 'Please fill in all fields.';
      return;
    }

    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      msgEl.style.color = '#ff6b6b';
      msgEl.textContent = 'Please enter a valid email address.';
      return;
    }

    /* Simulate send (replace with Formspree/EmailJS endpoint in production) */
    msgEl.style.color = 'var(--clr-accent)';
    msgEl.textContent = 'Sending…';

    fetch(form.action, {
      method: 'POST',
      body: data,
      headers: {
        'Accept': 'application/json'
      }
    }).then(response => {
      if (response.ok) {
        msgEl.style.color = 'var(--clr-accent)';
        msgEl.textContent = "✔ Message sent! I'll get back to you within 24 hours.";
        form.reset();
      } else {
        response.json().then(data => {
          if (Object.hasOwn(data, 'errors')) {
            msgEl.textContent = data["errors"].map(error => error["message"]).join(", ");
          } else {
            msgEl.textContent = "Oops! There was a problem submitting your form";
          }
        })
      }
    }).catch(error => {
      msgEl.style.color = '#ff6b6b';
      msgEl.textContent = "Oops! There was a problem connecting to the server.";
    });
  });
})();



/* ── 6. ACTIVE NAV LINK ON SCROLL ────────────────────── */
(function initScrollSpy() {
  var sections = document.querySelectorAll('section[id]');
  var links    = document.querySelectorAll('.nav__link');

  if (!sections.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var id = entry.target.getAttribute('id');
        links.forEach(function (link) {
          link.classList.toggle('nav__link--active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });

  sections.forEach(function (s) { observer.observe(s); });
})();


/* ── 7. REVEAL ON SCROLL ─────────────────────────────── */
(function initReveal() {
  var els = document.querySelectorAll(
    '.skill-card, .cert-card, .project-featured, .contact__link, .about-strip__stat'
  );

  if (!els.length) return;

  /* Inject base reveal style */
  els.forEach(function (el) {
    el.style.opacity  = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  });

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity  = '1';
        entry.target.style.transform = 'translateY(0)';
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(function (el) { revealObserver.observe(el); });
})();
