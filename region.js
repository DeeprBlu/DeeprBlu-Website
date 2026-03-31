/* =========================================
   DEEPRBLU MEDIA — region.js
   Region selector & currency conversion
   =========================================
   
   TO UPDATE EXCHANGE RATES:
   Change the 'rate' values below.
   AUD is always the base (1.0).
   Example: if 1 AUD = 0.58 EUR, set EUR rate to 0.58
   ========================================= */

const REGIONS = [
  {
    id:       'au',
    name:     'Australia',
    flag:     '🇦🇺',
    currency: 'AUD',
    symbol:   '$',
  },
  {
    id:       'us',
    name:     'United States',
    flag:     '🇺🇸',
    currency: 'USD',
    symbol:   '$',
  },
  {
    id:       'eu',
    name:     'Europe',
    flag:     '🇪🇺',
    currency: 'EUR',
    symbol:   '€',
  },
];

// Fixed rounded prices per region
const PRICES = {
  au: { starter: 350,  business: 499,  plus: 750  },
  us: { starter: 225,  business: 300,  plus: 475  },
  eu: { starter: 200,  business: 300,  plus: 425  },
};

function getRegion() {
  return sessionStorage.getItem('deeprblu-region') || 'au';
}

function setRegion(id) {
  sessionStorage.setItem('deeprblu-region', id);
}

function getCurrentRegion() {
  return REGIONS.find(r => r.id === getRegion()) || REGIONS[0];
}

function updatePrices(region) {
  const prices = PRICES[region.id] || PRICES.au;

  // Update all price elements on the page
  // Supports both .price-amount (homepage) and .service-card-price (services page)
  const priceEls = document.querySelectorAll('[data-price]');
  priceEls.forEach(el => {
    const key = el.getAttribute('data-price');
    if (prices[key] !== undefined) {
      el.innerHTML = `${region.symbol}${prices[key]} <span class="price-currency">${region.currency}</span>`;
    }
  });

  // Update contact form select options with current currency
  const packageMap = {
    'opt-shoreline': { key: 'starter',  name: 'Shoreline' },
    'opt-reef':      { key: 'business', name: 'Reef'      },
    'opt-deep':      { key: 'plus',     name: 'Deep'      },
  };
  Object.entries(packageMap).forEach(([id, pkg]) => {
    const opt = document.getElementById(id);
    if (opt && prices[pkg.key] !== undefined) {
      opt.textContent = `${pkg.name} — ${region.symbol}${prices[pkg.key]} ${region.currency}`;
    }
  });
}

function updateSelector(region) {
  const btn = document.getElementById('regionBtn');
  if (btn) {
    btn.innerHTML = `<span class="region-flag">${region.flag}</span> ${region.currency} <span class="region-arrow">▾</span>`;
  }

  // Mark active option
  document.querySelectorAll('.region-option').forEach(opt => {
    opt.classList.toggle('active', opt.getAttribute('data-region') === region.id);
  });
}

function applyRegion(id) {
  setRegion(id);
  const region = REGIONS.find(r => r.id === id) || REGIONS[0];
  updatePrices(region);
  updateSelector(region);

  // Close dropdown
  const selector = document.querySelector('.region-selector');
  if (selector) selector.classList.remove('open');
}

function buildSelector() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const selector = document.createElement('div');
  selector.className = 'region-selector';
  selector.id = 'regionSelector';

  const current = getCurrentRegion();

  selector.innerHTML = `
    <button class="region-btn" id="regionBtn" aria-label="Select region">
      <span class="region-flag">${current.flag}</span> ${current.currency} <span class="region-arrow">▾</span>
    </button>
    <div class="region-dropdown">
      ${REGIONS.map(r => `
        <button class="region-option${r.id === current.id ? ' active' : ''}" data-region="${r.id}">
          <span class="region-option-flag">${r.flag}</span>
          <span class="region-option-info">
            <span class="region-option-name">${r.name}</span>
            <span class="region-option-currency">${r.symbol} ${r.currency}</span>
          </span>
        </button>
      `).join('')}
    </div>
  `;

  // Insert as last item in nav-links, right after Contact button
  const navLinks = nav.querySelector('.nav-links');
  if (navLinks) {
    const li = document.createElement('li');
    li.appendChild(selector);
    navLinks.appendChild(li);
  } else {
    // Fallback: insert before nav-toggle
    const toggle = nav.querySelector('.nav-toggle');
    nav.insertBefore(selector, toggle);
  }

  // Toggle dropdown
  document.getElementById('regionBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    selector.classList.toggle('open');
  });

  // Option click
  selector.querySelectorAll('.region-option').forEach(opt => {
    opt.addEventListener('click', () => {
      applyRegion(opt.getAttribute('data-region'));
    });
  });

  // Close on outside click
  document.addEventListener('click', () => {
    selector.classList.remove('open');
  });
}

// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  buildSelector();
  applyRegion(getRegion());
});
