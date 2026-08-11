const adminReviewManagementPage = {
  async render() {
    const res = await window.api.reviews.getAll();
    const reviews = res.success ? res.reviews : [];

    return `
      <div class="container-fluid py-3">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="fw-bold mb-1"><i class="bi bi-chat-left-heart me-2 text-primary"></i>Customer Reviews & Feedback</h2>
            <p class="text-muted mb-0">View ratings, written feedback, and AI-extracted topics.</p>
          </div>
          <span class="badge bg-primary fs-6 px-3 py-2 rounded-pill">Total: ${reviews.length} Reviews</span>
        </div>

        <div class="card custom-card p-4">
          <div class="table-responsive">
            <table class="table align-middle table-hover">
              <thead class="table-light">
                <tr>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Review Comment</th>
                  <th>Extracted Topics</th>
                  <th>AI Sentiment</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                ${reviews.map(r => `
                  <tr>
                    <td>
                      <div class="fw-bold">${r.customer_name}</div>
                      <div class="extra-small text-muted">${r.customer_email}</div>
                    </td>
                    <td>
                      <span class="text-warning fs-6">
                        ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
                      </span>
                    </td>
                    <td><p class="mb-0 text-dark small">${r.comment}</p></td>
                    <td>
                      ${(r.topics || []).map(t => `<span class="badge bg-light text-dark border me-1 small">${t}</span>`).join('')}
                    </td>
                    <td>
                      ${r.ai_sentiment ? `
                        <span class="badge ${r.ai_sentiment === 'positive' ? 'bg-success' : r.ai_sentiment === 'negative' ? 'bg-danger' : 'bg-secondary'} rounded-pill px-3">
                          ${r.ai_sentiment.toUpperCase()} (${r.ai_score || 0.5})
                        </span>
                      ` : '<span class="badge bg-secondary">Pending</span>'}
                    </td>
                    <td class="small text-muted">${utils.formatDate(r.created_at)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  async init() {}
};
