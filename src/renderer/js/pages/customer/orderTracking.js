const customerOrderTrackingPage = {
  async render() {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const orderId = params.get('orderId');

    let order = null;
    if (orderId) {
      const res = await window.api.orders.getById(orderId);
      if (res.success) order = res.order;
    } else {
      // Get user's latest order
      const sessionRes = await window.api.auth.getSession();
      if (sessionRes.user) {
        const userOrdersRes = await window.api.orders.getByUser(sessionRes.user.id);
        if (userOrdersRes.success && userOrdersRes.orders.length > 0) {
          order = userOrdersRes.orders[0];
        }
      }
    }

    if (!order) {
      return `
        <div class="container py-5 text-center">
          <span class="display-1">📦</span>
          <h3 class="fw-bold mt-3 text-muted">No Active Order Found</h3>
          <p class="text-muted">Place an order from our digital menu to track live status.</p>
          <a href="#/menu" class="btn btn-primary rounded-pill px-4 mt-2">Go to Menu</a>
        </div>
      `;
    }

    // Determine progress percentage
    const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];
    const currentIndex = statuses.indexOf(order.status);
    const progressPct = ((currentIndex + 1) / statuses.length) * 100;

    return `
      <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="fw-bold mb-1"><i class="bi bi-radar text-primary me-2"></i>Live Order Tracker</h2>
            <p class="text-muted mb-0">Order #${order.id} • Table #${order.table_number || 'N/A'} • ${utils.formatDate(order.created_at)}</p>
          </div>
          <span id="refresh-badge" class="badge bg-secondary p-2"><i class="bi bi-arrow-repeat me-1"></i> Auto-refreshing</span>
        </div>

        <!-- Progress Tracker Header -->
        <div class="card custom-card p-4 mb-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="fw-bold fs-5 text-dark">Current Status:</span>
            <div id="status-badge">${utils.getStatusBadge(order.status)}</div>
          </div>

          <div class="progress mb-4" style="height: 12px;">
            <div class="progress-bar progress-bar-striped progress-bar-animated bg-primary" role="progressbar" style="width: ${progressPct}%;"></div>
          </div>

          <!-- Step Indicators -->
          <div class="row text-center small fw-bold">
            <div class="col ${currentIndex >= 0 ? 'text-primary' : 'text-muted'}">
              <div class="fs-4"><i class="bi bi-hourglass-top"></i></div>
              1. Pending
            </div>
            <div class="col ${currentIndex >= 1 ? 'text-primary' : 'text-muted'}">
              <div class="fs-4"><i class="bi bi-check-circle"></i></div>
              2. Confirmed
            </div>
            <div class="col ${currentIndex >= 2 ? 'text-primary' : 'text-muted'}">
              <div class="fs-4"><i class="bi bi-fire"></i></div>
              3. Preparing
            </div>
            <div class="col ${currentIndex >= 3 ? 'text-primary' : 'text-muted'}">
              <div class="fs-4"><i class="bi bi-bell"></i></div>
              4. Ready to Serve
            </div>
            <div class="col ${currentIndex >= 4 ? 'text-success' : 'text-muted'}">
              <div class="fs-4"><i class="bi bi-emoji-smile"></i></div>
              5. Completed
            </div>
          </div>
        </div>

        <!-- Order Items Breakdown -->
        <div class="row g-4">
          <div class="col-md-8">
            <div class="card custom-card p-4">
              <h5 class="fw-bold mb-3">Ordered Items</h5>
              <div class="list-group list-group-flush mb-3">
                ${order.items.map(item => `
                  <div class="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                    <div class="d-flex align-items-center">
                      <span class="fs-3 me-3">${item.image_url || '🍽️'}</span>
                      <div>
                        <div class="fw-bold">${item.food_name}</div>
                        <div class="text-muted small">Qty: ${item.quantity} × ${utils.formatPrice(item.unit_price)}</div>
                      </div>
                    </div>
                    <span class="fw-bold text-primary">${utils.formatPrice(item.subtotal)}</span>
                  </div>
                `).join('')}
              </div>

              ${order.notes ? `
                <div class="alert alert-warning mb-0">
                  <i class="bi bi-info-circle me-1"></i> <strong>Kitchen Notes:</strong> ${order.notes}
                </div>
              ` : ''}
            </div>
          </div>

          <div class="col-md-4">
            <div class="card custom-card p-4">
              <h5 class="fw-bold mb-3">Order Summary</h5>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">Subtotal</span>
                <span class="fw-bold">${utils.formatPrice(order.total_amount)}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">Tax (5%)</span>
                <span>${utils.formatPrice(order.total_amount * 0.05)}</span>
              </div>
              <hr>
              <div class="d-flex justify-content-between mb-4 fs-5 fw-bold">
                <span>Total Amount</span>
                <span class="text-primary">${utils.formatPrice(order.total_amount * 1.05)}</span>
              </div>

              ${order.status === 'completed' ? `
                <div class="d-grid gap-2">
                  <a href="#/bills?orderId=${order.id}" class="btn btn-success rounded-pill py-2">
                    <i class="bi bi-receipt me-1"></i> View Itemized Bill
                  </a>
                  <a href="#/reviews?orderId=${order.id}" class="btn btn-outline-primary rounded-pill py-2">
                    <i class="bi bi-star me-1"></i> Leave a Review
                  </a>
                </div>
              ` : `
                <div class="text-center text-muted small py-2 bg-light rounded">
                  <i class="bi bi-clock me-1"></i> Kitchen staff is preparing your delicious meal!
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async init() {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const orderId = params.get('orderId');

    // Live Polling every 5 seconds for status changes
    this.pollInterval = setInterval(async () => {
      if (window.location.hash.startsWith('#/order-tracking')) {
        const orderIdToFetch = orderId || (await window.api.auth.getSession())?.user?.id;
        if (orderIdToFetch) {
          const res = await window.api.orders.getById(orderIdToFetch);
          if (res.success && res.order) {
            const badge = document.getElementById('status-badge');
            if (badge) badge.innerHTML = utils.getStatusBadge(res.order.status);
          }
        }
      } else {
        clearInterval(this.pollInterval);
      }
    }, 5000);
  }
};
