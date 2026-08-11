const adminAIDashboardPage = {
  async render() {
    return `
      <div class="container-fluid py-3">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="fw-bold mb-1"><i class="bi bi-cpu text-warning me-2"></i>AI Analytics & Predictions Hub</h2>
            <p class="text-muted mb-0">Powered by Google Gemini 2.0 Flash • Smart Demand, Inventory Forecast, and Sentiment Analysis.</p>
          </div>
          <button id="refresh-ai-btn" class="btn btn-outline-primary rounded-pill px-4">
            <i class="bi bi-arrow-repeat me-1"></i> Refresh Predictions
          </button>
        </div>

        <!-- Tabs Navigation -->
        <ul class="nav nav-pills mb-4 gap-2" id="ai-tabs">
          <li class="nav-item">
            <button class="nav-link active rounded-pill px-4 fw-bold" data-tab="demand">
              <i class="bi bi-graph-up-arrow me-2"></i> Food Demand Prediction
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link rounded-pill px-4 fw-bold" data-tab="inventory">
              <i class="bi bi-boxes me-2"></i> Inventory Run-Out Forecast
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link rounded-pill px-4 fw-bold" data-tab="sentiment">
              <i class="bi bi-emoji-smile me-2"></i> Customer Review Sentiment
            </button>
          </li>
        </ul>

        <!-- Dynamic Content Container -->
        <div id="ai-tab-content">
          <div class="text-center py-5">
            <div class="spinner-border text-warning" role="status"></div>
            <p class="text-muted mt-2">Running AI algorithms...</p>
          </div>
        </div>
      </div>
    `;
  },

  async init() {
    let activeTab = 'demand';

    const renderTab = async (tab) => {
      activeTab = tab;
      const container = document.getElementById('ai-tab-content');
      if (!container) return;

      container.innerHTML = `
        <div class="text-center py-5">
          <div class="spinner-border text-warning" role="status"></div>
          <p class="text-muted mt-2">Generating AI insights from Gemini...</p>
        </div>
      `;

      if (tab === 'demand') {
        const res = await window.api.ai.getDemandPrediction();
        if (!res.success) {
          container.innerHTML = `<div class="alert alert-danger">${res.error}</div>`;
          return;
        }

        if (res.message) {
          container.innerHTML = `<div class="alert alert-warning">${res.message}</div>`;
          return;
        }

        container.innerHTML = `
          <div class="card custom-card p-4">
            <h4 class="fw-bold mb-3"><i class="bi bi-graph-up-arrow text-primary me-2"></i>Predicted Food Demand (Next 7 Days)</h4>
            <p class="text-muted small mb-4">Estimations based on 30-day historical order velocity to minimize food waste and optimize kitchen prep.</p>

            <div class="table-responsive">
              <table class="table align-middle table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Food Item</th>
                    <th>Predicted Demand</th>
                    <th>Est. Next-Period Orders</th>
                    <th>Trend</th>
                    <th>AI Reasoning</th>
                  </tr>
                </thead>
                <tbody>
                  ${res.predictions.map(p => `
                    <tr>
                      <td class="fw-bold fs-6">${p.food_name}</td>
                      <td>
                        <span class="badge ${p.predicted_demand === 'High' ? 'bg-danger' : p.predicted_demand === 'Medium' ? 'bg-warning text-dark' : 'bg-secondary'} rounded-pill px-3 py-2 fs-6">
                          ${p.predicted_demand}
                        </span>
                      </td>
                      <td class="fw-bold text-primary fs-5">${p.estimated_orders} orders</td>
                      <td>
                        <span class="badge ${p.trend === 'increasing' ? 'bg-success-subtle text-success' : p.trend === 'decreasing' ? 'bg-danger-subtle text-danger' : 'bg-light text-dark'} rounded-pill">
                          ${p.trend ? p.trend.toUpperCase() : 'STABLE'}
                        </span>
                      </td>
                      <td class="small text-muted">${p.reason || 'Based on order velocity'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      } else if (tab === 'inventory') {
        const res = await window.api.ai.getInventoryPrediction();
        if (!res.success) {
          container.innerHTML = `<div class="alert alert-danger">${res.error}</div>`;
          return;
        }

        container.innerHTML = `
          <div class="card custom-card p-4">
            <h4 class="fw-bold mb-3"><i class="bi bi-boxes text-warning me-2"></i>Inventory Run-Out & Depletion Forecast</h4>
            <p class="text-muted small mb-4">Correlates current raw ingredient stock with daily consumption rates to prevent unexpected kitchen outages.</p>

            <div class="table-responsive">
              <table class="table align-middle table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Ingredient</th>
                    <th>Current Stock</th>
                    <th>Usage Rate</th>
                    <th>Status</th>
                    <th>Days Until Empty</th>
                    <th>AI Action Recommendation</th>
                  </tr>
                </thead>
                <tbody>
                  ${res.predictions.map(p => `
                    <tr class="${p.status === 'Critical' ? 'table-danger' : p.status === 'Warning' ? 'table-warning' : ''}">
                      <td class="fw-bold">${p.ingredient_name}</td>
                      <td class="fw-bold">${p.current_stock} ${p.unit}</td>
                      <td><span class="badge bg-secondary-subtle text-dark">${p.usage_rate} Usage</span></td>
                      <td>
                        <span class="badge ${p.status === 'Critical' ? 'badge-low-stock' : p.status === 'Warning' ? 'bg-warning text-dark' : 'bg-success'} rounded-pill px-3 py-2">
                          ${p.status}
                        </span>
                      </td>
                      <td class="fw-bold">${p.days_until_empty !== null ? `~${p.days_until_empty} Days` : '100+ Days'}</td>
                      <td class="small font-weight-bold">${p.recommendation}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      } else if (tab === 'sentiment') {
        const res = await window.api.ai.analyzeSentiment();
        if (!res.success) {
          container.innerHTML = `<div class="alert alert-danger">${res.error}</div>`;
          return;
        }

        const sum = res.summary;

        container.innerHTML = `
          <div class="row g-4">
            <!-- Sentiment Breakdown KPI Cards -->
            <div class="col-md-4">
              <div class="card custom-card p-4 text-center border-start border-4 border-success">
                <span class="display-3 text-success">😊</span>
                <h2 class="fw-bold mt-2 text-success">${sum.positive_pct}%</h2>
                <div class="text-muted fw-bold">POSITIVE REVIEWS</div>
              </div>
            </div>

            <div class="col-md-4">
              <div class="card custom-card p-4 text-center border-start border-4 border-secondary">
                <span class="display-3 text-secondary">😐</span>
                <h2 class="fw-bold mt-2 text-secondary">${sum.neutral_pct}%</h2>
                <div class="text-muted fw-bold">NEUTRAL REVIEWS</div>
              </div>
            </div>

            <div class="col-md-4">
              <div class="card custom-card p-4 text-center border-start border-4 border-danger">
                <span class="display-3 text-danger">🙁</span>
                <h2 class="fw-bold mt-2 text-danger">${sum.negative_pct}%</h2>
                <div class="text-muted fw-bold">NEGATIVE REVIEWS</div>
              </div>
            </div>

            <!-- Common Topics Box -->
            <div class="col-md-6">
              <div class="card custom-card p-4 h-100">
                <h5 class="fw-bold text-success mb-3"><i class="bi bi-hand-thumbs-up me-2"></i>Most Praised Aspects</h5>
                <ul class="list-group list-group-flush">
                  ${sum.common_positive.map(tp => `
                    <li class="list-group-item px-0 fw-bold text-dark"><i class="bi bi-check-circle-fill text-success me-2"></i> ${tp.toUpperCase()}</li>
                  `).join('')}
                </ul>
              </div>
            </div>

            <div class="col-md-6">
              <div class="card custom-card p-4 h-100">
                <h5 class="fw-bold text-danger mb-3"><i class="bi bi-hand-thumbs-down me-2"></i>Frequent Customer Complaints</h5>
                <ul class="list-group list-group-flush">
                  ${sum.common_negative.map(tp => `
                    <li class="list-group-item px-0 fw-bold text-dark"><i class="bi bi-exclamation-octagon-fill text-danger me-2"></i> ${tp.toUpperCase()}</li>
                  `).join('')}
                </ul>
              </div>
            </div>
          </div>
        `;
      }
    };

    // Tab Button Handlers
    document.querySelectorAll('#ai-tabs button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('#ai-tabs button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTab(btn.dataset.tab);
      });
    });

    const refreshBtn = document.getElementById('refresh-ai-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        renderTab(activeTab);
      });
    }

    // Initial Tab Render
    await renderTab('demand');
  }
};
