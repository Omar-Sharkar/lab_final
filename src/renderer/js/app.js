// ── Main SPA Client Router & Application Orchestrator ──

// Load all page modules script tags dynamically if needed or load sequentially
const routes = {
  '#/login': loginPage,
  '#/register': registerPage,
  '#/profile': profilePage,

  // Customer routes
  '#/': customerMenuPage,
  '#/menu': customerMenuPage,
  '#/customer/dashboard': customerDashboardPage,
  '#/cart': customerCartPage,
  '#/order-tracking': customerOrderTrackingPage,
  '#/order-history': customerOrderHistoryPage,
  '#/bills': customerBillsPage,
  '#/reviews': customerReviewsPage,
  '#/chatbot': customerChatbotPage,
  '#/ai-recommendations': customerRecommendationsPage,

  // Admin routes
  '#/admin/dashboard': adminDashboardPage,
  '#/admin/foods': adminFoodsPage,
  '#/admin/categories': adminCategoriesPage,
  '#/admin/tables': adminTablesPage,
  '#/admin/orders': adminOrdersPage,
  '#/admin/customers': adminCustomersPage,
  '#/admin/inventory': adminInventoryPage,
  '#/admin/billing': adminBillingPage,
  '#/admin/ai-dashboard': adminAIDashboardPage,
  '#/admin/reviews': adminReviewManagementPage,

  // Kitchen routes
  '#/kitchen/dashboard': kitchenDashboardPage,
};

let currentUser = null;

async function initApp() {
  // Get active user session
  try {
    const sessionRes = await window.api.auth.getSession();
    currentUser = sessionRes.user || null;
  } catch (err) {
    console.error('Session fetch error:', err);
  }

  // Handle routing
  window.addEventListener('hashchange', navigate);
  await navigate();
}

async function navigate() {
  let hash = window.location.hash || '#/menu';
  const cleanHash = hash.split('?')[0];

  // Always refresh session object on navigation to keep user object updated
  try {
    const sessionRes = await window.api.auth.getSession();
    currentUser = sessionRes.user || null;
  } catch (err) {
    console.error('Session refresh error:', err);
  }

  // Route Guard checks
  if (cleanHash === '#/profile' && !currentUser) {
    utils.showToast('Please log in to view your profile', 'warning');
    window.location.hash = '#/login';
    return;
  }

  if (cleanHash.startsWith('#/admin') && (!currentUser || currentUser.role !== 'admin')) {
    utils.showToast('Access denied: Admin login required', 'error');
    window.location.hash = '#/login';
    return;
  }

  if (cleanHash.startsWith('#/kitchen') && (!currentUser || (currentUser.role !== 'kitchen' && currentUser.role !== 'admin'))) {
    utils.showToast('Access denied: Kitchen staff login required', 'error');
    window.location.hash = '#/login';
    return;
  }

  // Get Page Module
  const page = routes[cleanHash] || customerMenuPage;

  // Update Navbar
  const headerContainer = document.getElementById('header-container');
  if (headerContainer) {
    headerContainer.innerHTML = navbarComponent.render(currentUser);
    navbarComponent.bindEvents();
  }

  // Update Sidebar
  const sidebarContainer = document.getElementById('sidebar-container');
  if (sidebarContainer) {
    const sidebarHtml = sidebarComponent.render(currentUser);
    if (sidebarHtml && (currentUser?.role === 'admin' || currentUser?.role === 'kitchen')) {
      sidebarContainer.innerHTML = sidebarHtml;
      sidebarContainer.classList.remove('d-none');
    } else {
      sidebarContainer.innerHTML = '';
      sidebarContainer.classList.add('d-none');
    }
  }

  // Update Cart Badge
  cartManager.updateBadge();

  // Render Page Content
  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    mainContent.innerHTML = await page.render();
    if (page.init) {
      await page.init();
    }
  }

  // Scroll to top
  window.scrollTo(0, 0);
}

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
