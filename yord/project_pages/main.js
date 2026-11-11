/* YORD — Project Page: animace řízené scrollem */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) return;

  function getK() {
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--k')) || 1;
  }

  /* --- 0) Typewriter pro citaci: každý znak dostane vlastní span, který je
     do napsání neviditelný (místo zůstává, takže se text nepřelamuje) --- */
  var TYPE_DURATION = 600; // ms

  function prepareTypewriter(el) {
    var chars = [];
    (function wrap(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          Array.from(child.textContent).forEach(function (ch) {
            var s = document.createElement('span');
            s.className = 'tw-char';
            s.textContent = ch;
            frag.appendChild(s);
            chars.push(s);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          wrap(child);
        }
      });
    })(el);
    el.setAttribute('aria-label', el.textContent);
    el._twChars = chars;
  }

  function runTypewriter(el) {
    var chars = el._twChars || [];
    var shown = 0;
    var start = null;
    function frame(now) {
      if (start === null) start = now;
      var t = Math.min(1, (now - start) / TYPE_DURATION);
      var target = Math.round(chars.length * t);
      while (shown < target) chars[shown++].classList.add('is-typed');
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  document.querySelectorAll('[data-typewriter]').forEach(prepareTypewriter);

  /* --- 1) Texty a tlačítka: plynulé objevení, jednou když samotný blok textu
     vjede do okna (jeho horní hrana nad ~80 % výšky okna) --- */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      // Spustit i pro bloky, které už jsou nad oknem (např. po obnovení stránky níž)
      if (e.isIntersecting || e.boundingClientRect.top < 0) {
        e.target.classList.add('is-in');
        e.target.querySelectorAll('[data-typewriter]').forEach(runTypewriter);
        revealObserver.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -20% 0px', threshold: 0 });

  document.querySelectorAll('[data-reveal-group]').forEach(function (g) {
    revealObserver.observe(g);
  });

  /* --- 2) Galerie: posun vázaný na scroll, s plynulým dojezdem ---
     Začátek: horní hrana sekce na spodku okna. Konec: horní hrana sekce nahoře.
     Celkový posun = 198 px při 1440 (škáluje se šířkou okna).
     Průběh má ease-in-out křivku a pozice za scrollem plynule „dojíždí“,
     takže skoky kolečka myši nejsou vidět. */
  var gallery = document.getElementById('gallery');
  var track = gallery && gallery.querySelector('.gallery__track');
  var current = null;
  var running = false;
  var SMOOTH = 0.09; // menší = měkčí dojezd

  function easeInOut(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function targetX() {
    var rect = gallery.getBoundingClientRect();
    var p = 1 - rect.top / window.innerHeight;
    p = Math.min(1, Math.max(0, p));
    return -198 * getK() * easeInOut(p);
  }

  function tick() {
    var target = targetX();
    if (current === null) current = target;
    current += (target - current) * SMOOTH;
    if (Math.abs(target - current) < 0.05) current = target;
    track.style.transform = 'translate3d(' + current.toFixed(2) + 'px,0,0)';
    if (current !== target) {
      requestAnimationFrame(tick);
    } else {
      running = false;
    }
  }
  function startGallery() {
    if (!track || running) return;
    running = true;
    requestAnimationFrame(tick);
  }
  window.addEventListener('scroll', startGallery, { passive: true });
  window.addEventListener('resize', startGallery);
  startGallery();

  /* --- 2b) Parallaxa full-bleed fotek: celý rám s fotkou jede rychleji než stránka ---
     Při vjezdu zespodu je rám posunutý o +RANGE dolů, při odjezdu o −RANGE nahoru,
     takže přijede i odjede ze záběru dřív. Fotka uvnitř rámu se nehýbe.
     Poloha se počítá z neposunuté pozice (offsetTop), aby se posun nesčítal sám se sebou. */
  var bleeds = Array.prototype.slice.call(document.querySelectorAll('.bleed'));
  var PARALLAX_RANGE = 0.30; // podíl výšky rámu (~300 px při 1440)
  var parallaxQueued = false;

  function updateParallax() {
    parallaxQueued = false;
    var vh = window.innerHeight;
    var sy = window.scrollY || window.pageYOffset;
    bleeds.forEach(function (sec) {
      var h = sec.offsetHeight;
      var top = sec.offsetTop - sy;
      if (top + h < -h || top > vh + h) return; // daleko mimo okno
      // 0 = rám právě vjíždí zespodu, 1 = právě odjíždí nahoru
      var p = (vh - top) / (vh + h);
      p = Math.min(1, Math.max(0, p));
      var y = (0.5 - p) * 2 * PARALLAX_RANGE * h;
      sec.style.transform = 'translate3d(0,' + y.toFixed(2) + 'px,0)';
    });
  }
  function requestParallax() {
    if (!parallaxQueued) { parallaxQueued = true; requestAnimationFrame(updateParallax); }
  }
  if (bleeds.length) {
    window.addEventListener('scroll', requestParallax, { passive: true });
    window.addEventListener('resize', requestParallax);
    updateParallax();
  }

  /* --- 3) Results: plynulé načítání čísel, jednou při ~30 % viditelnosti --- */
  var results = document.getElementById('results');
  var counters = results ? Array.prototype.slice.call(results.querySelectorAll('[data-count]')) : [];
  var DURATION = 1800; // ms

  function format(n, suffix) {
    return n.toLocaleString('en-US') + (suffix || '');
  }
  // Rychlý start, jemné dobrzdění na konci
  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

  counters.forEach(function (el) {
    el.textContent = format(0, el.dataset.suffix);
  });

  function runCounters() {
    var start = null;
    function frame(now) {
      if (start === null) start = now;
      var t = Math.min(1, (now - start) / DURATION);
      var e = easeOutQuart(t);
      counters.forEach(function (el) {
        var target = parseInt(el.dataset.count, 10);
        el.textContent = format(Math.round(target * e), el.dataset.suffix);
      });
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (results) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting || e.boundingClientRect.top < 0) {
          countObserver.disconnect();
          runCounters();
        }
      });
    }, { rootMargin: '0px 0px -30% 0px', threshold: 0 });
    countObserver.observe(results);
  }
})();
