const { session } = require('../utils/helpers');

function registerKitchenHandlers(ipcMain, pool) {
  ipcMain.handle('kitchen:getOrders', async () => {
    try {
      const [orders] = await pool.query(`
        SELECT o.*, u.name as customer_name, t.table_number
        FROM orders o
        JOIN users u ON o.user_id = u.id
        LEFT JOIN restaurant_tables t ON o.table_id = t.id
        WHERE o.status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed')
        ORDER BY 
          CASE o.status
            WHEN 'pending' THEN 1
            WHEN 'confirmed' THEN 2
            WHEN 'preparing' THEN 3
            WHEN 'ready' THEN 4
            WHEN 'completed' THEN 5
          END,
          o.created_at ASC
      `);

      for (const order of orders) {
        const [items] = await pool.query(`
          SELECT oi.*, f.name as food_name, f.image_url
          FROM order_items oi
          JOIN foods f ON oi.food_id = f.id
          WHERE oi.order_id = ?
        `, [order.id]);
        order.items = items;
      }

      return { success: true, orders };
    } catch (error) {
      console.error('Error fetching kitchen orders:', error);
      return { success: false, error: 'Failed to fetch kitchen orders' };
    }
  });

  ipcMain.handle('kitchen:updateStatus', async (event, id, status) => {
    try {
      if (!session.isKitchen() && !session.isAdmin()) {
        return { success: false, error: 'Unauthorized: Kitchen staff or Admin access required' };
      }

      const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];
      if (!validStatuses.includes(status)) {
        return { success: false, error: 'Invalid order status' };
      }

      await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

      // If status completed, create bill if not exists and free table
      if (status === 'completed') {
        const [bills] = await pool.query('SELECT id FROM bills WHERE order_id = ?', [id]);
        if (bills.length === 0) {
          const [orders] = await pool.query('SELECT total_amount FROM orders WHERE id = ?', [id]);
          if (orders.length > 0) {
            const subtotal = parseFloat(orders[0].total_amount);
            const taxRate = 5.00;
            const taxAmount = parseFloat((subtotal * (taxRate / 100)).toFixed(2));
            const total = parseFloat((subtotal + taxAmount).toFixed(2));

            await pool.query(
              'INSERT INTO bills (order_id, subtotal, tax_rate, tax_amount, discount, total, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [id, subtotal, taxRate, taxAmount, 0, total, 'unpaid']
            );
          }
        }

        const [orders] = await pool.query('SELECT table_id FROM orders WHERE id = ?', [id]);
        if (orders.length > 0 && orders[0].table_id) {
          await pool.query('UPDATE restaurant_tables SET status = ? WHERE id = ?', ['available', orders[0].table_id]);
        }
      }

      return { success: true, message: `Order #${id} updated to ${status}` };
    } catch (error) {
      console.error('Error updating kitchen order status:', error);
      return { success: false, error: 'Failed to update order status' };
    }
  });
}

module.exports = { registerKitchenHandlers };
