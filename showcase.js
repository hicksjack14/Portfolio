/* Lineup / Coach X case study for the project panel.
   Content comes from SITE_CONFIG.showcases (config.js). Pure DOM building, no innerHTML. */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cfg = (typeof SITE_CONFIG !== 'undefined') ? SITE_CONFIG : {};
  var NS = 'http://www.w3.org/2000/svg';

  function h(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function s(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function add(parent) { for (var i = 1; i < arguments.length; i++) parent.appendChild(arguments[i]); return parent; }

  var scrollRoot = null, observers = [];
  function seen(node, cb, threshold) {
    if (!('IntersectionObserver' in window)) { cb(); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { io.disconnect(); cb(); } });
    }, { root: scrollRoot, threshold: threshold || 0.2 });
    io.observe(node); observers.push(io);
  }
  function reveal(node, i) {
    node.classList.add('sc-rv');
    node.style.setProperty('--i', i || 0);
    seen(node, function () { node.classList.add('sc-in'); }, 0.15);
    return node;
  }
  function kicker(text) { return h('div', 'sc-kicker', text); }
  function tagline(lines, secondClass) {
    var t = h('h3', 'sc-tagline');
    lines.forEach(function (l, i) { t.appendChild(h('span', i ? (secondClass || 'sc-hot') : 'sc-cool', l)); });
    return t;
  }

  /* ---------- timeline ---------- */
  function timeline(items) {
    var wrap = h('div', 'sc-tl'); var line = h('div', 'sc-tl-line'); wrap.appendChild(line);
    items.forEach(function (it, i) {
      var n = h('div', 'sc-tl-item'); n.style.setProperty('--i', i);
      add(n, h('span', 'sc-tl-dot'), h('span', 'sc-tl-when', it.when), h('span', 'sc-tl-title', it.title), h('span', 'sc-tl-text', it.text));
      wrap.appendChild(n);
    });
    seen(wrap, function () { wrap.classList.add('sc-in'); }, 0.3);
    wrap.classList.add('sc-rv-tl');
    return wrap;
  }

  /* ---------- Chapter 1: Lineup ---------- */
  function lineupChapter(d) {
    var ch = h('section', 'sc-ch sc-ch--lineup');
    add(ch, kicker(d.kicker), tagline(d.tagline, 'sc-amber'));
    ch.appendChild(reveal(h('p', 'sc-lead', d.sub), 1));
    ch.appendChild(reveal(h('p', 'sc-body', d.problem), 2));

    // three-step flow with a traveling dot
    var flow = h('div', 'sc-flow'); var line = h('div', 'sc-flow-line'); line.appendChild(h('span', 'sc-flow-dot'));
    flow.appendChild(line);
    d.steps.forEach(function (st, i) {
      var c = h('div', 'sc-flow-step'); c.style.setProperty('--i', i);
      add(c, h('span', 'sc-flow-n', '0' + (i + 1)), h('span', 'sc-flow-node'), h('span', 'sc-flow-t', st.t), h('span', 'sc-flow-d', st.d));
      flow.appendChild(c);
    });
    seen(flow, function () { flow.classList.add('sc-in'); }, 0.3);
    ch.appendChild(flow);
    var ap = appShowcase(d.app); ch._vids = [ap._video]; ch.appendChild(reveal(ap, 0));

    // both sides
    var twin = h('div', 'sc-twin');
    [['PLAYERS', d.players], ['COACHES', d.coaches]].forEach(function (side, i) {
      var col = h('div', 'sc-side'); col.appendChild(h('div', 'sc-label', side[0]));
      var ul = h('ul', 'sc-list'); side[1].forEach(function (t) { ul.appendChild(h('li', null, t)); }); col.appendChild(ul);
      twin.appendChild(reveal(col, i));
    });
    ch.appendChild(twin);

    // an animated network: people connecting with people, next to the statement
    var watch = h('div', 'sc-watch');
    var net = h('div', 'sc-net');
    var sentence = h('p', 'sc-statement', d.watching);
    add(watch, reveal(net, 0), reveal(sentence, 1));
    ch.appendChild(watch);
    if (window.NetViz) window.NetViz.mount(net, { root: scrollRoot });

    // scope + phase 2 + palette
    var meta = h('div', 'sc-meta');
    var chips = h('div', 'sc-chips'); d.scope.forEach(function (t) { chips.appendChild(h('span', 'sc-chip', t)); });
    var pal = h('div', 'sc-pal'); d.palette.forEach(function (p) {
      var sw = h('span', 'sc-sw'); var dot = h('i'); dot.style.background = p.c; add(sw, dot, document.createTextNode(p.n + ' ' + p.c)); pal.appendChild(sw);
    });
    add(meta, chips, h('p', 'sc-phase2', d.phase2), pal);
    ch.appendChild(reveal(meta, 0));
    return ch;
  }

  /* ---------- Chapter 2: Coach X ---------- */
  function trailerPlayer(t) {
    var box = h('div', 'sc-trailer');
    var v = document.createElement('video'); v.preload = 'none'; v.poster = t.poster; v.setAttribute('playsinline', ''); v.src = t.src;
    var btn = h('button', 'sc-play'); btn.type = 'button'; btn.setAttribute('aria-label', 'Play the Coach X pitch film');
    add(btn, h('span', 'sc-play-ring', '▶'), h('span', 'sc-play-label', 'WATCH THE PITCH FILM'), h('span', 'sc-play-meta', '0:58 · SOUND ON'));
    btn.addEventListener('click', function () { btn.classList.add('gone'); v.controls = true; v.play(); });
    add(box, v, btn);
    var cap = h('div', 'sc-cap', t.caption);
    var wrap = h('div'); add(wrap, box, cap);
    wrap._video = v;
    return wrap;
  }

  function compare(c) {
    var row = h('div', 'sc-compare');
    var a = h('div', 'sc-cmp sc-cmp--them'); add(a, h('span', 'sc-cmp-k', c.them), h('span', 'sc-cmp-price', c.themPrice), h('span', 'sc-cmp-t', c.themText));
    var b = h('div', 'sc-cmp sc-cmp--us'); add(b, h('span', 'sc-cmp-k', c.us), h('span', 'sc-cmp-price', 'WATCHES IT.'), h('span', 'sc-cmp-t', c.usText));
    add(row, reveal(a, 0), reveal(b, 1));
    return row;
  }

  function problems(list, note) {
    var wrap = h('div', 'sc-problems'); wrap.appendChild(h('div', 'sc-label', 'FIVE PROBLEMS, DEFINED BY A COACH'));
    var ol = h('ol', 'sc-prob-list');
    list.forEach(function (p, i) {
      var li = h('li', 'sc-prob'); add(li, h('span', 'sc-prob-n', '0' + (i + 1)), h('span', 'sc-prob-t', p.t), h('span', 'sc-prob-d', p.d));
      ol.appendChild(reveal(li, i));
    });
    add(wrap, ol, h('p', 'sc-note', note));
    return wrap;
  }

  /* pipeline scenes */
  var POSE = { nose: [100, 40], le: [94, 34], re: [106, 34], lea: [86, 38], rea: [114, 38], ls: [78, 80], rs: [122, 80], lel: [60, 120], rel: [140, 120], lw: [46, 154], rw: [154, 154], lh: [86, 164], rh: [114, 164], lk: [84, 222], rk: [116, 222], la: [82, 280], ra: [118, 280] };
  var BONES = [['ls', 'rs'], ['ls', 'lh'], ['rs', 'rh'], ['lh', 'rh'], ['ls', 'lel'], ['lel', 'lw'], ['rs', 'rel'], ['rel', 'rw'], ['lh', 'lk'], ['lk', 'la'], ['rh', 'rk'], ['rk', 'ra'], ['nose', 'le'], ['nose', 're'], ['le', 'lea'], ['re', 'rea']];

  function detectScene() {
    var sv = s('svg', { viewBox: '0 0 560 300', 'class': 'sc-svg', role: 'img', 'aria-label': 'Players detected on a rugby pitch' });
    s('rect', { x: 10, y: 10, width: 540, height: 280, rx: 4, 'class': 'sc-pitch' }, sv);
    [90, 190, 280, 370, 470].forEach(function (x) { s('line', { x1: x, y1: 10, x2: x, y2: 290, 'class': 'sc-pline' + (x === 280 ? ' sc-pline--mid' : '') }, sv); });
    var pts = [[120, 70], [150, 120], [110, 170], [170, 215], [205, 90], [230, 150], [260, 205], [300, 70], [330, 130], [310, 190], [370, 100], [395, 160], [350, 230], [430, 120]];
    var tags = { 1: 'SU_09', 5: 'SU_12', 9: 'LN_14', 11: 'SU_15' };
    pts.forEach(function (p, i) {
      var g = s('g', { 'class': 'sc-pl', style: 'animation-delay:' + (-i * 0.7) + 's;animation-duration:' + (5 + (i % 4)) + 's' }, sv);
      s('rect', { x: p[0] - 9, y: p[1] - 15, width: 18, height: 30, rx: 2, 'class': 'sc-box' + (tags[i] ? ' sc-box--hot' : '') }, g);
      s('circle', { cx: p[0], cy: p[1], r: 3, 'class': 'sc-pdot' }, g);
      if (tags[i]) { var t = s('text', { x: p[0] - 9, y: p[1] - 19, 'class': 'sc-boxlabel' }, g); t.textContent = tags[i]; }
    });
    s('rect', { x: 0, y: 0, width: 560, height: 300, fill: 'none', 'class': 'sc-scan' }, sv);
    s('line', { x1: 0, y1: 0, x2: 0, y2: 300, 'class': 'sc-scanline' }, sv);
    return sv;
  }
  function poseScene() {
    var sv = s('svg', { viewBox: '0 0 240 300', 'class': 'sc-svg sc-svg--pose', role: 'img', 'aria-label': 'Seventeen body keypoints on one player' });
    BONES.forEach(function (b, i) { s('line', { x1: POSE[b[0]][0], y1: POSE[b[0]][1], x2: POSE[b[1]][0], y2: POSE[b[1]][1], 'class': 'sc-bone', style: 'animation-delay:' + (i * 0.05) + 's' }, sv); });
    var i = 0;
    for (var k in POSE) { s('circle', { cx: POSE[k][0], cy: POSE[k][1], r: 4.5, 'class': 'sc-kp', style: 'animation-delay:' + (0.4 + i * 0.06) + 's' }, sv); i++; }
    s('path', { d: 'M84 196 A26 26 0 0 0 100 222', 'class': 'sc-arc' }, sv);
    var t1 = s('text', { x: 142, y: 214, 'class': 'sc-angle' }, sv); t1.textContent = 'kneeBend 179°';
    var t2 = s('text', { x: 142, y: 112, 'class': 'sc-angle' }, sv); t2.textContent = 'spineAngle 0°';
    return sv;
  }
  function enrichScene(raw) {
    var tbl = h('div', 'sc-table');
    var head = h('div', 'sc-tr sc-tr--head'); add(head, h('span', null, 'RAW YOLO VALUE'), h('span', null, 'DERIVED METRIC'), h('span', null, 'COACHING FLAG')); tbl.appendChild(head);
    raw.forEach(function (r, i) {
      var row = h('div', 'sc-tr'); row.style.setProperty('--i', i);
      add(row, h('span', 'sc-mono', r[0]), h('span', 'sc-metric', r[1]), h('span', 'sc-flag', r[2])); tbl.appendChild(row);
    });
    return tbl;
  }
  function reportScene(r) {
    var card = h('div', 'sc-report');
    var body = h('p', 'sc-report-text'); body.setAttribute('data-full', r.text);
    add(card, h('div', 'sc-report-who', r.who), body, h('span', 'sc-caret'));
    card._body = body;
    return card;
  }

  function pipeline(d) {
    var wrap = h('div', 'sc-pipe'); wrap.appendChild(h('div', 'sc-label', 'HOW IT WORKS. REAL OUTPUT FROM THE SYSTEM.'));
    var tabs = h('div', 'sc-tabs'); var stage = h('div', 'sc-stage');
    var scenes = [], tabEls = [], cur = -1, timer = null, hover = false, active = false, typeTimer = null;

    function visual(k) { return k === 'DETECT' ? detectScene() : k === 'POSE' ? poseScene() : k === 'ENRICH' ? enrichScene(d.raw) : reportScene(d.report); }
    d.pipeline.forEach(function (st, i) {
      var tb = h('button', 'sc-tab'); tb.type = 'button';
      add(tb, h('span', 'sc-tab-n', '0' + (i + 1)), h('span', 'sc-tab-k', st.k), h('span', 'sc-tab-bar'));
      tb.addEventListener('click', function () { go(i, true); });
      tabs.appendChild(tb); tabEls.push(tb);
      var sc = h('div', 'sc-scene');
      var vis = h('div', 'sc-vis'); var v = visual(st.k); vis.appendChild(v);
      var txt = h('div', 'sc-txt'); add(txt, h('h4', 'sc-st', st.t), h('p', 'sc-sd', st.d));
      add(sc, vis, txt); stage.appendChild(sc); scenes.push({ el: sc, v: v, k: st.k });
    });
    add(wrap, tabs, stage);

    function type(card) {
      var full = card._body.getAttribute('data-full'); clearInterval(typeTimer);
      if (reduce) { card._body.textContent = full; return; }
      card._body.textContent = ''; var n = 0;
      typeTimer = setInterval(function () { n += 2; card._body.textContent = full.slice(0, n); if (n >= full.length) clearInterval(typeTimer); }, 22);
    }
    function go(i, user) {
      if (i === cur) return;
      cur = i;
      scenes.forEach(function (sc, j) { sc.el.classList.toggle('on', j === i); });
      tabEls.forEach(function (t, j) { t.classList.toggle('on', j === i); t.classList.remove('run'); });
      void tabs.offsetWidth;
      if (!reduce) tabEls[i].classList.add('run');
      if (scenes[i].k === 'REPORT') type(scenes[i].v);
      clearTimeout(timer);
      if (!reduce && !user) arm(); else if (!reduce && user) arm(9000);
    }
    function arm(ms) { clearTimeout(timer); timer = setTimeout(function () { if (active && !hover) go((cur + 1) % scenes.length); else arm(1200); }, ms || 5600); }
    stage.addEventListener('pointerenter', function () { hover = true; });
    stage.addEventListener('pointerleave', function () { hover = false; });
    go(0, true); clearTimeout(timer);
    seen(wrap, function () { active = true; wrap.classList.add('sc-in'); if (!reduce) { tabEls[0].classList.remove('run'); void tabs.offsetWidth; tabEls[0].classList.add('run'); arm(); } }, 0.35);
    wrap._stop = function () { active = false; clearTimeout(timer); clearInterval(typeTimer); };
    return wrap;
  }

  function appShowcase(a) {
    var wrap = h('div', 'sc-app');
    var frame = h('div', 'sc-frame');
    var bar = h('div', 'sc-frame-bar'); add(bar, h('i'), h('i'), h('i'), h('span', null, 'LINEUP \u00B7 APP PREVIEW \u00B7 CONCEPT')); frame.appendChild(bar);
    var v = document.createElement('video'); v.muted = true; v.loop = true; v.setAttribute('playsinline', ''); v.preload = 'metadata'; if (a.poster) v.poster = a.poster; v.src = a.src;
    frame.appendChild(v);
    var steps = h('div', 'sc-app-steps'); steps.style.setProperty('--n', a.steps.length); var els = a.steps.map(function (t, i) { var e = h('span', 'sc-app-step', t); e.setAttribute('data-i', i); steps.appendChild(e); return e; });
    add(wrap, frame, steps);
    var marks = (a.marks || []).concat([9999]);
    v.addEventListener('timeupdate', function () {
      var t = v.currentTime, idx = -1; for (var i = 0; i < a.steps.length; i++) if (t >= marks[i] && t < marks[i + 1]) idx = i;
      els.forEach(function (e, j) { e.classList.toggle('on', j === idx); });
    });
    if (reduce) { v.controls = true; v.removeAttribute('loop'); }
    else if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { v.play().catch(function () {}); } else v.pause(); }); }, { root: scrollRoot, threshold: 0.35 });
      io.observe(frame); observers.push(io);
    }
    wrap._video = v;
    return wrap;
  }

  function coachxChapter(d) {
    var ch = h('section', 'sc-ch sc-ch--coachx'); var vids = [], stops = [];
    add(ch, kicker(d.kicker), tagline(d.tagline, 'sc-cyan'));
    if (d.intro) ch.appendChild(reveal(h('p', 'sc-body', d.intro), 1));
    var tr = trailerPlayer(d.trailer); vids.push(tr._video); ch.appendChild(reveal(tr, 0));
    ch.appendChild(compare(d.compare));
    ch.appendChild(problems(d.problems, d.problemsNote));
    var pp = pipeline(d); stops.push(pp._stop); ch.appendChild(pp);
    ch._vids = vids; ch._stops = stops;
    return ch;
  }

  /* ---------- mount on panel open ---------- */
  function mount(host, key, panel) {
    var d = cfg.showcases && cfg.showcases[key]; if (!d || !host) return;
    scrollRoot = panel.querySelector('.panel-scroll'); observers = [];
    host.textContent = '';
    panel.classList.add('panel--showcase');
    var vis = panel.querySelector('.panel-visual');
    if (vis && window.Logos) {
      var lock = document.createElement('div'); lock.className = 'sc-hero-lockup'; vis.appendChild(lock);
      window.Logos.lineup(lock, { size: 'xl', idle: true, root: scrollRoot });
    }
    var root = h('div', 'sc');
    root.appendChild(timeline(d.timeline));
    var c1 = lineupChapter(d.lineup), c2 = coachxChapter(d.coachx);
    add(root, c1, c2);
    if (d.lineup.legal) root.appendChild(h('p', 'sc-legal', d.lineup.legal));
    host.appendChild(root);
    // stop videos, timers and observers when the panel closes
    var prev = panel._dotWaveCleanup;
    panel._dotWaveCleanup = function () {
      if (prev) prev();
      c2._vids.concat(c1._vids || []).forEach(function (v) { v.pause(); v.removeAttribute('src'); v.load(); });
      c2._stops.forEach(function (f) { f(); });
      observers.forEach(function (o) { o.disconnect(); });
    };
  }
  window.addEventListener('panel:open', function (e) {
    var p = e.detail.project;
    if (p && p.showcase) mount(e.detail.panel.querySelector('#panelShowcase'), p.showcase, e.detail.panel);
  });
})();
