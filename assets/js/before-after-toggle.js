/**
 * Before / After Interactive Comparison Slider & Tutorial Controller
 * Crony Electronics Pvt Ltd
 */

(function () {
  'use strict';

  function initBeforeAfter() {
    const container = document.querySelector('.ba-viewport');
    if (!container) return;

    const wrapper = document.querySelector('.ba-comparison-wrapper');
    const badgeBefore = container.querySelector('.ba-badge-before');
    const badgeAfter = container.querySelector('.ba-badge-after');
    const hint = container.querySelector('.ba-hint');
    const tutorialBubble = container.querySelector('.ba-tutorial-bubble');
    const toggleBtns = document.querySelectorAll('.ba-toggle-btn');
    const autoBtn = document.getElementById('ba-auto-toggle');
    const replayBtn = document.getElementById('ba-replay-tutorial');

    let currentPos = 50; // percentage
    let isDragging = false;
    let autoPlayInterval = null;
    let autoDirection = 1;
    let hasPlayedIntro = false;
    let isDemoRunning = false;

    function setPosition(pos, animated = false) {
      pos = Math.max(0, Math.min(100, pos));
      currentPos = pos;

      if (animated) {
        container.classList.add('animating');
        setTimeout(() => container.classList.remove('animating'), 520);
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

      // Hide tutorial bubble and hint on direct interaction
      if (!isDemoRunning && tutorialBubble && tutorialBubble.style.opacity !== '0') {
        tutorialBubble.style.opacity = '0';
        setTimeout(() => {
          if (tutorialBubble && tutorialBubble.parentNode) tutorialBubble.remove();
        }, 350);
      }
      if (hint && hint.style.opacity !== '0') {
        hint.style.opacity = '0';
        setTimeout(() => {
          if (hint && hint.parentNode) hint.remove();
        }, 400);
      }
    }

    function updateActiveButton(mode) {
      toggleBtns.forEach(btn => {
        if (btn.getAttribute('data-mode') === mode) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    // Toggle button clicks
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        stopAutoPlay();
        isDemoRunning = false;
        const mode = this.getAttribute('data-mode');
        updateActiveButton(mode);

        if (mode === 'before') {
          setPosition(100, true);
        } else if (mode === 'after') {
          setPosition(0, true);
        } else if (mode === 'split') {
          setPosition(50, true);
        }
      });
    });

    // Auto Play / Compare Continuous Rotation Mode
    function startAutoPlay() {
      if (autoPlayInterval) return;
      isDemoRunning = false;
      if (autoBtn) {
        autoBtn.classList.add('running');
        autoBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause Auto';
      }
      updateActiveButton('split');

      autoPlayInterval = setInterval(() => {
        if (currentPos >= 96) autoDirection = -1;
        if (currentPos <= 4) autoDirection = 1;
        setPosition(currentPos + autoDirection * 1.5, false);
      }, 30);
    }

    function stopAutoPlay() {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
        if (autoBtn) {
          autoBtn.classList.remove('running');
          autoBtn.innerHTML = '<i class="fa-solid fa-play"></i> Auto Compare';
        }
      }
    }

    if (autoBtn) {
      autoBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (autoPlayInterval) {
          stopAutoPlay();
        } else {
          startAutoPlay();
        }
      });
    }

    // Smooth Intro Teaser Swipe (Tutorial Rotation)
    function playTutorialRotation() {
      if (isDemoRunning || isDragging || autoPlayInterval) return;
      isDemoRunning = true;
      stopAutoPlay();

      // Step 1: Slide left to show Before (Thermal Heat Loss)
      updateActiveButton('before');
      setPosition(20, true);

      // Step 2: Slide right to show After (Elastoclad HR)
      setTimeout(() => {
        if (isDragging || autoPlayInterval) return;
        updateActiveButton('after');
        setPosition(80, true);
      }, 900);

      // Step 3: Return to center split
      setTimeout(() => {
        if (isDragging || autoPlayInterval) return;
        updateActiveButton('split');
        setPosition(50, true);
        isDemoRunning = false;
      }, 1900);
    }

    // Replay demo button
    if (replayBtn) {
      replayBtn.addEventListener('click', function (e) {
        e.preventDefault();
        playTutorialRotation();
      });
    }

    // Trigger teaser automatically once when scrolled into view
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !hasPlayedIntro) {
              hasPlayedIntro = true;
              // Delay slightly so customer sees it initiate
              setTimeout(() => {
                playTutorialRotation();
              }, 600);
            }
          });
        },
        { threshold: 0.35 }
      );
      observer.observe(container);
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
      stopAutoPlay();
      isDemoRunning = false;
      isDragging = true;
      container.classList.add('is-dragging');
      const pos = getPointerPercentage(e);
      setPosition(pos, false);
      updateActiveButton('split');
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
        if (currentPos > 92) {
          updateActiveButton('before');
        } else if (currentPos < 8) {
          updateActiveButton('after');
        } else {
          updateActiveButton('split');
        }
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

    // Keyboard support
    container.setAttribute('tabindex', '0');
    container.setAttribute('role', 'slider');
    container.setAttribute('aria-label', 'Before and after thermal audit difference slider');
    container.setAttribute('aria-valuemin', '0');
    container.setAttribute('aria-valuemax', '100');

    container.addEventListener('keydown', function (e) {
      stopAutoPlay();
      isDemoRunning = false;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setPosition(currentPos - 5, true);
        updateActiveButton('split');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setPosition(currentPos + 5, true);
        updateActiveButton('split');
      } else if (e.key === 'Home') {
        e.preventDefault();
        setPosition(0, true);
        updateActiveButton('after');
      } else if (e.key === 'End') {
        e.preventDefault();
        setPosition(100, true);
        updateActiveButton('before');
      }
    });

    // Initialize at 50%
    setPosition(50, false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBeforeAfter);
  } else {
    initBeforeAfter();
  }
})();
