// ============================================================
//  ElectroStore - Mock API & Local Database
//  File: api.js
// ============================================================

const MOCK_CATEGORIES = [
  { id: 'electronics', name: 'Electronics', icon: '📱', desc: 'Premium Laptops, Chargers & Hubs', color: '#6366f1' },
  { id: 'accessories', name: 'Accessories', icon: '🎒', desc: 'Sleeves, Backpacks & Stands', color: '#f472b6' },
  { id: 'wearables', name: 'Wearables', icon: '⌚', desc: 'Smartwatches & Fitness Rings', color: '#34d399' },
  { id: 'gaming', name: 'Gaming', icon: '🎮', desc: 'Mice, Keyboards & Controllers', color: '#60a5fa' },
  { id: 'home', name: 'Home', icon: '🏠', desc: 'Smart Plugs, Speakers & Lights', color: '#fbbf24' },
  { id: 'phones', name: 'Phones', icon: '📞', desc: 'Smartphones & Foldables', color: '#a78bfa' }
];

const MOCK_PRODUCTS = [
  // Electronics (1-4)
  { id: 1, category: 'electronics', title: 'UltraBook Pro 14"', price: 1299.99, comparePrice: 1499.99, badge: 'New', icon: '💻', rating: '4.9', reviews: 128, stock: 15, colors: ['#c0c0c0', '#2d3748'] },
  { id: 2, category: 'electronics', title: 'GaN Fast Charger 100W', price: 49.99, comparePrice: 69.99, badge: 'On Sale', icon: '🔌', rating: '4.7', reviews: 340, stock: 45, colors: ['#ffffff', '#000000'] },
  { id: 3, category: 'electronics', title: 'USB-C 8-in-1 Dual HDMI Hub', price: 79.99, comparePrice: 99.99, badge: '', icon: '🎛️', rating: '4.6', reviews: 89, stock: 25, colors: ['#a0aec0'] },
  { id: 4, category: 'electronics', title: 'Thunderbolt 4 Pro Cable', price: 29.99, comparePrice: null, badge: '', icon: '🎗️', rating: '4.8', reviews: 54, stock: 60, colors: ['#000000'] },

  // Accessories (5-8)
  { id: 5, category: 'accessories', title: 'Anti-Theft Tech Backpack', price: 89.99, comparePrice: 119.99, badge: 'Hot Seller', icon: '🎒', rating: '4.8', reviews: 215, stock: 8, colors: ['#2d3748', '#4a5568'] },
  { id: 6, category: 'accessories', title: 'Ergonomic Laptop Stand', price: 39.99, comparePrice: 49.99, badge: '', icon: '🪜', rating: '4.5', reviews: 142, stock: 30, colors: ['#e2e8f0', '#4a5568'] },
  { id: 7, category: 'accessories', title: 'Leather Laptop Sleeve 14"', price: 45.00, comparePrice: 55.00, badge: 'New', icon: '💼', rating: '4.7', reviews: 67, stock: 12, colors: ['#8b5a2b', '#000000'] },
  { id: 8, category: 'accessories', title: 'Cable Organizer Pouch', price: 19.99, comparePrice: 24.99, badge: '', icon: '👝', rating: '4.4', reviews: 93, stock: 50, colors: ['#718096'] },

  // Wearables (9-12)
  { id: 9, category: 'wearables', title: 'AeroWatch GPS Smartwatch', price: 199.99, comparePrice: 249.99, badge: 'Hot Seller', icon: '⌚', rating: '4.8', reviews: 512, stock: 18, colors: ['#000000', '#e53e3e', '#3182ce'] },
  { id: 10, category: 'wearables', title: 'Helix Smart Fitness Ring', price: 149.99, comparePrice: 179.99, badge: 'New', icon: '💍', rating: '4.6', reviews: 74, stock: 9, colors: ['#ffd700', '#c0c0c0', '#000000'] },
  { id: 11, category: 'wearables', title: 'VisionVR Lite Headset', price: 349.99, comparePrice: 399.99, badge: '', icon: '🥽', rating: '4.7', reviews: 112, stock: 5, colors: ['#ffffff', '#000000'] },
  { id: 12, category: 'wearables', title: 'PulseBand Active tracker', price: 59.99, comparePrice: 79.99, badge: 'On Sale', icon: '📿', rating: '4.3', reviews: 204, stock: 40, colors: ['#4a5568', '#48bb78'] },

  // Gaming (13-16)
  { id: 13, category: 'gaming', title: 'Apex Elite Wireless Controller', price: 69.99, comparePrice: 79.99, badge: 'Hot Seller', icon: '🎮', rating: '4.8', reviews: 432, stock: 22, colors: ['#000000', '#ffffff', '#ed64a6'] },
  { id: 14, category: 'gaming', title: 'Phantom RGB Gaming Mouse', price: 49.99, comparePrice: 59.99, badge: '', icon: '🖱️', rating: '4.7', reviews: 189, stock: 35, colors: ['#1a202c'] },
  { id: 15, category: 'gaming', title: 'Stryker Mechanical Keyboard', price: 119.99, comparePrice: 139.99, badge: 'New', icon: '⌨️', rating: '4.9', reviews: 96, stock: 14, colors: ['#2d3748'] },
  { id: 16, category: 'gaming', title: 'Surround Sound Gaming Headset', price: 89.99, comparePrice: 109.99, badge: 'On Sale', icon: '🎧', rating: '4.6', reviews: 275, stock: 19, colors: ['#000000', '#3182ce'] },

  // Home (17-20)
  { id: 17, category: 'home', title: 'AcousticMax Smart Speaker', price: 99.99, comparePrice: 129.99, badge: 'On Sale', icon: '🔊', rating: '4.7', reviews: 320, stock: 28, colors: ['#2d3748', '#e2e8f0'] },
  { id: 18, category: 'home', title: 'RGB Smart LED Bulbs (4-Pack)', price: 34.99, comparePrice: 44.99, badge: '', icon: '💡', rating: '4.6', reviews: 412, stock: 65, colors: ['#ffffff'] },
  { id: 19, category: 'home', title: 'Smart Wi-Fi Plug Mini (2-Pack)', price: 24.99, comparePrice: 29.99, badge: '', icon: '🔌', rating: '4.5', reviews: 188, stock: 80, colors: ['#ffffff'] },
  { id: 20, category: 'home', title: 'HomeGuard HD Security Camera', price: 79.99, comparePrice: 99.99, badge: 'Hot Seller', icon: '📷', rating: '4.8', reviews: 156, stock: 11, colors: ['#ffffff', '#000000'] },

  // Phones (21-24)
  { id: 21, category: 'phones', title: 'Titanium Fold V3 Smartphone', price: 1599.99, comparePrice: 1799.99, badge: 'New', icon: '📱', rating: '4.9', reviews: 42, stock: 4, colors: ['#000000', '#a0aec0'] },
  { id: 22, category: 'phones', title: 'Aero Tab S10 Ultra Tablet', price: 799.99, comparePrice: 899.99, badge: '', icon: '📟', rating: '4.8', reviews: 88, stock: 13, colors: ['#2d3748'] },
  { id: 23, category: 'phones', title: 'Nova 5G Performance Phone', price: 599.99, comparePrice: 699.99, badge: 'On Sale', icon: '📞', rating: '4.6', reviews: 147, stock: 20, colors: ['#3182ce', '#000000'] },
  { id: 24, category: 'phones', title: 'Magnetic Wireless Power Bank 10K', price: 39.99, comparePrice: 49.99, badge: '', icon: '🔋', rating: '4.7', reviews: 235, stock: 75, colors: ['#ffffff', '#2d3748'] }
];

