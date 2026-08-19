// ============================================================
//  ElectroStore - E-Commerce JavaScript
//  File: papa.js
// ============================================================

// ===== RESPONSIVE: Scroll Header Shadow & Back to Top Button =====
(function () {
  const header = document.querySelector('header');
  const backToTopBtn = document.createElement('button');
  backToTopBtn.className = 'back-to-top';
  backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
  backToTopBtn.setAttribute('aria-label', 'Back to top');
  backToTopBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  document.body.appendChild(backToTopBtn);

  let lastScrollY = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    if (scrollY > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
    lastScrollY = scrollY;
  });
})();

// ===== RESPONSIVE: Hamburger Button Toggle Menu =====
document.getElementById('hamburgerBtn').addEventListener('click', () => {
  document.getElementById('mobileNav').classList.toggle('open');
  document.getElementById('hamburgerBtn').classList.toggle('active');
});

// ===== RESPONSIVE: Auto-close mobile nav on link click =====
document.querySelectorAll('.mobile-nav .nav-link').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('mobileNav').classList.remove('open');
    document.getElementById('hamburgerBtn').classList.remove('active');
  });
});

// ===== RESPONSIVE: Close mobile nav on window resize =====
window.addEventListener('resize', () => {
  if (window.innerWidth > 1024) {
    document.getElementById('mobileNav').classList.remove('open');
    document.getElementById('hamburgerBtn').classList.remove('active');
  }
});

// ===== RESPONSIVE: Swipe to close drawers on mobile =====
(function () {
  let touchStartX = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const swipeDistance = touchEndX - touchStartX;

    if (swipeDistance > 80 && cartDrawer && cartDrawer.classList.contains('open')) {
      cartDrawer.classList.remove('open');
    }
    if (swipeDistance > 80 && wishlistDrawer && wishlistDrawer.classList.contains('open')) {
      wishlistDrawer.classList.remove('open');
    }
  }, { passive: true });
})();

// ===== RESPONSIVE: Smooth collapse footer columns on mobile =====
(function () {
  const footerCols = document.querySelectorAll('.footer-col');
  if (window.innerWidth <= 600) {
    footerCols.forEach((col, index) => {
      if (index === 0) return;
      const heading = col.querySelector('h4');
      const links = col.querySelectorAll('a:not(.logo)');
      const linksContainer = document.createElement('div');
      linksContainer.className = 'footer-links-collapse';
      linksContainer.style.cssText = 'overflow:hidden;transition:max-height 0.3s ease;max-height:200px;';
      links.forEach(link => linksContainer.appendChild(link.cloneNode(true)));
      links.forEach(link => link.remove());
      col.appendChild(linksContainer);

      heading.style.cursor = 'pointer';
      heading.addEventListener('click', () => {
        const isOpen = linksContainer.style.maxHeight !== '0px';
        linksContainer.style.maxHeight = isOpen ? '0px' : '200px';
      });
    });
  }
})();

// ===== RESPONSIVE: Lazy reveal animation on scroll =====
(function () {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const animateElements = document.querySelectorAll(
    '.category-card, .deal-card, .product-card, .testimonial-card, .section-header, .newsletter-container, .hero-slide'
  );

  // Make hero visible immediately
  const heroSlide = document.querySelector('.hero-slide');
  if (heroSlide) {
    heroSlide.style.opacity = '1';
    heroSlide.style.transform = 'translateY(0)';
  }

  animateElements.forEach(el => {
    if (el !== heroSlide) {
      observer.observe(el);
    }
  });
})();

// ===== RESPONSIVE: Handle orientation change =====
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    if (cartDrawer && cartDrawer.classList.contains('open')) {
      cartDrawer.classList.remove('open');
    }
    if (wishlistDrawer && wishlistDrawer.classList.contains('open')) {
      wishlistDrawer.classList.remove('open');
    }
  }, 300);
});

// ===== DATABASE (Server-se fetch hoga, fallback ke liye hardcoded) =====
let categories = [];
let allProducts = [];
let testimonials = [];
let dataLoaded = false;

// ===== STATE =====
let cart = [];
let wishlist = [];
let compareList = [];
let recentlyViewed = [];
let currentFilter = 'all';
let currentSort = 'default';
let currentCurrency = 'USD';
let maxPrice = 2000;
let appliedPromo = null;

// ===== CURRENCY CONVERSION & FORMATTING =====
function changeCurrency(curr) {
  currentCurrency = curr;
  localStorage.setItem('electro_currency', curr);
  const select = document.getElementById('currencySelect');
  if (select) select.value = curr;
  refreshProducts();
  renderDeals();
  updateCart();
  updateWishlistUI();
  renderCompareUI();
  renderRecentlyViewed();
  showToast(`Currency changed to ${curr}`, '💱');
}

