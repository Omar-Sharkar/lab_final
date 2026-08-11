const customerOrderHistoryPage = {
  async render() {
    const sessionRes = await window.api.auth.getSession();
    const user = sessionRes.user;

    if (!user) {
      return `
        <div class="container py-5 text-center">
          <h3>Please Log In</h3>
          <p class="text-muted">You need to log in to view your order history.</p>
          <a href="#/login" class="btn btn-primary rounded-pill px-4">Log In</a>
        </div>
      `;
    }

    const res = await window.api.orders.getByUser(user.id);
    const orders = res.success ? res.orders : [];

    return `
      <div class="container py-4">
        <h2 class="fw-bold mb-4"><i class="bi bi-clock-history me-2 text-primary"></i>My Order History</h2>

        ${orders.length === 0 ? `
          <div class="card custom-card p-5 text-center">
            <span class="display-1">📜</span>
            <h4 class="fw-bold mt-3 text-muted">No Orders Found</h4>
            <p class="text-muted">You haven't placed any food orders yet.</p>
            <a href="#/menu" class="btn btn-primary rounded-pill px-4 mt-2">Explore Digital Menu</a>
          </div>
        ` : `
          <div class="row g-4">
            ${orders.map(order => `
              <div class="col-md-6 col-lg-4">
                <div class="card custom-card h-100">
                  <div class="card-header bg-light d-flex justify-content-between align-items-center py-3">
                    <div>
                      <span class="fw-bold">Order #${order.id}</span>
                      <div class="extra-small text-muted">${utils.formatDate(order.created_at)}</div>
                    </div>
                    ${utils.getStatusBadge(order.status)}
                  </div>
                  <div class="card-body">
                    <div class="mb-2 small text-muted">
                      <i class="bi bi-qr-code-scan me-1"></i> Table #${order.table_number || 'N/A'}
                    </div>

                    <div class="list-group list-group-flush mb-3">
                      ${order.items.map(item => `
                        <div class="list-group-item px-0 py-1 d-flex justify-content-between align-items-center border-0 small">
                          <span>${item.quantity}× ${item.food_name}</span>
                          <span class="fw-bold">${utils.formatPrice(item.subtotal)}</span>
                        </div>
                      `).join('')}
                    </div>

                    <div class="d-flex justify-content-between align-items-center pt-2 border-top">
                      <span class="fw-bold">Total Amount:</span>
                      <span class="fs-5 fw-bold text-primary">${utils.formatPrice(order.total_amount * 1.05)}</span>
                    </div>
                  </div>
                  <div class="card-footer bg-white border-0 pb-3">
                    <div class="d-flex gap-2">
                      <a href="#/order-tracking?orderId=${order.id}" class="btn btn-sm btn-outline-primary w-100 rounded-pill">
                        <i class="bi bi-radar me-1"></i> Track Status
                      </a>
                      ${order.status === 'completed' ? `
                        <a href="#/bills?orderId=${order.id}" class="btn btn-sm btn-outline-success w-100 rounded-pill">
                          <i class="bi bi-receipt me-1"></i> Bill
                        </a>
                      ` : ''}
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  },

  async init() {}
};
