import { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import performances from './data/performances';
import './App.css';

const I18N = {
  zh: {
    'nav.home':'音乐首页','nav.listen':'听','nav.concert':'赏','nav.perform':'演','nav.create':'创',
    'hero.badge':'AUTUMN PANTS',
    'hero.sub':'聚光灯下，话筒前——每一场演出都在靠近自己',
    'gallery.title':'演出档案','gallery.desc':'点击卡片查看详情',
    'footer.text':'下一场演出，正在路上','footer.meta':'AUTUMN PANTS · 2026',
    'section.setlist':'曲目','section.photos':'影像',
    'credit':'舞台时光 · AutumnPants',
  },
  en: {
    'nav.home':'Music Home','nav.listen':'Listen','nav.concert':'Live','nav.perform':'Stage','nav.create':'Create',
    'hero.badge':'AUTUMN PANTS',
    'hero.sub':'Under the spotlight, before the mic — every performance brings me closer to myself',
    'gallery.title':'Performance Archive','gallery.desc':'Click a card to explore',
    'footer.text':'Next show, on its way','footer.meta':'AUTUMN PANTS · 2026',
    'section.setlist':'Setlist','section.photos':'Photos',
    'credit':'Stage Moments · AutumnPants',
  },
  hant: {
    'nav.home':'音樂首頁','nav.listen':'聽','nav.concert':'賞','nav.perform':'演','nav.create':'創',
    'hero.badge':'AUTUMN PANTS',
    'hero.sub':'聚光燈下，話筒前——每一場演出都在靠近自己',
    'gallery.title':'演出檔案','gallery.desc':'點擊卡片查看詳情',
    'footer.text':'下一場演出，正在路上','footer.meta':'AUTUMN PANTS · 2026',
    'section.setlist':'曲目','section.photos':'影像',
    'credit':'舞台時光 · AutumnPants',
  }
};

function getT(lang, key) {
  return I18N[lang]?.[key] || I18N['zh'][key] || key;
}

function App() {
  const [selectedPerf, setSelectedPerf] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'zh');
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const timelineRef = useRef(null);

  const handleCardClick = useCallback((perf) => {
    setSelectedPerf(perf);
    setPhotoIndex(0);
    if (perf.video && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const handleClose = useCallback(() => {
    if (timelineRef.current) timelineRef.current.kill();
    setSelectedPerf(null);
    setLightboxOpen(false);
  }, []);

  const openLightbox = useCallback((idx) => {
    setPhotoIndex(idx);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const prevPhoto = useCallback((e) => {
    if (e) e.stopPropagation();
    setPhotoIndex(prev => prev > 0 ? prev - 1 : selectedPerf.images.length - 1);
  }, [selectedPerf]);

  const nextPhoto = useCallback((e) => {
    if (e) e.stopPropagation();
    setPhotoIndex(prev => prev < selectedPerf.images.length - 1 ? prev + 1 : 0);
  }, [selectedPerf]);

  useEffect(() => {
    if (!lightboxOpen || !selectedPerf) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'ArrowRight') nextPhoto();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen, selectedPerf, prevPhoto, nextPhoto, closeLightbox]);

  useEffect(() => {
    if (!selectedPerf || !overlayRef.current) return;
    if (timelineRef.current) timelineRef.current.kill();
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    timelineRef.current = tl;
    tl.fromTo('.detail-overlay-inner', { opacity: 0 }, { opacity: 1, duration: 0.4 })
      .fromTo('.detail-bg-media', { scale: 1.15, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6 }, '-=0.15')
      .fromTo('.dt-close', { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.3 }, '-=0.2')
      .fromTo('.dt-hero', { y: 35, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, '-=0.15')
      .fromTo('.dt-title-row', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.25')
      .fromTo('.dt-desc', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45 }, '-=0.2')
      .fromTo('.dt-setlist, .dt-gallery', { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 0.45 }, '-=0.2');
    return () => { if (timelineRef.current) timelineRef.current.kill(); };
  }, [selectedPerf]);

  useEffect(() => {
    if (selectedPerf?.video && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [selectedPerf]);

  // Nav pill animation
  useEffect(() => {
    const links = document.querySelector('.topnav .links');
    const pill = document.getElementById('navPill');
    if (!links || !pill) return;
    const active = links.querySelector('.here') || links.querySelector('a');
    if (active) { pill.style.width = active.offsetWidth + 'px'; pill.style.left = active.offsetLeft + 'px'; }
    const updatePill = (a) => { pill.style.width = a.offsetWidth + 'px'; pill.style.left = a.offsetLeft + 'px'; };
    const handleEnter = (e) => { if (e.target.tagName === 'A') updatePill(e.target); };
    const handleLeave = () => { if (active) updatePill(active); };
    links.addEventListener('mouseover', handleEnter);
    links.addEventListener('mouseout', handleLeave);
    return () => { links.removeEventListener('mouseover', handleEnter); links.removeEventListener('mouseout', handleLeave); };
  }, [lang]);

  // Theme toggle
  useEffect(() => {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const sun = document.getElementById('themeIconSun');
    const moon = document.getElementById('themeIconMoon');
    let dark = document.documentElement.getAttribute('data-theme') === 'dark';
    const toggle = () => {
      dark = !dark;
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
      if (sun) sun.style.display = dark ? 'none' : '';
      if (moon) moon.style.display = dark ? '' : 'none';
    };
    btn.addEventListener('click', toggle);
    return () => btn.removeEventListener('click', toggle);
  }, []);

  // Lang toggle: listen on container, update state
  useEffect(() => {
    const toggle = document.getElementById('langToggle');
    if (!toggle) return;
    const handleLang = (e) => {
      const item = e.target.closest('.lang-item');
      if (!item) return;
      const newLang = item.dataset.lang;
      setLang(newLang);
      localStorage.setItem('lang', newLang);
    };
    toggle.addEventListener('click', handleLang);
    // Sync active state
    toggle.querySelectorAll('.lang-item').forEach(el => el.classList.toggle('active', el.dataset.lang === lang));
    return () => toggle.removeEventListener('click', handleLang);
  }, [lang]);

  // Update lang-item active class when lang changes
  useEffect(() => {
    document.querySelectorAll('.lang-item').forEach(el => el.classList.toggle('active', el.dataset.lang === lang));
    // Update nav text
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (I18N[lang] && I18N[lang][key]) el.textContent = I18N[lang][key];
    });
  }, [lang]);

  // Get localized version of a performance
  const perfText = useCallback((p, field) => {
    if (field === 'subtitle') return p[`subtitle${lang.charAt(0).toUpperCase() + lang.slice(1)}`] || p.subtitle;
    if (field === 'description') return p[`description${lang.charAt(0).toUpperCase() + lang.slice(1)}`] || p.description;
    if (field === 'title') return p[`title${lang.charAt(0).toUpperCase() + lang.slice(1)}`] || p.title;
    if (field === 'role') return p[`role${lang.charAt(0).toUpperCase() + lang.slice(1)}`] || p.role;
    if (field === 'tags') return p[`tags${lang.charAt(0).toUpperCase() + lang.slice(1)}`] || p.tags;
    return p[field];
  }, [lang]);

  const heroChars = lang === 'zh' || lang === 'hant'
    ? ['舞','台','时','光']
    : ['S','T','A','G','E'];

  return (
    <div className="app">
      <nav className="topnav">
        <div className="nav-wrap">
          <div className="nav-center">
            <a href="../../音乐首页.html" className="home" data-i18n="nav.home">音乐首页</a>
            <div className="links" id="navLinks">
              <span className="nav-pill" id="navPill"></span>
              <a href="../../听-板块.html" data-i18n="nav.listen">听</a>
              <a href="../../赏-板块（演唱会）.html" data-i18n="nav.concert">赏</a>
              <a href="../../演-板块/dist/舞台时光.html" className="here" data-i18n="nav.perform">演</a>
              <a href="../../创-板块.html" data-i18n="nav.create">创</a>
            </div>
          </div>
          <div className="nav-right">
            <div className="lang-toggle" id="langToggle">
              <span className="lang-item active" data-lang="zh">简</span>
              <span className="lang-item" data-lang="en">EN</span>
              <span className="lang-item" data-lang="hant">繁</span>
            </div>
            <button className="theme-toggle" id="themeToggle" aria-label="切换主题">
              <svg viewBox="0 0 24 24" id="themeIconSun"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              <svg viewBox="0 0 24 24" id="themeIconMoon" style={{display:'none'}}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </button>
          </div>
        </div>
      </nav>

      <div className="page-overlay" />
      <div className="page-bg">
        <img src="./images/hero.jpeg" alt="" />
      </div>

      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-badge">{getT(lang, 'hero.badge')}</div>
          <h1 className="hero-title">
            {heroChars.map((c, i) => <span key={i} className="hero-char">{c}</span>)}
          </h1>
          <div className="hero-ornament">
            <span className="orn-line" /><span className="orn-diamond" /><span className="orn-line" />
          </div>
          <p className="hero-sub">{getT(lang, 'hero.sub')}</p>
        </div>
      </section>

      <section className="gallery-section">
        <div className="gallery-header">
          <h2 className="gallery-title">{getT(lang, 'gallery.title')}</h2>
          <p className="gallery-desc">{getT(lang, 'gallery.desc')}</p>
        </div>
        <div className="gallery-scroll">
          <div className="gallery-track">
            {performances.map((p) => (
              <div key={p.id} className="card" onClick={() => handleCardClick(p)}>
                <div className="card-img">
                  <img src={p.coverImage} alt={p.fullTitle} loading="lazy" />
                </div>
                <div className="card-overlay" />
                <div className="card-info">
                  <span className="card-date">{p.date}</span>
                  <span className="card-name">{p.title}</span>
                  <span className="card-tags">{perfText(p, 'tags').join(' · ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-line" />
        <p className="footer-text">{getT(lang, 'footer.text')}</p>
        <p className="footer-meta">{getT(lang, 'footer.meta')}</p>
      </footer>

      {selectedPerf && (
        <div className="detail-overlay" onClick={handleClose} ref={overlayRef}>
          <div className="detail-overlay-inner">
            <div className="detail-bg">
              {selectedPerf.video ? (
                <video ref={videoRef} className="detail-bg-media dt-video" src={selectedPerf.video} muted loop playsInline preload="metadata" />
              ) : (
                <div className="detail-bg-media dt-bg-img" style={{ backgroundImage: `url(${selectedPerf.coverImage})` }} />
              )}
              <div className="dt-vignette" />
            </div>

            <button className="dt-close" onClick={(e) => { e.stopPropagation(); handleClose(); }}>
              <svg viewBox="0 0 24 24" width="20" height="20"><path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
            </button>

            <div className="dt-scroll" onClick={(e) => e.stopPropagation()}>
              <div className="dt-inner">
                <div className="dt-hero">
                  <div className="dt-tags">
                    {perfText(selectedPerf, 'tags').map(tag => <span key={tag} className="dt-tag">{tag}</span>)}
                  </div>
                  {selectedPerf.role && <span className="dt-role">{perfText(selectedPerf, 'role')}</span>}
                </div>

                <div className="dt-title-row">
                  <h2 className="dt-title">{selectedPerf.date}</h2>
                  <p className="dt-subtitle">{perfText(selectedPerf, 'subtitle')}</p>
                  <div className="dt-title-ornament">
                    <span className="dt-orn-line" /><span className="dt-orn-diamond" /><span className="dt-orn-line" />
                  </div>
                </div>

                <p className="dt-desc">{perfText(selectedPerf, 'description')}</p>

                {selectedPerf.songs.length > 0 && (
                  <div className="dt-setlist">
                    <h3 className="dt-section-label">
                      <svg className="dt-label-icon" viewBox="0 0 24 24" width="14" height="14"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M10 8l6 4-6 4V8z" fill="currentColor"/></svg>
                      {getT(lang, 'section.setlist')}
                    </h3>
                    <div className="dt-setlist-tracks">
                      {selectedPerf.songs.map((s, i) => (
                        <div key={i} className="dt-track">
                          <span className="dt-track-num">{String(i + 1).padStart(2, '0')}</span>
                          <span className="dt-track-name">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPerf.images.length > 0 && (
                  <div className="dt-gallery">
                    <h3 className="dt-section-label">
                      <svg className="dt-label-icon" viewBox="0 0 24 24" width="14" height="14"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><path d="M3 16l5-5 3 3 4-4 6 6" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>
                      {getT(lang, 'section.photos')}
                    </h3>
                    <div className="dt-gallery-preview" onClick={() => openLightbox(photoIndex)}>
                      <img src={selectedPerf.images[photoIndex]} alt="" />
                      <div className="dt-gallery-expand">
                        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
                      </div>
                    </div>
                    {selectedPerf.images.length > 1 && (
                      <div className="dt-gallery-strip">
                        <div className="dt-gallery-strip-inner">
                          {selectedPerf.images.map((img, i) => (
                            <div
                              key={i}
                              className={`dt-gallery-thumb ${i === photoIndex ? 'active' : ''}`}
                              onClick={(e) => { e.stopPropagation(); setPhotoIndex(i); }}
                            >
                              <img src={img} alt="" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="dt-credits">
                  <p className="dt-credits-text">{getT(lang, 'credit')}</p>
                </div>
              </div>
            </div>
          </div>

          {lightboxOpen && selectedPerf && (
            <div className="lightbox" onClick={closeLightbox}>
              <button className="lightbox-close" onClick={(e) => { e.stopPropagation(); closeLightbox(); }}>
                <svg viewBox="0 0 24 24" width="24" height="24"><path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
              </button>
              {selectedPerf.images.length > 1 && (
                <>
                  <button className="lightbox-nav lightbox-prev" onClick={prevPhoto}>
                    <svg viewBox="0 0 24 24" width="24" height="24"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <button className="lightbox-nav lightbox-next" onClick={nextPhoto}>
                    <svg viewBox="0 0 24 24" width="24" height="24"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <div className="lightbox-counter">
                    <span className="lightbox-counter-current">{photoIndex + 1}</span>
                    <span className="lightbox-counter-sep">／</span>
                    <span className="lightbox-counter-total">{selectedPerf.images.length}</span>
                  </div>
                </>
              )}
              <img className="lightbox-img" src={selectedPerf.images[photoIndex]} alt="" onClick={(e) => e.stopPropagation()} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
