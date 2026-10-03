/* Portfolio redesign layer. Everything new lives here + redesign.css so it can be dropped in or removed in one move.
   Reads SITE_CONFIG.numbers, SITE_CONFIG.now, and project.flow from config.js. */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  var cfg = (typeof SITE_CONFIG !== 'undefined') ? SITE_CONFIG : {};
  var EASE_OUT_QUART = function (p) { return 1 - Math.pow(1 - p, 4); };

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function inView(nodes, cb, opts) {
    if (!('IntersectionObserver' in window)) { nodes.forEach(function (n) { cb(n); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { io.unobserve(en.target); cb(en.target); } });
    }, opts || { threshold: 0.25 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  /* ---------- 1. Hero role line: soft scramble between roles ---------- */
  function initRoles() {
    var node = document.getElementById('rolesText');
    if (!node) return;
    var roles = ['TALENT REP', 'TECHNICAL DIRECTOR', 'CONTENT STRATEGIST'];
    var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var i = 0, busy = false;
    node.textContent = roles[0];
    if (reduce) { return; }              // static first role for reduced motion

    function scrambleTo(next) {
      busy = true;
      var from = node.textContent, len = Math.max(from.length, next.length), t0 = performance.now(), DUR = 620;
      (function tick(now) {
        var p = Math.min(1, (now - t0) / DUR), out = '';
        for (var c = 0; c < len; c++) {
          var settleAt = (c / len) * 0.7 + 0.15;           // letters resolve left to right
          if (p >= settleAt) out += next[c] || '';
          else out += (c < Math.max(from.length, next.length) && (next[c] || from[c])) === ' ' ? ' ' : GLYPHS[(Math.random() * 26) | 0];
        }
        node.textContent = out;
        if (p < 1) requestAnimationFrame(tick); else { node.textContent = next; busy = false; }
      })(t0);
    }
    setInterval(function () {
      if (document.hidden || busy) return;
      i = (i + 1) % roles.length;
      scrambleTo(roles[i]);
    }, 3200);
  }

  /* ---------- 2. Numbers strip: count-up on view ---------- */
  function fmt(v, d) {
    return d ? v.toFixed(d) : Math.round(v).toLocaleString('en-US');
  }
  function initNumbers() {
    var grid = document.getElementById('numbersGrid');
    if (!grid || !cfg.numbers) return;
    cfg.numbers.forEach(function (n, idx) {
      var cell = el('div', 'num-cell rv');
      cell.style.setProperty('--i', idx);
      cell.appendChild(el('div', 'num-label', n.label));
      var val = el('div', 'num-value');
      if (n.text) {
        val.appendChild(el('span', 'num-main', n.text));
      } else {
        if (n.prefix) val.appendChild(el('span', 'num-affix', n.prefix));
        var main = el('span', 'num-main', reduce ? fmt(n.value, n.decimals) : fmt(0, n.decimals));
        main.setAttribute('data-to', n.value); main.setAttribute('data-d', n.decimals || 0);
        val.appendChild(main);
        if (n.suffix) val.appendChild(el('span', 'num-affix', n.suffix));
      }
      cell.appendChild(val);
      cell.appendChild(el('div', 'num-detail', n.detail));
      grid.appendChild(cell);
    });

    inView([grid], function () {
      var cells = grid.querySelectorAll('.num-cell');
      cells.forEach(function (c) { c.classList.add('rv-in'); });
      if (reduce) return;
      grid.querySelectorAll('.num-main[data-to]').forEach(function (m, k) {
        var to = parseFloat(m.getAttribute('data-to')), d = parseInt(m.getAttribute('data-d'), 10);
        var delay = 150 + k * 110, DUR = 1500;
        setTimeout(function () {
          var t0 = performance.now();
          (function tick(now) {
            var p = Math.min(1, (now - t0) / DUR);
            m.textContent = fmt(to * EASE_OUT_QUART(p), d);
            if (p < 1) requestAnimationFrame(tick);
          })(t0);
        }, delay);
      });
    }, { threshold: 0.35 });
  }

  /* ---------- 3. Now list ---------- */
  function openProject(title) {
    var rows = document.querySelectorAll('.project-item');
    for (var r = 0; r < rows.length; r++) {
      var t = rows[r].querySelector('.title');
      if (t && t.textContent.trim() === title) { rows[r].click(); return; }
    }
  }
  function initNow() {
    var list = document.getElementById('nowList'), label = document.getElementById('nowLabel');
    if (!list || !cfg.now) return;
    if (label && cfg.now.label) label.textContent = cfg.now.label;
    cfg.now.items.forEach(function (it, idx) {
      var li = el('li', 'now-item rv');
      li.style.setProperty('--i', idx);
      var a = el(it.href ? 'a' : 'button', 'now-row');
      if (it.href) { a.href = it.href; a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      else { a.type = 'button'; a.addEventListener('click', function () { openProject(it.open); }); }
      a.appendChild(el('span', 'now-dot'));
      a.appendChild(el('span', 'now-title', it.title));
      a.appendChild(el('span', 'now-text', it.text));
      a.appendChild(el('span', 'now-tag', it.tag));
      a.appendChild(el('span', 'now-arrow', it.href ? '↗' : '→'));
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  /* ---------- 4. Scroll reveal for new sections ---------- */
  function initReveal() {
    document.documentElement.classList.add('js-rv');
    var nodes = Array.prototype.slice.call(document.querySelectorAll('.rv:not(.num-cell)'));
    inView(nodes, function (n) { n.classList.add('rv-in'); }, { threshold: 0.2 });
  }

  /* ---------- 5. Work row cursor preview ---------- */
  function initRowPeek() {
    var list = document.getElementById('projectList');
    if (!list || !canHover || !cfg.projects) return;
    var peek = el('div', 'row-peek');
    var img = el('div', 'row-peek-img');
    var cap = el('div', 'row-peek-cap');
    peek.appendChild(img); peek.appendChild(cap);
    document.body.appendChild(peek);
    var tx = 0, ty = 0, x = 0, y = 0, raf = null, shown = false;

    function loop() {
      x += (tx - x) * 0.18; y += (ty - y) * 0.18;
      peek.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      raf = shown ? requestAnimationFrame(loop) : null;
    }
    list.addEventListener('mousemove', function (e) {
      tx = e.clientX + 28; ty = e.clientY - 70;
      if (tx + 270 > window.innerWidth) tx = e.clientX - 270 - 28;
    });
    list.querySelectorAll('.project-item').forEach(function (li) {
      li.addEventListener('mouseenter', function (e) {
        var p = cfg.projects[parseInt(li.getAttribute('data-index'), 10)];
        if (!p || !p.image) return;
        img.style.backgroundImage = "url('" + p.image + "')";
        img.style.backgroundSize = p.imageFit === 'contain' ? 'contain' : 'cover';
        cap.textContent = p.title;
        tx = e.clientX + 28; ty = e.clientY - 70;
        if (!shown) { x = tx; y = ty; }
        shown = true; peek.classList.add('on');
        if (!raf) raf = requestAnimationFrame(loop);
      });
    });
    function hide() { shown = false; peek.classList.remove('on'); }
    list.addEventListener('mouseleave', hide);
    window.addEventListener('blur', hide);
  }

  /* ---------- 6. Scroll cue previews the first projects ---------- */
  function initScrollPeek() {
    var peek = document.getElementById('scrollPeek'), btn = document.getElementById('scrollBtn');
    if (!peek || !cfg.projects) return;
    var picks = cfg.projects.slice(0, 3), i = 0;
    function render() {
      var p = picks[i];
      peek.textContent = '';
      var n = el('b', null, '0' + (i + 1));
      peek.appendChild(n);
      peek.appendChild(document.createTextNode(' ' + p.title));
      peek.appendChild(el('i', null, p.role));
    }
    render();
    if (reduce) return;
    setInterval(function () {
      if (document.hidden) return;
      peek.classList.add('swap');
      setTimeout(function () { i = (i + 1) % picks.length; render(); peek.classList.remove('swap'); }, 260);
    }, 3600);
    if (btn) btn.addEventListener('click', function (e) {
      var n = document.getElementById('numbers');
      if (n) { e.stopImmediatePropagation(); n.scrollIntoView({ behavior: 'smooth' }); }
    }, true);
  }

  /* ---------- 7. The dot wave shifts as you move between sections ---------- */
  function initWaveSections() {
    var map = {
      landing:        { y: 355, amp: 1.0 },
      numbers:        { y: 395, amp: 0.8 },
      work:           { y: 430, amp: 0.65 },
      now:            { y: 450, amp: 0.5 },
      about:          { y: 480, amp: 0.45 },
      resume:         { y: 480, amp: 0.4 },
      personal:       { y: 440, amp: 0.65 },
      'claude-robot': { y: 380, amp: 1.0 },
      contact:        { y: 450, amp: 0.55 }
    };
    if (reduce || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var t = map[en.target.id];
        if (en.isIntersecting && t && window._wave) { window._wave.ty = t.y; window._wave.tamp = t.amp; }
      });
    }, { threshold: 0.45 });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  function init() {
    initRoles(); initNumbers(); initReveal();
    initScrollPeek(); initWaveSections();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
