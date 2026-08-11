const adminOrdersPage = {
  async render() {
    const res = await window.api.orders.getAll();
    const orders = res.success ? res.orders : [];

    return `
      <div class="container-fluid py-3">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="fw-bold mb-1"><i class="bi bi-bag-check me-2 text-primary"></i>All Orders Management</h2>
            <p class="text-muted mb-0">Track live orders across all restaurant tables and update statuses.</p>
          </div>
          <div class="d-flex gap-2">
            <select id="status-filter" class="form-select border-primary rounded-pill">
              <option value="">All Order Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div class="card custom-card p-4">
          <div class="table-responsive">
            <table class="table align-middle table-hover">
              <thead class="table-light">
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Table</th>
                  <th>Ordered Items</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Date & Time</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody id="orders-tbody">
                ${orders.map(order => `
                  <tr>
                    <td class="fw-bold text-primary">#${order.id}</td>
                    <td>
                      <div class="fw-bold">${order.customer_name}</div>
                      <div class="extra-small text-muted">${order.customer_email}</div>
                    </td>
                    <td><span class="badge bg-secondary">Table #${order.table_number || 'N/A'}</span></td>
                    <td>
                      <div class="small">
                        ${order.items.map(i => `<div>${i.quantity}× ${i.food_name}</div>`).join('')}
                      </div>
                    </td>
                    <td class="fw-bold text-dark">${utils.formatPrice(order.total_amount)}</td>
                    <td>${utils.getStatusBadge(order.status)}</td>
                    <td class="small text-muted">${utils.formatDate(order.created_at)}</td>
                    <td class="text-end">
                      <select class="form-select form-select-sm status-select rounded-pill" data-id="${order.id}">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Preparing</option>
                        <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>Ready</option>
                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                      </select>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  async init() {
    // Status Filter Handler
    const filterSelect = document.getElementById('status-filter');
    if (filterSelect) {
      filterSelect.addEventListener('change', async (e) => {
        const status = e.target.value;
        const res = await window.api.orders.getAll({ status });
        if (res.success) {
          const tbody = document.getElementById('orders-tbody');
          tbody.innerHTML = res.orders.map(order => `
            <tr>
              <td class="fw-bold text-primary">#${order.id}</td>
              <td>
                <div class="fw-bold">${order.customer_name}</div>
                <div class="extra-small text-muted">${order.customer_email}</div>
              </td>
              <td><span class="badge bg-secondary">Table #${order.table_number || 'N/A'}</span></td>
              <td>
                <div class="small">
                  ${order.items.map(i => `<div>${i.quantity}× ${i.food_name}</div>`).join('')}
                </div>
              </td>
              <td class="fw-bold text-dark">${utils.formatPrice(order.total_amount)}</td>
              <td>${utils.getStatusBadge(order.status)}</td>
              <td class="small text-muted">${utils.formatDate(order.created_at)}</td>
              <td class="text-end">
                <select class="form-select form-select-sm status-select rounded-pill" data-id="${order.id}">
                  <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                  <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                  <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Preparing</option>
                  <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>Ready</option>
                  <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                </select>
              </td>
            </tr>
          `).join('');
          this.bindStatusSelects();
        }
      });
    }

    this.bindStatusSelects();
  },

  bindStatusSelects() {
    document.querySelectorAll('.status-select').forEach(select => {
      select.addEventListener('change', async (e) => {
        const id = select.dataset.id;
        const newStatus = select.value;
        const res = await window.api.orders.updateStatus(id, newStatus);
        if (res.success) {
          utils.showToast(res.message, 'success');
          window.location.reload();
        } else {
          utils.showToast(res.error, 'error');
        }
      });
    });
  }
};
