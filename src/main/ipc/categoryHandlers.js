const { session, validateRequired, sanitizeString } = require('../utils/helpers');

function registerCategoryHandlers(ipcMain, pool) {
  ipcMain.handle('categories:getAll', async () => {
    try {
      const [categories] = await pool.query(`
        SELECT c.*, COUNT(f.id) as food_count 
        FROM food_categories c 
        LEFT JOIN foods f ON c.id = f.category_id 
        GROUP BY c.id 
        ORDER BY c.name
      `);
      return { success: true, categories };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { success: false, error: 'Failed to fetch categories' };
    }
  });

  ipcMain.handle('categories:create', async (event, data) => {
    try {
      if (!session.isAdmin()) {
        return { success: false, error: 'Unauthorized: Admin access required' };
      }

      const { name, description, image_url } = data;
      const missing = validateRequired(['name'], data);
      if (missing.length > 0) {
        return { success: false, error: 'Category name is required' };
      }

      const [result] = await pool.query(
        'INSERT INTO food_categories (name, description, image_url) VALUES (?, ?, ?)',
        [sanitizeString(name), sanitizeString(description || ''), image_url || '🍽️']
      );

      return { success: true, id: result.insertId, message: 'Category created successfully' };
    } catch (error) {
      console.error('Error creating category:', error);
      return { success: false, error: 'Failed to create category' };
    }
  });

  ipcMain.handle('categories:update', async (event, id, data) => {
    try {
      if (!session.isAdmin()) {
        return { success: false, error: 'Unauthorized: Admin access required' };
      }

      const { name, description, image_url } = data;

      await pool.query(
        `UPDATE food_categories SET 
          name = COALESCE(?, name),
          description = COALESCE(?, description),
          image_url = COALESCE(?, image_url)
        WHERE id = ?`,
        [
          name ? sanitizeString(name) : null,
          description !== undefined ? sanitizeString(description) : null,
          image_url !== undefined ? image_url : null,
          id
        ]
      );

      return { success: true, message: 'Category updated successfully' };
    } catch (error) {
      console.error('Error updating category:', error);
      return { success: false, error: 'Failed to update category' };
    }
  });

  ipcMain.handle('categories:delete', async (event, id) => {
    try {
      if (!session.isAdmin()) {
        return { success: false, error: 'Unauthorized: Admin access required' };
      }

      await pool.query('DELETE FROM food_categories WHERE id = ?', [id]);
      return { success: true, message: 'Category deleted successfully' };
    } catch (error) {
      console.error('Error deleting category:', error);
      return { success: false, error: 'Failed to delete category' };
    }
  });
}

module.exports = { registerCategoryHandlers };
