const sidebarComponent = {
  render(user) {
    if (!user || (user.role !== 'admin' && user.role !== 'kitchen')) {
      return '';
    }

    const currentHash = window.location.hash || '#/admin/dashboard';

    if (user.role === 'admin') {
      return `
        <div class="d-flex flex-column h-100">
          <div class="mb-4 px-2">
            <span class="text-uppercase text-secondary fw-bold small">Admin Control</span>
          </div>

          <nav class="nav nav-pills flex-column mb-auto">
            <a class="sidebar-link ${currentHash === '#/admin/dashboard' ? 'active' : ''}" href="#/admin/dashboard">
              <i class="bi bi-speedometer2"></i> Overview Dashboard
            </a>
            <a class="sidebar-link ${currentHash === '#/admin/ai-dashboard' ? 'active' : ''}" href="#/admin/ai-dashboard">
              <i class="bi bi-cpu text-warning"></i> AI Intelligence Hub
            </a>
            <a class="sidebar-link ${currentHash === '#/admin/foods' ? 'active' : ''}" href="#/admin/foods">
              <i class="bi bi-egg-fried"></i> Food Items
            </a>
            <a class="sidebar-link ${currentHash === '#/admin/categories' ? 'active' : ''}" href="#/admin/categories">
              <i class="bi bi-tags"></i> Food Categories
            </a>
            <a class="sidebar-link ${currentHash === '#/admin/tables' ? 'active' : ''}" href="#/admin/tables">
              <i class="bi bi-qr-code-scan"></i> Tables & QR Codes
            </a>
            <a class="sidebar-link ${currentHash === '#/admin/orders' ? 'active' : ''}" href="#/admin/orders">
              <i class="bi bi-bag-check"></i> Orders Management
            </a>
            <a class="sidebar-link ${currentHash === '#/admin/inventory' ? 'active' : ''}" href="#/admin/inventory">
              <i class="bi bi-boxes"></i> Inventory & Stock
            </a>
            <a class="sidebar-link ${currentHash === '#/admin/customers' ? 'active' : ''}" href="#/admin/customers">
              <i class="bi bi-people"></i> Customers
            </a>
            <a class="sidebar-link ${currentHash === '#/admin/billing' ? 'active' : ''}" href="#/admin/billing">
              <i class="bi bi-receipt"></i> Bills & Revenue
            </a>
            <a class="sidebar-link ${currentHash === '#/admin/reviews' ? 'active' : ''}" href="#/admin/reviews">
              <i class="bi bi-chat-left-heart"></i> Reviews & Sentiment
            </a>
            <a class="sidebar-link ${currentHash === '#/profile' ? 'active' : ''}" href="#/profile">
              <i class="bi bi-person-badge text-info"></i> My Profile
            </a>
          </nav>

          <div class="mt-auto pt-3 border-top border-secondary">
            <div class="d-flex align-items-center text-white small px-2">
              <i class="bi bi-shield-check text-success me-2 fs-5"></i>
              <div>
                <div class="fw-bold">${user.name}</div>
                <div class="text-muted">Administrator</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (user.role === 'kitchen') {
      return `
        <div class="d-flex flex-column h-100">
          <div class="mb-4 px-2">
            <span class="text-uppercase text-secondary fw-bold small">Kitchen Display System</span>
          </div>

          <nav class="nav nav-pills flex-column mb-auto">
            <a class="sidebar-link ${currentHash === '#/kitchen/dashboard' ? 'active' : ''}" href="#/kitchen/dashboard">
              <i class="bi bi-fire text-danger"></i> Live Orders Board
            </a>
            <a class="sidebar-link ${currentHash === '#/menu' ? 'active' : ''}" href="#/menu">
              <i class="bi bi-book-half"></i> Menu Reference
            </a>
            <a class="sidebar-link ${currentHash === '#/profile' ? 'active' : ''}" href="#/profile">
              <i class="bi bi-person-badge text-info"></i> My Profile
            </a>
          </nav>

          <div class="mt-auto pt-3 border-top border-secondary">
            <div class="d-flex align-items-center text-white small px-2">
              <i class="bi bi-person-workspace text-warning me-2 fs-5"></i>
              <div>
                <div class="fw-bold">${user.name}</div>
                <div class="text-muted">Kitchen Staff</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    return '';
  }
};
