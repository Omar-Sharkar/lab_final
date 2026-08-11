const customerCartPage = {
  async render() {
    const cart = cartManager.getCart();
    const tableNumber = cartManager.getSelectedTableNumber();
    const total = cartManager.getTotal();

    return `
      <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="fw-bold"><i class="bi bi-cart3 me-2 text-primary"></i>Your Order Cart</h2>
          <a href="#/menu" class="btn btn-outline-secondary rounded-pill">
            <i class="bi bi-arrow-left me-1"></i> Continue Browsing Menu
          </a>
        </div>

        ${cart.length === 0 ? `
          <div class="card custom-card p-5 text-center">
            <span class="display-1">🛒</span>
            <h3 class="fw-bold mt-3 text-muted">Your Cart is Empty</h3>
            <p class="text-muted">You haven't added any items to your order cart yet.</p>
            <div class="mt-3">
              <a href="#/menu" class="btn btn-primary rounded-pill px-4 py-2">Explore Menu Now</a>
            </div>
          </div>
        ` : `
          <div class="row g-4">
            <!-- Cart Items List -->
            <div class="col-lg-8">
              <div class="card custom-card p-3">
                <div class="table-responsive">
                  <table class="table align-middle">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Price</th>
                        <th class="text-center" style="width: 140px;">Quantity</th>
                        <th class="text-end">Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      ${cart.map(item => `
                        <tr>
                          <td>
                            <div class="d-flex align-items-center">
                              <span class="fs-2 me-3">${item.image_url.startsWith('http') || item.image_url.startsWith('data:') ? '🍽️' : item.image_url}</span>
                              <div class="fw-bold">${item.name}</div>
                            </div>
                          </td>
                          <td>${utils.formatPrice(item.price)}</td>
                          <td>
                            <div class="input-group input-group-sm">
                              <button class="btn btn-outline-secondary qty-btn" data-id="${item.foodId}" data-action="dec">-</button>
                              <input type="text" class="form-control text-center fw-bold" value="${item.quantity}" readonly>
                              <button class="btn btn-outline-secondary qty-btn" data-id="${item.foodId}" data-action="inc">+</button>
                            </div>
                          </td>
                          <td class="text-end fw-bold text-primary">${utils.formatPrice(item.price * item.quantity)}</td>
                          <td class="text-end">
                            <button class="btn btn-sm btn-link text-danger remove-btn" data-id="${item.foodId}">
                              <i class="bi bi-trash fs-5"></i>
                            </button>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>

                <div class="d-flex justify-content-between align-items-center pt-3 border-top">
                  <button id="clear-cart-btn" class="btn btn-sm btn-outline-danger">
                    <i class="bi bi-trash me-1"></i> Clear Cart
                  </button>
                  <div class="fs-5">Total Items: <span class="fw-bold">${cartManager.getItemCount()}</span></div>
                </div>
              </div>
            </div>

            <!-- Order Summary Card -->
            <div class="col-lg-4">
              <div class="card custom-card p-4">
                <h4 class="fw-bold mb-3">Order Summary</h4>

                <div class="bg-light p-3 rounded mb-3">
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="text-muted"><i class="bi bi-qr-code-scan me-1"></i> Table Status:</span>
                    <span class="fw-bold ${tableNumber ? 'text-success' : 'text-danger'}">
                      ${tableNumber ? `Table #${tableNumber}` : 'No Table Selected'}
                    </span>
                  </div>
                  ${!tableNumber ? `
                    <div class="small text-danger mt-1">Please select a table on the menu page before placing an order.</div>
                  ` : ''}
                </div>

                <div class="mb-3">
                  <label class="form-label fw-bold">Kitchen Instructions / Notes</label>
                  <textarea id="order-notes" class="form-control" rows="3" placeholder="E.g., No onions, extra spicy, sauce on side..."></textarea>
                </div>

                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Subtotal</span>
                  <span class="fw-bold">${utils.formatPrice(total)}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Estimated Tax (5%)</span>
                  <span>${utils.formatPrice(total * 0.05)}</span>
                </div>
                <hr>
                <div class="d-flex justify-content-between mb-4 fs-4 fw-bold text-dark">
                  <span>Grand Total</span>
                  <span class="text-primary">${utils.formatPrice(total * 1.05)}</span>
                </div>

                <button id="place-order-btn" class="btn btn-primary w-100 py-3 font-weight-bold rounded-pill fs-5 shadow" ${!tableNumber ? 'disabled' : ''}>
                  <i class="bi bi-send-check me-2"></i> Place Order Now
                </button>
              </div>
            </div>
          </div>
        `}
      </div>
    `;
  },

  async init() {
    // Quantity Buttons Handler
    document.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const action = btn.dataset.action;
        const cart = cartManager.getCart();
        const item = cart.find(i => i.foodId === id);

        if (item) {
          const newQty = action === 'inc' ? item.quantity + 1 : item.quantity - 1;
          cartManager.updateQuantity(id, newQty);
          window.location.reload();
        }
      });
    });

    // Remove Item Handler
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        cartManager.removeItem(id);
        window.location.reload();
      });
    });

    // Clear Cart Handler
    const clearBtn = document.getElementById('clear-cart-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your cart?')) {
          cartManager.clearCart();
          window.location.reload();
        }
      });
    }

    // Place Order Handler
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
      placeOrderBtn.addEventListener('click', async () => {
        const cart = cartManager.getCart();
        const tableId = cartManager.getSelectedTable();
        const notes = document.getElementById('order-notes').value;

        if (!tableId) {
          utils.showToast('Please select a restaurant table first', 'error');
          return;
        }

        placeOrderBtn.disabled = true;
        placeOrderBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Placing Order...`;

        const res = await window.api.orders.create({
          tableId: parseInt(tableId),
          items: cart,
          notes: notes
        });

        if (res.success) {
          cartManager.clearCart();
          utils.showToast('Order placed successfully!', 'success');
          window.location.hash = `#/order-tracking?orderId=${res.orderId}`;
        } else {
          utils.showToast(res.error, 'error');
          placeOrderBtn.disabled = false;
          placeOrderBtn.innerHTML = `<i class="bi bi-send-check me-2"></i> Place Order Now`;
        }
      });
    }
  }
};
