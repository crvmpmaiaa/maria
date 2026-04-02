/* ==========================================================================
   Main JS — Loader, Lazy Load, Modal, Grid Drag/Scroll
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- Loader ---------- */
  function initLoader() {
    const loader = document.querySelector('.loader');
    if (!loader) return;

    window.addEventListener('load', () => {
      requestAnimationFrame(() => {
        loader.classList.add('loader--hidden');
        loader.addEventListener('transitionend', () => loader.remove(), { once: true });
      });
    });
  }

  /* ---------- Lazy Load with Fade-In ---------- */
  function initLazyLoad() {
    const images = document.querySelectorAll('.portfolio__slide img, .portfolio__bio-slide img');
    if (!images.length) return;

    /* Load ALL images immediately since they're part of the visible wall */
    images.forEach((img) => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
      const markLoaded = () => img.classList.add('loaded');
      if (img.complete) {
        markLoaded();
      } else {
        img.addEventListener('load', markLoaded, { once: true });
      }
    });
  }

  /* ---------- Modal ---------- */
  function initModal() {
    const modal = document.getElementById('profile-modal');
    const openBtn = document.querySelector('.portfolio__profile-link');
    const closeBtn = document.querySelector('.modal__close');
    if (!modal || !openBtn) return;

    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      modal.showModal();
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => modal.close());
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.close();
    });
  }

  /* ---------- Grid Drag & Scroll ---------- */
  function initGridInteraction() {
    const wrapper = document.querySelector('.portfolio__grid-wrapper');
    const grid = document.querySelector('.portfolio__grid');
    if (!wrapper || !grid) return;

    let posX = 0;
    let posY = 0;
    let targetX = 0;
    let targetY = 0;
    let velocityX = 0;
    let velocityY = 0;

    /* Calculate scroll bounds */
    function getBounds() {
      const gridRect = grid.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();
      const overflowX = (gridRect.width - wrapperRect.width) / 2;
      const overflowY = (gridRect.height - wrapperRect.height) / 2;
      return {
        minX: -overflowX,
        maxX: overflowX,
        minY: -overflowY,
        maxY: overflowY
      };
    }

    function clamp(val, min, max) {
      return Math.max(min, Math.min(max, val));
    }

    function applyBounds() {
      const bounds = getBounds();
      targetX = clamp(targetX, bounds.minX, bounds.maxX);
      targetY = clamp(targetY, bounds.minY, bounds.maxY);
    }

    /* Animation loop — smooth interpolation */
    const smoothing = 0.1;
    let animating = true;

    function animate() {
      if (!animating) return;

      /* Apply momentum/velocity */
      targetX += velocityX;
      targetY += velocityY;
      velocityX *= 0.95;
      velocityY *= 0.95;
      if (Math.abs(velocityX) < 0.1) velocityX = 0;
      if (Math.abs(velocityY) < 0.1) velocityY = 0;

      applyBounds();

      /* Smooth lerp toward target */
      posX += (targetX - posX) * smoothing;
      posY += (targetY - posY) * smoothing;

      grid.style.transform = `translate(calc(-50% + ${posX}px), calc(-50% + ${posY}px))`;

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

    /* --- Mouse drag --- */
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastY = 0;
    let dragStartTargetX = 0;
    let dragStartTargetY = 0;

    wrapper.addEventListener('mousedown', (e) => {
      isDragging = true;
      velocityX = 0;
      velocityY = 0;
      startX = e.clientX;
      startY = e.clientY;
      lastX = e.clientX;
      lastY = e.clientY;
      dragStartTargetX = targetX;
      dragStartTargetY = targetY;
      wrapper.classList.add('is-dragging');
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      targetX = dragStartTargetX + dx;
      targetY = dragStartTargetY + dy;

      /* Track velocity for momentum */
      velocityX = (e.clientX - lastX) * 0.4;
      velocityY = (e.clientY - lastY) * 0.4;
      lastX = e.clientX;
      lastY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      wrapper.classList.remove('is-dragging');
    });

    /* --- Wheel scroll --- */
    wrapper.addEventListener('wheel', (e) => {
      e.preventDefault();
      velocityX = 0;
      velocityY = 0;
      targetX -= e.deltaX * 0.8;
      targetY -= e.deltaY * 0.8;
    }, { passive: false });

    /* --- Touch drag (mobile) --- */
    let touchStartX = 0;
    let touchStartY = 0;
    let touchDragStartX = 0;
    let touchDragStartY = 0;
    let touchLastX = 0;
    let touchLastY = 0;

    wrapper.addEventListener('touchstart', (e) => {
      velocityX = 0;
      velocityY = 0;
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchLastX = touch.clientX;
      touchLastY = touch.clientY;
      touchDragStartX = targetX;
      touchDragStartY = targetY;
    }, { passive: true });

    wrapper.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;
      targetX = touchDragStartX + dx;
      targetY = touchDragStartY + dy;

      velocityX = (touch.clientX - touchLastX) * 0.4;
      velocityY = (touch.clientY - touchLastY) * 0.4;
      touchLastX = touch.clientX;
      touchLastY = touch.clientY;
    }, { passive: false });

    wrapper.addEventListener('touchend', () => {
      /* momentum continues via velocity in animate loop */
    });
  }

  /* ---------- Init ---------- */
  initLoader();
  initLazyLoad();
  initModal();
  initGridInteraction();
})();
