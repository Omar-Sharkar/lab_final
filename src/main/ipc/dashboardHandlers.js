const { session } = require('../utils/helpers');

function registerDashboardHandlers(ipcMain, pool) {
  ipcMain.handle('dashboard:getStats', async () => {
    try {
      if (!session.isAdmin()) {
        return { success: false, error: 'Unauthorized: Admin access required' };
      }

      // Total revenue
      const [revResult] = await pool.query('SELECT SUM(total_amount) as total_revenue FROM orders WHERE status = "completed"');
      const totalRevenue = parseFloat(revResult[0].total_revenue || 0);

      // Today's revenue
      const [todayRevResult] = await pool.query('SELECT SUM(total_amount) as today_revenue FROM orders WHERE status = "completed" AND DATE(created_at) = CURDATE()');
      const todayRevenue = parseFloat(todayRevResult[0].today_revenue || 0);

      // Total orders
      const [ordersResult] = await pool.query('SELECT COUNT(*) as total_orders FROM orders');
      const totalOrders = ordersResult[0].total_orders;

      // Today's orders
      const [todayOrdersResult] = await pool.query('SELECT COUNT(*) as today_orders FROM orders WHERE DATE(created_at) = CURDATE()');
      const todayOrders = todayOrdersResult[0].today_orders;

      // Orders by status
      const [statusCounts] = await pool.query('SELECT status, COUNT(*) as count FROM orders GROUP BY status');
      const ordersByStatus = { pending: 0, confirmed: 0, preparing: 0, ready: 0, completed: 0 };
      statusCounts.forEach(r => { ordersByStatus[r.status] = r.count; });

      // Total customers
      const [customersResult] = await pool.query('SELECT COUNT(*) as total_customers FROM users WHERE role = "customer"');
      const totalCustomers = customersResult[0].total_customers;

      // Low stock count
      const [lowStockResult] = await pool.query('SELECT COUNT(*) as low_stock_count FROM ingredients WHERE current_stock <= minimum_stock');
      const lowStockCount = lowStockResult[0].low_stock_count;

      // Popular foods
      const [popularFoods] = await pool.query(`
        SELECT f.name, f.image_url, SUM(oi.quantity) as total_quantity, SUM(oi.subtotal) as total_sales
        FROM order_items oi
        JOIN foods f ON oi.food_id = f.id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status = 'completed'
        GROUP BY f.id
        ORDER BY total_quantity DESC
        LIMIT 5
      `);

      // Recent orders
      const [recentOrders] = await pool.query(`
        SELECT o.id, o.status, o.total_amount, o.created_at, u.name as customer_name, t.table_number
        FROM orders o
        JOIN users u ON o.user_id = u.id
        LEFT JOIN restaurant_tables t ON o.table_id = t.id
        ORDER BY o.created_at DESC
        LIMIT 6
      `);

      // Recent reviews
      const [recentReviews] = await pool.query(`
        SELECT r.*, u.name as customer_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
        LIMIT 5
      `);

      // Monthly sales history (for chart)
      const [salesHistory] = await pool.query(`
        SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as date, SUM(total_amount) as daily_total, COUNT(*) as order_count
        FROM orders
        WHERE status = 'completed' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
        ORDER BY date ASC
      `);

      return {
        success: true,
        stats: {
          totalRevenue,
          todayRevenue,
          totalOrders,
          todayOrders,
          ordersByStatus,
          totalCustomers,
          lowStockCount,
          popularFoods,
          recentOrders,
          recentReviews,
          salesHistory
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return { success: false, error: 'Failed to fetch dashboard statistics' };
    }
  });
}

module.exports = { registerDashboardHandlers };
