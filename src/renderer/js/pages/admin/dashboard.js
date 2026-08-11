const adminDashboardPage = {
  async render() {
    const res = await window.api.dashboard.getStats();
    if (!res.success) {
      return `<div class="alert alert-danger m-4">Failed to load admin statistics: ${res.error}</div>`;
    }

    const s = res.stats;

    return `
      <div class="container-fluid py-3">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="fw-bold mb-1"><i class="bi bi-speedometer2 text-primary me-2"></i>Admin Management Dashboard</h2>
            <p class="text-muted mb-0">Overview of restaurant performance, sales, inventory alerts, and orders.</p>
          </div>
          <a href="#/admin/ai-dashboard" class="btn btn-warning rounded-pill px-4 font-weight-bold shadow-sm">
            <i class="bi bi-cpu me-1"></i> AI Intelligence Hub
          </a>
        </div>

        <!-- Metric KPI Cards Grid -->
        <div class="row g-3 mb-4">
          <div class="col-sm-6 col-xl-3">
            <div class="card custom-card p-3 border-start border-4 border-primary">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <div class="text-muted small fw-bold">TOTAL REVENUE</div>
                  <div class="fs-3 fw-bold text-dark">${utils.formatPrice(s.totalRevenue)}</div>
                  <div class="extra-small text-success"><i class="bi bi-arrow-up-right me-1"></i> Today: ${utils.formatPrice(s.todayRevenue)}</div>
                </div>
                <div class="bg-primary-subtle text-primary p-3 rounded-circle fs-3"><i class="bi bi-currency-dollar"></i></div>
              </div>
            </div>
          </div>

          <div class="col-sm-6 col-xl-3">
            <div class="card custom-card p-3 border-start border-4 border-info">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <div class="text-muted small fw-bold">TOTAL ORDERS</div>
                  <div class="fs-3 fw-bold text-dark">${s.totalOrders}</div>
                  <div class="extra-small text-info"><i class="bi bi-clock-history me-1"></i> Today: ${s.todayOrders} orders</div>
                </div>
                <div class="bg-info-subtle text-info p-3 rounded-circle fs-3"><i class="bi bi-bag-check"></i></div>
              </div>
            </div>
          </div>

          <div class="col-sm-6 col-xl-3">
            <div class="card custom-card p-3 border-start border-4 border-success">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <div class="text-muted small fw-bold">REGISTERED CUSTOMERS</div>
                  <div class="fs-3 fw-bold text-dark">${s.totalCustomers}</div>
                  <div class="extra-small text-muted"><i class="bi bi-person-check me-1"></i> Active profiles</div>
                </div>
                <div class="bg-success-subtle text-success p-3 rounded-circle fs-3"><i class="bi bi-people"></i></div>
              </div>
            </div>
          </div>

          <div class="col-sm-6 col-xl-3">
            <div class="card custom-card p-3 border-start border-4 border-danger">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <div class="text-muted small fw-bold">LOW STOCK ALERTS</div>
                  <div class="fs-3 fw-bold ${s.lowStockCount > 0 ? 'text-danger' : 'text-dark'}">${s.lowStockCount}</div>
                  <div class="extra-small ${s.lowStockCount > 0 ? 'text-danger' : 'text-muted'} fw-bold">
                    <i class="bi bi-exclamation-triangle me-1"></i> ${s.lowStockCount > 0 ? 'Requires attention' : 'Inventory healthy'}
                  </div>
                </div>
                <div class="bg-danger-subtle text-danger p-3 rounded-circle fs-3"><i class="bi bi-boxes"></i></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sales Chart & Order Status Grid -->
        <div class="row g-4 mb-4">
          <!-- 30-Day Sales Trend Line Chart -->
          <div class="col-lg-8">
            <div class="card custom-card p-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold mb-0"><i class="bi bi-graph-up me-2 text-primary"></i>Revenue Trend (Last 30 Days)</h5>
                <span class="badge bg-light text-dark">Completed Orders</span>
              </div>
              <div style="height: 280px;">
                <canvas id="salesChart"></canvas>
              </div>
            </div>
          </div>

          <!-- Order Status Breakdown -->
          <div class="col-lg-4">
            <div class="card custom-card p-4 h-100">
              <h5 class="fw-bold mb-3"><i class="bi bi-pie-chart me-2 text-info"></i>Order Status Breakdown</h5>
              
              <div class="list-group list-group-flush mb-3">
                <div class="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span><i class="bi bi-circle-fill text-warning me-2"></i>Pending</span>
                  <span class="badge bg-warning text-dark rounded-pill">${s.ordersByStatus.pending}</span>
                </div>
                <div class="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span><i class="bi bi-circle-fill text-info me-2"></i>Confirmed</span>
                  <span class="badge bg-info text-dark rounded-pill">${s.ordersByStatus.confirmed}</span>
                </div>
                <div class="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span><i class="bi bi-circle-fill text-primary me-2"></i>Preparing</span>
                  <span class="badge bg-primary rounded-pill">${s.ordersByStatus.preparing}</span>
                </div>
                <div class="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span><i class="bi bi-circle-fill text-secondary me-2"></i>Ready</span>
                  <span class="badge bg-secondary rounded-pill">${s.ordersByStatus.ready}</span>
                </div>
                <div class="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span><i class="bi bi-circle-fill text-success me-2"></i>Completed</span>
                  <span class="badge bg-success rounded-pill">${s.ordersByStatus.completed}</span>
                </div>
              </div>

              <a href="#/admin/orders" class="btn btn-outline-primary btn-sm w-100 rounded-pill mt-auto">
                Manage All Orders
              </a>
            </div>
          </div>
        </div>

        <!-- Popular Foods & Recent Orders Grid -->
        <div class="row g-4">
          <!-- Top Popular Food Items -->
          <div class="col-md-6">
            <div class="card custom-card p-4">
              <h5 class="fw-bold mb-3"><i class="bi bi-trophy text-warning me-2"></i>Top 5 Popular Foods</h5>
              <div class="table-responsive">
                <table class="table align-middle table-hover">
                  <thead>
                    <tr class="small text-muted">
                      <th>Food Item</th>
                      <th class="text-center">Orders Sold</th>
                      <th class="text-end">Total Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${s.popularFoods.map((pf, idx) => `
                      <tr>
                        <td>
                          <div class="d-flex align-items-center">
                            <span class="fw-bold me-2 text-muted">#${idx+1}</span>
                            <span class="fs-4 me-2">${pf.image_url.startsWith('http') ? '🍽️' : pf.image_url}</span>
                            <span class="fw-bold">${pf.name}</span>
                          </div>
                        </td>
                        <td class="text-center"><span class="badge bg-primary-subtle text-primary px-3 rounded-pill">${pf.total_quantity}</span></td>
                        <td class="text-end fw-bold">${utils.formatPrice(pf.total_sales)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Recent Orders Table -->
          <div class="col-md-6">
            <div class="card custom-card p-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold mb-0"><i class="bi bi-receipt me-2 text-success"></i>Recent Orders</h5>
                <a href="#/admin/orders" class="small text-decoration-none">View All</a>
              </div>
              <div class="table-responsive">
                <table class="table align-middle table-hover">
                  <thead>
                    <tr class="small text-muted">
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Status</th>
                      <th class="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${s.recentOrders.map(ro => `
                      <tr>
                        <td class="fw-bold">#${ro.id}</td>
                        <td>${ro.customer_name}</td>
                        <td>${utils.getStatusBadge(ro.status)}</td>
                        <td class="text-end fw-bold">${utils.formatPrice(ro.total_amount)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async init() {
    const res = await window.api.dashboard.getStats();
    if (res.success && res.stats.salesHistory) {
      const ctx = document.getElementById('salesChart');
      if (ctx) {
        const labels = res.stats.salesHistory.map(h => h.date);
        const data = res.stats.salesHistory.map(h => parseFloat(h.daily_total));

        new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Daily Sales ($)',
              data,
              borderColor: '#ff6b35',
              backgroundColor: 'rgba(255, 107, 53, 0.1)',
              fill: true,
              tension: 0.3,
              pointRadius: 4,
              pointBackgroundColor: '#ff6b35'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: { beginAtZero: true }
            }
          }
        });
      }
    }
  }
};
