const { session } = require('../utils/helpers');

function registerCustomerHandlers(ipcMain, pool) {
  ipcMain.handle('customers:getAll', async () => {
    try {
      if (!session.isAdmin()) {
        return { success: false, error: 'Unauthorized: Admin access required' };
      }

      const [customers] = await pool.query(`
        SELECT u.id, u.name, u.email, u.phone, u.created_at,
               COUNT(o.id) as total_orders,
               COALESCE(SUM(o.total_amount), 0) as total_spent
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id AND o.status = 'completed'
        WHERE u.role = 'customer'
        GROUP BY u.id
        ORDER BY u.created_at DESC
      `);

      return { success: true, customers };
    } catch (error) {
      console.error('Error fetching customers:', error);
      return { success: false, error: 'Failed to fetch customer list' };
    }
  });

  ipcMain.handle('customers:delete', async (event, id) => {
    try {
      if (!session.isAdmin()) {
        return { success: false, error: 'Unauthorized: Admin access required' };
      }

      await pool.query('DELETE FROM users WHERE id = ? AND role = "customer"', [id]);
      return { success: true, message: 'Customer account deleted' };
    } catch (error) {
      console.error('Error deleting customer:', error);
      return { success: false, error: 'Failed to delete customer' };
    }
  });

  ipcMain.handle('customers:getDashboardStats', async (event, userId) => {
    try {
      const uid = userId || session.getUserId();
      if (!uid) {
        return { success: false, error: 'User ID is required' };
      }

      // Total orders & total spent
      const [orderStats] = await pool.query(`
        SELECT COUNT(id) as total_orders, COALESCE(SUM(total_amount), 0) as total_spent
        FROM orders WHERE user_id = ?
      `, [uid]);

      // Active / ongoing orders
      const [activeOrders] = await pool.query(`
        SELECT COUNT(id) as active_count
        FROM orders WHERE user_id = ? AND status IN ('pending', 'confirmed', 'preparing', 'ready')
      `, [uid]);

      // Favorite dish
      const [favoriteDish] = await pool.query(`
        SELECT f.name, COUNT(oi.id) as order_qty
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN foods f ON oi.food_id = f.id
        WHERE o.user_id = ?
        GROUP BY f.id, f.name
        ORDER BY order_qty DESC LIMIT 1
      `, [uid]);

      // Recent 5 orders
      const [recentOrders] = await pool.query(`
        SELECT o.id, t.table_number, o.total_amount, o.status, o.created_at
        FROM orders o
        LEFT JOIN restaurant_tables t ON o.table_id = t.id
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC LIMIT 5
      `, [uid]);

      return {
        success: true,
        stats: {
          totalOrders: orderStats[0]?.total_orders || 0,
          totalSpent: parseFloat(orderStats[0]?.total_spent || 0).toFixed(2),
          activeOrdersCount: activeOrders[0]?.active_count || 0,
          favoriteDish: favoriteDish[0]?.name || 'None yet',
          recentOrders
        }
      };
    } catch (error) {
      console.error('Error fetching customer dashboard stats:', error);
      return { success: false, error: 'Failed to fetch customer dashboard stats' };
    }
  });
}

module.exports = { registerCustomerHandlers };
