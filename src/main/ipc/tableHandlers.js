const QRCode = require('qrcode');
const { session } = require('../utils/helpers');

function registerTableHandlers(ipcMain, pool) {
  ipcMain.handle('tables:getAll', async () => {
    try {
      const [tables] = await pool.query('SELECT * FROM restaurant_tables ORDER BY table_number');

      // Generate QR codes if missing
      for (const table of tables) {
        if (!table.qr_code) {
          const qrData = JSON.stringify({ tableId: table.id, tableNumber: table.table_number });
          const qrDataUrl = await QRCode.toDataURL(qrData);
          await pool.query('UPDATE restaurant_tables SET qr_code = ? WHERE id = ?', [qrDataUrl, table.id]);
          table.qr_code = qrDataUrl;
        }
      }

      return { success: true, tables };
    } catch (error) {
      console.error('Error fetching tables:', error);
      return { success: false, error: 'Failed to fetch restaurant tables' };
    }
  });

  ipcMain.handle('tables:create', async (event, data) => {
    try {
      if (!session.isAdmin()) {
        return { success: false, error: 'Unauthorized: Admin access required' };
      }

      const { table_number, capacity } = data;
      if (!table_number) {
        return { success: false, error: 'Table number is required' };
      }

      const qrData = JSON.stringify({ tableNumber: parseInt(table_number) });
      const qrDataUrl = await QRCode.toDataURL(qrData);

      const [result] = await pool.query(
        'INSERT INTO restaurant_tables (table_number, capacity, qr_code) VALUES (?, ?, ?)',
        [parseInt(table_number), parseInt(capacity || 4), qrDataUrl]
      );

      return { success: true, id: result.insertId, message: 'Table added successfully' };
    } catch (error) {
      console.error('Error creating table:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return { success: false, error: 'Table number already exists' };
      }
      return { success: false, error: 'Failed to create table' };
    }
  });

  ipcMain.handle('tables:update', async (event, id, data) => {
    try {
      if (!session.isAdmin()) {
        return { success: false, error: 'Unauthorized: Admin access required' };
      }

      const { table_number, capacity, status } = data;

      let qrDataUrl = null;
      if (table_number) {
        const qrData = JSON.stringify({ tableId: id, tableNumber: parseInt(table_number) });
        qrDataUrl = await QRCode.toDataURL(qrData);
      }

      await pool.query(
        `UPDATE restaurant_tables SET 
          table_number = COALESCE(?, table_number),
          capacity = COALESCE(?, capacity),
          status = COALESCE(?, status),
          qr_code = COALESCE(?, qr_code)
        WHERE id = ?`,
        [
          table_number ? parseInt(table_number) : null,
          capacity ? parseInt(capacity) : null,
          status || null,
          qrDataUrl,
          id
        ]
      );

      return { success: true, message: 'Table updated successfully' };
    } catch (error) {
      console.error('Error updating table:', error);
      return { success: false, error: 'Failed to update table' };
    }
  });

  ipcMain.handle('tables:delete', async (event, id) => {
    try {
      if (!session.isAdmin()) {
        return { success: false, error: 'Unauthorized: Admin access required' };
      }

      await pool.query('DELETE FROM restaurant_tables WHERE id = ?', [id]);
      return { success: true, message: 'Table deleted successfully' };
    } catch (error) {
      console.error('Error deleting table:', error);
      return { success: false, error: 'Failed to delete table' };
    }
  });

  ipcMain.handle('tables:getQR', async (event, id) => {
    try {
      const [tables] = await pool.query('SELECT * FROM restaurant_tables WHERE id = ?', [id]);
      if (tables.length === 0) {
        return { success: false, error: 'Table not found' };
      }

      const table = tables[0];
      if (!table.qr_code) {
        const qrData = JSON.stringify({ tableId: table.id, tableNumber: table.table_number });
        table.qr_code = await QRCode.toDataURL(qrData);
        await pool.query('UPDATE restaurant_tables SET qr_code = ? WHERE id = ?', [table.qr_code, id]);
      }

      return { success: true, qr_code: table.qr_code, table };
    } catch (error) {
      console.error('Error getting table QR:', error);
      return { success: false, error: 'Failed to generate QR code' };
    }
  });
}

module.exports = { registerTableHandlers };
