// ── Session Management ──
const { AsyncLocalStorage } = require('async_hooks');
const sessionStore = new AsyncLocalStorage();
let fallbackSession = null;

const session = {
  set(user) {
    const store = sessionStore.getStore();
    const userData = user ? {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone
    } : null;

    if (store) {
      store.user = userData;
    } else {
      fallbackSession = userData;
    }
  },
  get() {
    const store = sessionStore.getStore();
    if (store) {
      return store.user || null;
    }
    return fallbackSession;
  },
  clear() {
    const store = sessionStore.getStore();
    if (store) {
      store.user = null;
    } else {
      fallbackSession = null;
    }
  },
  isLoggedIn() {
    return this.get() !== null;
  },
  isAdmin() {
    return this.get()?.role === 'admin';
  },
  isKitchen() {
    return this.get()?.role === 'kitchen';
  },
  isCustomer() {
    return this.get()?.role === 'customer';
  },
  getUserId() {
    return this.get()?.id || null;
  }
};

// ── Input Validation ──
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validateRequired(fields, data) {
  const missing = [];
  for (const field of fields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missing.push(field);
    }
  }
  return missing;
}

function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
}

function formatCurrency(amount) {
  return parseFloat(amount).toFixed(2);
}

function generateOrderNumber() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${datePart}-${randomPart}`;
}

module.exports = {
  session,
  sessionStore,
  validateEmail,
  validateRequired,
  sanitizeString,
  formatCurrency,
  generateOrderNumber
};
