const adminTablesPage = {
  async render() {
    const res = await window.api.tables.getAll();
    const tables = res.success ? res.tables : [];

    return `
      <div class="container-fluid py-3">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="fw-bold mb-1"><i class="bi bi-qr-code-scan me-2 text-primary"></i>Restaurant Tables & QR Codes</h2>
            <p class="text-muted mb-0">Manage table numbers, seating capacity, and view generated QR ordering codes.</p>
          </div>
          <button id="add-table-btn" class="btn btn-primary rounded-pill px-4 font-weight-bold shadow-sm">
            <i class="bi bi-plus-circle me-1"></i> Add New Table
          </button>
        </div>

        <div class="row g-4">
          ${tables.map(t => `
            <div class="col-sm-6 col-md-4 col-lg-3">
              <div class="card custom-card p-3 text-center">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="badge ${t.status === 'available' ? 'bg-success' : t.status === 'occupied' ? 'bg-danger' : 'bg-warning text-dark'} rounded-pill">
                    ${t.status.toUpperCase()}
                  </span>
                  <span class="text-muted small"><i class="bi bi-people me-1"></i>${t.capacity} Seats</span>
                </div>

                <div class="py-2">
                  ${t.qr_code ? `<img src="${t.qr_code}" alt="Table ${t.table_number} QR" style="width: 140px; height: 140px;" class="img-thumbnail border-0">` : '<div class="spinner-border text-primary"></div>'}
                </div>

                <h4 class="fw-bold mt-2 mb-1">Table #${t.table_number}</h4>

                <div class="d-flex gap-2 justify-content-center mt-3 pt-2 border-top">
                  <button class="btn btn-sm btn-outline-primary view-qr-btn" data-qr="${t.qr_code}" data-num="${t.table_number}">
                    <i class="bi bi-eye"></i> Zoom QR
                  </button>
                  <button class="btn btn-sm btn-outline-danger delete-table-btn" data-id="${t.id}" data-num="${t.table_number}">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  async init() {
    const addBtn = document.getElementById('add-table-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const bodyHtml = `
          <form id="table-form">
            <div class="mb-3">
              <label class="form-label fw-bold">Table Number</label>
              <input type="number" id="table-num" class="form-control" placeholder="E.g., 11" required>
            </div>
            <div class="mb-3">
              <label class="form-label fw-bold">Capacity (Seating)</label>
              <input type="number" id="table-cap" class="form-control" value="4" required>
            </div>
          </form>
        `;

        const footerHtml = `
          <button type="button" class="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
          <button type="button" id="save-table-btn" class="btn btn-primary rounded-pill px-4">Generate Table & QR</button>
        `;

        utils.showModal('Add Restaurant Table', bodyHtml, footerHtml);

        document.getElementById('save-table-btn').addEventListener('click', async () => {
          const num = document.getElementById('table-num').value;
          const cap = document.getElementById('table-cap').value;

          const res = await window.api.tables.create({ table_number: num, capacity: cap });
          if (res.success) {
            utils.closeModal();
            utils.showToast(res.message, 'success');
            window.location.reload();
          } else {
            utils.showToast(res.error, 'error');
          }
        });
      });
    }

    // Zoom QR Handler
    document.querySelectorAll('.view-qr-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const qr = btn.dataset.qr;
        const num = btn.dataset.num;

        utils.showModal(
          `QR Code for Table #${num}`,
          `
            <div class="text-center p-3">
              <img src="${qr}" alt="QR" style="width: 250px; height: 250px;" class="shadow rounded p-2 bg-white">
              <p class="mt-3 text-muted">Customers can scan this QR code to automatically open Table #${num} digital menu.</p>
            </div>
          `,
          `<button class="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">Close</button>`
        );
      });
    });

    // Delete Table Handler
    document.querySelectorAll('.delete-table-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const num = btn.dataset.num;
        if (confirm(`Delete Table #${num}?`)) {
          const res = await window.api.tables.delete(btn.dataset.id);
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
