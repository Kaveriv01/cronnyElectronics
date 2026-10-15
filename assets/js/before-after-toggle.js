/**
 * Before / After Interactive Comparison Slider
 * Crony Electronics Pvt Ltd
 *
 * Ensures the split line is always centered in the middle (50%) on load/refresh,
 * with smooth interactive dragging and touch gestures.
 */

(function () {
  'use strict';

  function initBeforeAfter() {
    const container = document.querySelector('.ba-viewport');
    if (!container) return;

    const badgeBefore = container.querySelector('.ba-badge-before');
    const badgeAfter = container.querySelector('.ba-badge-after');
    const hint = container.querySelector('.ba-hint');

    // Always starts exactly at 50% in the middle
    let currentPos = 50;
    let isDragging = false;

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

      // Dynamic badge opacity based on slider position
      if (badgeBefore) {
        badgeBefore.style.opacity = pos < 12 ? '0' : '1';
      }
      if (badgeAfter) {
        badgeAfter.style.opacity = pos > 88 ? '0' : '1';
      }

      // Hide hint once interacted
      if (hint && hint.style.opacity !== '0') {
        hint.style.opacity = '0';
        setTimeout(() => {
          if (hint && hint.parentNode) hint.remove();
        }, 350);
      }
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
    container.setAttribute('aria-label', 'Before and after thermal audit difference slider');
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

    // Strictly center in the middle (50%) on website load/refresh
    setPosition(50, false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBeforeAfter);
  } else {
    initBeforeAfter();
  }
})();
