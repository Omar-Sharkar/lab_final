require('dotenv').config();
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { initDatabase } = require('./src/main/database/db');
const { seedDatabase } = require('./src/main/database/seed');

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

let mainWindow;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    title: 'Smart Restaurant Management System',
    autoHideMenuBar: true,
    show: false
  });

  try {
    console.log('🔄 Initializing database...');
    const pool = await initDatabase();
    console.log('✅ Database connected');

    console.log('🌱 Checking seed data...');
    await seedDatabase(pool);

    // Register all IPC handlers
    registerAuthHandlers(ipcMain, pool);
    registerFoodHandlers(ipcMain, pool);
    registerCategoryHandlers(ipcMain, pool);
    registerTableHandlers(ipcMain, pool);
    registerOrderHandlers(ipcMain, pool);
    registerKitchenHandlers(ipcMain, pool);
    registerBillHandlers(ipcMain, pool);
    registerInventoryHandlers(ipcMain, pool);
    registerReviewHandlers(ipcMain, pool);
    registerDashboardHandlers(ipcMain, pool);
    registerAIHandlers(ipcMain, pool);
    registerCustomerHandlers(ipcMain, pool);

    console.log('✅ All systems initialized successfully');
  } catch (error) {
    console.error('❌ Initialization error:', error.message);
    console.error('The application will start but database features may not work.');
    console.error('Please check your MySQL connection settings in .env');
  }

  mainWindow.loadFile(path.join(__dirname, 'src', 'renderer', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    console.log('✅ Window ready-to-show fired');
    mainWindow.show();
  });

  // Fallback: if ready-to-show doesn't fire within 5 seconds, force show
  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      console.log('⚠️ Forcing window to show (ready-to-show timeout)');
      mainWindow.show();
    }
  }, 5000);

  // Log any page load errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('❌ Page load error:', errorCode, errorDescription);
  });

  mainWindow.webContents.on('console-message', (event, level, message) => {
    if (level >= 2) console.error('🌐 Renderer error:', message);
  });

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
