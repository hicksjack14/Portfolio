/* Animated logos (Lineup, Run Lab, Crates) with custom-drawn lettering, plus the logo reel.
   The lettering is NOT a font: every letter is a hand-built vector stroke that draws itself, glows, then flashes.
   Logos.lineup(host, opts) / Logos.runlab(host, opts) / Logos.crates(host, opts)
   opts.hover: element(s) that replay the animation on mouseenter (a card). Plays once when first scrolled into view.
   Final state is always fully drawn, so the logo is never blank before it animates. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cfg = (typeof SITE_CONFIG !== 'undefined') ? SITE_CONFIG : {};
  var uid = 0;

  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function s(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }

  /* ---------- the alphabet: monoline letters on a 80-unit-tall grid (w = advance width) ---------- */
  var A = {
    L: { w: 46, d: 'M6 2 V74 H46' },
    I: { w: 12, d: 'M6 2 V78' },
    N: { w: 46, d: 'M6 78 V2 L46 78 V2' },
    E: { w: 44, d: 'M44 6 H6 V74 H44 M6 40 H36' },
    U: { w: 46, d: 'M6 2 V50 A20 20 0 0 0 46 50 V2' },
    P: { w: 48, d: 'M6 78 V6 H30 A17 17 0 0 1 30 40 H6' },
    R: { w: 48, d: 'M6 78 V6 H30 A17 17 0 0 1 30 40 H6 M28 40 L46 78' },
    A: { w: 52, d: 'M4 78 L26 4 L48 78 M13 54 H39' },
    B: { w: 48, d: 'M6 6 V74 M6 6 H28 A16 16 0 0 1 28 38 H6 M6 38 H31 A18 18 0 0 1 31 74 H6' },
    C: { w: 48, d: 'M46 16 A28 28 0 1 0 46 64' },
    T: { w: 52, d: 'M2 6 H50 M26 6 V78' },
    S: { w: 46, d: 'M42 16 C38 4 10 4 8 24 C6 42 42 36 42 58 C42 78 10 78 4 64' },
    ' ': { w: 22, d: '' }
  };
  /* wordSVG: builds the drawn lettering. `stroke` is in letter units, `gap` the letter spacing. */
  function wordSVG(text, o) {
    var x = 0, pad = o.stroke / 2 + 2, svg = s('svg', { 'class': 'lg-wsvg' });
    var g = s('g', { 'class': 'lg-wg', fill: 'none', stroke: o.color, 'stroke-width': o.stroke, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
    var i = 0;
    text.split('').forEach(function (ch) {
      var L = A[ch]; if (!L) return;
      if (L.d) { s('path', { 'class': 'lg-l', pathLength: 1, d: L.d, transform: 'translate(' + x + ' 0)', style: '--i:' + i }, g); i++; }
      x += L.w + o.gap;
    });
    var W = x - o.gap;
    svg.setAttribute('viewBox', (-pad) + ' ' + (-pad) + ' ' + (W + pad * 2 + 4) + ' ' + (80 + pad * 2));
    svg.setAttribute('aria-hidden', 'true');
    svg.style.setProperty('--ratio', ((W + pad * 2 + 4) / (80 + pad * 2)).toFixed(3));
    return svg;
  }

  function play(box) { box.classList.remove('go'); void box.offsetWidth; box.classList.add('go'); box._t = performance.now(); }
  function arm(box, opts) {
    opts = opts || {};
    function again() { if (!box._t || performance.now() - box._t > 2600) play(box); }
    box.addEventListener('click', function () { play(box); });
    [].concat(opts.hover || []).forEach(function (el) { if (el) el.addEventListener('mouseenter', again); });
    if (reduce) return;
    if (!('IntersectionObserver' in window)) { return; }
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); play(box); } }, { root: opts.root || null, threshold: 0.5 });
    io.observe(box);
  }

  /* ---------- Lineup: ribbon L + amber "i" (the L and the dot read as "Li"), then N E U P draw in ---------- */
  function lineup(host, opts) {
    opts = opts || {};
    var id = 'lgl' + (++uid), box = h('div', 'lg lg-lineup' + (opts.idle ? ' lg--idle' : '') + (opts.size ? ' lg--' + opts.size : ''));
    box.setAttribute('role', 'img'); box.setAttribute('aria-label', 'Lineup');
    var svg = s('svg', { viewBox: '120 80 360 350', 'class': 'lg-mark' });
    var defs = s('defs', {}, svg);
    var g = s('linearGradient', { id: id + 'r', x1: 0, y1: 1, x2: 1, y2: 0 }, defs);
    [['0', '#5E93F5'], ['.6', '#AFC6E9'], ['1', '#F2F7FF']].forEach(function (st) { s('stop', { offset: st[0], 'stop-color': st[1] }, g); });
    var a = s('linearGradient', { id: id + 'a', x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
    s('stop', { offset: 0, 'stop-color': '#FFC766' }, a); s('stop', { offset: 1, 'stop-color': '#F2A93B' }, a);
    s('path', { 'class': 'lg-ribbon', pathLength: 1, d: 'M178 120 V338 Q178 384 224 384 H300 Q334 384 352 354 L388 292', fill: 'none', stroke: 'url(#' + id + 'r)', 'stroke-width': 54, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
    s('path', { 'class': 'lg-sheen', pathLength: 1, d: 'M178 120 V338 Q178 384 224 384 H300', fill: 'none', stroke: '#fff', 'stroke-opacity': .22, 'stroke-width': 10, 'stroke-linecap': 'round' }, svg);
    var dot = s('g', { 'class': 'lg-dot' }, svg);
    s('circle', { 'class': 'lg-halo', cx: 408, cy: 214, r: 29, fill: '#F2A93B' }, dot);
    var fl = s('g', { 'class': 'lg-float' }, dot);
    s('circle', { cx: 408, cy: 214, r: 29, fill: 'url(#' + id + 'a)' }, fl);
    box.appendChild(svg);
    var w = wordSVG('NEUP', { stroke: 15, gap: 20, color: '#AFC6E9' }); w.classList.add('lg-w--lineup'); box.appendChild(w);
    host.appendChild(box); arm(box, opts); return box;
  }

  /* ---------- Run Lab: two rings draw, the replay marker runs a lap, RUN LAB is drawn in ---------- */
  function runlab(host, opts) {
    opts = opts || {};
    var box = h('div', 'lg lg-runlab'); box.setAttribute('role', 'img'); box.setAttribute('aria-label', 'Run Lab');
    var svg = s('svg', { viewBox: '100 100 824 824', 'class': 'lg-mark' });
    s('circle', { 'class': 'lg-ring lg-ring--o', cx: 512, cy: 512, r: 344, pathLength: 1, fill: 'none', stroke: '#7dd9fc', 'stroke-width': 96, transform: 'rotate(-90 512 512)' }, svg);
    s('circle', { 'class': 'lg-ring lg-ring--i', cx: 512, cy: 512, r: 202, pathLength: 1, fill: 'none', stroke: '#ff6e50', 'stroke-width': 84, transform: 'rotate(-90 512 512)' }, svg);
    var orbit = s('g', { 'class': 'lg-orbit' }, svg);
    var mx = 512 + 344 * Math.cos(-40 * Math.PI / 180), my = 512 + 344 * Math.sin(-40 * Math.PI / 180);
    s('circle', { 'class': 'lg-halo', cx: mx, cy: my, r: 74, fill: '#e6f4fe' }, orbit);
    s('circle', { cx: mx, cy: my, r: 74, fill: '#061223' }, orbit);
    s('circle', { cx: mx, cy: my, r: 58, fill: '#e6f4fe' }, orbit);
    box.appendChild(svg);
    var w = wordSVG('RUN LAB', { stroke: 9, gap: 16, color: '#7dd9fc' }); w.classList.add('lg-w--runlab'); box.appendChild(w);
    host.appendChild(box); arm(box, opts); return box;
  }

  /* ---------- Crates: the crate builds, the record rises and spins, CRATES is drawn in ---------- */
  function crates(host, opts) {
    opts = opts || {};
    var box = h('div', 'lg lg-crates'); box.setAttribute('role', 'img'); box.setAttribute('aria-label', 'Crates');
    var svg = s('svg', { viewBox: '70 50 372 400', 'class': 'lg-mark' });
    // the record is clipped at the crate's top edge (no solid mask, so the site background shows through)
    var cid = 'lgc' + (++uid), cdefs = s('defs', {}, svg), cp = s('clipPath', { id: cid }, cdefs);
    s('rect', { x: 0, y: 0, width: 512, height: 262 }, cp);
    var clip = s('g', { 'clip-path': 'url(#' + cid + ')' }, svg);
    var rec = s('g', { 'class': 'lg-record' }, clip);
    var spin = s('g', { 'class': 'lg-spin' }, rec);
    s('circle', { cx: 256, cy: 212, r: 152, fill: '#0f150e', stroke: '#b3f835', 'stroke-width': 10 }, spin);
    [128, 112, 96, 80].forEach(function (r) { s('circle', { cx: 256, cy: 212, r: r, fill: 'none', stroke: '#2f4228', 'stroke-width': 3 }, spin); });
    s('circle', { cx: 256, cy: 212, r: 52, fill: '#b3f835' }, spin);
    s('circle', { cx: 256, cy: 212, r: 9, fill: '#060806' }, spin);
    s('path', { d: 'M256 212 L256 160', stroke: '#060806', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: .55 }, spin);
    s('path', { 'class': 'lg-slat lg-slat--1', 'fill-rule': 'evenodd', fill: '#b3f835', d: 'M88 262h336a8 8 0 0 1 8 8v58H80v-58a8 8 0 0 1 8-8Z M206 286h100a12 12 0 0 1 0 24H206a12 12 0 0 1 0-24Z' }, svg);
    s('rect', { 'class': 'lg-slat lg-slat--2', x: 80, y: 342, width: 352, height: 36, fill: '#b3f835' }, svg);
    s('path', { 'class': 'lg-slat lg-slat--3', fill: '#b3f835', d: 'M80 392h352v36a8 8 0 0 1-8 8H88a8 8 0 0 1-8-8Z' }, svg);
    box.appendChild(svg);
    var w = wordSVG('CRATES', { stroke: 11, gap: 14, color: '#b3f835' }); w.classList.add('lg-w--crates'); box.appendChild(w);
    host.appendChild(box); arm(box, opts); return box;
  }

  /* ---------- Logo reel ---------- */
  function openByTitle(title) {
    var rows = document.querySelectorAll('.project-item');
    for (var i = 0; i < rows.length; i++) { var t = rows[i].querySelector('.title'); if (t && t.textContent.trim() === title) { rows[i].click(); return true; } }
    return false;
  }
  function reel() {
    var host = document.getElementById('logoReel'); if (!host || !cfg.projects) return;
    var items = [];
    cfg.projects.forEach(function (p) { items.push({ name: p.title, img: p.logo || p.image, open: p.title, role: p.roleShort || p.role }); });
    items.push({ name: 'CRATES', img: 'assets/crates/mark.svg', click: function () { var c = document.getElementById('cratesCard'); if (c) c.click(); }, role: 'BUILT IT' });
    items.push({ name: 'RUN LAB', img: 'assets/runlab/icon.svg', href: 'https://hicksjack14.github.io/run-lab/', role: 'BUILT IT' });
    var track = h('div', 'lgr-track');
    function chip(it) {
      var el = it.href ? h('a', 'lgr-item') : h('button', 'lgr-item');
      if (it.href) { el.href = it.href; el.target = '_blank'; el.rel = 'noopener noreferrer'; } else el.type = 'button';
      var im = h('span', 'lgr-chip'); var i = document.createElement('img'); i.src = it.img; i.alt = ''; i.loading = 'lazy'; im.appendChild(i);
      var tx = h('span', 'lgr-tx'); tx.appendChild(h('b', null, it.name)); tx.appendChild(h('i', null, it.role));
      el.appendChild(im); el.appendChild(tx);
      el.addEventListener('click', function () { if (it.click) it.click(); else if (it.open) openByTitle(it.open); });
      return el;
    }
    var set = h('div', 'lgr-set'); items.forEach(function (it) { set.appendChild(chip(it)); });
    var dup = h('div', 'lgr-set'); dup.setAttribute('aria-hidden', 'true');
    items.forEach(function (it) { var c = chip(it); c.tabIndex = -1; dup.appendChild(c); });
    track.appendChild(set); track.appendChild(dup); host.appendChild(track);
  }

  function init() {
    document.querySelectorAll('[data-logo]').forEach(function (slot) {
      var k = slot.getAttribute('data-logo'), card = slot.closest('.personal-project-card');
      var o = { hover: card };
      if (slot.getAttribute('data-stage')) slot.classList.add('lg-stage--on');
      if (k === 'runlab') runlab(slot, o); else if (k === 'crates') crates(slot, o); else if (k === 'lineup') lineup(slot, o);
    });
    reel();
  }
  window.Logos = { lineup: lineup, runlab: runlab, crates: crates };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
