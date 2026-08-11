const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // ── Authentication ──
  auth: {
    register: (data) => ipcRenderer.invoke('auth:register', data),
    login: (data) => ipcRenderer.invoke('auth:login', data),
    logout: () => ipcRenderer.invoke('auth:logout'),
    getSession: () => ipcRenderer.invoke('auth:getSession'),
  },

  // ── Foods ──
  foods: {
    getAll: (filters) => ipcRenderer.invoke('foods:getAll', filters),
    getById: (id) => ipcRenderer.invoke('foods:getById', id),
    create: (data) => ipcRenderer.invoke('foods:create', data),
    update: (id, data) => ipcRenderer.invoke('foods:update', id, data),
    delete: (id) => ipcRenderer.invoke('foods:delete', id),
  },

  // ── Categories ──
  categories: {
    getAll: () => ipcRenderer.invoke('categories:getAll'),
    create: (data) => ipcRenderer.invoke('categories:create', data),
    update: (id, data) => ipcRenderer.invoke('categories:update', id, data),
    delete: (id) => ipcRenderer.invoke('categories:delete', id),
  },

  // ── Tables ──
  tables: {
    getAll: () => ipcRenderer.invoke('tables:getAll'),
    create: (data) => ipcRenderer.invoke('tables:create', data),
    update: (id, data) => ipcRenderer.invoke('tables:update', id, data),
    delete: (id) => ipcRenderer.invoke('tables:delete', id),
    getQR: (id) => ipcRenderer.invoke('tables:getQR', id),
  },

  // ── Orders ──
  orders: {
    create: (data) => ipcRenderer.invoke('orders:create', data),
    getByUser: (userId) => ipcRenderer.invoke('orders:getByUser', userId),
    getAll: (filters) => ipcRenderer.invoke('orders:getAll', filters),
    getById: (id) => ipcRenderer.invoke('orders:getById', id),
    updateStatus: (id, status) => ipcRenderer.invoke('orders:updateStatus', id, status),
  },

  // ── Kitchen ──
  kitchen: {
    getOrders: () => ipcRenderer.invoke('kitchen:getOrders'),
    updateStatus: (id, status) => ipcRenderer.invoke('kitchen:updateStatus', id, status),
  },

  // ── Bills ──
  bills: {
    generate: (orderId) => ipcRenderer.invoke('bills:generate', orderId),
    getByOrder: (orderId) => ipcRenderer.invoke('bills:getByOrder', orderId),
    getAll: () => ipcRenderer.invoke('bills:getAll'),
    updatePayment: (id, status) => ipcRenderer.invoke('bills:updatePayment', id, status),
  },

  // ── Inventory ──
  inventory: {
    getAll: () => ipcRenderer.invoke('inventory:getAll'),
    create: (data) => ipcRenderer.invoke('inventory:create', data),
    update: (id, data) => ipcRenderer.invoke('inventory:update', id, data),
    delete: (id) => ipcRenderer.invoke('inventory:delete', id),
    getLowStock: () => ipcRenderer.invoke('inventory:getLowStock'),
    getTransactions: (id) => ipcRenderer.invoke('inventory:getTransactions', id),
    addTransaction: (data) => ipcRenderer.invoke('inventory:addTransaction', data),
  },

  // ── Reviews ──
  reviews: {
    create: (data) => ipcRenderer.invoke('reviews:create', data),
    getAll: () => ipcRenderer.invoke('reviews:getAll'),
    getByUser: (userId) => ipcRenderer.invoke('reviews:getByUser', userId),
  },

  // ── Dashboard ──
  dashboard: {
    getStats: () => ipcRenderer.invoke('dashboard:getStats'),
  },

  // ── AI Features ──
  ai: {
    getRecommendations: (userId) => ipcRenderer.invoke('ai:getRecommendations', userId),
    chat: (userId, message) => ipcRenderer.invoke('ai:chat', userId, message),
    getDemandPrediction: () => ipcRenderer.invoke('ai:getDemandPrediction'),
    getInventoryPrediction: () => ipcRenderer.invoke('ai:getInventoryPrediction'),
    analyzeSentiment: () => ipcRenderer.invoke('ai:analyzeSentiment'),
    getChatHistory: (userId) => ipcRenderer.invoke('ai:getChatHistory', userId),
  },

  // ── Customers (Admin) ──
  customers: {
    getAll: () => ipcRenderer.invoke('customers:getAll'),
    delete: (id) => ipcRenderer.invoke('customers:delete', id),
  },
});
