const adminBillingPage = {
  async render() {
    const res = await window.api.bills.getAll();
    const bills = res.success ? res.bills : [];

    return `
      <div class="container-fluid py-3">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="fw-bold mb-1"><i class="bi bi-receipt me-2 text-primary"></i>Billing & Revenue Receipts</h2>
            <p class="text-muted mb-0">View all customer invoices, track payment status, and verify totals.</p>
          </div>
        </div>

        <div class="card custom-card p-4">
          <div class="table-responsive">
            <table class="table align-middle table-hover">
              <thead class="table-light">
                <tr>
                  <th>Invoice ID</th>
                  <th>Order Ref</th>
                  <th>Customer</th>
                  <th>Table</th>
                  <th>Subtotal</th>
                  <th>Tax</th>
                  <th>Grand Total</th>
                  <th>Payment Status</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${bills.map(b => `
                  <tr>
                    <td class="fw-bold text-primary">INV-#${b.id}</td>
                    <td class="fw-bold">Order #${b.order_id}</td>
                    <td>${b.customer_name}</td>
                    <td><span class="badge bg-secondary">Table #${b.table_number || 'N/A'}</span></td>
                    <td>${utils.formatPrice(b.subtotal)}</td>
                    <td class="text-muted">${utils.formatPrice(b.tax_amount)}</td>
                    <td class="fw-bold fs-6 text-dark">${utils.formatPrice(b.total)}</td>
                    <td>
                      <span class="badge ${b.payment_status === 'paid' ? 'bg-success' : 'bg-warning text-dark'} rounded-pill px-3">
                        ${b.payment_status.toUpperCase()}
                      </span>
                    </td>
                    <td class="text-end">
                      <div class="btn-group">
                        <a href="#/bills?orderId=${b.order_id}" class="btn btn-sm btn-outline-primary" title="View Bill Receipt">
                          <i class="bi bi-eye"></i> View
                        </a>
                        ${b.payment_status === 'unpaid' ? `
                          <button class="btn btn-sm btn-success mark-paid-btn" data-id="${b.id}">
                            <i class="bi bi-check2-circle me-1"></i> Mark Paid
                          </button>
                        ` : ''}
                      </div>
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
    document.querySelectorAll('.mark-paid-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const res = await window.api.bills.updatePayment(id, 'paid');
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
