const adminInventoryPage = {
  async render() {
    const res = await window.api.inventory.getAll();
    const ingredients = res.success ? res.ingredients : [];

    const lowStockCount = ingredients.filter(i => i.is_low_stock).length;

    return `
      <div class="container-fluid py-3">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="fw-bold mb-1"><i class="bi bi-boxes me-2 text-primary"></i>Inventory & Stock Control</h2>
            <p class="text-muted mb-0">Monitor raw ingredients, set minimum stock alerts, and log stock-in/out adjustments.</p>
          </div>
          <div class="d-flex gap-2">
            <button id="add-ingredient-btn" class="btn btn-primary rounded-pill px-4 font-weight-bold shadow-sm">
              <i class="bi bi-plus-circle me-1"></i> Add Ingredient
            </button>
          </div>
        </div>

        ${lowStockCount > 0 ? `
          <div class="alert alert-danger d-flex align-items-center mb-4 shadow-sm" role="alert">
            <i class="bi bi-exclamation-triangle-fill fs-3 me-3"></i>
            <div>
              <h5 class="alert-heading fw-bold mb-1">Low Stock Warning Alert!</h5>
              <div>There are <strong>${lowStockCount}</strong> raw ingredients currently below their minimum threshold level. Restock to avoid kitchen order delays.</div>
            </div>
          </div>
        ` : ''}

        <div class="card custom-card p-4">
          <div class="table-responsive">
            <table class="table align-middle table-hover">
              <thead class="table-light">
                <tr>
                  <th>Ingredient Name</th>
                  <th>Current Stock</th>
                  <th>Minimum Stock</th>
                  <th>Cost / Unit</th>
                  <th>Stock Status</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${ingredients.map(ing => `
                  <tr class="${ing.is_low_stock ? 'table-danger' : ''}">
                    <td class="fw-bold">${ing.name}</td>
                    <td><span class="fs-5 fw-bold ${ing.is_low_stock ? 'text-danger' : 'text-dark'}">${ing.current_stock}</span> <small class="text-muted">${ing.unit}</small></td>
                    <td>${ing.minimum_stock} ${ing.unit}</td>
                    <td>${utils.formatPrice(ing.cost_per_unit)} / ${ing.unit}</td>
                    <td>
                      ${ing.is_low_stock 
                        ? `<span class="badge badge-low-stock px-3 py-2 rounded-pill"><i class="bi bi-exclamation-triangle me-1"></i> LOW STOCK</span>` 
                        : `<span class="badge bg-success-subtle text-success px-3 py-2 rounded-pill"><i class="bi bi-check-circle me-1"></i> Normal</span>`}
                    </td>
                    <td class="text-end">
                      <div class="btn-group">
                        <button class="btn btn-sm btn-outline-success stock-trans-btn" data-ing='${JSON.stringify(ing).replace(/'/g, "&apos;")}'>
                          <i class="bi bi-box-arrow-in-down me-1"></i> Restock
                        </button>
                        <button class="btn btn-sm btn-outline-primary edit-ing-btn" data-ing='${JSON.stringify(ing).replace(/'/g, "&apos;")}'>
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-ing-btn" data-id="${ing.id}" data-name="${ing.name}">
                          <i class="bi bi-trash"></i>
                        </button>
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
    const openIngModal = (ing = null) => {
      const isEdit = !!ing;
      const title = isEdit ? `Edit Ingredient: ${ing.name}` : 'Add Raw Ingredient';

      const bodyHtml = `
        <form id="ing-form">
          <div class="mb-3">
            <label class="form-label fw-bold">Ingredient Name</label>
            <input type="text" id="ing-name" class="form-control" value="${ing ? ing.name : ''}" required>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label fw-bold">Unit (e.g. kg, pcs, liters)</label>
              <input type="text" id="ing-unit" class="form-control" value="${ing ? ing.unit : 'kg'}" required>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label fw-bold">Cost Per Unit ($)</label>
              <input type="number" step="0.01" id="ing-cost" class="form-control" value="${ing ? ing.cost_per_unit : '0'}" required>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label fw-bold">Current Stock Quantity</label>
              <input type="number" step="0.1" id="ing-stock" class="form-control" value="${ing ? ing.current_stock : '10'}" required>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label fw-bold">Minimum Alert Stock Level</label>
              <input type="number" step="0.1" id="ing-min" class="form-control" value="${ing ? ing.minimum_stock : '5'}" required>
            </div>
          </div>
        </form>
      `;

      const footerHtml = `
        <button type="button" class="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
        <button type="button" id="save-ing-btn" class="btn btn-primary rounded-pill px-4">${isEdit ? 'Save Changes' : 'Add Ingredient'}</button>
      `;

      utils.showModal(title, bodyHtml, footerHtml);

      document.getElementById('save-ing-btn').addEventListener('click', async () => {
        const data = {
          name: document.getElementById('ing-name').value,
          unit: document.getElementById('ing-unit').value,
          cost_per_unit: parseFloat(document.getElementById('ing-cost').value),
          current_stock: parseFloat(document.getElementById('ing-stock').value),
          minimum_stock: parseFloat(document.getElementById('ing-min').value)
        };

        const res = isEdit
          ? await window.api.inventory.update(ing.id, data)
          : await window.api.inventory.create(data);

        if (res.success) {
          utils.closeModal();
          utils.showToast(res.message, 'success');
          window.location.reload();
        } else {
          utils.showToast(res.error, 'error');
        }
      });
    };

    // Add Ingredient Button
    const addBtn = document.getElementById('add-ingredient-btn');
    if (addBtn) addBtn.addEventListener('click', () => openIngModal());

    // Edit Ingredient Buttons
    document.querySelectorAll('.edit-ing-btn').forEach(btn => {
      btn.addEventListener('click', () => openIngModal(JSON.parse(btn.dataset.ing)));
    });

    // Delete Ingredient Buttons
    document.querySelectorAll('.delete-ing-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm(`Delete ingredient "${btn.dataset.name}"?`)) {
          const res = await window.api.inventory.delete(btn.dataset.id);
          if (res.success) {
            utils.showToast(res.message, 'success');
            window.location.reload();
          } else {
            utils.showToast(res.error, 'error');
          }
        }
      });
    });

    // Restock Button Handler
    document.querySelectorAll('.stock-trans-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const ing = JSON.parse(btn.dataset.ing);
        utils.showModal(
          `Restock Ingredient: ${ing.name}`,
          `
            <form id="restock-form">
              <div class="mb-3">
                <label class="form-label fw-bold">Quantity to Add (${ing.unit})</label>
                <input type="number" step="0.1" id="restock-qty" class="form-control" value="10" required>
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">Notes</label>
                <input type="text" id="restock-notes" class="form-control" placeholder="Supplier shipment #123...">
              </div>
            </form>
          `,
          `
            <button type="button" class="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
            <button type="button" id="confirm-restock-btn" class="btn btn-success rounded-pill px-4">Confirm Stock In</button>
          `
        );

        document.getElementById('confirm-restock-btn').addEventListener('click', async () => {
          const qty = parseFloat(document.getElementById('restock-qty').value);
          const notes = document.getElementById('restock-notes').value;

          const res = await window.api.inventory.addTransaction({
            ingredient_id: ing.id,
            type: 'in',
            quantity: qty,
            notes
          });

          if (res.success) {
            utils.closeModal();
            utils.showToast(`Added +${qty} ${ing.unit} to ${ing.name}`, 'success');
            window.location.reload();
          } else {
            utils.showToast(res.error, 'error');
          }
        });
      });
    });
  }
};