function formatPrice(amountUSD) {
  const rates = (typeof getCurrencyRates === 'function') ? getCurrencyRates() : { USD: { symbol: '$', rate: 1 } };
  const conf = rates[currentCurrency] || rates['USD'];
  const val = amountUSD * conf.rate;
  if (currentCurrency === 'INR') {
    return `${conf.symbol}${Math.round(val).toLocaleString('en-IN')}`;
  }
  return `${conf.symbol}${val.toFixed(2)}`;
}

// ===== DOM REFS =====
const productsGrid = document.getElementById('productsGrid');
const cartDrawer = document.getElementById('cartDrawer');
const openCartBtn = document.getElementById('openCartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartCount = document.getElementById('cartCount');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartTotalVal = document.getElementById('cartTotalVal');
const checkoutBtn = document.getElementById('checkoutBtn');
const emptyCartMsg = document.getElementById('emptyCartMsg');
const successModal = document.getElementById('successModal');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const sortSelect = document.getElementById('sortSelect');
const wishlistCount = document.getElementById('wishlistCount');
const toastContainer = document.getElementById('toastContainer');
const freeShippingMsg = document.getElementById('freeShippingMsg');

// ===== CATEGORIES RENDER =====
function renderCategories() {
  const grid = document.getElementById('categoriesGrid');
  grid.innerHTML = '';
  categories.forEach(cat => {
    grid.innerHTML += `
      <div class="category-card" onclick="filterCategory('${cat.id}', document.querySelector('[onclick*=\\'${cat.id}\\']') || document.querySelector('.filter-btn'))" style="--cat-color: ${cat.color}">
        <div class="category-icon">${cat.icon}</div>
        <h4>${cat.name}</h4>
        <p>${cat.desc}</p>
      </div>
    `;
  });
}

// ===== DEALS RENDER =====
function renderDeals() {
  const grid = document.getElementById('dealsGrid');
  if (!grid) return;
  const dealsProducts = allProducts.filter(p => p.id % 3 === 0 || p.badge === 'On Sale' || p.badge === 'Hot Seller').slice(0, 4);
  grid.innerHTML = '';
  dealsProducts.forEach(product => {
    const oldPriceUSD = (product.comparePrice && product.comparePrice > product.price) ? product.comparePrice : (product.price * 1.25);
    const discount = Math.round((1 - product.price / oldPriceUSD) * 100);
    grid.innerHTML += `
      <div class="deal-card" onclick="showProductDetail(${product.id})">
        <div class="deal-badge">🔥 Limited Deal</div>
        <div class="deal-image">${product.image ? `<img src="${product.image}" alt="${product.title}" loading="lazy" onerror="this.onerror=null; this.outerHTML='<span>${product.icon}</span>';">` : product.icon}</div>
        <h4>${product.title}</h4>
        <div class="deal-pricing">
          <span class="deal-price">${formatPrice(product.price)}</span>
          <span class="deal-old-price">${formatPrice(oldPriceUSD)}</span>
          <span class="price-discount-tag">-${discount}%</span>
        </div>
        <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${product.id})">
          <i class="fas fa-shopping-bag"></i> Grab Deal
        </button>
      </div>
    `;
  });
}

// ===== TESTIMONIALS RENDER =====
function renderTestimonials() {
  const grid = document.getElementById('testimonialsGrid');
  if (!grid) return;
  grid.innerHTML = '';
  testimonials.forEach(t => {
    const stars = '\u2605'.repeat(t.rating) + '\u2606'.repeat(5 - t.rating);
    grid.innerHTML += `
      <div class="testimonial-card">
        <div class="testimonial-stars">${stars}</div>
        <p class="testimonial-text">"${t.text}"</p>
        <div class="testimonial-author">
          <span class="testimonial-avatar">${t.avatar}</span>
          <div>
            <strong>${t.name}</strong>
            <small>${t.role}</small>
          </div>
        </div>
      </div>
    `;
  });
}

// ===== PRODUCTS RENDER =====
function renderProducts(productsToDisplay) {
  if (!productsGrid) return;
  productsGrid.innerHTML = '';
  productsToDisplay.forEach(product => {
    const discount = (product.comparePrice && product.comparePrice > product.price) ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;
    const isWishlisted = wishlist.some(w => w.id === product.id);
    const isCompared = compareList.includes(product.id);
    const stockClass = product.stock <= 10 ? 'low-stock' : product.stock <= 30 ? 'medium-stock' : 'high-stock';

    let topBadgeHtml = '';
    if (product.badge) {
      topBadgeHtml = `<span class="product-badge">${product.badge}</span>`;
    } else if (discount > 0) {
      topBadgeHtml = `<span class="product-badge badge-sale">-${discount}% OFF</span>`;
    }

    productsGrid.innerHTML += `
      <div class="product-card" data-category="${product.category}" onclick="showProductDetail(${product.id})">
        ${topBadgeHtml}
        <button class="wishlist-toggle ${isWishlisted ? 'active' : ''}" onclick="event.stopPropagation(); toggleWishlist(${product.id})">
          <i class="fa${isWishlisted ? 's' : 'r'} fa-heart"></i>
        </button>
        <div class="product-image">${product.image ? `<img src="${product.image}" alt="${product.title}" loading="lazy" onerror="this.onerror=null; this.outerHTML='<span>${product.icon}</span>';">` : product.icon}</div>
        <div class="product-info">
          <span class="product-cat">${product.category}</span>
          <h3 class="product-title">${product.title}</h3>
          <div class="product-price">
            <span class="price-current">${formatPrice(product.price)}</span>
            ${product.comparePrice ? `<span class="old-price">${formatPrice(product.comparePrice)}</span>` : ''}
            ${discount > 0 ? `<span class="price-discount-tag">-${discount}%</span>` : ''}
          </div>
          <div class="product-meta">
            <span class="product-rating">\u2605 ${product.rating} <small>(${product.reviews})</small></span>
            <span class="product-stock ${stockClass}">${product.stock >= 30 ? 'In Stock' : product.stock >= 10 ? 'Limited' : '🔥 Only ' + product.stock + ' left'}</span>
          </div>
          <div class="product-card-actions">
            <button class="add-to-cart" style="flex:1;" onclick="event.stopPropagation(); addToCart(${product.id})">
              <i class="fas fa-shopping-bag"></i> Add
            </button>
            <button class="compare-btn-card ${isCompared ? 'active' : ''}" title="Compare Product" onclick="event.stopPropagation(); toggleCompare(${product.id})">
              <i class="fas fa-columns"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  });
}

function handlePriceSlider(val) {
  maxPrice = parseFloat(val);
  const label = document.getElementById('priceRangeVal');
  if (label) label.textContent = formatPrice(maxPrice);
  refreshProducts();
}

function getFilteredAndSortedProducts() {
  let result = [...allProducts];
  if (currentFilter !== 'all') {
    result = result.filter(p => p.category === currentFilter);
  }

  // Price range filter
  result = result.filter(p => p.price <= maxPrice);

  // In stock filter
  const stockCheckbox = document.getElementById('inStockOnly');
  if (stockCheckbox && stockCheckbox.checked) {
    result = result.filter(p => p.stock > 0);
  }

  // Rating filter
  const ratingSelect = document.getElementById('ratingFilter');
  if (ratingSelect && parseFloat(ratingSelect.value) > 0) {
    result = result.filter(p => parseFloat(p.rating) >= parseFloat(ratingSelect.value));
  }

  switch (currentSort) {
    case 'price-low': result.sort((a, b) => a.price - b.price); break;
    case 'price-high': result.sort((a, b) => b.price - a.price); break;
    case 'rating': result.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating)); break;
    case 'name': result.sort((a, b) => a.title.localeCompare(b.title)); break;
  }

  const counter = document.getElementById('productCounter');
  if (counter) {
    counter.textContent = `Showing ${result.length} of ${allProducts.length} products`;
  }

  return result;
}

function refreshProducts() {
  renderProducts(getFilteredAndSortedProducts());
}

// ===== FILTER =====
function filterCategory(category, button) {
  if (button) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
  }
  currentFilter = category;
  refreshProducts();
}

// ===== SORT =====
function sortProducts() {
  currentSort = sortSelect.value;
  refreshProducts();
}

// ===== SEARCH =====
searchInput.addEventListener('input', function () {
  const query = this.value.trim().toLowerCase();
  if (query.length < 1) { searchResults.classList.remove('active'); return; }
  const matches = allProducts.filter(p => p.title.toLowerCase().includes(query) || p.category.includes(query)).slice(0, 6);
  if (matches.length === 0) {
    searchResults.innerHTML = '<div class="search-no-result">No products found</div>';
  } else {
    searchResults.innerHTML = matches.map(p => `
      <div class="search-result-item" onclick="showProductDetail(${p.id}); searchResults.classList.remove('active'); searchInput.value='';">
        <span class="search-result-icon">${p.image ? `<img src="${p.image}" alt="${p.title}">` : p.icon}</span>
        <div>
          <div>${p.title}</div>
          <small>$${p.price.toFixed(2)}</small>
        </div>
      </div>
    `).join('');
  }
  searchResults.classList.add('active');
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-box')) searchResults.classList.remove('active');
});

// Mobile search
document.getElementById('mobileSearchBtn').addEventListener('click', function () {
  const q = document.getElementById('mobileSearchInput').value.trim().toLowerCase();
  if (q) {
    filterCategory('all', document.querySelector('.filter-btn'));
    const matches = allProducts.filter(p => p.title.toLowerCase().includes(q) || p.category.includes(q));
    renderProducts(matches);
    document.getElementById('mobileNav').classList.remove('open');
    document.getElementById('hamburgerBtn').classList.remove('active');
  }
});

// ===== PRODUCT DETAIL =====
function showProductDetail(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;
  addToRecentlyViewed(id);
  const discount = p.comparePrice ? Math.round((1 - p.price / p.comparePrice) * 100) : 0;
  const isWishlisted = wishlist.some(w => w.id === id);
  const isCompared = compareList.includes(id);
  document.getElementById('productDetailContent').innerHTML = `
    <div class="pd-header">
      <span class="pd-icon">${p.image ? `<img src="${p.image}" alt="${p.title}">` : p.icon}</span>
      <div>
        <h3>${p.title}</h3>
        <span class="product-cat">${p.category}</span>
      </div>
    </div>
    <div class="pd-pricing">
      <span class="pd-price">${formatPrice(p.price)}</span>
      ${p.comparePrice ? `<span class="old-price">${formatPrice(p.comparePrice)}</span>` : ''}
      ${discount > 0 ? `<span class="pd-badge">Save ${discount}%</span>` : ''}
    </div>
    <div class="pd-rating">\u2605 ${p.rating} <small>(${p.reviews} reviews)</small></div>
    <div class="pd-stock">
      <span class="product-stock ${p.stock <= 10 ? 'low-stock' : p.stock <= 30 ? 'medium-stock' : 'high-stock'}">
        ${p.stock >= 30 ? '\u2705 In Stock' : p.stock >= 10 ? '\u26A0\uFE0F Only ' + p.stock + ' left' : '\uD83D\uDD25 Low Stock!'}
      </span>
    </div>
    <p class="pd-desc">Premium quality ${p.title}. Features cutting-edge technology, ergonomic design, and long-lasting durability. Perfect for everyday use.</p>
    <div class="pd-colors">
      <span>Available Colors:</span>
      <div>${p.colors.map(c => `<span class="color-swatch" style="background:${c}"></span>`).join('')}</div>
    </div>
    <div class="pd-actions" style="gap:8px;">
      <button class="btn-primary" onclick="addToCart(${p.id}); closeProductModal();"><i class="fas fa-shopping-bag"></i> Add to Cart</button>
      <button class="btn-outline" onclick="toggleWishlist(${p.id}); closeProductModal();"><i class="fa${isWishlisted ? 's' : 'r'} fa-heart"></i> ${isWishlisted ? 'In Wishlist' : 'Wishlist'}</button>
      <button class="btn-outline" onclick="toggleCompare(${p.id}); closeProductModal();"><i class="fas fa-columns"></i> ${isCompared ? 'Comparing' : 'Compare'}</button>
    </div>
  `;
  document.getElementById('productModal').classList.add('open');
}

function closeProductModal() { document.getElementById('productModal').classList.remove('open'); }

// ===== CART =====
function addToCart(productId) {
  const product = allProducts.find(p => p.id === productId);
  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  updateCart();
  cartDrawer.classList.add('open');
  showToast('Added to cart!', '\uD83D\uDED2');
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCart();
}

function changeQuantity(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(productId);
  } else {
    updateCart();
  }
}

function updateCart() {
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalCount;

  const subtotalUSD = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let discountUSD = 0;

  if (appliedPromo) {
    discountUSD = subtotalUSD * (appliedPromo.discountPercent / 100);
  }

  const finalUSD = Math.max(0, subtotalUSD - discountUSD);
  const pointsEarned = Math.floor(finalUSD);

  const cartSubtotalVal = document.getElementById('cartSubtotalVal');
  const cartDiscountRow = document.getElementById('cartDiscountRow');
  const cartDiscountVal = document.getElementById('cartDiscountVal');
  const cartPromoTag = document.getElementById('cartPromoTag');
  const cartPromoTagText = document.getElementById('cartPromoTagText');
  const cartPointsVal = document.getElementById('cartPointsVal');

  if (cartSubtotalVal) cartSubtotalVal.textContent = formatPrice(subtotalUSD);

  if (appliedPromo && discountUSD > 0) {
    if (cartDiscountRow) cartDiscountRow.style.display = 'flex';
    if (cartDiscountVal) cartDiscountVal.textContent = `-${formatPrice(discountUSD)}`;
    if (cartPromoTag) cartPromoTag.style.display = 'flex';
    if (cartPromoTagText) cartPromoTagText.textContent = `🎟️ ${appliedPromo.code} (${appliedPromo.label})`;
  } else {
    if (cartDiscountRow) cartDiscountRow.style.display = 'none';
    if (cartPromoTag) cartPromoTag.style.display = 'none';
  }

  if (cartPointsVal) cartPointsVal.textContent = pointsEarned.toLocaleString();

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<div class="empty-cart-msg" id="emptyCartMsg">Your cart is empty</div>';
    checkoutBtn.disabled = true;
    cartTotalVal.textContent = formatPrice(0);
    freeShippingMsg.textContent = `Add ${formatPrice(50)} more for free shipping 🚚`;
  } else {
    cartItemsContainer.innerHTML = '';
    cart.forEach(item => {
      cartItemsContainer.innerHTML += `
        <div class="cart-item">
          <div class="cart-item-img">${item.image ? `<img src="${item.image}" alt="${item.title}">` : item.icon}</div>
          <div class="cart-item-details">
            <div class="cart-item-title">${item.title}</div>
            <div class="cart-item-price">${formatPrice(item.price)}</div>
            <div class="cart-quantity">
              <button class="qty-btn" onclick="changeQuantity(${item.id}, -1)">−</button>
              <span>${item.quantity}</span>
              <button class="qty-btn" onclick="changeQuantity(${item.id}, 1)">+</button>
              <button class="remove-item" onclick="removeFromCart(${item.id})">🗑️</button>
            </div>
            <div class="cart-item-total">${formatPrice(item.price * item.quantity)}</div>
          </div>
        </div>
      `;
    });
    cartTotalVal.textContent = formatPrice(finalUSD);
    checkoutBtn.disabled = false;
    const remaining = Math.max(0, 50 - finalUSD);
    freeShippingMsg.textContent = remaining > 0 ? `Add ${formatPrice(remaining)} more for free shipping 🚚` : '🎉 You get FREE shipping!';
  }
}

// ===== WISHLIST =====
function toggleWishlist(productId) {
  const idx = wishlist.findIndex(w => w.id === productId);
  if (idx > -1) {
    wishlist.splice(idx, 1);
    showToast('Removed from wishlist', '\uD83D\uDC94');
  } else {
    const p = allProducts.find(x => x.id === productId);
    wishlist.push({ ...p });
    showToast('Added to wishlist!', '\u2764\uFE0F');
  }
  updateWishlistUI();
  refreshProducts();
}

function updateWishlistUI() {
  wishlistCount.textContent = wishlist.length;
  const container = document.getElementById('wishlistItemsContainer');
  if (wishlist.length === 0) {
    container.innerHTML = '<div class="empty-cart-msg">Your wishlist is empty</div>';
  } else {
    container.innerHTML = wishlist.map(item => `
      <div class="cart-item">
        <div class="cart-item-img">${item.image ? `<img src="${item.image}" alt="${item.title}">` : item.icon}</div>
        <div class="cart-item-details">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-price">$${item.price.toFixed(2)}</div>
          <button class="add-to-cart" style="padding:0.4rem;font-size:0.85rem;" onclick="addToCart(${item.id}); toggleWishlist(${item.id})">
            <i class="fas fa-shopping-bag"></i> Add to Cart
          </button>
        </div>
        <button class="remove-item" onclick="toggleWishlist(${item.id})">\u2715</button>
      </div>
    `).join('');
  }
}

const wishlistDrawer = document.getElementById('wishlistDrawer');
function toggleWishlistDrawer() {
  wishlistDrawer.classList.toggle('open');
}

// ===== CART DRAWER TOGGLE =====
openCartBtn.addEventListener('click', () => cartDrawer.classList.add('open'));
closeCartBtn.addEventListener('click', () => cartDrawer.classList.remove('open'));

// ===== CLOSE DRAWERS ON CLICK OUTSIDE =====
document.addEventListener('click', (e) => {
  if (cartDrawer && cartDrawer.classList.contains('open')) {
    if (!cartDrawer.contains(e.target) && !openCartBtn.contains(e.target)) {
      cartDrawer.classList.remove('open');
    }
  }
  if (wishlistDrawer && wishlistDrawer.classList.contains('open')) {
    if (!wishlistDrawer.contains(e.target) && !document.getElementById('wishlistBtn').contains(e.target)) {
      wishlistDrawer.classList.remove('open');
    }
  }
});

// ===== STATE PERSISTENCE =====
function saveState() {
  localStorage.setItem('electrostore_cart', JSON.stringify(cart));
  localStorage.setItem('electrostore_wishlist', JSON.stringify(wishlist));
  localStorage.setItem('electrostore_compare', JSON.stringify(compareList));
  localStorage.setItem('electrostore_recent', JSON.stringify(recentlyViewed));
}

function loadState() {
  const savedCart = localStorage.getItem('electrostore_cart');
  const savedWishlist = localStorage.getItem('electrostore_wishlist');
  const savedCompare = localStorage.getItem('electrostore_compare');
  const savedRecent = localStorage.getItem('electrostore_recent');
  const savedCurr = localStorage.getItem('electro_currency');

  if (savedCurr) currentCurrency = savedCurr;
  if (savedCart) { try { cart = JSON.parse(savedCart); } catch (e) { cart = []; } }
  if (savedWishlist) { try { wishlist = JSON.parse(savedWishlist); } catch (e) { wishlist = []; } }
  if (savedCompare) { try { compareList = JSON.parse(savedCompare); } catch (e) { compareList = []; } }
  if (savedRecent) { try { recentlyViewed = JSON.parse(savedRecent); } catch (e) { recentlyViewed = []; } }
}

// ===== COMPARISON & TRACKING & PROMO HELPERS =====
function toggleCompare(productId) {
  const idx = compareList.findIndex(id => id === productId);
  if (idx > -1) {
    compareList.splice(idx, 1);
    showToast('Removed from comparison', '⚖️');
  } else {
    if (compareList.length >= 3) {
      showToast('You can compare max 3 products at a time', '⚠️');
      return;
    }
    compareList.push(productId);
    showToast('Added to comparison list!', '⚖️');
  }
  updateCompareCount();
  renderCompareUI();
  refreshProducts();
  saveState();
}

function updateCompareCount() {
  const badge = document.getElementById('compareCount');
  const countSpan = document.getElementById('compareItemCount');
  if (badge) badge.textContent = compareList.length;
  if (countSpan) countSpan.textContent = compareList.length;
}

function toggleCompareDrawer() {
  const drawer = document.getElementById('compareDrawer');
  if (drawer) drawer.classList.toggle('open');
}

function clearCompareList() {
  compareList = [];
  updateCompareCount();
  renderCompareUI();
  refreshProducts();
  saveState();
  showToast('Comparison list cleared');
}

function renderCompareUI() {
  const container = document.getElementById('compareItemsContainer');
  if (!container) return;
  if (compareList.length === 0) {
    container.innerHTML = '<div class="empty-cart-msg">Select up to 3 products to compare features & prices</div>';
    return;
  }
  const items = compareList.map(id => allProducts.find(p => p.id === id)).filter(Boolean);
  container.innerHTML = `
    <div class="compare-grid">
      ${items.map(p => `
        <div class="compare-card">
          <button class="compare-card-remove" onclick="toggleCompare(${p.id})">&times;</button>
          <div style="font-size:2.5rem;margin-bottom:0.5rem;">${p.image ? `<img src="${p.image}" class="compare-card-img" alt="${p.title}">` : p.icon}</div>
          <h4 style="font-size:0.9rem;margin-bottom:0.3rem;">${p.title}</h4>
          <div style="color:var(--primary);font-weight:700;margin-bottom:0.4rem;">${formatPrice(p.price)}</div>
          <div style="font-size:0.8rem;color:var(--warning);margin-bottom:0.4rem;">★ ${p.rating} (${p.reviews})</div>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.8rem;">Category: ${p.category}</div>
          <button class="add-to-cart" style="font-size:0.8rem;padding:0.4rem;" onclick="addToCart(${p.id})"><i class="fas fa-shopping-bag"></i> Add</button>
        </div>
      `).join('')}
    </div>
  `;
}

function addToRecentlyViewed(productId) {
  recentlyViewed = recentlyViewed.filter(id => id !== productId);
  recentlyViewed.unshift(productId);
  if (recentlyViewed.length > 4) recentlyViewed.pop();
  saveState();
  renderRecentlyViewed();
}

function renderRecentlyViewed() {
  const section = document.getElementById('recentlyViewedSection');
  const grid = document.getElementById('recentlyViewedGrid');
  if (!section || !grid) return;

  if (recentlyViewed.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  grid.innerHTML = '';
  const items = recentlyViewed.map(id => allProducts.find(p => p.id === id)).filter(Boolean);
  items.forEach(product => {
    const isWishlisted = wishlist.some(w => w.id === product.id);
    grid.innerHTML += `
      <div class="product-card" onclick="showProductDetail(${product.id})">
        <button class="wishlist-toggle ${isWishlisted ? 'active' : ''}" onclick="event.stopPropagation(); toggleWishlist(${product.id})">
          <i class="fa${isWishlisted ? 's' : 'r'} fa-heart"></i>
        </button>
        <div class="product-image">${product.image ? `<img src="${product.image}" alt="${product.title}">` : product.icon}</div>
        <div class="product-info">
          <h3 class="product-title" style="font-size:0.9rem;">${product.title}</h3>
          <div class="product-price"><span>${formatPrice(product.price)}</span></div>
          <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${product.id})">
            <i class="fas fa-shopping-bag"></i> Add to Cart
          </button>
        </div>
      </div>
    `;
  });
}

function openTrackOrderModal() {
  document.getElementById('trackOrderModal').classList.add('open');
}

function closeTrackOrderModal() {
  document.getElementById('trackOrderModal').classList.remove('open');
}

function lookupOrderTrack() {
  const input = document.getElementById('trackOrderIdInput');
  const display = document.getElementById('trackingStatusDisplay');
  const val = (input ? input.value : '').trim().toUpperCase();

  if (!val) {
    showToast('Please enter an Order ID', '⚠️');
    return;
  }

  display.style.display = 'block';
  document.getElementById('trackOrderNumber').textContent = val;
  document.getElementById('trackStatusBadge').textContent = 'On The Way 📦';
  document.getElementById('trackEstDate').textContent = 'Tomorrow by 5:00 PM';
  showToast(`Tracking status loaded for ${val}`, '🚚');
}

async function handleApplyPromo() {
  const input = document.getElementById('cartPromoInput');
  const code = (input ? input.value : '').trim();
  if (!code) return;

  try {
    const res = await validatePromoCode(code);
    appliedPromo = res;
    showToast(`Applied ${res.label}! 🎉`, '🎟️');
    updateCart();
  } catch (err) {
    showToast(err.message || 'Invalid Promo Code', '❌');
  }
}

function removePromoCode() {
  appliedPromo = null;
  showToast('Promo code removed');
  updateCart();
}

// ===== DATA LOADING FROM API =====
async function loadDataFromAPI() {
  try {
    const [cats, prods, testis] = await Promise.all([
      getCategories(),
      getProducts(),
      getTestimonials()
    ]);
    categories = Array.isArray(cats) ? cats : (cats.categories || []);
    allProducts = Array.isArray(prods) ? prods : (prods.products || []);
    testimonials = Array.isArray(testis) ? testis : (testis.testimonials || []);
    dataLoaded = true;
  } catch (error) {
    console.warn('Server unavailable, using fallback data');
  }
  renderCategories();
  renderDeals();
  renderTestimonials();
  refreshProducts();
  updateCart();
  updateWishlistUI();
}

// ===== AUTH =====
function openLoginModal() {
  document.getElementById('loginModal').classList.add('open');
}
function closeLoginModal() {
  document.getElementById('loginModal').classList.remove('open');
}
function switchAuthTab(tab, btn) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('signupForm').style.display = tab === 'signup' ? 'block' : 'none';
}
async function handleLogin(e) {
  e.preventDefault();
  const form = e.target;
  const email = form.querySelector('input[type="email"]').value;
  const password = form.querySelector('input[type="password"]').value;
  try {
    const result = await login(email, password);
    showToast(result.message || 'Signed in successfully! Welcome back! \uD83C\uDF89', '\uD83D\uDC4B');
    closeLoginModal();
  } catch (err) {
    showToast(err.message || 'Login failed. Please try again.', '\u274C');
  }
}
async function handleSignup(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.querySelector('input[type="text"]').value;
  const inputs = form.querySelectorAll('input');
  const email = inputs[1].value;
  const password = inputs[2].value;
  try {
    const result = await signup(name, email, password);
    showToast(result.message || 'Account created! Welcome to ElectroStore! \uD83D\uDE80', '\uD83C\uDF89');
    closeLoginModal();
  } catch (err) {
    showToast(err.message || 'Signup failed. Please try again.', '\u274C');
  }
}

// ===== CHECKOUT =====
function openCheckoutModal() {
  const subtotalUSD = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let discountUSD = appliedPromo ? subtotalUSD * (appliedPromo.discountPercent / 100) : 0;
  const finalUSD = Math.max(0, subtotalUSD - discountUSD);
  const shippingUSD = finalUSD >= 50 ? 0 : 5.99;
  const grandTotalUSD = finalUSD + shippingUSD;

  document.getElementById('checkoutSubtotal').textContent = formatPrice(finalUSD);
  document.getElementById('checkoutShipping').textContent = shippingUSD === 0 ? 'FREE' : formatPrice(shippingUSD);
  document.getElementById('checkoutTotal').textContent = formatPrice(grandTotalUSD);
  document.getElementById('checkoutBtnTotal').textContent = formatPrice(grandTotalUSD);
  document.getElementById('checkoutModal').classList.add('open');
}
function closeCheckoutModal() {
  document.getElementById('checkoutModal').classList.remove('open');
}
async function placeOrder(e) {
  e.preventDefault();
  const form = e.target;
  const inputs = form.querySelectorAll('input');
  const subtotalUSD = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let discountUSD = appliedPromo ? subtotalUSD * (appliedPromo.discountPercent / 100) : 0;
  const finalUSD = Math.max(0, subtotalUSD - discountUSD);

  const orderData = {
    items: cart.map(item => ({ id: item.id, title: item.title, price: item.price, quantity: item.quantity, icon: item.icon })),
    total: finalUSD,
    shipping: finalUSD >= 50 ? 0 : 5.99,
    customer: { name: inputs[0].value, email: inputs[1].value, address: inputs[2].value, city: inputs[3].value, zip: inputs[4].value },
    payment: form.querySelector('input[name="payment"]:checked').value
  };
  try {
    const res = await apiPlaceOrder(orderData);
    closeCheckoutModal();
    cart = [];
    appliedPromo = null;
    updateCart();
    openSuccessModal(res.orderId);
  } catch (err) {
    showToast(err.message || 'Order failed. Please try again.', '❌');
  }
}

function openSuccessModal(orderId) {
  if (orderId) {
    const p = document.querySelector('#successModal p');
    if (p) p.innerHTML = `Order <strong>${orderId}</strong> confirmed! It will ship within 24 hours. Track it anytime!`;
  }
  document.getElementById('successModal').classList.add('open');
}
function closeSuccessModal() {
  document.getElementById('successModal').classList.remove('open');
}

// ===== TOASTS =====
function showToast(message, icon = 'ℹ️') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${icon}</span> ${message}`;
  toastContainer.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 50);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// ===== COUNTDOWN TIMER =====
(function () {
  let hours = 2, minutes = 45, seconds = 30;
  const timerHours = document.getElementById('timerHours');
  const timerMinutes = document.getElementById('timerMinutes');
  const timerSeconds = document.getElementById('timerSeconds');

  if (!timerHours || !timerMinutes || !timerSeconds) return;

  const interval = setInterval(() => {
    if (seconds > 0) {
      seconds--;
    } else {
      if (minutes > 0) {
        minutes--;
        seconds = 59;
      } else {
        if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          clearInterval(interval);
          return;
        }
      }
    }
    timerHours.textContent = String(hours).padStart(2, '0');
    timerMinutes.textContent = String(minutes).padStart(2, '0');
    timerSeconds.textContent = String(seconds).padStart(2, '0');
  }, 1000);
})();

// ===== NEWSLETTER =====
function handleNewsletter(e) {
  e.preventDefault();
  const emailInput = e.target.querySelector('input');
  showToast('Subscribed successfully! Thank you! \uD83D\uDCE2', '\uD83C\uDF89');
  emailInput.value = '';
}

// Auto-save state on changes
const origUpdateCart = updateCart;
updateCart = function () {
  origUpdateCart();
  saveState();
};

updateWishlistUI = (function (orig) {
  return function () {
    orig();
    saveState();
  };
})(updateWishlistUI);

// ===== INIT =====
loadState();
loadDataFromAPI();
setTimeout(() => {
  const select = document.getElementById('currencySelect');
  if (select) select.value = currentCurrency;
  updateCompareCount();
  renderCompareUI();
  renderRecentlyViewed();
}, 200);

// Close drawers on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    cartDrawer.classList.remove('open');
    wishlistDrawer.classList.remove('open');
    const compareDrawer = document.getElementById('compareDrawer');
    if (compareDrawer) compareDrawer.classList.remove('open');
    closeProductModal();
    closeLoginModal();
    closeCheckoutModal();
    closeSuccessModal();
    closeTrackOrderModal();
  }
});

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

// ===== THEME TOGGLE (LIGHT / DARK MODE) =====
function initTheme() {
  const savedTheme = localStorage.getItem('electro_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('electro_theme', newTheme);
  updateThemeIcon(newTheme);
  showToast(newTheme === 'dark' ? '🌙 Dark Mode Activated' : '☀️ Light Mode Activated');
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('themeToggleBtn');
  if (!btn) return;
  const icon = btn.querySelector('i');
  if (!icon) return;
  if (theme === 'dark') {
    icon.className = 'fas fa-sun';
    btn.setAttribute('title', 'Switch to Light Mode');
  } else {
    icon.className = 'fas fa-moon';
    btn.setAttribute('title', 'Switch to Dark Mode');
  }
}

// Initialize theme on load
document.addEventListener('DOMContentLoaded', initTheme);
initTheme();

