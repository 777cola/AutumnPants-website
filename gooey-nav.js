/* ============================================================
   GooeyNav — Vanilla JS port of React Bits GooeyNav
   Gooey blob indicator with particle burst on click
   ============================================================ */
(function () {
  'use strict';

  var gooeyLinear = 'linear(0,0.068,0.19 2.7%,0.804 8.1%,1.037,1.199 13.2%,1.245,1.27 15.8%,1.274,1.272 17.4%,1.249 19.1%,0.996 28%,0.949,0.928 33.3%,0.926,0.933 36.8%,1.001 45.6%,1.013,1.019 50.8%,1.018 54.4%,1 63.1%,0.995 68%,1.001 85%,1)';

  window.GooeyNav = function (container, opts) {
    var items = opts.items || [];
    var animationTime = opts.animationTime || 600;
    var particleCount = opts.particleCount || 15;
    var particleDistances = opts.particleDistances || [90, 10];
    var particleR = opts.particleR || 100;
    var timeVariance = opts.timeVariance || 300;
    var colors = opts.colors || [1, 2, 3, 1, 2, 3, 1, 4];
    var initialActiveIndex = opts.initialActiveIndex || 0;

    var activeIndex = initialActiveIndex;
    var navEl, filterEl, textEl;

    /* ---- helpers ---- */
    function noise(n) { return n / 2 - Math.random() * n; }

    function getXY(dist, idx, total) {
      var angle = ((360 + noise(8)) / total) * idx * (Math.PI / 180);
      return [dist * Math.cos(angle), dist * Math.sin(angle)];
    }

    function createParticle(i, t, d, r, colorsArr) {
      var rotate = noise(r / 10);
      return {
        start: getXY(d[0], particleCount - i, particleCount),
        end: getXY(d[1] + noise(7), particleCount - i, particleCount),
        time: t,
        scale: 1 + noise(0.2),
        color: colorsArr[Math.floor(Math.random() * colorsArr.length)],
        rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
      };
    }

    function makeParticles(element) {
      var d = particleDistances;
      var r = particleR;
      var bubbleTime = animationTime * 2 + timeVariance;
      element.style.setProperty('--time', bubbleTime + 'ms');

      for (var i = 0; i < particleCount; i++) {
        var t = animationTime * 2 + noise(timeVariance * 2);
        var p = createParticle(i, t, d, r, colors);
        element.classList.remove('active');

        (function (pData) {
          setTimeout(function () {
            var particle = document.createElement('span');
            var point = document.createElement('span');
            particle.className = 'particle';
            particle.style.setProperty('--start-x', pData.start[0] + 'px');
            particle.style.setProperty('--start-y', pData.start[1] + 'px');
            particle.style.setProperty('--end-x', pData.end[0] + 'px');
            particle.style.setProperty('--end-y', pData.end[1] + 'px');
            particle.style.setProperty('--time', pData.time + 'ms');
            particle.style.setProperty('--scale', pData.scale);
            particle.style.setProperty('--color', 'var(--color-' + pData.color + ', white)');
            particle.style.setProperty('--rotate', pData.rotate + 'deg');

            point.className = 'point';
            particle.appendChild(point);
            element.appendChild(particle);
            requestAnimationFrame(function () {
              element.classList.add('active');
            });
            setTimeout(function () {
              try { element.removeChild(particle); } catch (e) {}
            }, pData.time);
          }, 30);
        })(p);
      }
    }

    function updateEffectPosition(el) {
      if (!container || !filterEl || !textEl) return;
      var cr = container.getBoundingClientRect();
      var pos = el.getBoundingClientRect();
      filterEl.style.left = (pos.x - cr.x) + 'px';
      filterEl.style.top = (pos.y - cr.y) + 'px';
      filterEl.style.width = pos.width + 'px';
      filterEl.style.height = pos.height + 'px';
      textEl.style.left = (pos.x - cr.x) + 'px';
      textEl.style.top = (pos.y - cr.y) + 'px';
      textEl.style.width = pos.width + 'px';
      textEl.style.height = pos.height + 'px';
      textEl.textContent = el.textContent;
    }

    function handleClick(liEl, idx) {
      if (activeIndex === idx) return;
      activeIndex = idx;

      // Update active class on all items
      var allLis = navEl.querySelectorAll('li');
      allLis.forEach(function (li, i) {
        li.classList.toggle('active', i === idx);
      });

      updateEffectPosition(liEl);

      // Remove existing particles
      if (filterEl) {
        filterEl.querySelectorAll('.particle').forEach(function (p) {
          filterEl.removeChild(p);
        });
      }
      if (textEl) {
        textEl.classList.remove('active');
        void textEl.offsetWidth; // force reflow
        textEl.classList.add('active');
      }
      if (filterEl) {
        makeParticles(filterEl);
      }
    }

    /* ---- build DOM ---- */
    container.className = 'gooey-nav-container';

    navEl = document.createElement('nav');
    var ul = document.createElement('ul');

    items.forEach(function (item, idx) {
      var li = document.createElement('li');
      li.className = idx === initialActiveIndex ? 'active' : '';
      var a = document.createElement('a');
      a.href = item.href || '#';
      a.textContent = item.label;
      a.addEventListener('click', function (e) {
        // Update active state on click, but still navigate
        handleClick(li, idx);
      });
      li.appendChild(a);
      ul.appendChild(li);
    });

    navEl.appendChild(ul);
    container.appendChild(navEl);

    filterEl = document.createElement('span');
    filterEl.className = 'effect filter';
    container.appendChild(filterEl);

    textEl = document.createElement('span');
    textEl.className = 'effect text';
    container.appendChild(textEl);

    /* ---- initial position ---- */
    setTimeout(function () {
      var firstLi = navEl.querySelector('li');
      if (firstLi) {
        updateEffectPosition(firstLi);
        if (textEl) textEl.classList.add('active');
      }
    }, 10);

    /* ---- resize observer ---- */
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function () {
        var lis = navEl.querySelectorAll('li');
        if (lis[activeIndex]) {
          updateEffectPosition(lis[activeIndex]);
        }
      });
      ro.observe(container);
    }

    return {
      setActive: function (idx) {
        var lis = navEl.querySelectorAll('li');
        if (lis[idx]) handleClick(lis[idx], idx);
      },
      destroy: function () {
        if (window.ResizeObserver) ro && ro.disconnect();
      }
    };
  };
})();
