const customerMenuPage = {
  async render() {
    const categoriesRes = await window.api.categories.getAll();
    const categories = categoriesRes.success ? categoriesRes.categories : [];

    const tablesRes = await window.api.tables.getAll();
    const tables = tablesRes.success ? tablesRes.tables : [];

    const currentTableNumber = cartManager.getSelectedTableNumber();

    return `
      <div class="container-fluid py-3">
        <!-- Banner & Table Selector -->
        <div class="card custom-card bg-dark text-white p-4 mb-4 border-0 position-relative overflow-hidden">
          <div class="row align-items-center">
            <div class="col-md-8">
              <span class="badge bg-warning text-dark px-3 py-2 rounded-pill mb-2 fw-bold">
                <i class="bi bi-stars"></i> Smart AI Menu
              </span>
              <h2 class="fw-bold mb-2">Delicious Gourmet Food Delivered to Your Table</h2>
              <p class="text-white-50 mb-0">Browse our chef's signature dishes, customized for your taste.</p>
            </div>
            <div class="col-md-4 text-md-end mt-3 mt-md-0">
              <div class="bg-white text-dark p-3 rounded-3 shadow-sm d-inline-block text-start" style="min-width: 250px;">
                <label class="form-label fw-bold small text-muted mb-1"><i class="bi bi-qr-code-scan text-primary me-1"></i> Simulated Table Scan</label>
                <select id="table-select" class="form-select form-select-sm border-primary">
                  <option value="">Select Restaurant Table...</option>
                  ${tables.map(t => `<option value="${t.id}" data-number="${t.table_number}" ${cartManager.getSelectedTable() == t.id ? 'selected' : ''}>Table #${t.table_number} (${t.capacity} seats)</option>`).join('')}
                </select>
                ${currentTableNumber ? `
                  <div class="mt-2 text-success small fw-bold">
                    <i class="bi bi-check-circle-fill me-1"></i> Active Table: #${currentTableNumber}
                  </div>
                ` : '<div class="mt-1 text-muted extra-small">Select table to associate orders</div>'}
              </div>
            </div>
          </div>
        </div>

        <!-- Filter & Search Bar -->
        <div class="row mb-4">
          <div class="col-md-8 mb-2 mb-md-0">
            <div class="d-flex flex-wrap gap-2" id="category-pills">
              <button class="btn btn-primary rounded-pill cat-pill active" data-cat="">All Categories</button>
              ${categories.map(c => `
                <button class="btn btn-outline-secondary rounded-pill cat-pill" data-cat="${c.id}">
                  ${c.image_url || '🍽️'} ${c.name}
                </button>
              `).join('')}
            </div>
          </div>
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0"><i class="bi bi-search"></i></span>
              <input type="text" id="search-input" class="form-control border-start-0" placeholder="Search food items...">
            </div>
          </div>
        </div>

        <!-- Food Items Grid -->
        <div id="food-grid-container" class="row g-4">
          <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="text-muted mt-2">Loading digital menu...</p>
          </div>
        </div>
      </div>
    `;
  },

  async init() {
    let currentCategory = '';
    let searchKeyword = '';

    const loadFoods = async () => {
      const container = document.getElementById('food-grid-container');
      if (!container) return;

      const res = await window.api.foods.getAll({
        categoryId: currentCategory,
        search: searchKeyword,
        availableOnly: false
      });

      if (!res.success || res.foods.length === 0) {
        container.innerHTML = `
          <div class="col-12 text-center py-5">
            <span class="display-1">🔍</span>
            <h4 class="fw-bold mt-3 text-muted">No Food Items Found</h4>
            <p class="text-muted">Try adjusting your category filter or search keywords.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = res.foods.map(food => `
        <div class="col-sm-6 col-md-4 col-lg-3">
          <div class="card custom-card food-card">
            <div class="food-img-wrapper">
              ${food.image_url.startsWith('http') || food.image_url.startsWith('data:') 
                ? `<img src="${food.image_url}" alt="${food.name}">` 
                : `<span class="display-3">${food.image_url}</span>`}
            </div>
            <div class="card-body d-flex flex-column">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 class="card-title fw-bold mb-0">${food.name}</h5>
                <span class="badge bg-primary rounded-pill fs-6">${utils.formatPrice(food.price)}</span>
              </div>
              <p class="card-text text-muted small flex-grow-1">${food.description || 'Delicious dish prepared fresh upon order.'}</p>
              
              <div class="d-flex align-items-center justify-content-between mt-3 pt-2 border-top">
                <span class="badge ${food.is_available ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} rounded-pill">
                  ${food.is_available ? 'Available' : 'Sold Out'}
                </span>
                <div class="btn-group">
                  <button class="btn btn-sm btn-outline-secondary view-detail-btn" data-id="${food.id}" title="View Ingredients">
                    <i class="bi bi-info-circle"></i>
                  </button>
                  <button class="btn btn-sm btn-primary add-cart-btn" 
                          data-food='${JSON.stringify(food).replace(/'/g, "&apos;")}' 
                          ${!food.is_available ? 'disabled' : ''}>
                    <i class="bi bi-cart-plus me-1"></i> Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `).join('');

      // Bind Food Card Events
      document.querySelectorAll('.add-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const food = JSON.parse(btn.dataset.food);
          cartManager.addItem(food);
        });
      });

      document.querySelectorAll('.view-detail-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = btn.dataset.id;
          const res = await window.api.foods.getById(id);
          if (res.success) {
            const food = res.food;
            utils.showModal(
              `${food.image_url} ${food.name}`,
              `
                <div class="text-center mb-3">
                  <span class="display-1">${food.image_url}</span>
                  <h4 class="fw-bold mt-2">${food.name}</h4>
                  <span class="badge bg-primary fs-5">${utils.formatPrice(food.price)}</span>
                </div>
                <p class="lead text-muted text-center">${food.description}</p>
                <hr>
                <h6 class="fw-bold mb-2"><i class="bi bi-basket me-2 text-warning"></i>Ingredients & Allergens:</h6>
                <p class="text-dark bg-light p-3 rounded">${food.ingredients_info || 'No explicit ingredient list available.'}</p>
              `,
              `<button class="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">Close</button>`
            );
          }
        });
      });
    };

    // Table Select Handler
    const tableSelect = document.getElementById('table-select');
    if (tableSelect) {
      tableSelect.addEventListener('change', (e) => {
        const tableId = e.target.value;
        const selectedOption = e.target.options[e.target.selectedIndex];
        const tableNumber = selectedOption ? selectedOption.dataset.number : null;

        cartManager.setSelectedTable(tableId, tableNumber);
        if (tableId) {
          utils.showToast(`Simulated QR Scan: Table #${tableNumber} selected!`, 'success');
        } else {
          utils.showToast('Table selection cleared', 'info');
        }
        window.location.reload();
      });
    }

    // Category Filter Handler
    document.querySelectorAll('.cat-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        document.querySelectorAll('.cat-pill').forEach(p => {
          p.classList.remove('btn-primary', 'active');
          p.classList.add('btn-outline-secondary');
        });
        pill.classList.remove('btn-outline-secondary');
        pill.classList.add('btn-primary', 'active');

        currentCategory = pill.dataset.cat;
        loadFoods();
      });
    });

    // Search Input Handler
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchKeyword = e.target.value.trim();
        loadFoods();
      });
    }

    // Initial Load
    await loadFoods();
  }
};
