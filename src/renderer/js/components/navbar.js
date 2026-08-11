const navbarComponent = {
  render(user) {
    const role = user ? user.role : null;
    const tableNumber = cartManager.getSelectedTableNumber();

    return `
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm px-3">
        <div class="container-fluid">
          <!-- Brand Logo -->
          <a class="navbar-brand navbar-brand-custom" href="#/">
            <span class="fs-3">🍽️</span> SmartResto AI
          </a>

          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>

          <div class="collapse navbar-collapse" id="navbarNav">
            <!-- Left-aligned Links -->
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              ${role === 'customer' ? `
                <li class="nav-item">
                  <a class="nav-link nav-link-custom text-light ${window.location.hash === '#/customer/dashboard' ? 'active' : ''}" href="#/customer/dashboard">
                    <i class="bi bi-speedometer2 me-1"></i> Dashboard
                  </a>
                </li>
              ` : ''}
              ${role === 'customer' || !role ? `
                <li class="nav-item">
                  <a class="nav-link nav-link-custom text-light ${window.location.hash === '#/menu' || window.location.hash === '#/' ? 'active' : ''}" href="#/menu">
                    <i class="bi bi-book-half me-1"></i> Digital Menu
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link nav-link-custom text-light ${window.location.hash === '#/ai-recommendations' ? 'active' : ''}" href="#/ai-recommendations">
                    <i class="bi bi-stars me-1 text-warning"></i> AI Recommendations
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link nav-link-custom text-light ${window.location.hash === '#/chatbot' ? 'active' : ''}" href="#/chatbot">
                    <i class="bi bi-robot me-1 text-info"></i> AI Chatbot
                  </a>
                </li>
              ` : ''}

              ${role === 'admin' ? `
                <li class="nav-item">
                  <a class="nav-link nav-link-custom text-light ${window.location.hash === '#/admin/dashboard' ? 'active' : ''}" href="#/admin/dashboard">
                    <i class="bi bi-speedometer2 me-1"></i> Admin Dashboard
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link nav-link-custom text-light ${window.location.hash === '#/admin/ai-dashboard' ? 'active' : ''}" href="#/admin/ai-dashboard">
                    <i class="bi bi-cpu me-1 text-warning"></i> AI Analytics
                  </a>
                </li>
              ` : ''}

              ${role === 'kitchen' ? `
                <li class="nav-item">
                  <a class="nav-link nav-link-custom text-light ${window.location.hash === '#/kitchen/dashboard' ? 'active' : ''}" href="#/kitchen/dashboard">
                    <i class="bi bi-fire me-1 text-danger"></i> Kitchen Orders
                  </a>
                </li>
              ` : ''}
            </ul>

            <!-- Right-aligned Actions -->
            <div class="d-flex align-items-center gap-3">
              <!-- Table Badge -->
              ${tableNumber ? `
                <span class="badge bg-warning text-dark px-3 py-2 rounded-pill fs-6">
                  <i class="bi bi-qr-code-scan me-1"></i> Table #${tableNumber}
                </span>
              ` : ''}

              <!-- Cart Button (Customer) -->
              ${role === 'customer' || !role ? `
                <a href="#/cart" class="btn btn-outline-light position-relative rounded-pill px-3">
                  <i class="bi bi-cart3 fs-5"></i>
                  <span id="cart-badge" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger ${cartManager.getItemCount() === 0 ? 'd-none' : ''}">
                    ${cartManager.getItemCount()}
                  </span>
                </a>
              ` : ''}

              <!-- Auth Status -->
              ${user ? `
                <div class="dropdown">
                  <button class="btn btn-primary dropdown-toggle rounded-pill px-3" type="button" id="userMenu" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-person-circle me-1"></i> ${user.name} (${user.role.toUpperCase()})
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end shadow border-0" aria-labelledby="userMenu">
                    <li><a class="dropdown-item" href="#/profile"><i class="bi bi-person-badge me-2 text-primary"></i>My Profile</a></li>
                    ${user.role === 'customer' ? `
                      <li><a class="dropdown-item" href="#/customer/dashboard"><i class="bi bi-speedometer2 me-2"></i>My Dashboard</a></li>
                      <li><a class="dropdown-item" href="#/order-history"><i class="bi bi-clock-history me-2"></i>Order History</a></li>
                      <li><a class="dropdown-item" href="#/reviews"><i class="bi bi-star me-2"></i>My Reviews</a></li>
                    ` : ''}
                    <li><hr class="dropdown-divider"></li>
                    <li><button id="logout-btn" class="dropdown-item text-danger"><i class="bi bi-box-arrow-right me-2"></i>Logout</button></li>
                  </ul>
                </div>
              ` : `
                <a href="#/login" class="btn btn-outline-light rounded-pill px-3 me-2">Login</a>
                <a href="#/register" class="btn btn-primary rounded-pill px-3">Register</a>
              `}
            </div>
          </div>
        </div>
      </nav>
    `;
  },

  bindEvents() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await window.api.auth.logout();
        utils.showToast('Logged out successfully', 'info');
        window.location.hash = '#/login';
      });
    }
  }
};
