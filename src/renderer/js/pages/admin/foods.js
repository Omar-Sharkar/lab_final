const adminFoodsPage = {
  async render() {
    const foodsRes = await window.api.foods.getAll();
    const foods = foodsRes.success ? foodsRes.foods : [];

    const categoriesRes = await window.api.categories.getAll();
    const categories = categoriesRes.success ? categoriesRes.categories : [];

    return `
      <div class="container-fluid py-3">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="fw-bold mb-1"><i class="bi bi-egg-fried me-2 text-primary"></i>Food Menu Management</h2>
            <p class="text-muted mb-0">Add, edit, change prices, toggle availability, or delete food items.</p>
          </div>
          <button id="add-food-btn" class="btn btn-primary rounded-pill px-4 font-weight-bold shadow-sm">
            <i class="bi bi-plus-circle me-1"></i> Add New Food
          </button>
        </div>

        <div class="card custom-card p-4">
          <div class="table-responsive">
            <table id="foods-table" class="table align-middle table-hover">
              <thead class="table-light">
                <tr>
                  <th>Image</th>
                  <th>Food Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Availability</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${foods.map(food => `
                  <tr>
                    <td>
                      <span class="fs-2">${food.image_url.startsWith('http') || food.image_url.startsWith('data:') ? '🍽️' : food.image_url}</span>
                    </td>
                    <td>
                      <div class="fw-bold">${food.name}</div>
                      <div class="text-muted extra-small">${food.description || ''}</div>
                    </td>
                    <td><span class="badge bg-secondary-subtle text-secondary rounded-pill">${food.category_name}</span></td>
                    <td class="fw-bold text-primary">${utils.formatPrice(food.price)}</td>
                    <td>
                      <span class="badge ${food.is_available ? 'bg-success' : 'bg-danger'} rounded-pill">
                        ${food.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td class="text-end">
                      <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary edit-food-btn" data-food='${JSON.stringify(food).replace(/'/g, "&apos;")}'>
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-food-btn" data-id="${food.id}" data-name="${food.name}">
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
    const categoriesRes = await window.api.categories.getAll();
    const categories = categoriesRes.success ? categoriesRes.categories : [];

    const openFoodModal = (food = null) => {
      const isEdit = !!food;
      const title = isEdit ? `Edit Food: ${food.name}` : 'Add New Food Item';

      const bodyHtml = `
        <form id="food-form">
          <div class="mb-3">
            <label class="form-label fw-bold">Food Name</label>
            <input type="text" id="food-name" class="form-control" value="${food ? food.name : ''}" required>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label fw-bold">Category</label>
              <select id="food-category" class="form-select" required>
                ${categories.map(c => `
                  <option value="${c.id}" ${food && food.category_id == c.id ? 'selected' : ''}>${c.name}</option>
                `).join('')}
              </select>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label fw-bold">Price ($)</label>
              <input type="number" step="0.01" id="food-price" class="form-control" value="${food ? food.price : ''}" required>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label fw-bold">Icon Emoji or Image URL</label>
            <input type="text" id="food-image" class="form-control" placeholder="E.g., 🍔 or https://..." value="${food ? food.image_url : '🍔'}">
          </div>

          <div class="mb-3">
            <label class="form-label fw-bold">Description</label>
            <textarea id="food-desc" class="form-control" rows="2">${food ? food.description || '' : ''}</textarea>
          </div>

          <div class="mb-3">
            <label class="form-label fw-bold">Ingredients & Allergens Info</label>
            <textarea id="food-ingredients" class="form-control" rows="2">${food ? food.ingredients_info || '' : ''}</textarea>
          </div>

          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="food-available" ${!food || food.is_available ? 'checked' : ''}>
            <label class="form-check-label fw-bold">Available for Order</label>
          </div>
        </form>
      `;

      const footerHtml = `
        <button type="button" class="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
        <button type="button" id="save-food-btn" class="btn btn-primary rounded-pill px-4">${isEdit ? 'Save Changes' : 'Create Food'}</button>
      `;

      utils.showModal(title, bodyHtml, footerHtml);

      document.getElementById('save-food-btn').addEventListener('click', async () => {
        const data = {
          name: document.getElementById('food-name').value,
          category_id: parseInt(document.getElementById('food-category').value),
          price: parseFloat(document.getElementById('food-price').value),
          image_url: document.getElementById('food-image').value,
          description: document.getElementById('food-desc').value,
          ingredients_info: document.getElementById('food-ingredients').value,
          is_available: document.getElementById('food-available').checked
        };

        const res = isEdit
          ? await window.api.foods.update(food.id, data)
          : await window.api.foods.create(data);

        if (res.success) {
          utils.closeModal();
          utils.showToast(res.message, 'success');
          window.location.reload();
        } else {
          utils.showToast(res.error, 'error');
        }
      });
    };

    // Add Food Button Handler
    const addBtn = document.getElementById('add-food-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => openFoodModal());
    }

    // Edit Food Buttons
    document.querySelectorAll('.edit-food-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const food = JSON.parse(btn.dataset.food);
        openFoodModal(food);
      });
    });

    // Delete Food Buttons
    document.querySelectorAll('.delete-food-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
          const res = await window.api.foods.delete(id);
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
