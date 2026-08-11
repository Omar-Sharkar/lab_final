const customerDashboardPage = {
  async render() {
    const sessionRes = await window.api.auth.getSession();
    const user = sessionRes.user;

    if (!user) {
      window.location.hash = '#/login';
      return '<div>Redirecting to login...</div>';
    }

    const tableNumber = cartManager.getSelectedTableNumber();

    return `
      <div class="container py-3">
        <!-- Header Banner -->
        <div class="card border-0 bg-primary text-white shadow-sm rounded-4 mb-4 overflow-hidden">
          <div class="card-body p-4 position-relative">
            <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
              <div>
                <span class="badge bg-white text-primary px-3 py-2 rounded-pill fw-bold mb-2">
                  <i class="bi bi-person-fill me-1"></i> Customer Portal
                </span>
                <h2 class="fw-bold mb-1">Welcome back, ${user.name}! 👋</h2>
                <p class="mb-0 text-white-50">Manage your orders, get AI recommendations, and update your preferences.</p>
              </div>
              <div class="bg-white bg-opacity-10 p-3 rounded-4 backdrop-blur text-center" style="min-width: 200px;">
                <div class="small text-white-50">Current Dining Table</div>
                <div class="fs-4 fw-bold mt-1">
                  ${tableNumber ? `<i class="bi bi-qr-code-scan me-2 text-warning"></i>Table #${tableNumber}` : '<span class="text-white-50 fs-6">No table selected</span>'}
                </div>
                <a href="#/menu" class="btn btn-sm btn-light text-primary rounded-pill mt-2 px-3 fw-bold">
                  ${tableNumber ? 'Change Table' : 'Select Table'}
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Dashboard Stats Grid -->
        <div class="row g-3 mb-4" id="customer-stats-container">
          <div class="col-12 text-center py-4">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="text-muted mt-2">Loading your statistics...</p>
          </div>
        </div>

        <!-- Quick Action Shortcuts -->
        <div class="mb-4">
          <h5 class="fw-bold text-dark mb-3"><i class="bi bi-grid-fill text-primary me-2"></i>Quick Actions</h5>
          <div class="row g-3">
            <div class="col-6 col-md-4 col-lg-2">
              <a href="#/menu" class="card h-100 border-0 shadow-sm text-decoration-none text-center p-3 hover-lift rounded-4">
                <div class="fs-1 text-primary mb-2">🍔</div>
                <h6 class="fw-bold text-dark mb-1">Digital Menu</h6>
                <small class="text-muted">Browse & Order</small>
              </a>
            </div>
            <div class="col-6 col-md-4 col-lg-2">
              <a href="#/ai-recommendations" class="card h-100 border-0 shadow-sm text-decoration-none text-center p-3 hover-lift rounded-4">
                <div class="fs-1 text-warning mb-2">✨</div>
                <h6 class="fw-bold text-dark mb-1">AI Picks</h6>
                <small class="text-muted">Personalized</small>
              </a>
            </div>
            <div class="col-6 col-md-4 col-lg-2">
              <a href="#/chatbot" class="card h-100 border-0 shadow-sm text-decoration-none text-center p-3 hover-lift rounded-4">
                <div class="fs-1 text-info mb-2">🤖</div>
                <h6 class="fw-bold text-dark mb-1">AI Chatbot</h6>
                <small class="text-muted">Ask Assistant</small>
              </a>
            </div>
            <div class="col-6 col-md-4 col-lg-2">
              <a href="#/order-history" class="card h-100 border-0 shadow-sm text-decoration-none text-center p-3 hover-lift rounded-4">
                <div class="fs-1 text-success mb-2">📜</div>
                <h6 class="fw-bold text-dark mb-1">Order History</h6>
                <small class="text-muted">Past Receipts</small>
              </a>
            </div>
            <div class="col-6 col-md-4 col-lg-2">
              <a href="#/reviews" class="card h-100 border-0 shadow-sm text-decoration-none text-center p-3 hover-lift rounded-4">
                <div class="fs-1 text-danger mb-2">⭐</div>
                <h6 class="fw-bold text-dark mb-1">My Reviews</h6>
                <small class="text-muted">Rate Dishes</small>
              </a>
            </div>
            <div class="col-6 col-md-4 col-lg-2">
              <a href="#/profile" class="card h-100 border-0 shadow-sm text-decoration-none text-center p-3 hover-lift rounded-4">
                <div class="fs-1 text-secondary mb-2">👤</div>
                <h6 class="fw-bold text-dark mb-1">My Profile</h6>
                <small class="text-muted">Account Settings</small>
              </a>
            </div>
          </div>
        </div>

        <!-- Recent Orders Section -->
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div class="card-header bg-white py-3 px-4 d-flex align-items-center justify-content-between">
            <h5 class="fw-bold text-dark mb-0"><i class="bi bi-clock-history text-primary me-2"></i>Recent Orders</h5>
            <a href="#/order-history" class="btn btn-sm btn-outline-primary rounded-pill px-3">View All</a>
          </div>
          <div class="card-body p-0" id="recent-orders-container">
            <div class="p-4 text-center text-muted">Loading recent orders...</div>
          </div>
        </div>
      </div>
    `;
  },

  async init() {
    try {
      const res = await window.api.customers.getDashboardStats();
      if (!res.success) {
        utils.showToast(res.error || 'Failed to load dashboard', 'error');
        return;
      }

      const stats = res.stats;

      // Render Stat Cards
      const statsContainer = document.getElementById('customer-stats-container');
      if (statsContainer) {
        statsContainer.innerHTML = `
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-primary">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <span class="text-muted small text-uppercase fw-bold">Total Orders</span>
                  <h3 class="fw-bold text-dark mt-1 mb-0">${stats.totalOrders}</h3>
                </div>
                <div class="bg-primary bg-opacity-10 p-3 rounded-circle text-primary fs-4">
                  <i class="bi bi-bag-check-fill"></i>
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-lg-3">
            <div class="card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-warning">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <span class="text-muted small text-uppercase fw-bold">Active Orders</span>
                  <h3 class="fw-bold text-dark mt-1 mb-0">${stats.activeOrdersCount}</h3>
                </div>
                <div class="bg-warning bg-opacity-10 p-3 rounded-circle text-warning fs-4">
                  <i class="bi bi-hourglass-split"></i>
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-lg-3">
            <div class="card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-success">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <span class="text-muted small text-uppercase fw-bold">Total Spent</span>
                  <h3 class="fw-bold text-dark mt-1 mb-0">$${stats.totalSpent}</h3>
                </div>
                <div class="bg-success bg-opacity-10 p-3 rounded-circle text-success fs-4">
                  <i class="bi bi-currency-dollar"></i>
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-lg-3">
            <div class="card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-danger">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <span class="text-muted small text-uppercase fw-bold">Favorite Dish</span>
                  <h6 class="fw-bold text-dark mt-1 mb-0 text-truncate" style="max-width: 140px;" title="${stats.favoriteDish}">${stats.favoriteDish}</h6>
                </div>
                <div class="bg-danger bg-opacity-10 p-3 rounded-circle text-danger fs-4">
                  <i class="bi bi-heart-fill"></i>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      // Render Recent Orders
      const recentContainer = document.getElementById('recent-orders-container');
      if (recentContainer) {
        if (!stats.recentOrders || stats.recentOrders.length === 0) {
          recentContainer.innerHTML = `
            <div class="p-4 text-center">
              <p class="text-muted mb-2">You haven't placed any orders yet!</p>
              <a href="#/menu" class="btn btn-primary rounded-pill px-4">Browse Menu & Order</a>
            </div>
          `;
        } else {
          recentContainer.innerHTML = `
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Order #</th>
                    <th>Table</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th class="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${stats.recentOrders.map(order => `
                    <tr>
                      <td class="fw-bold">Order #${order.id}</td>
                      <td><span class="badge bg-light text-dark border">Table #${order.table_number || 'N/A'}</span></td>
                      <td class="fw-bold text-success">$${parseFloat(order.total_amount).toFixed(2)}</td>
                      <td>${utils.getStatusBadge(order.status)}</td>
                      <td class="small text-muted">${new Date(order.created_at).toLocaleString()}</td>
                      <td class="text-end">
                        <a href="#/order-tracking?id=${order.id}" class="btn btn-sm btn-outline-primary rounded-pill px-3">
                          Track Status
                        </a>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `;
        }
      }
    } catch (err) {
      console.error('Customer dashboard error:', err);
    }
  }
};
