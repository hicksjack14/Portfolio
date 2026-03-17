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
        '<span class="project-data medium">' + project.medium + '</span>' +
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

  // ── 4. SOCIAL LINKS ───────────────────────────────────────
  function renderSocialLinks() {
    if (!socialRowEl) return;

    var links = [
      { key: 'linkedin',  label: 'LinkedIn'  },
      { key: 'instagram', label: 'Instagram' },
      { key: 'spotify',   label: 'Spotify'   },
      { key: 'imdb',      label: 'IMDb'      }
    ];

    var emailA = document.createElement('a');
    emailA.href = 'mailto:' + SITE_CONFIG.email;
    emailA.textContent = 'Email';
    socialRowEl.appendChild(emailA);

    links.forEach(function (item) {
      var url = SITE_CONFIG[item.key];
      if (!url) return;
      var a = document.createElement('a');
      a.href = url;
      a.textContent = item.label;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      socialRowEl.appendChild(a);
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
      photoEl.style.backgroundImage = 'url("assets/profile/profile.jpg")';
      photoEl.classList.add('has-image');
    };
    testImg.src = 'assets/profile/profile.jpg';
  }

  // ── 12. PROJECT PANEL ─────────────────────────────────────
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
      '<div class="panel-topbar">' +
        '<button class="panel-back-btn" id="panelBackBtn">' +
          '<span class="panel-back-arrow">←</span> Back' +
        '</button>' +
        '<span class="panel-topbar-title">Jack Hicks — ' + project.title + '</span>' +
        '<span style="width:60px"></span>' +
      '</div>' +

      '<div class="panel-inner">' +

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

      '</div>';

    return panel;
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

  // ── 14. SCROLL BUTTON ─────────────────────────────────────
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
    applyEmailLinks();
    checkProfilePhoto();
    initLandingScramble();
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
