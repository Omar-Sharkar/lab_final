const registerPage = {
  async render() {
    return `
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-md-5">
            <div class="card custom-card p-4">
              <div class="text-center mb-4">
                <span class="display-3">📝</span>
                <h3 class="fw-bold mt-2">Create Account</h3>
                <p class="text-muted">Register as a new customer</p>
              </div>

              <form id="register-form">
                <div class="mb-3">
                  <label class="form-label fw-bold">Full Name</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-person"></i></span>
                    <input type="text" class="form-control" id="reg-name" placeholder="John Doe" required>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-bold">Email Address</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                    <input type="email" class="form-control" id="reg-email" placeholder="john@example.com" required>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-bold">Phone Number</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-telephone"></i></span>
                    <input type="text" class="form-control" id="reg-phone" placeholder="01700000000">
                  </div>
                </div>

                <div class="mb-4">
                  <label class="form-label fw-bold">Password</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-lock"></i></span>
                    <input type="password" class="form-control" id="reg-password" placeholder="At least 6 characters" minlength="6" required>
                  </div>
                </div>

                <button type="submit" class="btn btn-primary w-100 py-2 font-weight-bold rounded-pill">
                  <i class="bi bi-person-plus me-2"></i> Register Account
                </button>
              </form>

              <hr class="my-4">

              <div class="text-center">
                <p class="mb-0 text-muted">Already have an account? <a href="#/login" class="fw-bold text-decoration-none">Log in here</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async init() {
    const form = document.getElementById('register-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const phone = document.getElementById('reg-phone').value;
        const password = document.getElementById('reg-password').value;

        const res = await window.api.auth.register({ name, email, phone, password });
        if (res.success) {
          utils.showToast('Account registered successfully!', 'success');
          window.location.hash = '#/menu';
        } else {
          utils.showToast(res.error, 'error');
        }
      });
    }
  }
};
