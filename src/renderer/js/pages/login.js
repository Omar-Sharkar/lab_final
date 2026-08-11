const loginPage = {
  async render() {
    return `
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-md-5">
            <div class="card custom-card p-4">
              <div class="text-center mb-4">
                <span class="display-3">🍽️</span>
                <h3 class="fw-bold mt-2">Welcome Back</h3>
                <p class="text-muted">Sign in to Smart Restaurant System</p>
              </div>

              <form id="login-form">
                <div class="mb-3">
                  <label class="form-label font-weight-bold">Email Address</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                    <input type="email" class="form-control" id="login-email" placeholder="name@example.com" required>
                  </div>
                </div>

                <div class="mb-4">
                  <label class="form-label font-weight-bold">Password</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-lock"></i></span>
                    <input type="password" class="form-control" id="login-password" placeholder="••••••••" required>
                  </div>
                </div>

                <button type="submit" class="btn btn-primary w-100 py-2 font-weight-bold rounded-pill">
                  <i class="bi bi-box-arrow-in-right me-2"></i> Log In
                </button>
              </form>

              <hr class="my-4">

              <!-- Demo Credentials Shortcut Box -->
              <div class="bg-light p-3 rounded-3 small mb-3 border">
                <div class="fw-bold mb-2 text-dark"><i class="bi bi-key-fill text-warning me-1"></i> Quick Demo Login:</div>
                <div class="d-flex flex-wrap gap-2">
                  <button class="btn btn-sm btn-outline-primary demo-login-btn" data-email="customer@restaurant.com" data-pass="customer123">
                    Customer
                  </button>
                  <button class="btn btn-sm btn-outline-danger demo-login-btn" data-email="admin@restaurant.com" data-pass="admin123">
                    Admin
                  </button>
                  <button class="btn btn-sm btn-outline-warning text-dark demo-login-btn" data-email="kitchen@restaurant.com" data-pass="kitchen123">
                    Kitchen
                  </button>
                </div>
              </div>

              <div class="text-center">
                <p class="mb-0 text-muted">Don't have an account? <a href="#/register" class="fw-bold text-decoration-none">Register here</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async init() {
    const form = document.getElementById('login-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const res = await window.api.auth.login({ email, password });
        if (res.success) {
          utils.showToast(`Welcome back, ${res.user.name}!`, 'success');
          // Route based on role
          if (res.user.role === 'admin') window.location.hash = '#/admin/dashboard';
          else if (res.user.role === 'kitchen') window.location.hash = '#/kitchen/dashboard';
          else window.location.hash = '#/customer/dashboard';
        } else {
          utils.showToast(res.error, 'error');
        }
      });
    }

    // Demo buttons handler
    document.querySelectorAll('.demo-login-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('login-email').value = btn.dataset.email;
        document.getElementById('login-password').value = btn.dataset.pass;
        form.dispatchEvent(new Event('submit'));
      });
    });
  }
};
