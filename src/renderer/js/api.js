/**
 * Web API Bridge for Smart Restaurant Management System
 * Replaces Electron preload contextBridge with HTTP REST/RPC calls.
 */

async function callApi(channel, ...args) {
  try {
    const response = await fetch('/api/ipc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ channel, args })
    });
    return await response.json();
  } catch (error) {
    console.error(`API Error (${channel}):`, error);
    return { success: false, error: 'Network error or server unavailable' };
  }
}

window.api = {
  // ── Authentication ──
  auth: {
    register: (data) => callApi('auth:register', data),
    login: (data) => callApi('auth:login', data),
    logout: () => callApi('auth:logout'),
    getSession: () => callApi('auth:getSession'),
    updateProfile: (data) => callApi('auth:updateProfile', data),
    changePassword: (data) => callApi('auth:changePassword', data),
  },

  // ── Foods ──
  foods: {
    getAll: (filters) => callApi('foods:getAll', filters),
    getById: (id) => callApi('foods:getById', id),
    create: (data) => callApi('foods:create', data),
    update: (id, data) => callApi('foods:update', id, data),
    delete: (id) => callApi('foods:delete', id),
  },

  // ── Categories ──
  categories: {
    getAll: () => callApi('categories:getAll'),
    create: (data) => callApi('categories:create', data),
    update: (id, data) => callApi('categories:update', id, data),
    delete: (id) => callApi('categories:delete', id),
  },

  // ── Tables ──
  tables: {
    getAll: () => callApi('tables:getAll'),
    create: (data) => callApi('tables:create', data),
    update: (id, data) => callApi('tables:update', id, data),
    delete: (id) => callApi('tables:delete', id),
    getQR: (id) => callApi('tables:getQR', id),
  },

  // ── Orders ──
  orders: {
    create: (data) => callApi('orders:create', data),
    getByUser: (userId) => callApi('orders:getByUser', userId),
    getAll: (filters) => callApi('orders:getAll', filters),
    getById: (id) => callApi('orders:getById', id),
    updateStatus: (id, status) => callApi('orders:updateStatus', id, status),
  },

  // ── Kitchen ──
  kitchen: {
    getOrders: () => callApi('kitchen:getOrders'),
    updateStatus: (id, status) => callApi('kitchen:updateStatus', id, status),
  },

  // ── Bills ──
  bills: {
    generate: (orderId) => callApi('bills:generate', orderId),
    getByOrder: (orderId) => callApi('bills:getByOrder', orderId),
    getAll: () => callApi('bills:getAll'),
    updatePayment: (id, status) => callApi('bills:updatePayment', id, status),
  },

  // ── Inventory ──
  inventory: {
    getAll: () => callApi('inventory:getAll'),
    create: (data) => callApi('inventory:create', data),
    update: (id, data) => callApi('inventory:update', id, data),
    delete: (id) => callApi('inventory:delete', id),
    getLowStock: () => callApi('inventory:getLowStock'),
    getTransactions: (id) => callApi('inventory:getTransactions', id),
    addTransaction: (data) => callApi('inventory:addTransaction', data),
  },

  // ── Reviews ──
  reviews: {
    create: (data) => callApi('reviews:create', data),
    getAll: () => callApi('reviews:getAll'),
    getByUser: (userId) => callApi('reviews:getByUser', userId),
  },

  // ── Dashboard ──
  dashboard: {
    getStats: () => callApi('dashboard:getStats'),
  },

  // ── AI Features ──
  ai: {
    getRecommendations: (userId) => callApi('ai:getRecommendations', userId),
    chat: (userId, message) => callApi('ai:chat', userId, message),
    getDemandPrediction: () => callApi('ai:getDemandPrediction'),
    getInventoryPrediction: () => callApi('ai:getInventoryPrediction'),
    analyzeSentiment: () => callApi('ai:analyzeSentiment'),
    getChatHistory: (userId) => callApi('ai:getChatHistory', userId),
  },

  // ── Customers (Admin) ──
  customers: {
    getAll: () => callApi('customers:getAll'),
    delete: (id) => callApi('customers:delete', id),
    getDashboardStats: (userId) => callApi('customers:getDashboardStats', userId),
  },
};
