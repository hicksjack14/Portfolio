/* ============================================================
   JACK HICKS — script.js
   Depends on: SITE_CONFIG (config.js), GSAP (CDN)
   ============================================================ */

(function () {
  'use strict';

  // ── DOM REFS ─────────────────────────────────────────────
  const projectListEl    = document.getElementById('projectList');
  const portfolioEl      = document.getElementById('portfolioContainer');
  const bgImageEl        = document.getElementById('backgroundImage');
  const locationEl       = document.getElementById('locationDisplay');
  const footerLocEl      = document.getElementById('footerLocation');
  const timeEl           = document.getElementById('currentTime');
  const socialRowEl      = document.getElementById('socialRow');

  // ── STATE ────────────────────────────────────────────────
  let projectRefs        = [];   // array of <li> DOM elements
  let activeIndex        = -1;
  let idleTimeline       = null;
  let idleTimeout        = null;
  let isHovering         = false;

  const SCRAMBLE_CHARS   = 'QWERTYUIOP@#$&1234567890';
  const SCRAMBLE_DURATION = 700; // ms total for one scramble resolve

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
        handleRowEnter(index, li);
      });

      li.addEventListener('click', function () {
        if (project.link && project.link !== '#') {
          window.open(project.link, '_blank', 'noopener');
        }
      });

      li.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (project.link && project.link !== '#') {
            window.open(project.link, '_blank', 'noopener');
          }
        }
      });

      projectListEl.appendChild(li);
      projectRefs.push(li);
    });

    // mouseleave from entire container hides everything
    if (portfolioEl) {
      portfolioEl.addEventListener('mouseleave', handleContainerLeave);
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

    var parts  = formatter.formatToParts(now);
    var hour   = '';
    var minute = '';
    var dayPeriod = '';

    parts.forEach(function (part) {
      if (part.type === 'hour')      hour      = part.value;
      if (part.type === 'minute')    minute    = part.value;
      if (part.type === 'dayPeriod') dayPeriod = part.value;
    });

    timeEl.innerHTML =
      hour +
      '<span class="time-blink">:</span>' +
      minute + ' ' + dayPeriod;
  }

  // ── 3. LOCATION DISPLAY ──────────────────────────────────
  function renderLocation() {
    var loc = SITE_CONFIG.location || '';
    if (locationEl)  locationEl.textContent  = loc;
    if (footerLocEl) footerLocEl.textContent = loc;
  }

  // ── 4. SOCIAL LINKS ──────────────────────────────────────
  function renderSocialLinks() {
    if (!socialRowEl) return;

    var links = [
      { key: 'linkedin',  label: 'LinkedIn'  },
      { key: 'instagram', label: 'Instagram' },
      { key: 'spotify',   label: 'Spotify'   },
      { key: 'imdb',      label: 'IMDb'      }
    ];

    // Always show email
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

  // ── 5. EMAIL ATTRIBUTE ───────────────────────────────────
  function applyEmailLinks() {
    document.querySelectorAll('[data-email]').forEach(function (el) {
      el.href = 'mailto:' + SITE_CONFIG.email;
      // If element already has text showing an email address, update it
      if (el.textContent && el.textContent.includes('@')) {
        el.textContent = SITE_CONFIG.email;
      }
    });
  }

  // ── 6. BACKGROUND IMAGE ──────────────────────────────────
  function showBackground(imageUrl) {
    if (!bgImageEl) return;
    if (imageUrl) {
      bgImageEl.style.backgroundImage = 'url("' + imageUrl + '")';
    }
    bgImageEl.classList.add('visible');
  }

  function hideBackground() {
    if (!bgImageEl) return;
    bgImageEl.classList.remove('visible');
  }

  // ── 7. ROW ACTIVE STATE ──────────────────────────────────
  function activateRow(index) {
    projectRefs.forEach(function (el, i) {
      if (i === index) {
        el.classList.add('active');
        el.classList.remove('idle-dim');
      } else {
        el.classList.remove('active');
        el.classList.remove('idle-dim');
      }
    });
  }

  function deactivateAll() {
    projectRefs.forEach(function (el) {
      el.classList.remove('active');
      el.classList.remove('idle-dim');
    });
  }

  // ── 8. SCRAMBLE TEXT ─────────────────────────────────────
  function scrambleSpan(span) {
    if (!span) return;

    var original = span.getAttribute('data-original');
    if (!original) {
      original = span.textContent;
      span.setAttribute('data-original', original);
    }

    // Clear any existing scramble
    if (span._scramble) {
      clearInterval(span._scramble);
      span._scramble = null;
    }

    var len      = original.length;
    var revealed = 0;
    var elapsed  = 0;
    var intervalMs = 30;
    var totalSteps = Math.ceil(SCRAMBLE_DURATION / intervalMs);
    var revealPerStep = len / totalSteps;

    span._scramble = setInterval(function () {
      elapsed++;
      revealed = Math.min(Math.floor(elapsed * revealPerStep), len);

      var result = '';
      for (var i = 0; i < len; i++) {
        if (i < revealed) {
          result += original[i];
        } else {
          // keep spaces as spaces
          if (original[i] === ' ') {
            result += ' ';
          } else {
            result += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          }
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
    li.querySelectorAll('.project-data').forEach(function (span) {
      scrambleSpan(span);
    });
  }

  function stopScrambleRow(li) {
    li.querySelectorAll('.project-data').forEach(function (span) {
      if (span._scramble) {
        clearInterval(span._scramble);
        span._scramble = null;
      }
      var original = span.getAttribute('data-original');
      if (original) {
        span.textContent = original;
      }
    });
  }

  function stopAllScrambles() {
    projectRefs.forEach(function (li) {
      stopScrambleRow(li);
    });
  }

  // ── 9. HOVER INTERACTIONS ────────────────────────────────
  function handleRowEnter(index, li) {
    isHovering = true;
    stopIdleAnimation();
    clearTimeout(idleTimeout);

    var imageUrl = li.getAttribute('data-image');
    showBackground(imageUrl);
    activateRow(index);
    scrambleRow(li);
    activeIndex = index;
  }

  function handleContainerLeave() {
    isHovering = false;
    hideBackground();
    deactivateAll();
    stopAllScrambles();
    activeIndex = -1;

    // Start idle timer
    clearTimeout(idleTimeout);
    idleTimeout = setTimeout(startIdleAnimation, 4000);
  }

  // ── 10. IDLE ANIMATION ───────────────────────────────────
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
    if (idleTimeline) {
      idleTimeline.kill();
      idleTimeline = null;
    }
    // Reset opacity on all rows
    if (typeof gsap !== 'undefined') {
      gsap.set(projectRefs, { opacity: 1 });
    } else {
      projectRefs.forEach(function (el) {
        el.style.opacity = '';
      });
    }
  }

  // ── 11. PROFILE PHOTO ────────────────────────────────────
  function checkProfilePhoto() {
    var photoEl = document.getElementById('profilePhoto');
    if (!photoEl) return;

    var testImg = new Image();
    testImg.onload = function () {
      photoEl.style.backgroundImage = 'url("assets/profile/profile.jpg")';
      photoEl.classList.add('has-image');
    };
    testImg.onerror = function () {
      // No photo found — placeholder text remains
    };
    testImg.src = 'assets/profile/profile.jpg';
  }

  // ── INIT ─────────────────────────────────────────────────
  function init() {
    renderProjects();
    renderLocation();
    renderSocialLinks();
    applyEmailLinks();
    checkProfilePhoto();

    // Start clock
    updateTime();
    setInterval(updateTime, 1000);

    // Start idle animation after initial delay
    idleTimeout = setTimeout(startIdleAnimation, 4000);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
