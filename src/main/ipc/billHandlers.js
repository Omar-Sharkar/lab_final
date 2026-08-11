const { session } = require('../utils/helpers');

function registerBillHandlers(ipcMain, pool) {
  ipcMain.handle('bills:generate', async (event, orderId) => {
    try {
      const [existingBills] = await pool.query('SELECT * FROM bills WHERE order_id = ?', [orderId]);
      if (existingBills.length > 0) {
        return { success: true, bill: existingBills[0] };
      }

      const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
      if (orders.length === 0) return { success: false, error: 'Order not found' };

      const subtotal = parseFloat(orders[0].total_amount);
      const taxRate = 5.00;
      const taxAmount = parseFloat((subtotal * (taxRate / 100)).toFixed(2));
      const total = parseFloat((subtotal + taxAmount).toFixed(2));

      const [result] = await pool.query(
        'INSERT INTO bills (order_id, subtotal, tax_rate, tax_amount, discount, total, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [orderId, subtotal, taxRate, taxAmount, 0, total, 'unpaid']
      );

      const [newBill] = await pool.query('SELECT * FROM bills WHERE id = ?', [result.insertId]);
      return { success: true, bill: newBill[0] };
    } catch (error) {
      console.error('Error generating bill:', error);
      return { success: false, error: 'Failed to generate bill' };
    }
  });

  ipcMain.handle('bills:getByOrder', async (event, orderId) => {
    try {
      const [bills] = await pool.query(`
        SELECT b.*, o.user_id, o.table_id, o.created_at as order_date, u.name as customer_name, u.email as customer_email, t.table_number
        FROM bills b
        JOIN orders o ON b.order_id = o.id
        JOIN users u ON o.user_id = u.id
        LEFT JOIN restaurant_tables t ON o.table_id = t.id
        WHERE b.order_id = ?
      `, [orderId]);

      if (bills.length === 0) return { success: false, error: 'Bill not found' };

      const bill = bills[0];
      const [items] = await pool.query(`
        SELECT oi.*, f.name as food_name
        FROM order_items oi
        JOIN foods f ON oi.food_id = f.id
        WHERE oi.order_id = ?
      `, [orderId]);
      bill.items = items;

      return { success: true, bill };
    } catch (error) {
      console.error('Error fetching bill by order:', error);
      return { success: false, error: 'Failed to fetch bill' };
    }
  });

  ipcMain.handle('bills:getAll', async () => {
    try {
      const [bills] = await pool.query(`
        SELECT b.*, o.created_at as order_date, u.name as customer_name, t.table_number
        FROM bills b
        JOIN orders o ON b.order_id = o.id
        JOIN users u ON o.user_id = u.id
        LEFT JOIN restaurant_tables t ON o.table_id = t.id
        ORDER BY b.created_at DESC
      `);
      return { success: true, bills };
    } catch (error) {
      console.error('Error fetching all bills:', error);
      return { success: false, error: 'Failed to fetch bills' };
    }
  });

  ipcMain.handle('bills:updatePayment', async (event, id, status) => {
    try {
      if (!session.isAdmin() && !session.isKitchen()) {
        return { success: false, error: 'Unauthorized' };
      }

      await pool.query('UPDATE bills SET payment_status = ? WHERE id = ?', [status, id]);
      return { success: true, message: 'Payment status updated' };
    } catch (error) {
      console.error('Error updating payment status:', error);
      return { success: false, error: 'Failed to update payment status' };
    }
  });
}

module.exports = { registerBillHandlers };
