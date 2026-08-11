const { session, validateRequired, sanitizeString } = require('../utils/helpers');

function registerInventoryHandlers(ipcMain, pool) {
  ipcMain.handle('inventory:getAll', async () => {
    try {
      const [ingredients] = await pool.query(`
        SELECT *, 
          (current_stock <= minimum_stock) as is_low_stock
        FROM ingredients 
        ORDER BY name
      `);
      return { success: true, ingredients };
    } catch (error) {
      console.error('Error fetching inventory:', error);
      return { success: false, error: 'Failed to fetch inventory' };
    }
  });

  ipcMain.handle('inventory:getLowStock', async () => {
    try {
      const [ingredients] = await pool.query(`
        SELECT * FROM ingredients 
        WHERE current_stock <= minimum_stock 
        ORDER BY (current_stock / NULLIF(minimum_stock, 0)) ASC
      `);
      return { success: true, ingredients };
    } catch (error) {
      console.error('Error fetching low stock ingredients:', error);
      return { success: false, error: 'Failed to fetch low stock warnings' };
    }
  });

  ipcMain.handle('inventory:create', async (event, data) => {
    try {
      if (!session.isAdmin()) {
        return { success: false, error: 'Unauthorized: Admin access required' };
      }

      const { name, unit, current_stock, minimum_stock, cost_per_unit } = data;
      const missing = validateRequired(['name', 'unit'], data);
      if (missing.length > 0) {
        return { success: false, error: `Missing fields: ${missing.join(', ')}` };
      }

      const [result] = await pool.query(
        'INSERT INTO ingredients (name, unit, current_stock, minimum_stock, cost_per_unit) VALUES (?, ?, ?, ?, ?)',
        [
          sanitizeString(name),
          sanitizeString(unit),
          parseFloat(current_stock || 0),
          parseFloat(minimum_stock || 0),
          parseFloat(cost_per_unit || 0)
        ]
      );

      // Log transaction
      if (current_stock > 0) {
        await pool.query(
          'INSERT INTO inventory_transactions (ingredient_id, type, quantity, notes) VALUES (?, ?, ?, ?)',
          [result.insertId, 'in', parseFloat(current_stock), 'Initial stock addition']
        );
      }

      return { success: true, id: result.insertId, message: 'Ingredient added successfully' };
    } catch (error) {
      console.error('Error adding ingredient:', error);
      return { success: false, error: 'Failed to add ingredient' };
    }
  });

  ipcMain.handle('inventory:update', async (event, id, data) => {
    try {
      if (!session.isAdmin()) {
        return { success: false, error: 'Unauthorized: Admin access required' };
      }

      const { name, unit, current_stock, minimum_stock, cost_per_unit } = data;

      // Check current stock to log adjustment if changed
      const [existing] = await pool.query('SELECT current_stock FROM ingredients WHERE id = ?', [id]);
      if (existing.length > 0 && current_stock !== undefined) {
        const oldStock = parseFloat(existing[0].current_stock);
        const newStock = parseFloat(current_stock);
        const diff = newStock - oldStock;
        if (diff !== 0) {
          const type = diff > 0 ? 'in' : 'adjustment';
          await pool.query(
            'INSERT INTO inventory_transactions (ingredient_id, type, quantity, notes) VALUES (?, ?, ?, ?)',
            [id, type, Math.abs(diff), `Stock updated from ${oldStock} to ${newStock}`]
          );
        }
      }

      await pool.query(
        `UPDATE ingredients SET 
          name = COALESCE(?, name),
          unit = COALESCE(?, unit),
          current_stock = COALESCE(?, current_stock),
          minimum_stock = COALESCE(?, minimum_stock),
          cost_per_unit = COALESCE(?, cost_per_unit)
        WHERE id = ?`,
        [
          name ? sanitizeString(name) : null,
          unit ? sanitizeString(unit) : null,
          current_stock !== undefined ? parseFloat(current_stock) : null,
          minimum_stock !== undefined ? parseFloat(minimum_stock) : null,
          cost_per_unit !== undefined ? parseFloat(cost_per_unit) : null,
          id
        ]
      );

      return { success: true, message: 'Ingredient updated successfully' };
    } catch (error) {
      console.error('Error updating ingredient:', error);
      return { success: false, error: 'Failed to update ingredient' };
    }
  });

  ipcMain.handle('inventory:delete', async (event, id) => {
    try {
      if (!session.isAdmin()) {
        return { success: false, error: 'Unauthorized: Admin access required' };
      }

      await pool.query('DELETE FROM ingredients WHERE id = ?', [id]);
      return { success: true, message: 'Ingredient deleted successfully' };
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      return { success: false, error: 'Failed to delete ingredient' };
    }
  });

  ipcMain.handle('inventory:getTransactions', async (event, id) => {
    try {
      let query = `
        SELECT t.*, i.name as ingredient_name, i.unit 
        FROM inventory_transactions t
        JOIN ingredients i ON t.ingredient_id = i.id
      `;
      const params = [];

      if (id) {
        query += ' WHERE t.ingredient_id = ?';
        params.push(id);
      }

      query += ' ORDER BY t.created_at DESC LIMIT 50';

      const [transactions] = await pool.query(query, params);
      return { success: true, transactions };
    } catch (error) {
      console.error('Error fetching inventory transactions:', error);
      return { success: false, error: 'Failed to fetch inventory transactions' };
    }
  });

  ipcMain.handle('inventory:addTransaction', async (event, data) => {
    try {
      if (!session.isAdmin()) {
        return { success: false, error: 'Unauthorized' };
      }

      const { ingredient_id, type, quantity, notes } = data;
      const qty = parseFloat(quantity);

      if (type === 'in') {
        await pool.query('UPDATE ingredients SET current_stock = current_stock + ? WHERE id = ?', [qty, ingredient_id]);
      } else if (type === 'out' || type === 'adjustment') {
        await pool.query('UPDATE ingredients SET current_stock = GREATEST(0, current_stock - ?) WHERE id = ?', [qty, ingredient_id]);
      }

      await pool.query(
        'INSERT INTO inventory_transactions (ingredient_id, type, quantity, notes) VALUES (?, ?, ?, ?)',
        [ingredient_id, type, qty, sanitizeString(notes || '')]
      );

      return { success: true, message: 'Stock transaction recorded' };
    } catch (error) {
      console.error('Error adding transaction:', error);
      return { success: false, error: 'Failed to record transaction' };
    }
  });
}

module.exports = { registerInventoryHandlers };