const MOCK_TESTIMONIALS = [
  { rating: 5, text: "Absolutely blown away by the quality of the UltraBook! Shipping was lightning fast, arriving within 24 hours.", avatar: "👨‍💻", name: "Alex Mercer", role: "Software Architect" },
  { rating: 5, text: "The Helix Fitness Ring is incredibly sleek and accurate. Customer support helped me with sizing instantly.", avatar: "👩‍💼", name: "Sarah Jenkins", role: "Product Manager" },
  { rating: 5, text: "Apex wireless controller is a game changer. Minimal latency and premium tactile buttons. Highly recommended!", avatar: "🎮", name: "Ryu Tanaka", role: "Esports Competitor" }
];

// ===== API IMPLEMENTATION =====

function getCategories() {
  return Promise.resolve(MOCK_CATEGORIES);
}

function getProducts() {
  return Promise.resolve(MOCK_PRODUCTS);
}

function getTestimonials() {
  return Promise.resolve(MOCK_TESTIMONIALS);
}

function login(email, password) {
  if (email && password.length >= 6) {
    return Promise.resolve({ success: true, message: 'Signed in successfully! Welcome back! 🎉' });
  } else {
    return Promise.reject(new Error('Invalid email or password (min 6 characters required).'));
  }
}

function signup(name, email, password) {
  if (name && email && password.length >= 6) {
    return Promise.resolve({ success: true, message: 'Account created! Welcome to ElectroStore! 🚀' });
  } else {
    return Promise.reject(new Error('Please fill all fields and enter a password of min 6 characters.'));
  }
}

function apiPlaceOrder(orderData) {
  if (orderData.items && orderData.items.length > 0) {
    return Promise.resolve({ success: true, message: 'Order placed successfully!' });
  } else {
    return Promise.reject(new Error('No items in order.'));
  }
}
