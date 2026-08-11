const adminCategoriesPage = {
  async render() {
    const res = await window.api.categories.getAll();
    const categories = res.success ? res.categories : [];

    return `
      <div class="container-fluid py-3">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="fw-bold mb-1"><i class="bi bi-tags me-2 text-primary"></i>Food Categories</h2>
            <p class="text-muted mb-0">Manage food categories for organized menu navigation.</p>
          </div>
          <button id="add-category-btn" class="btn btn-primary rounded-pill px-4 font-weight-bold shadow-sm">
            <i class="bi bi-plus-circle me-1"></i> Add Category
          </button>
        </div>

        <div class="row g-4">
          ${categories.map(c => `
            <div class="col-md-6 col-lg-4">
              <div class="card custom-card p-3 h-100">
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <div class="d-flex align-items-center">
                    <span class="fs-1 me-3">${c.image_url || '🍽️'}</span>
                    <div>
                      <h5 class="fw-bold mb-0">${c.name}</h5>
                      <span class="badge bg-primary-subtle text-primary rounded-pill">${c.food_count || 0} Foods</span>
                    </div>
                  </div>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary edit-cat-btn" data-cat='${JSON.stringify(c).replace(/'/g, "&apos;")}'>
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-cat-btn" data-id="${c.id}" data-name="${c.name}">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
                <p class="text-muted small mb-0">${c.description || 'No description provided.'}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  async init() {
    const openCatModal = (cat = null) => {
      const isEdit = !!cat;
      const title = isEdit ? `Edit Category: ${cat.name}` : 'Add Food Category';

      const bodyHtml = `
        <form id="cat-form">
          <div class="mb-3">
            <label class="form-label fw-bold">Category Name</label>
            <input type="text" id="cat-name" class="form-control" value="${cat ? cat.name : ''}" required>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Icon Emoji</label>
            <input type="text" id="cat-image" class="form-control" value="${cat ? cat.image_url : '🍽️'}">
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Description</label>
            <textarea id="cat-desc" class="form-control" rows="3">${cat ? cat.description || '' : ''}</textarea>
          </div>
        </form>
      `;

      const footerHtml = `
        <button type="button" class="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
        <button type="button" id="save-cat-btn" class="btn btn-primary rounded-pill px-4">${isEdit ? 'Save Changes' : 'Create Category'}</button>
      `;

      utils.showModal(title, bodyHtml, footerHtml);

      document.getElementById('save-cat-btn').addEventListener('click', async () => {
        const data = {
          name: document.getElementById('cat-name').value,
          image_url: document.getElementById('cat-image').value,
          description: document.getElementById('cat-desc').value
        };

        const res = isEdit
          ? await window.api.categories.update(cat.id, data)
          : await window.api.categories.create(data);

        if (res.success) {
          utils.closeModal();
          utils.showToast(res.message, 'success');
          window.location.reload();
        } else {
          utils.showToast(res.error, 'error');
        }
      });
    };

    const addBtn = document.getElementById('add-category-btn');
    if (addBtn) addBtn.addEventListener('click', () => openCatModal());

    document.querySelectorAll('.edit-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => openCatModal(JSON.parse(btn.dataset.cat)));
    });

    document.querySelectorAll('.delete-cat-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm(`Delete category "${btn.dataset.name}"?`)) {
          const res = await window.api.categories.delete(btn.dataset.id);
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
