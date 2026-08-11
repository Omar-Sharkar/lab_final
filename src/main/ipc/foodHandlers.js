const { session, validateRequired, sanitizeString } = require('../utils/helpers');

function registerFoodHandlers(ipcMain, pool) {
  ipcMain.handle('foods:getAll', async (event, filters = {}) => {
    try {
      let query = `
        SELECT f.*, c.name as category_name 
        FROM foods f 
        LEFT JOIN food_categories c ON f.category_id = c.id 
        WHERE 1=1
      `;
      const params = [];

      if (filters.categoryId) {
        query += ' AND f.category_id = ?';
        params.push(filters.categoryId);
      }

      if (filters.search) {
        query += ' AND (f.name LIKE ? OR f.description LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm);
      }

      if (filters.availableOnly) {
        query += ' AND f.is_available = TRUE';
      }

      query += ' ORDER BY f.category_id, f.name';

      const [foods] = await pool.query(query, params);
      return { success: true, foods };
    } catch (error) {
      console.error('Error fetching foods:', error);
      return { success: false, error: 'Failed to fetch food items' };
    }
  });

  ipcMain.handle('foods:getById', async (event, id) => {
    try {
      const [foods] = await pool.query(`
        SELECT f.*, c.name as category_name 
        FROM foods f 
        LEFT JOIN food_categories c ON f.category_id = c.id 
        WHERE f.id = ?
      `, [id]);

      if (foods.length === 0) {
        return { success: false, error: 'Food item not found' };
      }

      // Also get ingredient info if configured
      const [ingredients] = await pool.query(`
        SELECT i.id, i.name, i.unit, fi.quantity_needed
        FROM food_ingredients fi
        JOIN ingredients i ON fi.ingredient_id = i.id
        WHERE fi.food_id = ?
      `, [id]);

      const food = foods[0];
      food.ingredients = ingredients;

      return { success: true, food };
    } catch (error) {
      console.error('Error fetching food by ID:', error);
      return { success: false, error: 'Failed to fetch food item details' };
    }
  });

  ipcMain.handle('foods:create', async (event, data) => {
    try {
      if (!session.isAdmin()) {
        return { success: false, error: 'Unauthorized: Admin access required' };
      }

      const { category_id, name, description, price, image_url, is_available, ingredients_info } = data;
      const missing = validateRequired(['category_id', 'name', 'price'], data);
      if (missing.length > 0) {
        return { success: false, error: `Missing fields: ${missing.join(', ')}` };
      }

      const [result] = await pool.query(
        'INSERT INTO foods (category_id, name, description, price, image_url, is_available, ingredients_info) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          category_id,
          sanitizeString(name),
          sanitizeString(description || ''),
          parseFloat(price),
          image_url || '🍔',
          is_available !== undefined ? Boolean(is_available) : true,
          sanitizeString(ingredients_info || '')
        ]
      );

      return { success: true, id: result.insertId, message: 'Food item created successfully' };
    } catch (error) {
      console.error('Error creating food:', error);
      return { success: false, error: 'Failed to create food item' };
    }
  });

  ipcMain.handle('foods:update', async (event, id, data) => {
    try {
      if (!session.isAdmin()) {
        return { success: false, error: 'Unauthorized: Admin access required' };
      }

      const { category_id, name, description, price, image_url, is_available, ingredients_info } = data;

      await pool.query(
        `UPDATE foods SET 
          category_id = COALESCE(?, category_id),
          name = COALESCE(?, name),
          description = COALESCE(?, description),
          price = COALESCE(?, price),
          image_url = COALESCE(?, image_url),
          is_available = COALESCE(?, is_available),
          ingredients_info = COALESCE(?, ingredients_info)
        WHERE id = ?`,
        [
          category_id || null,
          name ? sanitizeString(name) : null,
          description !== undefined ? sanitizeString(description) : null,
          price !== undefined ? parseFloat(price) : null,
          image_url !== undefined ? image_url : null,
          is_available !== undefined ? Boolean(is_available) : null,
          ingredients_info !== undefined ? sanitizeString(ingredients_info) : null,
          id
        ]
      );

      return { success: true, message: 'Food item updated successfully' };
    } catch (error) {
      console.error('Error updating food:', error);
      return { success: false, error: 'Failed to update food item' };
    }
  });

  ipcMain.handle('foods:delete', async (event, id) => {
    try {
      if (!session.isAdmin()) {
        return { success: false, error: 'Unauthorized: Admin access required' };
      }

      await pool.query('DELETE FROM foods WHERE id = ?', [id]);
      return { success: true, message: 'Food item deleted successfully' };
    } catch (error) {
      console.error('Error deleting food:', error);
      return { success: false, error: 'Failed to delete food item' };
    }
  });
}

module.exports = { registerFoodHandlers };
