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

// --- COUNT-UP STATS ---
const countEls = document.querySelectorAll('[data-count-to]');
if (countEls.length) {
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-count-to'));
        const suffix = el.getAttribute('data-count-suffix') || '';
        const decimals = parseInt(el.getAttribute('data-count-decimals') || '0', 10);
        const duration = 1200;
        const start = performance.now();
        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = eased * target;
          el.textContent = (decimals > 0 ? current.toFixed(decimals) : Math.round(current)) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        countObserver.unobserve(el);
      });
    }, { threshold: 0.4 });
    countEls.forEach(el => countObserver.observe(el));
  } else {
    // Reduced motion or no observer support: show final value immediately
    countEls.forEach(el => {
      el.textContent = el.getAttribute('data-count-to') + (el.getAttribute('data-count-suffix') || '');
    });
  }
}

// --- LOCAL FILE PREVIEW FIX ---
// Clean URLs like /about only resolve on a real server (e.g. GitHub Pages).
// When this site is opened directly from disk (file://), there's no server
// to do that resolution, so clicking a nav link would fail. This detects
// that case and quietly sends the click to the real .html file instead.
// On the live site (https://) this block does nothing — window.location.protocol
// is never 'file:' there, so every click behaves completely normally.
//
// Aware of the /nl/ /fr/ /de/ language subfolders: correctly computes the
// relative path whether moving root->subfolder, subfolder->root, staying
// within a subfolder, or moving subfolder->different subfolder.
window.resolveLocalPath = function(absolutePath) {
  const match = absolutePath.match(/^\/([^?#]*)(.*)$/);
  const targetPath = match ? match[1] : absolutePath.replace(/^\//, '');
  const suffix = (match && match[2]) || '';
  const knownLangs = ['nl', 'fr', 'de'];
  const segments = targetPath.split('/').filter(Boolean);
  const targetPrefix = knownLangs.includes(segments[0]) ? segments[0] : null;
  const targetRest = targetPrefix ? segments.slice(1).join('/') : segments.join('/');
  const targetFilename = (targetRest === '' ? 'index' : targetRest) + '.html';

  const currentLangMatch = window.location.pathname.match(/\/(nl|fr|de)\/[^/]*$/);
  const currentPrefix = currentLangMatch ? currentLangMatch[1] : null;

  let relative;
  if (currentPrefix === targetPrefix) {
    relative = targetFilename;
  } else if (currentPrefix && !targetPrefix) {
    relative = '../' + targetFilename;
  } else if (!currentPrefix && targetPrefix) {
    relative = targetPrefix + '/' + targetFilename;
  } else {
    relative = '../' + targetPrefix + '/' + targetFilename;
  }
  return relative + suffix;
};

if (window.location.protocol === 'file:') {
  document.addEventListener('click', (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('/') || href.includes('.')) return;
    e.preventDefault();
    window.location.href = window.resolveLocalPath(href);
  });
}

// --- ACTIVE NAV LINK ---
const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
document.querySelectorAll('.nav-links a').forEach(link => {
  const linkPath = link.pathname.replace(/\/$/, '') || '/';
  if (linkPath === currentPath) link.classList.add('active');
});

// --- PREVENT 300ms TAP DELAY on older iOS ---
// (Modern browsers handle this via touch-action CSS, but belt-and-suspenders)
if ('ontouchstart' in window) {
  document.documentElement.style.touchAction = 'manipulation';
}
