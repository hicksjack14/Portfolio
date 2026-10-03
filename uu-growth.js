/* UU growth motion piece. Vanilla JS, no dependencies.
   UUGrowth.mount(containerEl, growthConfig, scrollRootEl?)
   Data comes from SITE_CONFIG.projects[...].growth in config.js.
   Timeline (ms): counters 0 | followers line 150-1750 | bars 600-1900 | cumulative line 1500-3000 | labels 3000. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function svgEl(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var key in attrs) e.setAttribute(key, attrs[key]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function k(v)   { return (v / 1000).toFixed(v >= 100000 ? 0 : 1).replace(/\.0$/, '') + 'K'; }
  function num(v) { return Math.round(v).toLocaleString('en-US'); }

  function countUp(node, to, ms, delay, fmt, from) {
    from = from || 0;
    if (reduce) { node.textContent = fmt(to); return; }
    node.textContent = fmt(from);
    setTimeout(function () {
      var t0 = performance.now();
      (function tick(now) {
        var p = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - p, 4); // ease-out-quart
        node.textContent = fmt(from + (to - from) * e);
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }, delay);
  }

  /* ---------- followers line chart (supports 2+ points) ---------- */
  function followersChart(host, g) {
    var pts = g.followers.points, W = 600, H = 300, pL = 46, pR = 74, pT = 20, pB = 34;
    var min = g.followers.axisMin, max = g.followers.axisMax;
    var x = function (i) { return pL + (i / (pts.length - 1)) * (W - pL - pR); };
    var y = function (v) { return pT + (1 - (v - min) / (max - min)) * (H - pT - pB); };
    var svg = svgEl('svg', { 'class': 'ug-chart', viewBox: '0 0 ' + W + ' ' + H, role: 'img',
      'aria-label': 'Followers rose from ' + k(pts[0].value) + ' to ' + k(pts[pts.length - 1].value) + '.' }, host);

    for (var v = Math.ceil(min / 500) * 500; v <= max; v += 500) {
      svgEl('line', { 'class': 'ug-grid', x1: pL, x2: W - pR + 24, y1: y(v), y2: y(v) }, svg);
      svgEl('text', { 'class': 'ug-tick', x: pL - 10, y: y(v) + 3, 'text-anchor': 'end' }, svg).textContent = k(v);
    }
    var sy = y(pts[0].value);
    svgEl('line', { 'class': 'ug-base', x1: x(0), x2: W - pR + 24, y1: sy, y2: sy }, svg);

    var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + x(i) + ' ' + y(p.value); }).join(' ');
    var defs = svgEl('defs', {}, svg), gr = svgEl('linearGradient', { id: 'ugA' + g._uid, x1: 0, x2: 0, y1: 0, y2: 1 }, defs);
    svgEl('stop', { offset: '0%', 'stop-color': 'currentColor', 'stop-opacity': 0.3 }, gr);
    svgEl('stop', { offset: '100%', 'stop-color': 'currentColor', 'stop-opacity': 0 }, gr);
    svgEl('path', { 'class': 'ug-area', d: d + ' L' + x(pts.length - 1) + ' ' + y(min) + ' L' + x(0) + ' ' + y(min) + ' Z', fill: 'url(#ugA' + g._uid + ')' }, svg);
    svgEl('path', { 'class': 'ug-line ug-line--f', d: d, pathLength: 1 }, svg);

    var last = pts[pts.length - 1], bx = x(pts.length - 1) + 30;
    svgEl('path', { 'class': 'ug-bracket', d: 'M' + (bx - 6) + ' ' + sy + ' H' + bx + ' V' + y(last.value) + ' H' + (bx - 6), fill: 'none' }, svg);
    svgEl('text', { 'class': 'ug-gain', x: bx + 8, y: (sy + y(last.value)) / 2 + 4 }, svg).textContent = '+' + num(last.value - pts[0].value);

    pts.forEach(function (p, i) {
      var end = i === pts.length - 1;
      if (end) svgEl('circle', { 'class': 'ug-halo', cx: x(i), cy: y(p.value), r: 6 }, svg);
      svgEl('circle', { 'class': 'ug-dot ' + (end ? 'ug-dot--end' : 'ug-dot--start'), cx: x(i), cy: y(p.value), r: end ? 5 : 4 }, svg);
      svgEl('text', { 'class': 'ug-xlabel', x: x(i), y: H - 8, 'text-anchor': i === 0 ? 'start' : end ? 'end' : 'middle' }, svg).textContent = p.label;
    });
  }

  /* ---------- engagement chart: one bar per month (+ cumulative line once there are 2+ months) ---------- */
  function monthsOf(g) { return g.engagements.months; }
  function engagementTotal(g) { return monthsOf(g).reduce(function (s, m) { return s + m.value; }, 0); }

  function engagementChart(host, g) {
    var ms = monthsOf(g), W = 600, H = 300, pL = 46, pR = 74, pT = 20, pB = 34;
    var peak = Math.max.apply(null, ms.map(function (m) { return m.value; }));
    var step = Math.pow(10, Math.floor(Math.log10(peak))) / 2;          // 500K -> 50K steps
    var axisMax = Math.ceil(peak * 1.12 / (step * 2)) * step * 2;
    var total = engagementTotal(g), cum = [], run = 0;
    ms.forEach(function (m) { run += m.value; cum.push(run); });
    var slot = (W - pL - pR) / Math.max(ms.length, 3), bw = Math.min(slot * 0.5, 110);  // keep a lone bar from looking huge
    var cx = function (i) { return pL + slot * i + slot / 2; };
    var by = function (v) { return pT + (1 - v / axisMax) * (H - pT - pB); };
    var cy = function (v) { return pT + (1 - v / total) * (H - pT - pB); };
    var svg = svgEl('svg', { 'class': 'ug-chart', viewBox: '0 0 ' + W + ' ' + H, role: 'img',
      'aria-label': 'Monthly engagements: ' + k(total) + ' in month one.' }, host);

    for (var v = 0; v <= axisMax; v += axisMax / 4) {
      svgEl('line', { 'class': 'ug-grid', x1: pL, x2: W - pR + 24, y1: by(v), y2: by(v) }, svg);
      svgEl('text', { 'class': 'ug-tick', x: pL - 10, y: by(v) + 3, 'text-anchor': 'end' }, svg).textContent = v ? k(v) : '0';
    }

    ms.forEach(function (m, i) {
      var r = svgEl('rect', { 'class': 'ug-bar', x: cx(i) - bw / 2, y: by(m.value), width: bw, height: by(0) - by(m.value), rx: 2 }, svg);
      r.style.setProperty('--d', (600 + i * 170) + 'ms');
      svgEl('text', { 'class': 'ug-barval', x: cx(i), y: by(m.value) - 8, 'text-anchor': 'middle' }, svg).textContent = k(m.value);
      svgEl('text', { 'class': 'ug-xlabel', x: cx(i), y: H - 8, 'text-anchor': 'middle' }, svg).textContent = m.label;
    });

    if (ms.length > 1) {   // running total across months
      var d = cum.map(function (v, i) { return (i ? 'L' : 'M') + cx(i) + ' ' + cy(v); }).join(' ');
      svgEl('path', { 'class': 'ug-line ug-line--e', d: d, pathLength: 1 }, svg);
      var li = ms.length - 1;
      svgEl('circle', { 'class': 'ug-halo ug-halo--e', cx: cx(li), cy: cy(total), r: 6 }, svg);
      svgEl('circle', { 'class': 'ug-dot ug-dot--endE', cx: cx(li), cy: cy(total), r: 5 }, svg);
      svgEl('text', { 'class': 'ug-gain ug-gain--e', x: cx(li) + 14, y: cy(total) + 4 }, svg).textContent = k(total) + '+ TOTAL';
    }
  }

  function mount(host, g, scrollRoot) {
    if (!host || !g) return;
    g._uid = Math.random().toString(36).slice(2, 7);
    var fp = g.followers.points, f0 = fp[0].value, f1 = fp[fp.length - 1].value;
    var total = engagementTotal(g);
    var pct = ((f1 - f0) / f0 * 100).toFixed(1);

    // Only numbers and escaped config text go into this template.
    host.innerHTML =
      '<div class="ug" data-ug>' +
        '<div class="ug-top">' +
          '<span class="ug-eyebrow">' + esc(g.eyebrow || 'Month one') + '</span>' +
          '<button type="button" class="ug-replay" aria-label="Replay animation">&#8635; REPLAY</button>' +
        '</div>' +
        '<div class="ug-counters">' +
          '<div><div class="ug-clabel">FOLLOWERS</div><div class="ug-big" data-f>' + num(f0) + '</div><div class="ug-sub">+' + num(f1 - f0) + ' &nbsp;/&nbsp; +' + pct + '%</div></div>' +
          '<div><div class="ug-clabel">ENGAGEMENTS</div><div class="ug-big ug-big--e" data-e>0</div><div class="ug-sub">in the first month</div></div>' +
        '</div>' +
        '<div class="ug-charts">' +
          '<div><div class="ug-clabel">FOLLOWERS OVER TIME</div><div data-fc></div></div>' +
          '<div><div class="ug-clabel">ENGAGEMENTS BY MONTH' +
            (g.engagements.sample ? ' <span class="ug-sample">SAMPLE DATA</span>' : '') + '</div><div data-ec></div></div>' +
        '</div>' +
        (g.note ? '<p class="ug-note">' + esc(g.note) + '</p>' : '') +
      '</div>';

    var root = host.querySelector('[data-ug]');
    followersChart(host.querySelector('[data-fc]'), g);
    engagementChart(host.querySelector('[data-ec]'), g);

    function play() {
      root.classList.remove('ug-go');
      void root.offsetWidth; // restart CSS animations
      root.classList.add('ug-go');
      countUp(root.querySelector('[data-f]'), f1, 1700, 150, num, f0);
      countUp(root.querySelector('[data-e]'), total, 2800, 500, function (v) { return k(v) + (v >= total ? '+' : ''); });
    }
    root.querySelector('.ug-replay').addEventListener('click', play);

    var started = false;
    function start() { if (!started) { started = true; play(); } }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { start(); io.disconnect(); }
      }, { root: scrollRoot || null, threshold: 0.3 });
      io.observe(root);
    } else start();
  }

  window.UUGrowth = { mount: mount };
})();
