/* ============================================
   Pratik Singh Chandel Portfolio — Interactions
   ============================================ */

(function () {
  'use strict';

  // Cursor glow disabled (simple portfolio) 


  // --- Theme Toggle (Dark / Light Mode) ---
  const themeToggle = document.getElementById('themeToggle');
  const themeToggleMobile = document.getElementById('themeToggleMobile');

  const getSavedTheme = () => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  };

  const applyTheme = (theme) => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
  };

  // Initialize theme on load
  applyTheme(getSavedTheme());

  const handleThemeToggle = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
  };

  if (themeToggle) {
    themeToggle.addEventListener('click', handleThemeToggle);
  }
  if (themeToggleMobile) {
    themeToggleMobile.addEventListener('click', handleThemeToggle);
  }

  // --- Navbar scroll effect ---
  const nav = document.getElementById('nav');
  const handleScroll = () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();


  // --- Mobile menu ---
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.classList.toggle('active');
      mobileMenu.classList.toggle('open', isOpen);
      mobileMenu.setAttribute('aria-hidden', !isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        mobileMenu.classList.remove('open');
        mobileMenu.setAttribute('aria-hidden', 'true');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Hero typing (Frontend Developer style) ---
  const typeWrap = document.querySelector('.typewrap');
  if (typeWrap) {
    const words = ['Frontend Developer', 'Frontend Developer'];
    let wordIndex = 0;
    let charIndex = 0;
    const cursor = typeWrap.querySelector('.typecursor');

    const ghostSpacer = document.createElement('span');
    ghostSpacer.className = 'typeghost';
    ghostSpacer.setAttribute('aria-hidden', 'true');
    ghostSpacer.textContent = '';
    typeWrap.appendChild(ghostSpacer);

    // We already hardcoded initial text in HTML. JS keeps cursor blink + ensures consistent styling.
    if (cursor) cursor.style.animationPlayState = 'running';

    // Optional: if you want real typing, uncomment below.
    // const targetWord = words[wordIndex];
    // const tick = () => {
    //   if (!cursor) return;
    //   const before = typeWrap.childNodes[0];
    //   if (charIndex <= targetWord.length) {
    //     if (!before) {
    //       const textNode = document.createTextNode('');
    //       typeWrap.insertBefore(textNode, cursor);
    //     }
    //   }
    // };
  }

  // --- Counter animation (disabled for simple portfolio) ---



  // --- Scroll reveal ---
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 5, 4) * 70}ms`;
      revealObserver.observe(el);
    });
  }

  // --- Active nav link on scroll ---
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__links a');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    { threshold: 0.25, rootMargin: `-${nav ? nav.offsetHeight : 72}px 0px -45% 0px` }
  );

  sections.forEach((s) => sectionObserver.observe(s));

  // --- Shop / Cart ---
  const STORAGE_KEY = 'demo_shop_cart_v1';

  const products = [
    { id: 'p1', name: 'Java Handbook', price: 499, desc: 'Practical notes and patterns for Java developers.', tag: 'Java', rating: 4.6 },
    { id: 'p2', name: 'DSA Problem Set', price: 799, desc: 'Curated DSA questions with solutions walkthrough.', tag: 'DSA', rating: 4.7 },
    { id: 'p3', name: 'Frontend UI Kit', price: 999, desc: 'Modern components inspired by real production UI.', tag: 'UI', rating: 4.5 },
    { id: 'p4', name: 'Node.js API Blueprint', price: 699, desc: 'REST API design + error handling patterns.', tag: 'Node', rating: 4.4 },
    { id: 'p5', name: 'SQL Starter Pack', price: 399, desc: 'Basics to joins, queries, and optimization tips.', tag: 'SQL', rating: 4.3 },
    { id: 'p6', name: 'React Components', price: 899, desc: 'Reusable components and state management examples.', tag: 'React', rating: 4.6 },
  ];

  const els = {
    search: document.getElementById('shopSearch'),
    productGrid: document.getElementById('productGrid'),
    cartItems: document.getElementById('cartItems'),
    cartCountText: document.getElementById('cartCountText'),
    cartTotal: document.getElementById('cartTotal'),
    grandTotal: document.getElementById('grandTotal'),
    placeOrderBtn: document.getElementById('placeOrderBtn'),
    clearCartBtn: document.getElementById('clearCartBtn'),
    checkoutForm: document.getElementById('checkoutForm'),
  };

  let cart = loadCart();

  function formatINR(amount) {
    try {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount).replace('₹', '₹');
    } catch {
      return `₹${amount}`;
    }
  }

  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }

  function getCartCount() {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  }

  function getCartSubtotal() {
    let total = 0;
    for (const [id, qty] of Object.entries(cart)) {
      const p = products.find((x) => x.id === id);
      if (p) total += p.price * qty;
    }
    return total;
  }

  function addToCart(productId, qty = 1) {
    if (!cart[productId]) cart[productId] = 0;
    cart[productId] += qty;
    if (cart[productId] <= 0) delete cart[productId];
    saveCart();
    renderAll();
    showToast('Added to cart');
  }

  function setQty(productId, qty) {
    const safe = Math.max(0, qty);
    if (safe === 0) delete cart[productId];
    else cart[productId] = safe;
    saveCart();
    renderAll();
  }

  function clearCart() {
    cart = {};
    saveCart();
    renderAll();
    showToast('Cart cleared');
  }

  function renderProductCard(p) {
    return `
      <article class="product-card" data-product-id="${p.id}">
        <div class="product-card__top">
          <div class="product-card__badge">${p.tag}</div>
          <div class="product-card__rating">★ ${p.rating.toFixed(1)}</div>
        </div>
        <h3 class="product-card__title">${p.name}</h3>
        <p class="product-card__desc">${p.desc}</p>
        <div class="product-card__bottom">
          <div class="product-card__price">${formatINR(p.price)}</div>
          <button class="btn btn--primary product-card__btn" type="button" data-add-to-cart="${p.id}">
            Add to cart
          </button>
        </div>
      </article>
    `;
  }

  function renderProducts(list) {
    els.productGrid.innerHTML = list.map(renderProductCard).join('');
  }

  function renderCartItems() {
    const entries = Object.entries(cart);
    if (entries.length === 0) {
      els.cartItems.dataset.empty = 'true';
      els.cartItems.innerHTML = `
        <div class="cart__empty">
          <div class="cart__empty-icon">🛒</div>
          <div class="cart__empty-title">Your cart is empty</div>
          <div class="cart__empty-sub">Add a product to get started.</div>
        </div>
      `;
      return;
    }

    els.cartItems.dataset.empty = 'false';
    els.cartItems.innerHTML = entries
      .map(([id, qty]) => {
        const p = products.find((x) => x.id === id);
        if (!p) return '';
        return `
          <div class="cart-item" data-cart-item-id="${id}">
            <div class="cart-item__meta">
              <div class="cart-item__name">${p.name}</div>
              <div class="cart-item__price">${formatINR(p.price)}</div>
            </div>

            <div class="cart-item__qty">
              <button class="qty-btn" type="button" data-qty-decrease="${id}" aria-label="Decrease quantity">−</button>
              <div class="qty" aria-label="Quantity">${qty}</div>
              <button class="qty-btn" type="button" data-qty-increase="${id}" aria-label="Increase quantity">+</button>
            </div>

            <div class="cart-item__line">
              <div class="cart-item__line-total">${formatINR(p.price * qty)}</div>
              <button class="cart-item__remove" type="button" data-remove="${id}">Remove</button>
            </div>
          </div>
        `;
      })
      .join('');
  }

  function renderCartTotals() {
    const count = getCartCount();
    const subtotal = getCartSubtotal();
    const shipping = 0;
    const grand = subtotal + shipping;

    els.cartCountText.textContent = `${count} item${count === 1 ? '' : 's'}`;
    els.cartTotal.textContent = formatINR(subtotal);
    els.grandTotal.textContent = formatINR(grand);
    els.placeOrderBtn.disabled = count === 0;
  }

  function renderAll() {
    const q = els.search ? els.search.value.trim().toLowerCase() : '';
    const filtered = q
      ? products.filter((p) => (p.name + ' ' + p.desc + ' ' + p.tag).toLowerCase().includes(q))
      : products;

    if (els.productGrid) renderProducts(filtered);
    if (els.cartItems) renderCartItems();
    if (els.cartTotal) renderCartTotals();

    // update event handlers for add-to-cart buttons (event delegation below handles cart buttons too)
    // no-op
  }

  function hydrateShopEvents() {
    if (els.productGrid) {
      els.productGrid.addEventListener('click', (e) => {
        const target = e.target.closest('[data-add-to-cart]');
        if (!target) return;
        const id = target.getAttribute('data-add-to-cart');
        addToCart(id, 1);
      });
    }

    if (els.cartItems) {
      els.cartItems.addEventListener('click', (e) => {
        const inc = e.target.closest('[data-qty-increase]');
        if (inc) {
          const id = inc.getAttribute('data-qty-increase');
          const next = (cart[id] || 0) + 1;
          setQty(id, next);
          return;
        }

        const dec = e.target.closest('[data-qty-decrease]');
        if (dec) {
          const id = dec.getAttribute('data-qty-decrease');
          const next = (cart[id] || 0) - 1;
          setQty(id, next);
          return;
        }

        const rem = e.target.closest('[data-remove]');
        if (rem) {
          const id = rem.getAttribute('data-remove');
          setQty(id, 0);
          showToast('Removed');
        }
      });
    }

    if (els.search) {
      let t = null;
      els.search.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(() => renderAll(), 120);
      });
    }

    if (els.clearCartBtn) {
      els.clearCartBtn.addEventListener('click', clearCart);
    }

    if (els.checkoutForm) {
      els.checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const count = getCartCount();
        if (count === 0) return;

        const btn = els.checkoutForm.querySelector('button[type="submit"]');
        const original = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = 'Placing order...';

        setTimeout(() => {
          clearCart();
          els.checkoutForm.reset();
          btn.innerHTML = original;
          btn.disabled = false;
          showToast('Order placed! (demo)');
        }, 900);
      });
    }
  }

  // --- Contact form ---
  const contactForm = document.getElementById('contactForm');

  // Initialize shop only if elements exist
  if (els.productGrid && els.cartItems) {
    renderAll();
    hydrateShopEvents();
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn = contactForm.querySelector('button[type="submit"]');
      const originalHTML = btn.innerHTML;
      btn.innerHTML = 'Sending...';
      btn.disabled = true;

      setTimeout(() => {
        showToast('Message sent! I\'ll get back to you soon.');
        contactForm.reset();
        btn.innerHTML = originalHTML;
        btn.disabled = false;
      }, 1200);
    });
  }


  function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  // --- Smooth anchor offset fix ---
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });
})();
