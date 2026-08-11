const customerReviewsPage = {
  async render() {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const orderId = params.get('orderId');

    const reviewsRes = await window.api.reviews.getAll();
    const reviews = reviewsRes.success ? reviewsRes.reviews : [];

    return `
      <div class="container py-4">
        <div class="row g-4">
          <!-- Submit Review Form -->
          <div class="col-lg-5">
            <div class="card custom-card p-4">
              <h4 class="fw-bold mb-3"><i class="bi bi-star-fill text-warning me-2"></i>Rate & Review</h4>
              <p class="text-muted small">Share your dining experience. Our AI system will analyze your feedback to improve restaurant service!</p>

              <form id="review-form">
                ${orderId ? `
                  <div class="alert alert-info py-2 small mb-3">
                    <i class="bi bi-receipt me-1"></i> Reviewing Order #${orderId}
                  </div>
                ` : ''}

                <div class="mb-3">
                  <label class="form-label fw-bold">Your Rating</label>
                  <div class="star-rating d-flex gap-2 mb-2" id="star-picker">
                    <i class="bi bi-star-fill active" data-val="1"></i>
                    <i class="bi bi-star-fill active" data-val="2"></i>
                    <i class="bi bi-star-fill active" data-val="3"></i>
                    <i class="bi bi-star-fill active" data-val="4"></i>
                    <i class="bi bi-star-fill active" data-val="5"></i>
                  </div>
                  <input type="hidden" id="selected-rating" value="5">
                </div>

                <div class="mb-4">
                  <label class="form-label fw-bold">Written Review</label>
                  <textarea id="review-comment" class="form-control" rows="4" placeholder="Tell us about the food taste, portion size, waiting time, or staff service..." required></textarea>
                </div>

                <button type="submit" class="btn btn-primary w-100 py-2 rounded-pill fw-bold">
                  <i class="bi bi-send me-1"></i> Submit Review
                </button>
              </form>
            </div>
          </div>

          <!-- Customer Reviews Feed -->
          <div class="col-lg-7">
            <div class="card custom-card p-4">
              <h4 class="fw-bold mb-3">Recent Customer Reviews</h4>

              ${reviews.length === 0 ? `
                <p class="text-muted text-center py-4">No reviews submitted yet. Be the first to review!</p>
              ` : `
                <div class="list-group list-group-flush">
                  ${reviews.map(r => `
                    <div class="list-group-item px-0 py-3">
                      <div class="d-flex justify-content-between align-items-center mb-1">
                        <div class="fw-bold">${r.customer_name}</div>
                        <span class="text-warning fs-5">
                          ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
                        </span>
                      </div>
                      <p class="text-dark mb-2">${r.comment}</p>

                      <div class="d-flex justify-content-between align-items-center extra-small text-muted">
                        <span>${utils.formatDate(r.created_at)}</span>
                        ${r.sentiment ? `
                          <span class="badge ${r.sentiment === 'positive' ? 'bg-success-subtle text-success' : r.sentiment === 'negative' ? 'bg-danger-subtle text-danger' : 'bg-secondary-subtle text-secondary'} rounded-pill">
                            AI Sentiment: ${r.sentiment.toUpperCase()}
                          </span>
                        ` : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async init() {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const orderId = params.get('orderId');

    // Star Picker Handler
    const stars = document.querySelectorAll('#star-picker i');
    const ratingInput = document.getElementById('selected-rating');

    stars.forEach(star => {
      star.addEventListener('click', () => {
        const val = parseInt(star.dataset.val);
        ratingInput.value = val;

        stars.forEach((s, idx) => {
          if (idx < val) s.classList.add('active');
          else s.classList.remove('active');
        });
      });
    });

    // Form Submit Handler
    const form = document.getElementById('review-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const rating = parseInt(ratingInput.value);
        const comment = document.getElementById('review-comment').value;

        const res = await window.api.reviews.create({
          orderId: orderId ? parseInt(orderId) : null,
          rating,
          comment
        });

        if (res.success) {
          utils.showToast('Review submitted successfully! AI sentiment analyzed.', 'success');
          window.location.hash = '#/reviews';
          window.location.reload();
        } else {
          utils.showToast(res.error, 'error');
        }
      });
    }
  }
};
