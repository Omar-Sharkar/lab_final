const customerBillsPage = {
  async render() {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const orderId = params.get('orderId');

    if (!orderId) {
      return `
        <div class="container py-5 text-center">
          <span class="display-1">🧾</span>
          <h3 class="fw-bold mt-3 text-muted">No Bill Selected</h3>
          <p class="text-muted">Select an order from your history to view its itemized bill.</p>
          <a href="#/order-history" class="btn btn-primary rounded-pill px-4">View Order History</a>
        </div>
      `;
    }

    const res = await window.api.bills.getByOrder(orderId);
    if (!res.success) {
      return `
        <div class="container py-5 text-center">
          <h3 class="text-danger">Bill Not Generated Yet</h3>
          <p class="text-muted">Bills are generated automatically once an order is marked as Completed by kitchen staff.</p>
          <a href="#/order-tracking?orderId=${orderId}" class="btn btn-primary rounded-pill px-4">Track Order Status</a>
        </div>
      `;
    }

    const bill = res.bill;

    return `
      <div class="container py-4">
        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-6">
            <div id="printable-bill" class="card custom-card p-4 shadow-lg border-top border-4 border-primary">
              <!-- Restaurant Header -->
              <div class="text-center pb-3 mb-3 border-bottom">
                <span class="display-3">🍽️</span>
                <h3 class="fw-bold mb-1">Smart Restaurant System</h3>
                <p class="text-muted small mb-0">123 University Campus Road, Software Engineering Lab</p>
                <p class="text-muted small">Tel: (555) 019-2831 • Tax ID: SR-992182</p>
              </div>

              <!-- Bill Info Grid -->
              <div class="row mb-3 small">
                <div class="col-6">
                  <div class="text-muted">Customer Name:</div>
                  <div class="fw-bold">${bill.customer_name}</div>
                  <div class="text-muted mt-1">Table Number:</div>
                  <div class="fw-bold">Table #${bill.table_number || 'N/A'}</div>
                </div>
                <div class="col-6 text-end">
                  <div class="text-muted">Invoice No:</div>
                  <div class="fw-bold text-primary">INV-#${bill.id}</div>
                  <div class="text-muted mt-1">Order Date:</div>
                  <div class="fw-bold">${utils.formatDate(bill.order_date)}</div>
                </div>
              </div>

              <!-- Itemized Table -->
              <table class="table table-sm align-middle mb-3">
                <thead class="table-light">
                  <tr>
                    <th>Item Description</th>
                    <th class="text-center">Qty</th>
                    <th class="text-end">Unit Price</th>
                    <th class="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${bill.items.map(item => `
                    <tr>
                      <td class="fw-bold">${item.food_name}</td>
                      <td class="text-center">${item.quantity}</td>
                      <td class="text-end">${utils.formatPrice(item.unit_price)}</td>
                      <td class="text-end fw-bold">${utils.formatPrice(item.subtotal)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <!-- Totals Breakdown -->
              <div class="bg-light p-3 rounded mb-3">
                <div class="d-flex justify-content-between mb-1 small">
                  <span>Subtotal</span>
                  <span>${utils.formatPrice(bill.subtotal)}</span>
                </div>
                <div class="d-flex justify-content-between mb-1 small">
                  <span>VAT Tax (${bill.tax_rate}%)</span>
                  <span>${utils.formatPrice(bill.tax_amount)}</span>
                </div>
                <div class="d-flex justify-content-between mb-1 small text-success">
                  <span>Discount</span>
                  <span>-${utils.formatPrice(bill.discount)}</span>
                </div>
                <hr class="my-2">
                <div class="d-flex justify-content-between fs-4 fw-bold text-dark">
                  <span>Grand Total</span>
                  <span class="text-primary">${utils.formatPrice(bill.total)}</span>
                </div>
              </div>

              <!-- Payment Status Badge -->
              <div class="text-center py-2 mb-3">
                <span class="badge ${bill.payment_status === 'paid' ? 'bg-success' : 'bg-warning text-dark'} px-4 py-2 rounded-pill fs-6">
                  Payment Status: ${bill.payment_status.toUpperCase()}
                </span>
              </div>

              <div class="text-center text-muted small border-top pt-3">
                <p class="mb-0">Thank you for dining with Smart Restaurant!</p>
                <p class="mb-0">AI-Powered Dining Experience</p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="d-flex gap-2 mt-4">
              <button id="print-bill-btn" class="btn btn-primary w-100 rounded-pill py-2">
                <i class="bi bi-printer me-1"></i> Print / Save Bill
              </button>
              <a href="#/reviews?orderId=${bill.order_id}" class="btn btn-outline-primary w-100 rounded-pill py-2">
                <i class="bi bi-star me-1"></i> Submit Review
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async init() {
    const printBtn = document.getElementById('print-bill-btn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }
  }
};
