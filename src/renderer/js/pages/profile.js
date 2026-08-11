const profilePage = {
  async render() {
    const sessionRes = await window.api.auth.getSession();
    const user = sessionRes.user;

    if (!user) {
      window.location.hash = '#/login';
      return '<div>Redirecting to login...</div>';
    }

    const roleBadges = {
      admin: '<span class="badge bg-danger px-3 py-2 rounded-pill"><i class="bi bi-shield-check me-1"></i> System Administrator</span>',
      kitchen: '<span class="badge bg-warning text-dark px-3 py-2 rounded-pill"><i class="bi bi-fire me-1"></i> Kitchen Staff</span>',
      customer: '<span class="badge bg-primary px-3 py-2 rounded-pill"><i class="bi bi-person-heart me-1"></i> Customer Member</span>'
    };

    const roleIcons = {
      admin: '⚙️',
      kitchen: '👨‍🍳',
      customer: '👤'
    };

    return `
      <div class="container py-3" style="max-width: 900px;">
        <!-- Header Profile Card -->
        <div class="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
          <div class="card-body p-4 bg-white">
            <div class="d-flex flex-column flex-md-row align-items-center gap-4">
              <div class="position-relative">
                <div class="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 100px; height: 100px; font-size: 3rem;">
                  ${roleIcons[user.role] || '👤'}
                </div>
              </div>
              <div class="text-center text-md-start flex-grow-1">
                <div class="d-flex flex-wrap align-items-center justify-content-center justify-content-md-start gap-2 mb-2">
                  <h3 class="fw-bold text-dark mb-0">${user.name}</h3>
                  ${roleBadges[user.role] || ''}
                </div>
                <div class="text-muted mb-2">
                  <i class="bi bi-envelope-fill me-1"></i> ${user.email} &nbsp;|&nbsp; 
                  <i class="bi bi-telephone-fill me-1"></i> ${user.phone || 'No phone added'}
                </div>
                <div class="small text-secondary">
                  Account Status: <span class="text-success fw-bold"><i class="bi bi-check-circle-fill"></i> Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Role Summary Panel -->
        <div class="card border-0 shadow-sm rounded-4 mb-4 p-4">
          <h5 class="fw-bold text-dark mb-3"><i class="bi bi-info-circle-fill text-primary me-2"></i>Account Overview</h5>
          ${user.role === 'customer' ? `
            <div class="row g-3 text-center" id="profile-customer-stats">
              <div class="col-4">
                <div class="p-3 bg-light rounded-4">
                  <small class="text-muted d-block text-uppercase fw-bold">Orders</small>
                  <span class="fs-4 fw-bold text-primary" id="prof-stat-orders">...</span>
                </div>
              </div>
              <div class="col-4">
                <div class="p-3 bg-light rounded-4">
                  <small class="text-muted d-block text-uppercase fw-bold">Total Spent</small>
                  <span class="fs-4 fw-bold text-success" id="prof-stat-spent">...</span>
                </div>
              </div>
              <div class="col-4">
                <div class="p-3 bg-light rounded-4">
                  <small class="text-muted d-block text-uppercase fw-bold">Favorite Dish</small>
                  <span class="fs-6 fw-bold text-dark text-truncate d-block" id="prof-stat-fav">...</span>
                </div>
              </div>
            </div>
          ` : user.role === 'kitchen' ? `
            <div class="row g-3 text-center">
              <div class="col-md-4">
                <div class="p-3 bg-warning bg-opacity-10 text-dark rounded-4">
                  <i class="bi bi-fire fs-3 text-warning"></i>
                  <h6 class="fw-bold mt-2 mb-0">Kitchen Display System</h6>
                  <small class="text-muted">Live Orders Access</small>
                </div>
              </div>
              <div class="col-md-4">
                <div class="p-3 bg-info bg-opacity-10 text-dark rounded-4">
                  <i class="bi bi-clock-history fs-3 text-info"></i>
                  <h6 class="fw-bold mt-2 mb-0">Shift Status</h6>
                  <small class="text-muted">Active Duty</small>
                </div>
              </div>
              <div class="col-md-4">
                <div class="p-3 bg-success bg-opacity-10 text-dark rounded-4">
                  <i class="bi bi-check-circle fs-3 text-success"></i>
                  <h6 class="fw-bold mt-2 mb-0">Order Fulfillments</h6>
                  <small class="text-muted">Real-time KDS</small>
                </div>
              </div>
            </div>
          ` : `
            <div class="row g-3 text-center">
              <div class="col-md-4">
                <div class="p-3 bg-danger bg-opacity-10 text-dark rounded-4">
                  <i class="bi bi-speedometer2 fs-3 text-danger"></i>
                  <h6 class="fw-bold mt-2 mb-0">Full Admin Rights</h6>
                  <small class="text-muted">System Management</small>
                </div>
              </div>
              <div class="col-md-4">
                <div class="p-3 bg-warning bg-opacity-10 text-dark rounded-4">
                  <i class="bi bi-cpu fs-3 text-warning"></i>
                  <h6 class="fw-bold mt-2 mb-0">AI Analytics Hub</h6>
                  <small class="text-muted">Demand & Inventory AI</small>
                </div>
              </div>
              <div class="col-md-4">
                <div class="p-3 bg-primary bg-opacity-10 text-dark rounded-4">
                  <i class="bi bi-database-check fs-3 text-primary"></i>
                  <h6 class="fw-bold mt-2 mb-0">Database Control</h6>
                  <small class="text-muted">MySQL 8.0 Integration</small>
                </div>
              </div>
            </div>
          `}
        </div>

        <!-- Form Cards Row -->
        <div class="row g-4">
          <!-- Edit Personal Info Form -->
          <div class="col-12 col-md-6">
            <div class="card border-0 shadow-sm rounded-4 h-100 p-4">
              <h5 class="fw-bold text-dark mb-3"><i class="bi bi-pencil-square text-primary me-2"></i>Edit Profile Details</h5>
              <form id="edit-profile-form">
                <div class="mb-3">
                  <label class="form-label fw-bold">Full Name</label>
                  <input type="text" id="prof-input-name" class="form-control rounded-3" value="${user.name}" required>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-bold">Email Address</label>
                  <input type="email" class="form-control rounded-3 bg-light" value="${user.email}" disabled readonly>
                  <small class="text-muted">Email address cannot be changed.</small>
                </div>
                <div class="mb-4">
                  <label class="form-label fw-bold">Phone Number</label>
                  <input type="text" id="prof-input-phone" class="form-control rounded-3" value="${user.phone || ''}" placeholder="e.g. +1234567890">
                </div>
                <button type="submit" class="btn btn-primary rounded-pill w-100 fw-bold py-2">
                  <i class="bi bi-save me-1"></i> Save Profile Details
                </button>
              </form>
            </div>
          </div>

          <!-- Change Password Form -->
          <div class="col-12 col-md-6">
            <div class="card border-0 shadow-sm rounded-4 h-100 p-4">
              <h5 class="fw-bold text-dark mb-3"><i class="bi bi-key-fill text-warning me-2"></i>Security & Password</h5>
              <form id="change-password-form">
                <div class="mb-3">
                  <label class="form-label fw-bold">Current Password</label>
                  <input type="password" id="prof-input-current-pass" class="form-control rounded-3" required placeholder="••••••••">
                </div>
                <div class="mb-3">
                  <label class="form-label fw-bold">New Password</label>
                  <input type="password" id="prof-input-new-pass" class="form-control rounded-3" required minlength="6" placeholder="Min. 6 characters">
                </div>
                <div class="mb-4">
                  <label class="form-label fw-bold">Confirm New Password</label>
                  <input type="password" id="prof-input-confirm-pass" class="form-control rounded-3" required minlength="6" placeholder="Re-enter new password">
                </div>
                <button type="submit" class="btn btn-warning text-dark rounded-pill w-100 fw-bold py-2">
                  <i class="bi bi-lock-fill me-1"></i> Update Password
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async init() {
    // If customer, load extra stats
    const sessionRes = await window.api.auth.getSession();
    const user = sessionRes.user;

    if (user && user.role === 'customer') {
      try {
        const statsRes = await window.api.customers.getDashboardStats(user.id);
        if (statsRes.success) {
          const ordersEl = document.getElementById('prof-stat-orders');
          const spentEl = document.getElementById('prof-stat-spent');
          const favEl = document.getElementById('prof-stat-fav');

          if (ordersEl) ordersEl.textContent = statsRes.stats.totalOrders;
          if (spentEl) spentEl.textContent = `$${statsRes.stats.totalSpent}`;
          if (favEl) favEl.textContent = statsRes.stats.favoriteDish;
        }
      } catch (err) {
        console.error('Error fetching customer profile stats:', err);
      }
    }

    // Bind Edit Profile Form
    const editForm = document.getElementById('edit-profile-form');
    if (editForm) {
      editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('prof-input-name').value.trim();
        const phone = document.getElementById('prof-input-phone').value.trim();

        if (!name) {
          utils.showToast('Name is required', 'error');
          return;
        }

        const res = await window.api.auth.updateProfile({ name, phone });
        if (res.success) {
          utils.showToast('Profile updated successfully!', 'success');
          // Re-render navbar and profile page
          window.location.reload();
        } else {
          utils.showToast(res.error || 'Failed to update profile', 'error');
        }
      });
    }

    // Bind Change Password Form
    const passForm = document.getElementById('change-password-form');
    if (passForm) {
      passForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPassword = document.getElementById('prof-input-current-pass').value;
        const newPassword = document.getElementById('prof-input-new-pass').value;
        const confirmPassword = document.getElementById('prof-input-confirm-pass').value;

        if (newPassword !== confirmPassword) {
          utils.showToast('New passwords do not match!', 'error');
          return;
        }

        const res = await window.api.auth.changePassword({ currentPassword, newPassword });
        if (res.success) {
          utils.showToast('Password changed successfully!', 'success');
          passForm.reset();
        } else {
          utils.showToast(res.error || 'Failed to change password', 'error');
        }
      });
    }
  }
};
