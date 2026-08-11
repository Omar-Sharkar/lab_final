const kitchenDashboardPage = {
  async render() {
    const res = await window.api.kitchen.getOrders();
    const orders = res.success ? res.orders : [];

    const pending = orders.filter(o => o.status === 'pending');
    const confirmed = orders.filter(o => o.status === 'confirmed');
    const preparing = orders.filter(o => o.status === 'preparing');
    const ready = orders.filter(o => o.status === 'ready');
    const completed = orders.filter(o => o.status === 'completed');

    return `
      <div class="container-fluid py-3">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="fw-bold mb-1"><i class="bi bi-fire text-danger me-2"></i>Kitchen Display System (KDS)</h2>
            <p class="text-muted mb-0">Live order queue for chef and kitchen staff. Status changes update customer tracker instantly.</p>
          </div>
          <span class="badge bg-danger p-2 fs-6"><i class="bi bi-broadcast me-1"></i> Live Auto-Polling (5s)</span>
        </div>

        <!-- Kanban Board Grid -->
        <div class="row g-3">
          <!-- Pending Orders Column -->
          <div class="col">
            <div class="kitchen-column border-top border-4 border-warning">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold mb-0 text-warning"><i class="bi bi-hourglass-top me-1"></i> Pending</h5>
                <span class="badge bg-warning text-dark rounded-pill">${pending.length}</span>
              </div>
              <div class="d-flex flex-column gap-3">
                ${pending.map(o => this.renderOrderCard(o, 'Accept Order', 'confirmed', 'btn-warning')).join('')}
              </div>
            </div>
          </div>

          <!-- Confirmed Orders Column -->
          <div class="col">
            <div class="kitchen-column border-top border-4 border-info">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold mb-0 text-info"><i class="bi bi-check-circle me-1"></i> Confirmed</h5>
                <span class="badge bg-info text-dark rounded-pill">${confirmed.length}</span>
              </div>
              <div class="d-flex flex-column gap-3">
                ${confirmed.map(o => this.renderOrderCard(o, 'Start Preparing', 'preparing', 'btn-info text-dark')).join('')}
              </div>
            </div>
          </div>

          <!-- Preparing Orders Column -->
          <div class="col">
            <div class="kitchen-column border-top border-4 border-primary">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold mb-0 text-primary"><i class="bi bi-fire me-1"></i> Preparing</h5>
                <span class="badge bg-primary rounded-pill">${preparing.length}</span>
              </div>
              <div class="d-flex flex-column gap-3">
                ${preparing.map(o => this.renderOrderCard(o, 'Mark Ready', 'ready', 'btn-primary')).join('')}
              </div>
            </div>
          </div>

          <!-- Ready to Serve Column -->
          <div class="col">
            <div class="kitchen-column border-top border-4 border-secondary">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold mb-0 text-secondary"><i class="bi bi-bell me-1"></i> Ready</h5>
                <span class="badge bg-secondary rounded-pill">${ready.length}</span>
              </div>
              <div class="d-flex flex-column gap-3">
                ${ready.map(o => this.renderOrderCard(o, 'Complete Order', 'completed', 'btn-success')).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderOrderCard(order, nextLabel, nextStatus, btnClass) {
    return `
      <div class="card custom-card kitchen-order-card shadow-sm p-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="fw-bold fs-5">Order #${order.id}</span>
          <span class="badge bg-dark text-white rounded-pill px-3 py-1">Table #${order.table_number || 'N/A'}</span>
        </div>

        <div class="text-muted extra-small mb-2">
          <i class="bi bi-clock me-1"></i> Placed: ${utils.formatDate(order.created_at)}
        </div>

        <!-- Items List -->
        <div class="bg-light p-2 rounded mb-2 small">
          ${order.items.map(i => `
            <div class="d-flex justify-content-between font-weight-bold">
              <span>${i.quantity}× ${i.food_name}</span>
            </div>
          `).join('')}
        </div>

        ${order.notes ? `
          <div class="alert alert-warning py-1 px-2 mb-2 extra-small">
            <strong>Notes:</strong> ${order.notes}
          </div>
        ` : ''}

        <button class="btn btn-sm ${btnClass} w-100 rounded-pill fw-bold update-kitchen-status-btn" data-id="${order.id}" data-status="${nextStatus}">
          ${nextLabel} <i class="bi bi-arrow-right me-1"></i>
        </button>
      </div>
    `;
  },

  async init() {
    this.bindButtons();

    // Auto-polling for kitchen orders every 5 seconds
    this.pollInterval = setInterval(async () => {
      if (window.location.hash.startsWith('#/kitchen/dashboard')) {
        const container = document.getElementById('main-content');
        if (container) {
          const newHtml = await this.render();
          container.innerHTML = newHtml;
          this.bindButtons();
        }
      } else {
        clearInterval(this.pollInterval);
      }
    }, 5000);
  },

  bindButtons() {
    document.querySelectorAll('.update-kitchen-status-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = btn.dataset.id;
        const status = btn.dataset.status;

        btn.disabled = true;
        const res = await window.api.kitchen.updateStatus(id, status);
        if (res.success) {
          utils.showToast(res.message, 'success');
          const container = document.getElementById('main-content');
          container.innerHTML = await this.render();
          this.bindButtons();
        } else {
          utils.showToast(res.error, 'error');
        }
      });
    });
  }
};
