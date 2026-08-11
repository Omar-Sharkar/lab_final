require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const { initDatabase } = require('./src/main/database/db');
const { seedDatabase } = require('./src/main/database/seed');
const { sessionStore } = require('./src/main/utils/helpers');

// IPC handler imports
const { registerAuthHandlers } = require('./src/main/ipc/authHandlers');
const { registerFoodHandlers } = require('./src/main/ipc/foodHandlers');
const { registerCategoryHandlers } = require('./src/main/ipc/categoryHandlers');
const { registerTableHandlers } = require('./src/main/ipc/tableHandlers');
const { registerOrderHandlers } = require('./src/main/ipc/orderHandlers');
const { registerKitchenHandlers } = require('./src/main/ipc/kitchenHandlers');
const { registerBillHandlers } = require('./src/main/ipc/billHandlers');
const { registerInventoryHandlers } = require('./src/main/ipc/inventoryHandlers');
const { registerReviewHandlers } = require('./src/main/ipc/reviewHandlers');
const { registerDashboardHandlers } = require('./src/main/ipc/dashboardHandlers');
const { registerAIHandlers } = require('./src/main/ipc/aiHandlers');
const { registerCustomerHandlers } = require('./src/main/ipc/customerHandlers');

const app = express();
const PORT = process.env.PORT || 3000;

// Mock ipcMain registry to bridge desktop IPC handlers to HTTP RPC
const ipcHandlers = new Map();
const ipcMainMock = {
  handle(channel, handler) {
    ipcHandlers.set(channel, handler);
  }
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'smart-restaurant-secret-key-2026',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static frontend files from src/renderer
app.use(express.static(path.join(__dirname, 'src', 'renderer')));

// Unified API Endpoint for RPC calls
app.post('/api/ipc', (req, res) => {
  const { channel, args = [] } = req.body;
  const handler = ipcHandlers.get(channel);

  if (!handler) {
    return res.status(404).json({ success: false, error: `Unknown API channel: ${channel}` });
  }

  // Execute handler inside AsyncLocalStorage session store context
  sessionStore.run(req.session, async () => {
    try {
      const result = await handler({}, ...args);
      res.json(result);
    } catch (err) {
      console.error(`❌ Error executing handler for ${channel}:`, err);
      res.status(500).json({ success: false, error: err.message || 'Internal server error' });
    }
  });
});

// Fallback for Single Page Application routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'renderer', 'index.html'));
});

async function startServer() {
  try {
    console.log('🔄 Initializing database connection pool...');
    const pool = await initDatabase();
    console.log('✅ Database connected');

    console.log('🌱 Checking seed data...');
    await seedDatabase(pool);

    console.log('🔗 Registering API handlers...');
    registerAuthHandlers(ipcMainMock, pool);
    registerFoodHandlers(ipcMainMock, pool);
    registerCategoryHandlers(ipcMainMock, pool);
    registerTableHandlers(ipcMainMock, pool);
    registerOrderHandlers(ipcMainMock, pool);
    registerKitchenHandlers(ipcMainMock, pool);
    registerBillHandlers(ipcMainMock, pool);
    registerInventoryHandlers(ipcMainMock, pool);
    registerReviewHandlers(ipcMainMock, pool);
    registerDashboardHandlers(ipcMainMock, pool);
    registerAIHandlers(ipcMainMock, pool);
    registerCustomerHandlers(ipcMainMock, pool);

    console.log(`✅ ${ipcHandlers.size} API channels registered`);

    app.listen(PORT, () => {
      console.log(`\n🚀 Smart Restaurant Web App running live at: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    console.error('Please verify your MySQL connection settings in .env');
  }
}

startServer();
