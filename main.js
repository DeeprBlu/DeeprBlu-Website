/* =========================================
   DEEPRBLU MEDIA — main.js
   ========================================= */

// --- NAV SCROLL BEHAVIOR ---
const nav = document.getElementById('nav');

if (nav) {
  const updateNav = () => {
    if (window.scrollY > 20) {
      nav.classList.add('scrolled');
    } else {
      if (document.body.classList.contains('has-hero')) {
        nav.classList.remove('scrolled');
      }
    }
  };

  if (document.querySelector('.hero')) {
    document.body.classList.add('has-hero');
  } else {
    nav.classList.add('scrolled');
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
}

// --- MOBILE MENU TOGGLE ---
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

function closeMenu() {
  if (!navLinks) return;
  navLinks.classList.remove('open');
  navToggle && navToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  const spans = navToggle ? navToggle.querySelectorAll('span') : [];
  spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
}

function openMenu() {
  if (!navLinks) return;
  navLinks.classList.add('open');
  navToggle && navToggle.setAttribute('aria-expanded', 'true');
  // Prevent background scroll when menu is open on mobile
  document.body.style.overflow = 'hidden';
  const spans = navToggle ? navToggle.querySelectorAll('span') : [];
  if (spans[0]) spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
  if (spans[1]) spans[1].style.opacity = '0';
  if (spans[2]) spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
}

if (navToggle && navLinks) {
  navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    navLinks.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Close on any nav link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on outside tap/click
  document.addEventListener('click', (e) => {
    if (nav && !nav.contains(e.target)) closeMenu();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // Swipe-up to close menu on mobile
  let touchStartY = 0;
  navLinks.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; }, { passive: true });
  navLinks.addEventListener('touchmove', e => {
    if (e.touches[0].clientY - touchStartY < -40) closeMenu();
  }, { passive: true });
}

// --- SCROLL REVEAL ANIMATION ---
// Only run if user hasn't requested reduced motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  const revealEls = document.querySelectorAll(
    '.what-card, .price-card, .service-card, .portfolio-card, .about-card, .contact-form-card, .policy-section, .strip-item'
  );

  if (revealEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -32px 0px' }
    );

    revealEls.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(22px)';
      // Stagger capped at 4 items to avoid long waits on mobile
      const delay = Math.min(i, 3) * 0.08;
      el.style.transition = `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`;
      observer.observe(el);
    });
  }
}

// --- ACTIVE NAV LINK ---
const currentPath = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPath) link.classList.add('active');
});

// --- PREVENT 300ms TAP DELAY on older iOS ---
// (Modern browsers handle this via touch-action CSS, but belt-and-suspenders)
if ('ontouchstart' in window) {
  document.documentElement.style.touchAction = 'manipulation';
}
