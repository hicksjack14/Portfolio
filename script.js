/* ============================================================
   JACK HICKS — script.js
   Depends on: SITE_CONFIG (config.js), GSAP (CDN)
   ============================================================ */

(function () {
  'use strict';

  // ── DOM REFS ─────────────────────────────────────────────
  const projectListEl = document.getElementById('projectList');
  const portfolioEl   = document.getElementById('portfolioContainer');
  const bgImageEl     = document.getElementById('backgroundImage');
  const locationEl    = document.getElementById('locationDisplay');
  const footerLocEl   = document.getElementById('footerLocation');
  const timeEl        = document.getElementById('currentTime');
  const socialRowEl   = document.getElementById('socialRow');

  // ── STATE ────────────────────────────────────────────────
  let projectRefs    = [];
  let activeIndex    = -1;
  let idleTimeline   = null;
  let idleTimeout    = null;
  let isHovering     = false;
  let panelOpen      = false;
  let currentPanel   = null;

  const SCRAMBLE_CHARS    = 'QWERTYUIOP@#$&1234567890';
  const SCRAMBLE_DURATION = 700;

  // ── 1. RENDER PROJECT LIST ───────────────────────────────
  function renderProjects() {
    if (!projectListEl || !SITE_CONFIG.projects) return;

    SITE_CONFIG.projects.forEach(function (project, index) {
      var li = document.createElement('li');
      li.className = 'project-item';
      li.setAttribute('data-index', index);
      li.setAttribute('data-image', project.image || '');
      li.setAttribute('role', 'listitem');
      li.setAttribute('tabindex', '0');

      li.innerHTML =
        '<span class="project-data title">'  + project.title  + '</span>' +
        '<span class="project-data role">'   + project.role   + '</span>' +
        '<span class="project-data type">'   + project.type   + '</span>' +
        '<button class="project-open-btn" tabindex="-1">' +
          '<span class="project-open-label">OPEN</span>' +
          '<span class="project-open-arrow">→</span>' +
        '</button>' +
        '<span class="project-data year">'   + project.year   + '</span>';

      li.addEventListener('mouseenter', function () {
        if (!panelOpen) handleRowEnter(index, li);
      });

      li.addEventListener('click', function () {
        openPanel(index);
      });

      li.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openPanel(index);
        }
      });

      projectListEl.appendChild(li);
      projectRefs.push(li);
    });

    if (portfolioEl) {
      portfolioEl.addEventListener('mouseleave', function () {
        if (!panelOpen) handleContainerLeave();
      });
    }
  }

  // ── 2. TIME DISPLAY ──────────────────────────────────────
  function updateTime() {
    if (!timeEl || !SITE_CONFIG.timeZone) return;

    var now = new Date();
    var formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: SITE_CONFIG.timeZone,
      hour:     'numeric',
      minute:   '2-digit',
      hour12:   true
    });

    var parts     = formatter.formatToParts(now);
    var hour      = '';
    var minute    = '';
    var dayPeriod = '';

    parts.forEach(function (part) {
      if (part.type === 'hour')      hour      = part.value;
      if (part.type === 'minute')    minute    = part.value;
      if (part.type === 'dayPeriod') dayPeriod = part.value;
    });

    timeEl.innerHTML =
      hour + '<span class="time-blink">:</span>' + minute + ' ' + dayPeriod;
  }

  // ── 3. LOCATION ───────────────────────────────────────────
  function renderLocation() {
    var loc = SITE_CONFIG.location || '';
    if (locationEl)  locationEl.textContent  = loc;
    if (footerLocEl) footerLocEl.textContent = loc;
  }

  // ── 4. SOCIAL ICONS ───────────────────────────────────────
  var SOCIAL_ICONS = {
    linkedin:  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
    instagram: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>',
    spotify:   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>',
    youtube:   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>',
    imdb:      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14.31 9.588v.005c-.077-.048-.227-.07-.42-.07v4.815c.27 0 .44-.06.5-.177.062-.116.095-.42.095-.897V10.54c0-.45-.023-.75-.07-.885a.435.435 0 0 0-.105-.067zM24 0v24H0V0h24zM4.388 7.823H2.34v8.354h2.048V7.823zm4.217 0H6.459l-.31 3.273-.34-3.273H3.845c.165.477.34 1.02.5 1.59v6.764h1.66V10.11l.73 6.067h1.12l.7-6.29v6.29h1.66V7.823h-1.61zm7.42 1.257c-.165-.42-.435-.717-.8-.885a3.994 3.994 0 0 0-1.49-.225h-2.07v8.354h1.93c.57 0 1-.052 1.3-.156.296-.104.53-.27.7-.494.168-.225.275-.48.32-.765.047-.285.07-.75.07-1.395V11.27c0-.72-.022-1.2-.067-1.44a1.606 1.606 0 0 0-.195-.75zm3.786-.042c-.3-.16-.735-.24-1.305-.24h-.195c-.51 0-.916.097-1.215.29-.3.194-.516.48-.645.855v-.988H15.1v8.354h1.35v-.883c.135.345.344.6.627.764.285.166.63.248 1.035.248.42 0 .762-.097 1.02-.29.255-.194.435-.45.54-.765.103-.315.155-.81.155-1.485V11.03c0-.614-.03-1.034-.09-1.26a1.567 1.567 0 0 0-.336-.732zm-.504 5.28c0 .42-.023.688-.07.807-.047.12-.15.18-.307.18-.12 0-.225-.03-.315-.09V10.17c.105-.06.21-.09.315-.09.165 0 .27.068.315.203.044.135.067.435.067.892l-.005 3.143z"/></svg>'
  };

  var SOCIAL_LINKS = [
    { key: 'linkedin',  label: 'LinkedIn'  },
    { key: 'instagram', label: 'Instagram' },
    { key: 'spotify',   label: 'Spotify'   },
    { key: 'imdb',      label: 'IMDb'      },
    { key: 'youtube',   label: 'YouTube'   }
  ];

  function buildSocialIconLink(item) {
    var url = SITE_CONFIG[item.key];
    if (!url) return null;
    var a = document.createElement('a');
    a.href = url;
    a.className = 'social-icon-link';
    a.setAttribute('aria-label', item.label);
    a.title = item.label;
    a.innerHTML = SOCIAL_ICONS[item.key];
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    return a;
  }

  function renderSocialLinks() {
    if (!socialRowEl) return;
    SOCIAL_LINKS.forEach(function (item) {
      var a = buildSocialIconLink(item);
      if (a) socialRowEl.appendChild(a);
    });
  }

  function renderLandingIcons() {
    var container = document.getElementById('landingSocialIcons');
    if (!container) return;
    SOCIAL_LINKS.forEach(function (item) {
      var a = buildSocialIconLink(item);
      if (a) container.appendChild(a);
    });
  }

  // ── 5. EMAIL LINKS ────────────────────────────────────────
  function applyEmailLinks() {
    document.querySelectorAll('[data-email]').forEach(function (el) {
      el.href = 'mailto:' + SITE_CONFIG.email;
      if (el.textContent && el.textContent.includes('@')) {
        el.textContent = SITE_CONFIG.email;
      }
    });
  }

  // ── 6. BACKGROUND IMAGE + CORNER LOGO ────────────────────
  var logoEl = document.getElementById('projectLogo');

  function showBackground(imageUrl, logoUrl) {
    if (!bgImageEl) return;
    if (imageUrl) bgImageEl.style.backgroundImage = 'url("' + imageUrl + '")';
    bgImageEl.classList.add('visible');

    if (logoEl) {
      if (logoUrl) {
        logoEl.style.backgroundImage = 'url("' + logoUrl + '")';
        logoEl.classList.add('visible');
      } else {
        logoEl.classList.remove('visible');
      }
    }
  }

  function hideBackground() {
    if (!bgImageEl) return;
    bgImageEl.classList.remove('visible');
    if (logoEl) logoEl.classList.remove('visible');
  }

  // ── 7. ROW ACTIVE STATE ───────────────────────────────────
  function activateRow(index) {
    projectRefs.forEach(function (el, i) {
      el.classList.toggle('active', i === index);
      el.classList.remove('idle-dim');
    });
  }

  function deactivateAll() {
    projectRefs.forEach(function (el) {
      el.classList.remove('active', 'idle-dim');
    });
  }

  // ── 8. SCRAMBLE TEXT ──────────────────────────────────────
  function scrambleSpan(span) {
    if (!span) return;

    var original = span.getAttribute('data-original');
    if (!original) {
      original = span.textContent;
      span.setAttribute('data-original', original);
    }

    if (span._scramble) {
      clearInterval(span._scramble);
      span._scramble = null;
    }

    var len          = original.length;
    var revealed     = 0;
    var elapsed      = 0;
    var intervalMs   = 30;
    var totalSteps   = Math.ceil(SCRAMBLE_DURATION / intervalMs);
    var revealPerStep = len / totalSteps;

    span._scramble = setInterval(function () {
      elapsed++;
      revealed = Math.min(Math.floor(elapsed * revealPerStep), len);

      var result = '';
      for (var i = 0; i < len; i++) {
        if (i < revealed) {
          result += original[i];
        } else {
          result += original[i] === ' '
            ? ' '
            : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
      }
      span.textContent = result;

      if (revealed >= len) {
        clearInterval(span._scramble);
        span._scramble = null;
        span.textContent = original;
      }
    }, intervalMs);
  }

  function scrambleRow(li) {
    li.querySelectorAll('.project-data').forEach(scrambleSpan);
  }

  function stopScrambleRow(li) {
    li.querySelectorAll('.project-data').forEach(function (span) {
      if (span._scramble) { clearInterval(span._scramble); span._scramble = null; }
      var original = span.getAttribute('data-original');
      if (original) span.textContent = original;
    });
  }

  function stopAllScrambles() {
    projectRefs.forEach(stopScrambleRow);
  }

  // ── 9. HOVER ─────────────────────────────────────────────
  function handleRowEnter(index, li) {
    isHovering = true;
    stopIdleAnimation();
    clearTimeout(idleTimeout);
    activateRow(index);
    scrambleRow(li);
    activeIndex = index;
  }

  function handleContainerLeave() {
    isHovering = false;
    deactivateAll();
    stopAllScrambles();
    activeIndex = -1;
    clearTimeout(idleTimeout);
    idleTimeout = setTimeout(startIdleAnimation, 4000);
  }

  // ── 10. IDLE ANIMATION ────────────────────────────────────
  function startIdleAnimation() {
    if (isHovering || projectRefs.length === 0) return;
    if (typeof gsap === 'undefined') return;
    stopIdleAnimation();

    idleTimeline = gsap.timeline({ repeat: -1, yoyo: true });

    projectRefs.forEach(function (el, i) {
      idleTimeline.to(el, {
        opacity: 0.08,
        duration: 1.2,
        ease: 'power1.inOut',
        delay: i * 0.18
      }, i * 0.18);
    });

    idleTimeline.to(projectRefs, {
      opacity: 1,
      duration: 1.2,
      ease: 'power1.inOut',
      stagger: 0.1
    }, projectRefs.length * 0.18 + 0.6);
  }

  function stopIdleAnimation() {
    if (idleTimeline) { idleTimeline.kill(); idleTimeline = null; }
    if (typeof gsap !== 'undefined') {
      gsap.set(projectRefs, { opacity: 1 });
    } else {
      projectRefs.forEach(function (el) { el.style.opacity = ''; });
    }
  }

  // ── 11. PROFILE PHOTO ─────────────────────────────────────
  function checkProfilePhoto() {
    var photoEl = document.getElementById('profilePhoto');
    if (!photoEl) return;

    var testImg = new Image();
    testImg.onload = function () {
      photoEl.style.backgroundImage = "url('assets/profile/camera%20op%20photo.jpg')";
      photoEl.classList.add('has-image');
    };
    testImg.src = 'assets/profile/camera%20op%20photo.jpg';
  }

  // ── 14. PROJECT PANEL ─────────────────────────────────────
  function buildPanel(project) {
    var detail = project.detail || {};
    var accent    = detail.accent    || '#C9A227';
    var accentRgb = detail.accentRgb || '201, 162, 39';

    var panel = document.createElement('div');
    panel.className = 'project-panel';
    panel.id = 'panel-' + project.id;
    panel.style.setProperty('--panel-accent', accent);
    panel.style.setProperty('--panel-accent-rgb', accentRgb);

    // Build bullets HTML
    var bulletsHTML = (detail.bullets || []).map(function (b) {
      return '<li>' + b + '</li>';
    }).join('');

    // Build tags HTML
    var tagsHTML = (detail.tags || []).map(function (t) {
      return '<span class="panel-tag">' + t + '</span>';
    }).join('');

    // Image or gradient fallback
    var fit = project.imageFit || 'cover';
    var imageStyle = project.image
      ? "background-image: url('" + project.image + "'); background-size: " + fit + "; background-position: center; background-color: #0D0D0F;"
      : 'background: linear-gradient(160deg, rgba(' + accentRgb + ', 0.18) 0%, #0D0D0F 100%);';

    panel.innerHTML =
      '<div class="panel-canvas"></div>' +
      '<div class="panel-topbar">' +
        '<button class="panel-back-btn" id="panelBackBtn">' +
          '<span class="panel-back-arrow">←</span> Back' +
        '</button>' +
        '<span class="panel-topbar-title">Jack Hicks — ' + project.title + '</span>' +
        '<span style="width:60px"></span>' +
      '</div>' +

      '<div class="panel-scroll">' +

        '<div class="panel-visual">' +
          '<div class="panel-image" style="' + imageStyle + '"></div>' +
          '<div class="panel-visual-overlay"></div>' +
          '<div class="panel-visual-content">' +
            '<div class="panel-badge">' + project.role + '</div>' +
            '<h2 class="panel-visual-title">' + project.title + '</h2>' +
            '<div class="panel-visual-meta">' + project.type + ' &nbsp;·&nbsp; ' + project.medium + '</div>' +
          '</div>' +
        '</div>' +

        '<div class="panel-content" id="panelContent">' +
          '<div class="panel-dates-row">' +
            '<span class="panel-date-item highlight">' + (detail.dates || project.year) + '</span>' +
            '<span class="panel-date-sep"></span>' +
            '<span class="panel-date-item">' + (detail.location || '') + '</span>' +
          '</div>' +

          '<div class="panel-section" id="panelSec1">' +
            '<div class="panel-label">The Role</div>' +
            '<p class="panel-text">' + (detail.description || '') + '</p>' +
          '</div>' +

          '<div class="panel-section" id="panelSec2">' +
            '<div class="panel-label">What I Did</div>' +
            '<ul class="panel-bullets">' + bulletsHTML + '</ul>' +
          '</div>' +

          '<div class="panel-tags" id="panelTags">' + tagsHTML + '</div>' +
        '</div>' +

      '</div>'; // .panel-scroll

    return panel;
  }

  function initPanelDotWave(panelEl) {
    if (typeof THREE === 'undefined') return;
    var container = panelEl.querySelector('.panel-canvas');
    if (!container) return;

    var SEPARATION = 150, AMOUNTX = 40, AMOUNTY = 60;

    var scene    = new THREE.Scene();
    var camera   = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 355, 1220);

    var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    var positions = [], colors = [];
    for (var ix = 0; ix < AMOUNTX; ix++) {
      for (var iy = 0; iy < AMOUNTY; iy++) {
        positions.push(ix * SEPARATION - (AMOUNTX * SEPARATION) / 2, 0, iy * SEPARATION - (AMOUNTY * SEPARATION) / 2);
        colors.push(240/255, 237/255, 232/255);
      }
    }

    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color',    new THREE.Float32BufferAttribute(colors, 3));

    var material = new THREE.PointsMaterial({ size: 7, vertexColors: true, transparent: true, opacity: 0.45, sizeAttenuation: true });
    scene.add(new THREE.Points(geometry, material));

    var count = 0, animId;

    function animate() {
      animId = requestAnimationFrame(animate);
      var arr = geometry.attributes.position.array;
      var i = 0;
      for (var x = 0; x < AMOUNTX; x++) {
        for (var y = 0; y < AMOUNTY; y++) {
          arr[i * 3 + 1] = Math.sin((x + count) * 0.3) * 50 + Math.sin((y + count) * 0.5) * 50;
          i++;
        }
      }
      geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
      count += 0.1;
    }

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', onResize);
    animate();

    panelEl._dotWaveCleanup = function () {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }

  function openPanel(index) {
    var project = SITE_CONFIG.projects[index];
    if (!project) return;

    stopIdleAnimation();
    clearTimeout(idleTimeout);
    hideBackground();
    deactivateAll();
    stopAllScrambles();

    // Remove existing panel if any
    if (currentPanel) {
      currentPanel.remove();
      currentPanel = null;
    }

    var panel = buildPanel(project);
    document.body.appendChild(panel);
    initPanelDotWave(panel);
    currentPanel = panel;
    panelOpen = true;

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Make visible before animating
    panel.classList.add('is-open');

    // GSAP entrance
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(panel,
        { x: '100%' },
        { x: '0%', duration: 0.5, ease: 'power3.out' }
      );

      var content = panel.querySelector('#panelContent');
      var sec1    = panel.querySelector('#panelSec1');
      var sec2    = panel.querySelector('#panelSec2');
      var tags    = panel.querySelector('#panelTags');
      var badge   = panel.querySelector('.panel-badge');
      var title   = panel.querySelector('.panel-visual-title');

      if (badge)  gsap.fromTo(badge,  { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.35, ease: 'power2.out' });
      if (title)  gsap.fromTo(title,  { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.45, delay: 0.42, ease: 'power2.out' });
      if (sec1)   gsap.fromTo(sec1,   { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.5,  ease: 'power2.out' });
      if (sec2)   gsap.fromTo(sec2,   { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.6,  ease: 'power2.out' });
      if (tags)   gsap.fromTo(tags,   { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.7,  ease: 'power2.out' });
    }

    // Back button
    var backBtn = panel.querySelector('#panelBackBtn');
    if (backBtn) backBtn.addEventListener('click', closePanel);
  }

  function closePanel() {
    if (!currentPanel) return;

    var panel = currentPanel;

    if (panel._dotWaveCleanup) panel._dotWaveCleanup();

    if (typeof gsap !== 'undefined') {
      gsap.to(panel, {
        x: '100%',
        duration: 0.4,
        ease: 'power3.in',
        onComplete: function () {
          panel.remove();
          if (currentPanel === panel) currentPanel = null;
        }
      });
    } else {
      panel.remove();
      currentPanel = null;
    }

    panelOpen = false;
    document.body.style.overflow = '';
    idleTimeout = setTimeout(startIdleAnimation, 4000);
  }

  // Escape key closes panel
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panelOpen) closePanel();
  });

  // ── 13. LANDING NAME SCRAMBLE ─────────────────────────────
  var LANDING_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$&%!?1234567890';

  function initLandingScramble() {
    var nameEl = document.getElementById('landingName');
    if (!nameEl) return;

    var fullName       = 'JACK HICKS';
    var isHovering     = false;
    var idleInterval   = null;
    var resolveIval    = null;

    function randChar() {
      return LANDING_CHARS[Math.floor(Math.random() * LANDING_CHARS.length)];
    }

    function startIdleScramble() {
      if (idleInterval) clearInterval(idleInterval);
      idleInterval = setInterval(function () {
        if (isHovering) return;
        var out = '';
        for (var i = 0; i < fullName.length; i++) {
          out += fullName[i] === ' ' ? ' ' : randChar();
        }
        nameEl.textContent = out;
      }, 55);
    }

    function resolveToName() {
      if (idleInterval)  { clearInterval(idleInterval);  idleInterval  = null; }
      if (resolveIval)   { clearInterval(resolveIval);   resolveIval   = null; }

      var len      = fullName.length;
      var revealed = 0;
      var elapsed  = 0;
      var steps    = Math.ceil(650 / 30);
      var perStep  = len / steps;

      resolveIval = setInterval(function () {
        elapsed++;
        revealed = Math.min(Math.floor(elapsed * perStep), len);
        var out = '';
        for (var i = 0; i < len; i++) {
          if (fullName[i] === ' ' || i < revealed) {
            out += fullName[i];
          } else {
            out += randChar();
          }
        }
        nameEl.textContent = out;
        if (revealed >= len) {
          clearInterval(resolveIval);
          resolveIval = null;
          nameEl.textContent = fullName;
        }
      }, 30);
    }

    function returnToScramble() {
      if (resolveIval) { clearInterval(resolveIval); resolveIval = null; }
      startIdleScramble();
    }

    nameEl.parentElement.addEventListener('mouseenter', function () {
      isHovering = true;
      resolveToName();
    });

    nameEl.parentElement.addEventListener('mouseleave', function () {
      isHovering = false;
      if (idleInterval || resolveIval) return;
      nameEl.textContent = fullName;
    });

    startIdleScramble();
    setTimeout(function () {
      isHovering = true;
      resolveToName();
    }, 1000);
  }

  // ── 14. DOTTED WAVE SURFACE (Three.js) ───────────────────
  function initDottedSurface() {
    if (typeof THREE === 'undefined') return;
    var container = document.getElementById('landingCanvas');
    if (!container) return;

    var SEPARATION = 150;
    var AMOUNTX    = 40;
    var AMOUNTY    = 60;

    var scene  = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 355, 1220);

    var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    var positions = [];
    var colors    = [];

    for (var ix = 0; ix < AMOUNTX; ix++) {
      for (var iy = 0; iy < AMOUNTY; iy++) {
        positions.push(
          ix * SEPARATION - (AMOUNTX * SEPARATION) / 2,
          0,
          iy * SEPARATION - (AMOUNTY * SEPARATION) / 2
        );
        // Warm cream: #F0EDE8
        colors.push(240 / 255, 237 / 255, 232 / 255);
      }
    }

    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color',    new THREE.Float32BufferAttribute(colors, 3));

    var material = new THREE.PointsMaterial({
      size: 7,
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
      sizeAttenuation: true
    });

    var points = new THREE.Points(geometry, material);
    scene.add(points);

    var count = 0;

    function animate() {
      requestAnimationFrame(animate);
      var posAttr = geometry.attributes.position;
      var arr     = posAttr.array;
      var i = 0;
      for (var x = 0; x < AMOUNTX; x++) {
        for (var y = 0; y < AMOUNTY; y++) {
          arr[i * 3 + 1] =
            Math.sin((x + count) * 0.3) * 50 +
            Math.sin((y + count) * 0.5) * 50;
          i++;
        }
      }
      posAttr.needsUpdate = true;
      renderer.render(scene, camera);
      count += 0.1;
    }

    window.addEventListener('resize', function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
  }

  // ── 16. SCROLL BUTTON ─────────────────────────────────────
  function initScrollBtn() {
    var btn = document.getElementById('scrollBtn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var workSection = document.getElementById('work');
      if (workSection) workSection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // ── INIT ─────────────────────────────────────────────────
  function init() {
    renderProjects();
    renderLocation();
    renderSocialLinks();
    renderLandingIcons();
    applyEmailLinks();
    checkProfilePhoto();
    initLandingScramble();
    initDottedSurface();
    initScrollBtn();

    updateTime();
    setInterval(updateTime, 1000);

    idleTimeout = setTimeout(startIdleAnimation, 4000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
