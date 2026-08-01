/* ============================================================
   CardSwap — Faithful vanilla JS port of React Bits CardSwap
   Uses GSAP for animations (matching original)
   ============================================================ */
(function () {
  'use strict';

  var gsap = window.gsap;

  /* ─── SVG icons for card headers ─── */
  var ICONS = {
    note:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    map:    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.4 8 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8z"/></svg>',
    camera: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
    run:    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13" cy="4" r="2"/><path d="M7 21l3-6 4 3 3-7 3 2"/><path d="M12 12l-3-2-2-4H4"/></svg>',
    doc:    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    mail:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
  };
  function getIcon(name) { return ICONS[name] || ICONS.note; }

  function hexToRgba(hex, alpha) {
    var n = parseInt(hex.replace('#', ''), 16);
    return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + alpha + ')';
  }

  /* ─── Slot math (exact original) ─── */
  function makeSlot(i, distX, distY, total) {
    return { x: i * distX, y: -i * distY, z: -i * distX * 1.5, zIndex: total - i };
  }

  function placeNow(el, slot, skew) {
    gsap.set(el, {
      x: slot.x,
      y: slot.y,
      z: slot.z,
      xPercent: -50,
      yPercent: -50,
      skewY: skew,
      transformOrigin: 'center center',
      zIndex: slot.zIndex,
      force3D: true,
    });
  }

  /* ─── Easing config (exact original) ─── */
  var elasticCfg = {
    ease: 'power3.out',
    durDrop: 0.6,
    durMove: 0.5,
    durReturn: 0.5,
    promoteOverlap: 0.6,
    returnDelay: 0.1,
  };
  var linearCfg = {
    ease: 'power1.inOut',
    durDrop: 0.8,
    durMove: 0.8,
    durReturn: 0.8,
    promoteOverlap: 0.45,
    returnDelay: 0.2,
  };

  /* ============================================================
     CardSwap constructor
     opts: { items, width, height, cardDistance, verticalDistance,
             skewAmount, easing, onCardClick }
     NOTE: delay & pauseOnHover omitted (no auto-slide)
     ============================================================ */
  window.CardSwap = function (container, opts) {
    var items = opts.items || [];
    var width = opts.width || 500;
    var height = opts.height || 400;
    var cardDistance = opts.cardDistance || 60;
    var verticalDistance = opts.verticalDistance || 70;
    var skewAmount = opts.skewAmount || 6;
    var easing = opts.easing || 'elastic';
    var onCardClick = opts.onCardClick || null;

    var total = items.length;
    if (total === 0) return;

    var cfg = easing === 'elastic' ? elasticCfg : linearCfg;

    container.style.width = width + 'px';
    container.style.height = height + 'px';
    container.className = 'card-swap-container';

    var refs = [];
    var ctas = [];
    var order = items.map(function (_, i) { return i; });

    /* ─── Build cards ─── */
    items.forEach(function (item, idx) {
      var card = document.createElement('div');
      card.className = 'card';
      card.style.width = width + 'px';
      card.style.height = height + 'px';
      card.style.background = '#ffffff';
      card.dataset.index = idx;

      /* Background image (if provided) */
      if (item.image) {
        card.style.background = '#f5f0e8 url(' + item.image + ') center center / cover no-repeat';
      }

      /* === Card Header (icon + label) === */
      var hdr = document.createElement('div');
      hdr.className = 'card-header';
      hdr.style.background = 'rgba(240,227,200,0.5)';
      hdr.style.color = '#1a2332';
      hdr.innerHTML = getIcon(item.icon) + '<span class="card-label">' + (item.label || item.text) + '</span><span class="card-cta">探索 →</span>';
      card.appendChild(hdr);

      var ctaEl = hdr.querySelector('.card-cta');
      ctas.push(ctaEl);

      /* === CTA "探索" click: press animation + navigate === */
      ctaEl.addEventListener('click', function (e) {
        e.stopPropagation();
        if (ctaEl.dataset.navigating === '1') return;
        // Safety: if this card is NOT at the front, only bring it forward (no navigation)
        if (order[0] !== idx) { bringToFront(idx); return; }
        ctaEl.dataset.navigating = '1';

        var accent = item.accent || '#3B82F6';
        var glow = hexToRgba(accent, 0.45);

        gsap.timeline()
          .to(card, {
            scale: 1.03,
            boxShadow: '0 18px 60px ' + glow,
            duration: 0.25,
            ease: 'power2.out',
          }, 0)
          .to(ctaEl, {
            backgroundColor: accent,
            color: '#ffffff',
            borderColor: accent,
            scale: 1.08,
            x: 8,
            duration: 0.3,
            ease: 'power2.out',
          }, 0);

        setTimeout(function () {
          if (item.href) window.location.href = item.href;
        }, 600);
      });

      /* === Card Body === */
      var body = document.createElement('div');
      body.className = 'card-body';

      if (!item.image) {
        body.textContent = '网站制作中';
        body.style.cssText = 'display:flex;align-items:center;justify-content:center;font-size:1.2rem;color:var(--text-muted);letter-spacing:0.1em';
      }

      card.appendChild(body);

      // Pixel canvas overlay
      var canvas = document.createElement('canvas');
      canvas.className = 'pixel-canvas';
      canvas.width = width;
      canvas.height = height;
      canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:5;border-radius:12px';
      card.appendChild(canvas);

      container.appendChild(card);
      refs.push(card);

      card.addEventListener('click', function () {
        bringToFront(idx);
        if (onCardClick) onCardClick(idx, item);
      });

      initPixelHover(ctaEl, card, canvas, width, height);
    });

    /* ─── Initial placement ─── */
    placeAll();
    updateFrontCta();

    function placeAll() {
      order.forEach(function (id, i) {
        placeNow(refs[id], makeSlot(i, cardDistance, verticalDistance, total), skewAmount);
      });
    }

    /* ─── Bring clicked card to front ─── */
    function bringToFront(idx) {
      var pos = order.indexOf(idx);
      if (pos === -1 || pos === 0) return;

      var newOrder = [idx].concat(order.filter(function (id) { return id !== idx; }));
      var tl = gsap.timeline();
      var frontEl = refs[order[0]]; // current front card

      // 1) Current front card drops down
      tl.to(frontEl, {
        y: '+=500',
        duration: cfg.durDrop,
        ease: cfg.ease,
      });

      // 2) All cards reposition (except the one being dropped)
      tl.addLabel('promote', '-=' + (cfg.durDrop * cfg.promoteOverlap));

      newOrder.forEach(function (id, i) {
        var el = refs[id];
        var slot = makeSlot(i, cardDistance, verticalDistance, total);

        if (id === idx) {
          // Clicked card: goes to front (position 0)
          tl.set(el, { zIndex: slot.zIndex }, 'promote');
          tl.to(el, {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            duration: cfg.durMove,
            ease: cfg.ease,
          }, 'promote');
        } else if (i === total - 1) {
          // Last card in new order = the dropped front card goes to back
          tl.set(el, { zIndex: slot.zIndex }, 'promote+=' + (cfg.durMove * cfg.returnDelay));
          tl.to(el, {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            duration: cfg.durReturn,
            ease: cfg.ease,
          }, 'promote+=' + (cfg.durMove * cfg.returnDelay));
        } else {
          // Middle cards shift
          tl.set(el, { zIndex: slot.zIndex }, 'promote');
          tl.to(el, {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            duration: cfg.durMove,
            ease: cfg.ease,
          }, 'promote+=' + (i * 0.15));
        }
      });

      order = newOrder;
      updateFrontCta();
    }

    /* ─── Show CTA only on front card ─── */
    function updateFrontCta() {
      ctas.forEach(function (el, i) {
        el.classList.toggle('active', order[0] === i);
      });
    }

    /* ─── PixelCard hover — triggered by CTA only ─── */
    function initPixelHover(trigger, card, canvas, w, h) {
      var ctx = canvas.getContext('2d');
      var pixels = [];
      var animId = null;
      var timePrev = performance.now();
      var running = false;

      var gap = 6;
      var speed = 35;
      var colors = '#f8fafc,#f1f5f9,#cbd5e1'.split(',');

      function Pixel(x, y, color, speedVal, delay) {
        this.x = x; this.y = y; this.color = color;
        this.speed = (0.1 + Math.random() * 0.8) * speedVal * 0.001;
        this.size = 0;
        this.sizeStep = Math.random() * 0.4;
        this.minSize = 0.5;
        this.maxSizeInt = 2;
        this.maxSize = this.minSize + Math.random() * (this.maxSizeInt - this.minSize);
        this.delay = delay;
        this.counter = 0;
        this.counterStep = Math.random() * 4 + (w + h) * 0.01;
        this.isIdle = false;
        this.isReverse = false;
        this.isShimmer = false;
      }
      Pixel.prototype.draw = function () {
        var off = this.maxSizeInt * 0.5 - this.size * 0.5;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x + off, this.y + off, this.size, this.size);
      };
      Pixel.prototype.appear = function () {
        this.isIdle = false;
        if (this.counter <= this.delay) { this.counter += this.counterStep; return; }
        if (this.size >= this.maxSize) { this.isShimmer = true; }
        this.isShimmer ? this.shimmer() : (this.size += this.sizeStep);
        this.draw();
      };
      Pixel.prototype.disappear = function () {
        this.isShimmer = false; this.counter = 0;
        if (this.size <= 0) { this.isIdle = true; return; }
        this.size -= 0.1; this.draw();
      };
      Pixel.prototype.shimmer = function () {
        if (this.size >= this.maxSize) this.isReverse = true;
        else if (this.size <= this.minSize) this.isReverse = false;
        this.size += this.isReverse ? -this.speed : this.speed;
      };

      function initPixels() {
        pixels = [];
        for (var x = 0; x < w; x += gap) {
          for (var y = 0; y < h; y += gap) {
            var c = colors[Math.floor(Math.random() * colors.length)];
            var dx = x - w / 2, dy = y - h / 2;
            pixels.push(new Pixel(x, y, c, speed, Math.sqrt(dx * dx + dy * dy)));
          }
        }
      }
      initPixels();

      function doAnimate(fnName) {
        animId = requestAnimationFrame(function () { doAnimate(fnName); });
        var now = performance.now();
        if (now - timePrev < 1000 / 60) return;
        timePrev = now;
        ctx.clearRect(0, 0, w, h);
        var allIdle = true;
        for (var i = 0; i < pixels.length; i++) {
          pixels[i][fnName]();
          if (!pixels[i].isIdle) allIdle = false;
        }
        if (allIdle) { cancelAnimationFrame(animId); running = false; }
      }

      trigger.addEventListener('mouseenter', function () {
        if (running) cancelAnimationFrame(animId);
        running = true; timePrev = performance.now();
        animId = requestAnimationFrame(function () { doAnimate('appear'); });
      });
      trigger.addEventListener('mouseleave', function () {
        if (running) cancelAnimationFrame(animId);
        running = true; timePrev = performance.now();
        animId = requestAnimationFrame(function () { doAnimate('disappear'); });
      });
    }

    return { bringToFront: bringToFront };
  };
})();
