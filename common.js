/* =====================================================
   COMMON JS — 戚俊皓 | Personal Website v3
   ===================================================== */

// ─── I18N Translations (nav links only) ─────────────
const NAV_I18N = {
  zh: {
    'nav.home': '首页',
    'nav.music': '音乐',
    'nav.travel': '旅行',
    'nav.photo': '摄影',
    'nav.sports': '运动',
    'nav.resume': '履历',
    'nav.contact': '联系',
  },
  en: {
    'nav.home': 'Home',
    'nav.music': 'Music',
    'nav.travel': 'Travel',
    'nav.photo': 'Photography',
    'nav.sports': 'Sports',
    'nav.resume': 'Resume',
    'nav.contact': 'Contact',
  },
  hant: {
    'nav.home': '首頁',
    'nav.music': '音樂',
    'nav.travel': '旅行',
    'nav.photo': '攝影',
    'nav.sports': '運動',
    'nav.resume': '履歷',
    'nav.contact': '聯繫',
  }
};

let currentLang = localStorage.getItem('lang') || 'zh';

function applyLang() {
  const lang = currentLang;
  document.documentElement.lang = lang === 'hant' ? 'zh-TW' : (lang === 'en' ? 'en' : 'zh-CN');
  // Translate data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const text = NAV_I18N[lang]?.[key];
    if (text) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = text;
      } else {
        el.textContent = text;
      }
    }
  });
  // Update lang toggle active state
  document.querySelectorAll('.lang-item').forEach(item => {
    item.classList.toggle('active', item.dataset.lang === lang);
  });
}

function initLangToggle() {
  const toggle = document.getElementById('langToggle');
  if (!toggle) return;
  toggle.querySelectorAll('.lang-item').forEach(item => {
    item.addEventListener('click', () => {
      currentLang = item.dataset.lang;
      localStorage.setItem('lang', currentLang);
      applyLang();
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // ─── Apply saved language ──────────────────────────
  applyLang();
  initLangToggle();

  // ─── Theme Toggle ────────────────────────────────
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  if (themeToggle) updateThemeIcon(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.add('theme-transitioning');
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateThemeIcon(next);
      setTimeout(() => {
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

  // ─── Mobile Nav Toggle ───────────────────────────
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', function() {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  // ─── Navbar Scroll Effect ────────────────────────
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', function() {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  // ─── Back to Top ─────────────────────────────────
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', function() {
      backToTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    backToTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ─── Scroll Reveal Animations ────────────────────
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '40px' });
    revealElements.forEach(el => revealObserver.observe(el));
  }
});
