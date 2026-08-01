;(function () {
  /* PREFS — cross-subdomain shared prefs (cookie .qijunhao.com + localStorage) */
  function prefDomain() {
    var h = location.hostname;
    return (h === 'qijunhao.com' || h.slice(-13) === '.qijunhao.com') ? '; domain=.qijunhao.com' : '';
  }
  function setPref(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
    try { document.cookie = key + '=' + encodeURIComponent(value) + '; path=/; max-age=31536000' + prefDomain(); } catch (e) {}
  }
  function getPref(key) {
    try {
      var v = localStorage.getItem(key);
      if (v !== null) { setPref(key, v); return v; }
    } catch (e) {}
    try {
      var m = document.cookie.match(new RegExp('(?:^|; )' + key + '=([^;]*)'));
      return m ? decodeURIComponent(m[1]) : null;
    } catch (e) { return null; }
  }
  window.Prefs = { get: getPref, set: setPref };
})();

/* =====================================================
   COMMON JS — 戚俊皓 | Personal Website v3
   ===================================================== */

;(function() {
  'use strict';

  var THEME_KEY = 'theme';
  var LANG_KEY = 'lang';

  // ─── DOM Ready ────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function() {

    // ─── Theme Toggle ────────────────────────────────
    var themeToggle = document.getElementById('themeToggle');
    var savedTheme = Prefs.get(THEME_KEY) || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (themeToggle) updateThemeIcon(savedTheme);

    if (themeToggle) {
      themeToggle.addEventListener('click', function() {
        var current = document.documentElement.getAttribute('data-theme');
        var next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.classList.add('theme-transitioning');
        document.documentElement.setAttribute('data-theme', next);
        Prefs.set(THEME_KEY, next);
        updateThemeIcon(next);
        setTimeout(function() {
          document.documentElement.classList.remove('theme-transitioning');
        }, 350);
      });
    }

    function updateThemeIcon(theme) {
      if (!themeToggle) return;
      themeToggle.innerHTML = theme === 'dark'
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
    }

    // ─── Language Toggle ─────────────────────────────
    var langToggle = document.getElementById('langToggle');
    var currentLang = Prefs.get(LANG_KEY) || 'zh';

    function applyLang(lang) {
      currentLang = lang;
      Prefs.set(LANG_KEY, lang);
      document.querySelectorAll('.lang-item').forEach(function(el) {
        el.classList.toggle('active', el.dataset.lang === lang);
      });
      // Dispatch custom event for other scripts
      document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
    }

    // Initial language state
    applyLang(currentLang);
    // ─── Generic i18n renderer (data-i18n + PAGE_I18N + GooeyNav labels) ───
    var NAV_LABELS = {
      zh: ['首页', '音乐', '旅行', '摄影', '运动', '简历', '联系'],
      en: ['Home', 'Music', 'Travel', 'Photography', 'Sport', 'Resume', 'Contact'],
      hant: ['首頁', '音樂', '旅行', '攝影', '運動', '履歷', '聯繫']
    };

    function renderPageI18N(lang) {
      var dict = window.PAGE_I18N;
      if (dict) {
        var table = dict[lang] || dict['zh'] || {};
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
          var key = el.getAttribute('data-i18n');
          if (table[key]) el.innerHTML = table[key];
        });
        var titleKey = document.documentElement.getAttribute('data-i18n-title');
        if (titleKey && table[titleKey]) document.title = table[titleKey];
        document.querySelectorAll('[data-i18n-meta]').forEach(function (m) {
          var key = m.getAttribute('data-i18n-meta');
          if (table[key]) m.setAttribute('content', table[key]);
        });
      }
      var labels = NAV_LABELS[lang] || NAV_LABELS.zh;
      document.querySelectorAll('.gooey-nav-container nav ul li a').forEach(function (a, i) {
        if (labels[i]) a.textContent = labels[i];
      });
    }

    document.addEventListener('langchange', function (e) {
      if (e.detail && e.detail.lang) renderPageI18N(e.detail.lang);
    });
    renderPageI18N(currentLang);
    // Retry after GooeyNav finishes building (it is created by page scripts that run later)
    setTimeout(function () { renderPageI18N(currentLang); }, 600);


    if (langToggle) {
      langToggle.addEventListener('click', function(e) {
        var item = e.target.closest('.lang-item');
        if (item) {
          applyLang(item.dataset.lang);
        }
      });
    }

    // ─── Mobile Nav Toggle ───────────────────────────
    var navToggle = document.getElementById('navToggle');
    var navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
      navToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
      });
      navLinks.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', function() {
          navToggle.classList.remove('active');
          navLinks.classList.remove('active');
        });
      });
    }

    // ─── Navbar Scroll Effect ────────────────────────
    var navbar = document.getElementById('navbar');
    if (navbar) {
      window.addEventListener('scroll', function() {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
      }, { passive: true });
    }

    // ─── Back to Top ─────────────────────────────────
    var backToTop = document.getElementById('backToTop');
    if (backToTop) {
      window.addEventListener('scroll', function() {
        backToTop.classList.toggle('visible', window.scrollY > 400);
      }, { passive: true });
      backToTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // ─── Scroll Reveal Animations ────────────────────
    var revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length) {
      var revealObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '40px' });
      revealElements.forEach(function(el) { revealObserver.observe(el); });
    }
  });
})();
