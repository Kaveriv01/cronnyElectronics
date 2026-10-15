/**
 * Before / After Interactive Comparison Slider
 * Crony Electronics Pvt Ltd
 *
 * Supports both:
 * 1. Manual interactive drag slider (centered at 50% on load)
 * 2. Smooth auto-playing gliding animation (continuously reveals Before & After without dragging)
 */

(function () {
  'use strict';

  function setupViewport(container) {
    if (!container || container.dataset.baInitialized) return;
    container.dataset.baInitialized = 'true';

    const badgeBefore = container.querySelector('.ba-badge-before');
    const badgeAfter = container.querySelector('.ba-badge-after');
    const hint = container.querySelector('.ba-hint');
    const isAutoPlay = container.getAttribute('data-auto-play') === 'true';

    let currentPos = 50;
    let isDragging = false;
    let isHovered = false;
    let resumeTimeout = null;
    let animFrameId = null;
    let startTime = null;
    let pausedTimeOffset = 0;

    function setPosition(pos, animated = false) {
      pos = Math.max(0, Math.min(100, pos));
      currentPos = pos;

      if (animated) {
        container.classList.add('animating');
        setTimeout(() => container.classList.remove('animating'), 350);
      } else {
        container.classList.remove('animating');
      }

      container.style.setProperty('--ba-pos', `${pos}%`);
      container.setAttribute('aria-valuenow', Math.round(pos));

      // Dynamic badge opacity based on slider position
      if (badgeBefore) {
        badgeBefore.style.opacity = pos < 12 ? '0' : '1';
      }
      if (badgeAfter) {
        badgeAfter.style.opacity = pos > 88 ? '0' : '1';
      }

      // Sync with About Us toggle switch if present
      if (container.id === 'ba-viewport-about-house') {
        const toggleBtn = document.getElementById('aboutDiffToggle');
        const labelWithout = document.querySelector('.label-without');
        const labelWith = document.querySelector('.label-with');
        if (toggleBtn) {
          if (pos <= 45) {
            toggleBtn.classList.add('is-with');
            if (labelWith) labelWith.classList.add('active');
            if (labelWithout) labelWithout.classList.remove('active');
          } else if (pos >= 55) {
            toggleBtn.classList.remove('is-with');
            if (labelWithout) labelWithout.classList.add('active');
            if (labelWith) labelWith.classList.remove('active');
          }
        }
      }

      // Hide hint once interacted
      if (hint && hint.style.opacity !== '0') {
        hint.style.opacity = '0';
        setTimeout(() => {
          if (hint && hint.parentNode) hint.remove();
        }, 350);
      }
    }

    container.baSetPosition = setPosition;

    // Auto-glide continuous animation loop
    function startAutoGlide() {
      if (!isAutoPlay) return;

      const minPos = 18;
      const maxPos = 82;
      const amp = (maxPos - minPos) / 2; // 32
      const mid = (minPos + maxPos) / 2; // 50
      const duration = 5400; // ms for one full cycle

      function loop(timestamp) {
        // Sleep and reset timing when tab is hidden
        if (container.offsetParent === null) {
          startTime = null;
          pausedTimeOffset = 0;
          animFrameId = requestAnimationFrame(loop);
          return;
        }

        if (!isDragging && !isHovered) {
          if (!startTime) {
            startTime = timestamp - pausedTimeOffset;
          }
          const elapsed = timestamp - startTime;
          // Smooth sinusoidal wave with gentle deceleration at extremes
          const rad = ((elapsed % duration) / duration) * 2 * Math.PI;
          const pos = mid + amp * Math.sin(rad);
          setPosition(pos, false);
        } else {
          if (startTime) {
            pausedTimeOffset = timestamp - startTime;
          }
        }
        animFrameId = requestAnimationFrame(loop);
      }

      animFrameId = requestAnimationFrame(loop);
    }

    // Pointer calculation
    function getPointerPercentage(e) {
      const rect = container.getBoundingClientRect();
      const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
      const x = clientX - rect.left;
      return (x / rect.width) * 100;
    }

    // Drag / Touch Handlers
    function onStart(e) {
      isDragging = true;
      container.classList.add('is-dragging');
      const pos = getPointerPercentage(e);
      setPosition(pos, false);
    }

    function onMove(e) {
      if (!isDragging) return;
      e.preventDefault();
      const pos = getPointerPercentage(e);
      setPosition(pos, false);
    }

    function onEnd() {
      if (isDragging) {
        isDragging = false;
        container.classList.remove('is-dragging');
      }
    }

    // Hover detection to pause on inspect
    container.addEventListener('mouseenter', function () {
      isHovered = true;
      clearTimeout(resumeTimeout);
    });

    container.addEventListener('mouseleave', function () {
      clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(() => {
        isHovered = false;
        startTime = null;
        pausedTimeOffset = 0;
      }, 1500);
    });

    // Mouse events
    container.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    // Touch events
    container.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);

    // Double click to reset to 50% center
    container.addEventListener('dblclick', function () {
      setPosition(50, true);
    });

    // Keyboard support (Arrow keys)
    container.setAttribute('tabindex', '0');
    container.setAttribute('role', 'slider');
    container.setAttribute('aria-label', 'Before and after difference comparison slider');
    container.setAttribute('aria-valuemin', '0');
    container.setAttribute('aria-valuemax', '100');
    container.setAttribute('aria-valuenow', '50');

    container.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setPosition(currentPos - 5, true);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setPosition(currentPos + 5, true);
      } else if (e.key === 'Home') {
        e.preventDefault();
        setPosition(0, true);
      } else if (e.key === 'End') {
        e.preventDefault();
        setPosition(100, true);
      }
    });

    // Initialize position at 50%
    setPosition(50, false);

    // Start auto glide if configured
    if (isAutoPlay) {
      startAutoGlide();
    }
  }

  function setupAboutToggle() {
    const toggleBtn = document.getElementById('aboutDiffToggle');
    const labelWithout = document.querySelector('.label-without');
    const labelWith = document.querySelector('.label-with');
    const houseViewport = document.getElementById('ba-viewport-about-house');

    if (!toggleBtn || !houseViewport) return;

    function switchTo(isWith) {
      if (typeof houseViewport.baSetPosition === 'function') {
        houseViewport.baSetPosition(isWith ? 0 : 100, true);
      }
      if (isWith) {
        toggleBtn.classList.add('is-with');
        if (labelWith) labelWith.classList.add('active');
        if (labelWithout) labelWithout.classList.remove('active');
      } else {
        toggleBtn.classList.remove('is-with');
        if (labelWithout) labelWithout.classList.add('active');
        if (labelWith) labelWith.classList.remove('active');
      }
    }

    toggleBtn.addEventListener('click', function () {
      const isCurrentlyWith = toggleBtn.classList.contains('is-with');
      switchTo(!isCurrentlyWith);
    });

    if (labelWithout) {
      labelWithout.addEventListener('click', () => switchTo(false));
    }
    if (labelWith) {
      labelWith.addEventListener('click', () => switchTo(true));
    }
  }

  function initAll() {
    document.querySelectorAll('.ba-viewport').forEach(setupViewport);
    setupAboutToggle();

    // Bootstrap Tab listener to wake up hidden viewports when tab is switched
    const tabButtons = document.querySelectorAll('button[data-bs-toggle="pill"], button[data-bs-toggle="tab"]');
    tabButtons.forEach(btn => {
      btn.addEventListener('shown.bs.tab', function () {
        document.querySelectorAll('.ba-viewport').forEach(vp => {
          if (vp.offsetParent !== null) {
            setupViewport(vp);
          }
        });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
