/* NetViz: an animated network of people connecting with people (players = ice blue, coaches = amber).
   NetViz.mount(host, { root })  Canvas 2D. Runs only while on screen and the tab is visible. Reduced motion draws one still frame. */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ICE = '175,198,233', AMBER = '242,169,59';

  function mount(host, opts) {
    opts = opts || {};
    var cv = document.createElement('canvas'); cv.className = 'sc-net-cv'; cv.setAttribute('role', 'img');
    cv.setAttribute('aria-label', 'An animated network of players and coaches connecting with each other');
    host.appendChild(cv);
    var ctx = cv.getContext('2d'), dpr = Math.min(window.devicePixelRatio || 1, 2), W = 0, H = 0;
    var nodes = [], links = [], mouse = null, connected = 0, last = 0, spawn = 0, running = false, raf = 0, inView = false;
    var counter = document.createElement('div'); counter.className = 'sc-net-count'; host.appendChild(counter);
    var legend = document.createElement('div'); legend.className = 'sc-net-legend';
    [['PLAYERS', ICE], ['COACHES', AMBER], ['CONNECTIONS', null]].forEach(function (l) {
      var sp = document.createElement('span'); var i = document.createElement('i');
      if (l[1]) i.style.background = 'rgb(' + l[1] + ')'; else i.className = 'ln';
      sp.appendChild(i); sp.appendChild(document.createTextNode(l[0])); legend.appendChild(sp);
    });
    host.appendChild(legend);

    function seed() {
      nodes = [];
      var nPlayers = 30, nCoaches = 7;
      for (var i = 0; i < nPlayers + nCoaches; i++) {
        nodes.push({ x: 20 + Math.random() * (W - 40), y: 20 + Math.random() * (H - 40), vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22,
          coach: i >= nPlayers, r: i >= nPlayers ? 5 : 3.2, glow: 0, seen: 0 });
      }
    }
    function resize() {
      var r = host.getBoundingClientRect(); W = Math.max(280, r.width); H = Math.max(240, Math.min(360, W * 0.62));
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!nodes.length) seed();
    }
    function connect() {
      var coaches = nodes.filter(function (n) { return n.coach; });
      var c = coaches[(Math.random() * coaches.length) | 0], best = null, bd = 1e9;
      nodes.forEach(function (p) {
        if (p.coach || p.glow > .3) return;
        var d = Math.hypot(p.x - c.x, p.y - c.y) + Math.random() * 90; if (d < bd) { bd = d; best = p; }
      });
      if (best) links.push({ a: c, b: best, t: 0, born: performance.now() });
    }
    function step(dt) {
      nodes.forEach(function (n) {
        n.x += n.vx * dt * .06; n.y += n.vy * dt * .06;
        if (n.x < 14 || n.x > W - 14) n.vx *= -1;
        if (n.y < 14 || n.y > H - 14) n.vy *= -1;
        if (mouse) {
          var dx = mouse.x - n.x, dy = mouse.y - n.y, d = Math.hypot(dx, dy);
          if (d < 130 && d > 1) { n.x += dx / d * .25; n.y += dy / d * .25; n.seen = Math.min(1, n.seen + .05); } else n.seen = Math.max(0, n.seen - .03);
        } else n.seen = Math.max(0, n.seen - .03);
        n.glow = Math.max(0, n.glow - dt * .00045);
      });
      links.forEach(function (l) { l.t = Math.min(1, l.t + dt / 650); if (l.t >= 1 && !l.done) { l.done = true; l.b.glow = 1; connected++; } });
      links = links.filter(function (l) { return performance.now() - l.born < 4800; });
      spawn -= dt; if (spawn <= 0) { connect(); spawn = 900 + Math.random() * 700; }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < nodes.length; i++) for (var j = i + 1; j < nodes.length; j++) {
        var a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 105) {
          ctx.strokeStyle = 'rgba(' + ICE + ',' + ((1 - d / 105) * (.26 + Math.max(a.seen, b.seen) * .35)).toFixed(3) + ')';
          ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      links.forEach(function (l) {   // a bright line grows from the coach to the player, with a pulse at its tip
        var age = performance.now() - l.born, fade = age > 3600 ? 1 - (age - 3600) / 1200 : 1;
        var x = l.a.x + (l.b.x - l.a.x) * l.t, y = l.a.y + (l.b.y - l.a.y) * l.t;
        ctx.strokeStyle = 'rgba(' + AMBER + ',' + (.9 * fade).toFixed(3) + ')'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(l.a.x, l.a.y); ctx.lineTo(x, y); ctx.stroke();
        if (l.t < 1) { ctx.fillStyle = 'rgba(255,230,170,' + fade + ')'; ctx.beginPath(); ctx.arc(x, y, 3, 0, 6.283); ctx.fill(); }
      });
      nodes.forEach(function (n) {
        var g = n.glow, c = n.coach ? AMBER : ICE;
        if (g > .02 || n.seen > .02) { ctx.fillStyle = 'rgba(' + AMBER + ',' + (g * .25 + n.seen * .12).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 6 + g * 14, 0, 6.283); ctx.fill(); }
        if (g > .02) { ctx.strokeStyle = 'rgba(' + AMBER + ',' + (g * .7).toFixed(3) + ')'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 4 + (1 - g) * 22, 0, 6.283); ctx.stroke(); }
        ctx.fillStyle = 'rgb(' + (g > .3 ? AMBER : c) + ')'; ctx.beginPath(); ctx.arc(n.x, n.y, n.r + (n.coach ? 0 : g * 1.6), 0, 6.283); ctx.fill();
        if (n.coach) { ctx.strokeStyle = 'rgba(' + AMBER + ',.45)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 4, 0, 6.283); ctx.stroke(); }
      });
      counter.textContent = String(connected).padStart(2, '0') + ' CONNECTIONS MADE';
    }
    function loop(t) {
      if (!running) return;
      var dt = Math.min(48, t - (last || t)); last = t;
      step(dt); draw(); raf = requestAnimationFrame(loop);
    }
    function start() { if (running || reduce) return; running = true; last = 0; raf = requestAnimationFrame(loop); }
    function stop() { running = false; cancelAnimationFrame(raf); }

    cv.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; });
    cv.addEventListener('pointerleave', function () { mouse = null; });
    window.addEventListener('resize', function () { var o = W; resize(); if (o && Math.abs(o - W) > 40) seed(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else if (inView) start(); });
    resize();
    if (reduce) {
      for (var k = 0; k < 4; k++) connect();
      links.forEach(function (l) { l.t = 1; l.done = true; l.b.glow = .8; connected++; l.born = performance.now(); });
      draw(); return;
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { inView = es[0].isIntersecting; if (inView) start(); else stop(); }, { root: opts.root || null, threshold: 0.1 }).observe(host);
    } else { inView = true; start(); }
  }
  window.NetViz = { mount: mount };
})();
