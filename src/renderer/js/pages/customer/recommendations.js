const customerRecommendationsPage = {
  async render() {
    const sessionRes = await window.api.auth.getSession();
    const user = sessionRes.user;

    const res = await window.api.ai.getRecommendations(user ? user.id : null);
    const recommendations = res.success ? res.recommendations : [];

    return `
      <div class="container py-4">
        <div class="card custom-card bg-dark text-white p-4 mb-4 border-0">
          <div class="d-flex align-items-center gap-3">
            <span class="display-3">✨</span>
            <div>
              <span class="badge bg-warning text-dark px-3 py-1 rounded-pill mb-2 fw-bold">AI Intelligence</span>
              <h2 class="fw-bold mb-1">Personalized Food Recommendations</h2>
              <p class="text-white-50 mb-0">Our AI analyzes your taste preferences, order history, and category trends to present the perfect culinary matches!</p>
            </div>
          </div>
        </div>

        ${recommendations.length === 0 ? `
          <div class="card custom-card p-5 text-center">
            <span class="display-1">🍲</span>
            <h4 class="fw-bold mt-3 text-muted">No Recommendations Available</h4>
            <p class="text-muted">Explore our digital menu to help us learn your taste preferences.</p>
            <a href="#/menu" class="btn btn-primary rounded-pill px-4 mt-2">Browse Menu</a>
          </div>
        ` : `
          <div class="row g-4">
            ${recommendations.map(rec => `
              <div class="col-md-6 col-lg-4">
                <div class="card custom-card food-card">
                  <div class="food-img-wrapper position-relative">
                    ${rec.food.image_url.startsWith('http') || rec.food.image_url.startsWith('data:') 
                      ? `<img src="${rec.food.image_url}" alt="${rec.food.name}">` 
                      : `<span class="display-3">${rec.food.image_url}</span>`}
                    <span class="position-absolute top-0 start-0 m-3 badge bg-warning text-dark px-3 py-2 rounded-pill shadow-sm">
                      <i class="bi bi-stars me-1"></i> AI Pick
                    </span>
                  </div>
                  <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <h5 class="card-title fw-bold mb-0">${rec.food.name}</h5>
                      <span class="badge bg-primary fs-6">${utils.formatPrice(rec.food.price)}</span>
                    </div>

                    <p class="card-text text-muted small mb-3">${rec.food.description}</p>

                    <!-- AI Reason Box -->
                    <div class="bg-warning-subtle text-dark p-2 rounded small mb-3 border border-warning">
                      <i class="bi bi-lightbulb-fill text-warning me-1"></i>
                      <strong>Why you'll love it:</strong> ${rec.reason}
                    </div>

                    <div class="mt-auto d-flex justify-content-between align-items-center pt-2 border-top">
                      <span class="badge bg-success-subtle text-success rounded-pill">Available</span>
                      <button class="btn btn-sm btn-primary rec-add-cart-btn" data-food='${JSON.stringify(rec.food).replace(/'/g, "&apos;")}'>
                        <i class="bi bi-cart-plus me-1"></i> Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  },

  async init() {
    document.querySelectorAll('.rec-add-cart-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const food = JSON.parse(btn.dataset.food);
        cartManager.addItem(food);
      });
    });
  }
};
