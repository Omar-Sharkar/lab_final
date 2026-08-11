// ── Utility Helper Functions ──

const utils = {
  // Show Bootstrap Toast Notification
  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const bgClass = type === 'success' ? 'bg-success text-white' :
                    type === 'error' ? 'bg-danger text-white' :
                    type === 'warning' ? 'bg-warning text-dark' : 'bg-info text-white';

    const toastId = 'toast-' + Date.now();
    const toastHtml = `
      <div id="${toastId}" class="toast align-items-center ${bgClass} border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">
            <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : type === 'error' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill'} me-2"></i>
            ${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', toastHtml);
    const toastEl = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
    toast.show();

    toastEl.addEventListener('hidden.bs.toast', () => {
      toastEl.remove();
    });
  },

  // Format currency
  formatPrice(amount) {
    return '$' + parseFloat(amount || 0).toFixed(2);
  },

  // Format date
  formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Get Order Status Badge HTML
  getStatusBadge(status) {
    const map = {
      pending: '<span class="badge badge-pending">Pending</span>',
      confirmed: '<span class="badge badge-confirmed">Confirmed</span>',
      preparing: '<span class="badge badge-preparing">Preparing</span>',
      ready: '<span class="badge badge-ready">Ready</span>',
      completed: '<span class="badge badge-completed">Completed</span>'
    };
    return map[status] || `<span class="badge bg-secondary">${status}</span>`;
  },

  // Show Modal Helper
  showModal(title, bodyHtml, footerHtml = '') {
    const container = document.getElementById('modal-container');
    const modalId = 'dynamic-modal';

    // Remove existing modal if any
    const existing = document.getElementById(modalId);
    if (existing) {
      const bsModal = bootstrap.Modal.getInstance(existing);
      if (bsModal) bsModal.dispose();
      existing.remove();
    }

    const modalHtml = `
      <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-light">
              <h5 class="modal-title fw-bold">${title}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">${bodyHtml}</div>
            ${footerHtml ? `<div class="modal-footer bg-light">${footerHtml}</div>` : ''}
          </div>
        </div>
      </div>
    `;

    container.innerHTML = modalHtml;
    const modalEl = document.getElementById(modalId);
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
    return modal;
  },

  closeModal() {
    const modalEl = document.getElementById('dynamic-modal');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }
  }
};

// ── Cart State Manager ──
const cartManager = {
  getCart() {
    try {
      return JSON.parse(localStorage.getItem('restaurant_cart') || '[]');
    } catch (e) {
      return [];
    }
  },

  saveCart(cart) {
    localStorage.setItem('restaurant_cart', JSON.stringify(cart));
    this.updateBadge();
  },

  addItem(food, quantity = 1) {
    const cart = this.getCart();
    const existingIndex = cart.findIndex(item => item.foodId === food.id);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        foodId: food.id,
        name: food.name,
        price: parseFloat(food.price),
        image_url: food.image_url,
        quantity: quantity
      });
    }

    this.saveCart(cart);
    utils.showToast(`Added "${food.name}" to cart`, 'success');
  },

  updateQuantity(foodId, quantity) {
    let cart = this.getCart();
    if (quantity <= 0) {
      cart = cart.filter(item => item.foodId !== foodId);
    } else {
      const item = cart.find(item => item.foodId === foodId);
      if (item) item.quantity = quantity;
    }
    this.saveCart(cart);
  },

  removeItem(foodId) {
    let cart = this.getCart();
    cart = cart.filter(item => item.foodId !== foodId);
    this.saveCart(cart);
    utils.showToast('Item removed from cart', 'info');
  },

  clearCart() {
    localStorage.removeItem('restaurant_cart');
    this.updateBadge();
  },

  getTotal() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  getItemCount() {
    const cart = this.getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
  },

  updateBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
      const count = this.getItemCount();
      badge.textContent = count;
      badge.classList.toggle('d-none', count === 0);
    }
  },

  // Selected table ID for QR scan simulation
  getSelectedTable() {
    return localStorage.getItem('selected_table_id') || null;
  },

  setSelectedTable(tableId, tableNumber) {
    if (tableId) {
      localStorage.setItem('selected_table_id', tableId);
      localStorage.setItem('selected_table_number', tableNumber);
    } else {
      localStorage.removeItem('selected_table_id');
      localStorage.removeItem('selected_table_number');
    }
  },

  getSelectedTableNumber() {
    return localStorage.getItem('selected_table_number') || null;
  }
};
