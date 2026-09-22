/* ============================================================
   Atech Pool Service — interactions
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Mobile navigation ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  function closeNav() {
    if (!nav || !burger) return;
    nav.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
  }

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeNav();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) closeNav();
    });
  }

  /* ---------- Sticky header shadow ---------- */
  var header = document.getElementById('header');
  function onScroll() {
    if (header) header.classList.toggle('is-stuck', window.scrollY > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll reveal ---------- */
  var revealTargets = document.querySelectorAll(
    '.section__head, .card, .cred, .why__media, .why__content, .strip__item, .contact__card, .formcard, .schedule__intro, .gallery__item, .alliance'
  );

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (i % 4) * 70 + 'ms';
      io.observe(el);
    });
  }

  /* ---------- Gallery lightbox ---------- */
  var grid = document.getElementById('galleryGrid');
  var lightbox = document.getElementById('lightbox');
  var lbStage = document.getElementById('lightboxStage');
  var lbImg = null;
  var lbClose = document.getElementById('lightboxClose');
  var lbPrev = document.getElementById('lightboxPrev');
  var lbNext = document.getElementById('lightboxNext');
  var items = grid ? Array.prototype.slice.call(grid.querySelectorAll('.gallery__item img')) : [];
  var current = 0;
  var lastFocused = null;

  function show(index) {
    if (!items.length || !lbStage) return;
    current = (index + items.length) % items.length;
    // The image element is created on demand so the page never ships an
    // empty-src <img> placeholder in the DOM.
    if (!lbImg) {
      lbImg = document.createElement('img');
      lbStage.appendChild(lbImg);
    }
    lbImg.src = items[current].src;
    lbImg.alt = items[current].alt;
  }

  function openLightbox(index) {
    if (!lightbox) return;
    lastFocused = document.activeElement;
    show(index);
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    if (lbClose) lbClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    if (lbImg && lbImg.parentNode) lbImg.parentNode.removeChild(lbImg);
    lbImg = null;
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  if (grid) {
    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('.gallery__item');
      if (!btn) return;
      var img = btn.querySelector('img');
      openLightbox(items.indexOf(img));
    });
  }

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev) lbPrev.addEventListener('click', function () { show(current - 1); });
  if (lbNext) lbNext.addEventListener('click', function () { show(current + 1); });

  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target === lbStage) closeLightbox();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (!lightbox || lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });

  /* ---------- Quote form validation ---------- */
  var form = document.getElementById('quoteForm');
  var status = document.getElementById('formStatus');

  function setError(name, message) {
    var box = document.querySelector('[data-error-for="' + name + '"]');
    var input = document.getElementById(name);
    if (box) box.textContent = message || '';
    if (input) input.classList.toggle('is-invalid', Boolean(message));
  }

  function clearErrors() {
    ['name', 'phone', 'email', 'service', 'consentTransactional'].forEach(function (n) {
      setError(n, '');
    });
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors();

      var name = document.getElementById('name');
      var phone = document.getElementById('phone');
      var email = document.getElementById('email');
      var service = document.getElementById('service');
      var consent = document.getElementById('consentTransactional');

      var ok = true;
      var firstBad = null;

      if (!name.value.trim()) {
        setError('name', 'Please enter your name.');
        ok = false; firstBad = firstBad || name;
      }

      var digits = phone.value.replace(/\D/g, '');
      if (digits.length < 10) {
        setError('phone', 'Please enter a valid phone number.');
        ok = false; firstBad = firstBad || phone;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
        setError('email', 'Please enter a valid email address.');
        ok = false; firstBad = firstBad || email;
      }

      if (!service.value) {
        setError('service', 'Please choose a service.');
        ok = false; firstBad = firstBad || service;
      }

      if (!consent.checked) {
        setError('consentTransactional', 'Please accept the transactional messages agreement.');
        ok = false; firstBad = firstBad || consent;
      }

      if (!ok) {
        if (status) {
          status.textContent = 'Please correct the highlighted fields.';
          status.className = 'formnote is-error';
        }
        if (firstBad) firstBad.focus();
        return;
      }

      if (status) {
        status.textContent =
          'Thanks, ' + name.value.trim().split(' ')[0] +
          '! Your ' + service.value.toLowerCase() +
          ' request is ready to send. For the fastest response, call us now at (469) 945-6922.';
        status.className = 'formnote is-success';
      }
      form.reset();
    });

    form.addEventListener('input', function (e) {
      if (e.target.id) setError(e.target.id, '');
    });
  }

  /* ---------- Footer year ---------- */
  // Copyright year is intentionally fixed to the source site's notice.
})();
