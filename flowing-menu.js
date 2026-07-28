/* ============================================================
   FlowingMenu — Vanilla JS port of React Bits FlowingMenu
   Uses animejs v4 for animations
   ============================================================ */
(function () {
  'use strict';

  const { animate, createTimeline: timeline } = window.anime;

  /**
   * @param {HTMLElement} container — the .menu-wrap element
   * @param {object} opts
   */
  window.FlowingMenu = function (container, opts) {
    const items = opts.items || [];
    const speed = opts.speed || 15;
    const textColor = opts.textColor || '#ffffff';
    const bgColor = opts.bgColor || '#120F17';
    const marqueeBgColor = opts.marqueeBgColor || '#ffffff';
    const marqueeTextColor = opts.marqueeTextColor || '#120F17';
    const borderColor = opts.borderColor || '#ffffff';

    /* --- helpers --- */
    function distMetric(x, y, x2, y2) {
      var dx = x - x2, dy = y - y2;
      return dx * dx + dy * dy;
    }

    function findClosestEdge(mx, my, w, h) {
      return distMetric(mx, my, w / 2, 0) < distMetric(mx, my, w / 2, h)
        ? 'top' : 'bottom';
    }

    /* --- build DOM --- */
    const menu = document.createElement('nav');
    menu.className = 'menu';
    menu.style.backgroundColor = bgColor;

    var anims = [];

    items.forEach(function (item, idx) {
      var itemDiv = document.createElement('div');
      itemDiv.className = 'menu__item';
      itemDiv.style.borderColor = borderColor;

      var link = document.createElement('a');
      link.className = 'menu__item-link';
      link.href = item.link;
      link.textContent = item.text;
      link.style.color = textColor;
      itemDiv.appendChild(link);

      // marquee overlay — handles Y axis (slide in/out)
      var marquee = document.createElement('div');
      marquee.className = 'marquee';
      marquee.style.backgroundColor = marqueeBgColor;
      marquee.style.transform = 'translate3d(0, 101%, 0)';

      // inner-wrap — handles Y counter-movement (enter/leave)
      // Separated from .marquee__inner so X scroll and Y anim don't fight
      var innerWrap = document.createElement('div');
      innerWrap.className = 'marquee__inner-wrap';

      // inner — handles X scroll (continuous marquee)
      var inner = document.createElement('div');
      inner.className = 'marquee__inner';

      // Build content copies
      var repCount = 4;
      for (var i = 0; i < repCount; i++) {
        var part = document.createElement('div');
        part.className = 'marquee__part';
        part.style.color = marqueeTextColor;

        var span = document.createElement('span');
        span.textContent = item.text;
        part.appendChild(span);

        var imgDiv = document.createElement('div');
        imgDiv.className = 'marquee__img';
        imgDiv.style.backgroundImage = 'url(' + item.image + ')';
        part.appendChild(imgDiv);

        inner.appendChild(part);
      }

      innerWrap.appendChild(inner);
      marquee.appendChild(innerWrap);
      itemDiv.appendChild(marquee);
      menu.appendChild(itemDiv);

      /* --- state --- */
      var state = {
        item: itemDiv,
        marquee: marquee,
        innerWrap: innerWrap,
        inner: inner,
        scrollAnim: null,
        enterTl: null,
        leaveTl: null,
        repetitions: repCount,
      };
      anims.push(state);

      /* recalc repetitions on resize */
      function calcReps() {
        var first = inner.querySelector('.marquee__part');
        if (!first) return;
        var cw = first.offsetWidth;
        if (cw === 0) return;
        var vw = window.innerWidth;
        var needed = Math.ceil(vw / cw) + 2;
        var target = Math.max(4, needed);

        if (target !== state.repetitions) {
          state.repetitions = target;
          // rebuild inner children
          inner.innerHTML = '';
          for (var j = 0; j < target; j++) {
            var p = document.createElement('div');
            p.className = 'marquee__part';
            p.style.color = marqueeTextColor;
            var s = document.createElement('span');
            s.textContent = item.text;
            p.appendChild(s);
            var id = document.createElement('div');
            id.className = 'marquee__img';
            id.style.backgroundImage = 'url(' + item.image + ')';
            p.appendChild(id);
            inner.appendChild(p);
          }
          startScroll();
        }
      }

      /* start horizontal scroll loop */
      function startScroll() {
        if (state.scrollAnim) {
          state.scrollAnim.pause();
          state.scrollAnim = null;
        }
        var first = inner.querySelector('.marquee__part');
        if (!first) return;
        var cw = first.offsetWidth;
        if (cw === 0) return;

        state.scrollAnim = animate(inner, {
          translateX: [0, -cw],
          duration: speed * 1000,
          loop: true,
          ease: 'linear',
        });
      }

      var scrollTimer = setTimeout(startScroll, 80);
      window.addEventListener('resize', calcReps);

      /* hover handlers */
      function onEnter(ev) {
        var rect = itemDiv.getBoundingClientRect();
        var x = ev.clientX - rect.left;
        var y = ev.clientY - rect.top;
        var edge = findClosestEdge(x, y, rect.width, rect.height);

        if (state.leaveTl) {
          state.leaveTl.pause();
          state.leaveTl = null;
        }

        var ms = edge === 'top' ? '-101%' : '101%';
        var mi = edge === 'top' ? '101%' : '-101%';

        // Animate marquee (wrapper) and innerWrap (counter-movement)
        // inner (X scroll) is NOT touched by Y animation
        state.enterTl = timeline({ defaults: { duration: 600, ease: 'easeOutExpo' } });
        state.enterTl.add(marquee, { translateY: [ms, '0%'] }, 0);
        state.enterTl.add(innerWrap, { translateY: [mi, '0%'] }, 0);
      }

      function onLeave(ev) {
        var rect = itemDiv.getBoundingClientRect();
        var x = ev.clientX - rect.left;
        var y = ev.clientY - rect.top;
        var edge = findClosestEdge(x, y, rect.width, rect.height);

        if (state.enterTl) {
          state.enterTl.pause();
          state.enterTl = null;
        }

        state.leaveTl = timeline({ defaults: { duration: 600, ease: 'easeOutExpo' } });
        state.leaveTl.add(marquee, { translateY: ['0%', edge === 'top' ? '-101%' : '101%'] }, 0);
        state.leaveTl.add(innerWrap, { translateY: ['0%', edge === 'top' ? '101%' : '-101%'] }, 0);
      }

      link.addEventListener('mouseenter', onEnter);
      link.addEventListener('mouseleave', onLeave);
    });

    container.appendChild(menu);

    return {
      destroy: function () {
        anims.forEach(function (s) {
          if (s.scrollAnim) s.scrollAnim.pause();
          if (s.enterTl) s.enterTl.pause();
          if (s.leaveTl) s.leaveTl.pause();
        });
      },
    };
  };
})();
