const adminCustomersPage = {
  async render() {
    const res = await window.api.customers.getAll();
    const customers = res.success ? res.customers : [];

    return `
      <div class="container-fluid py-3">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="fw-bold mb-1"><i class="bi bi-people me-2 text-primary"></i>Customer Accounts</h2>
            <p class="text-muted mb-0">List of registered restaurant customers and order activity.</p>
          </div>
          <span class="badge bg-primary fs-6 px-3 py-2 rounded-pill">Total: ${customers.length} Registered</span>
        </div>

        <div class="card custom-card p-4">
          <div class="table-responsive">
            <table class="table align-middle table-hover">
              <thead class="table-light">
                <tr>
                  <th>ID</th>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th class="text-center">Total Orders</th>
                  <th class="text-end">Total Spent</th>
                  <th>Registration Date</th>
                  <th class="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                ${customers.map(c => `
                  <tr>
                    <td class="fw-bold text-muted">#${c.id}</td>
                    <td class="fw-bold">${c.name}</td>
                    <td>${c.email}</td>
                    <td>${c.phone || 'N/A'}</td>
                    <td class="text-center"><span class="badge bg-primary-subtle text-primary px-3 rounded-pill">${c.total_orders}</span></td>
                    <td class="text-end fw-bold text-success">${utils.formatPrice(c.total_spent)}</td>
                    <td class="small text-muted">${utils.formatDate(c.created_at)}</td>
                    <td class="text-end">
                      <button class="btn btn-sm btn-outline-danger delete-cust-btn" data-id="${c.id}" data-name="${c.name}">
                        <i class="bi bi-trash"></i>
                      </button>
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
    document.querySelectorAll('.delete-cust-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        if (confirm(`Delete customer account for "${name}"?`)) {
          const res = await window.api.customers.delete(id);
          if (res.success) {
            utils.showToast(res.message, 'success');
            window.location.reload();
          } else {
            utils.showToast(res.error, 'error');
          }
        }
      });
    });
  }
};
