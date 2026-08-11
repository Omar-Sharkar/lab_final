const { session } = require('../utils/helpers');

function registerOrderHandlers(ipcMain, pool) {
  ipcMain.handle('orders:create', async (event, data) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const userId = session.getUserId() || data.userId;
      if (!userId) {
        connection.release();
        return { success: false, error: 'User must be logged in to place an order' };
      }

      const { tableId, items, notes } = data;
      if (!items || !Array.isArray(items) || items.length === 0) {
        connection.release();
        return { success: false, error: 'Order must contain at least one item' };
      }

      // Calculate totals
      let totalAmount = 0;
      const orderItemsToInsert = [];

      for (const item of items) {
        const [foods] = await connection.query('SELECT id, price, name, is_available FROM foods WHERE id = ?', [item.foodId]);
        if (foods.length === 0) {
          await connection.rollback();
          connection.release();
          return { success: false, error: `Food item ID ${item.foodId} not found` };
        }

        const food = foods[0];
        if (!food.is_available) {
          await connection.rollback();
          connection.release();
          return { success: false, error: `"${food.name}" is currently unavailable` };
        }

        const qty = parseInt(item.quantity) || 1;
        const price = parseFloat(food.price);
        const subtotal = qty * price;
        totalAmount += subtotal;

        orderItemsToInsert.push({ foodId: food.id, qty, price, subtotal });
      }

      // Insert Order
      const [orderResult] = await connection.query(
        'INSERT INTO orders (user_id, table_id, status, total_amount, notes) VALUES (?, ?, ?, ?, ?)',
        [userId, tableId || null, 'pending', totalAmount, notes || '']
      );

      const orderId = orderResult.insertId;

      // Insert Order Items
      for (const item of orderItemsToInsert) {
        await connection.query(
          'INSERT INTO order_items (order_id, food_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
          [orderId, item.foodId, item.qty, item.price, item.subtotal]
        );

        // Deduct ingredients automatically
        const [foodIngredients] = await connection.query(
          'SELECT ingredient_id, quantity_needed FROM food_ingredients WHERE food_id = ?',
          [item.foodId]
        );

        for (const fi of foodIngredients) {
          const totalIngredientNeeded = fi.quantity_needed * item.qty;
          await connection.query(
            'UPDATE ingredients SET current_stock = GREATEST(0, current_stock - ?) WHERE id = ?',
            [totalIngredientNeeded, fi.ingredient_id]
          );

          await connection.query(
            'INSERT INTO inventory_transactions (ingredient_id, type, quantity, notes) VALUES (?, ?, ?, ?)',
            [fi.ingredient_id, 'out', totalIngredientNeeded, `Order #${orderId} deduction`]
          );
        }
      }

      // Update table status to occupied if specified
      if (tableId) {
        await connection.query('UPDATE restaurant_tables SET status = ? WHERE id = ?', ['occupied', tableId]);
      }

      await connection.commit();
      connection.release();

      return { success: true, orderId, totalAmount, message: 'Order placed successfully!' };
    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error('Error placing order:', error);
      return { success: false, error: 'Failed to place order' };
    }
  });

  ipcMain.handle('orders:getByUser', async (event, userId) => {
    try {
      const uid = userId || session.getUserId();
      if (!uid) return { success: false, error: 'User ID is required' };

      const [orders] = await pool.query(`
        SELECT o.*, t.table_number 
        FROM orders o
        LEFT JOIN restaurant_tables t ON o.table_id = t.id
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
      `, [uid]);

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
      console.error('Error fetching user orders:', error);
      return { success: false, error: 'Failed to fetch user orders' };
    }
  });

  ipcMain.handle('orders:getAll', async (event, filters = {}) => {
    try {
      let query = `
        SELECT o.*, u.name as customer_name, u.email as customer_email, t.table_number
        FROM orders o
        JOIN users u ON o.user_id = u.id
        LEFT JOIN restaurant_tables t ON o.table_id = t.id
        WHERE 1=1
      `;
      const params = [];

      if (filters.status) {
        query += ' AND o.status = ?';
        params.push(filters.status);
      }

      if (filters.search) {
        query += ' AND (u.name LIKE ? OR o.id LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      query += ' ORDER BY o.created_at DESC';

      const [orders] = await pool.query(query, params);

      for (const order of orders) {
        const [items] = await pool.query(`
          SELECT oi.*, f.name as food_name
          FROM order_items oi
          JOIN foods f ON oi.food_id = f.id
          WHERE oi.order_id = ?
        `, [order.id]);
        order.items = items;
      }

      return { success: true, orders };
    } catch (error) {
      console.error('Error fetching all orders:', error);
      return { success: false, error: 'Failed to fetch orders' };
    }
  });

  ipcMain.handle('orders:getById', async (event, id) => {
    try {
      const [orders] = await pool.query(`
        SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone, t.table_number
        FROM orders o
        JOIN users u ON o.user_id = u.id
        LEFT JOIN restaurant_tables t ON o.table_id = t.id
        WHERE o.id = ?
      `, [id]);

      if (orders.length === 0) return { success: false, error: 'Order not found' };

      const order = orders[0];
      const [items] = await pool.query(`
        SELECT oi.*, f.name as food_name, f.image_url, f.description
        FROM order_items oi
        JOIN foods f ON oi.food_id = f.id
        WHERE oi.order_id = ?
      `, [id]);
      order.items = items;

      return { success: true, order };
    } catch (error) {
      console.error('Error fetching order by ID:', error);
      return { success: false, error: 'Failed to fetch order details' };
    }
  });

  ipcMain.handle('orders:updateStatus', async (event, id, status) => {
    try {
      const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];
      if (!validStatuses.includes(status)) {
        return { success: false, error: 'Invalid order status' };
      }

      await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

      // If status is completed, generate bill automatically if not created
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

        // Release table
        const [orders] = await pool.query('SELECT table_id FROM orders WHERE id = ?', [id]);
        if (orders.length > 0 && orders[0].table_id) {
          await pool.query('UPDATE restaurant_tables SET status = ? WHERE id = ?', ['available', orders[0].table_id]);
        }
      }

      return { success: true, message: `Order #${id} status updated to ${status}` };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, error: 'Failed to update order status' };
    }
  });
}

module.exports = { registerOrderHandlers };
