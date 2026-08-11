const bcrypt = require('bcryptjs');
const { session, validateEmail, validateRequired, sanitizeString } = require('../utils/helpers');

function registerAuthHandlers(ipcMain, pool) {
  ipcMain.handle('auth:register', async (event, data) => {
    try {
      const { name, email, password, phone } = data;

      const missing = validateRequired(['name', 'email', 'password'], data);
      if (missing.length > 0) {
        return { success: false, error: `Missing required fields: ${missing.join(', ')}` };
      }

      if (!validateEmail(email)) {
        return { success: false, error: 'Invalid email format' };
      }

      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long' };
      }

      const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
      if (existing.length > 0) {
        return { success: false, error: 'Email already registered' };
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const cleanName = sanitizeString(name);
      const cleanPhone = phone ? sanitizeString(phone) : null;

      const [result] = await pool.query(
        'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
        [cleanName, email.toLowerCase().trim(), passwordHash, cleanPhone, 'customer']
      );

      const user = {
        id: result.insertId,
        name: cleanName,
        email: email.toLowerCase().trim(),
        role: 'customer',
        phone: cleanPhone
      };

      session.set(user);

      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed due to a server error' };
    }
  });

  ipcMain.handle('auth:login', async (event, data) => {
    try {
      const { email, password } = data;

      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
      if (users.length === 0) {
        return { success: false, error: 'Invalid email or password' };
      }

      const user = users[0];
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        return { success: false, error: 'Invalid email or password' };
      }

      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      };

      session.set(userData);

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed due to a server error' };
    }
  });

  ipcMain.handle('auth:logout', async () => {
    session.clear();
    return { success: true };
  });

  ipcMain.handle('auth:getSession', async () => {
    return { success: true, user: session.get() };
  });

  ipcMain.handle('auth:updateProfile', async (event, data) => {
    try {
      const currentUser = session.get();
      if (!currentUser) {
        return { success: false, error: 'Unauthorized: Please login' };
      }

      const { name, phone } = data;
      if (!name || !name.trim()) {
        return { success: false, error: 'Name cannot be empty' };
      }

      const cleanName = sanitizeString(name);
      const cleanPhone = phone ? sanitizeString(phone) : null;

      await pool.query('UPDATE users SET name = ?, phone = ? WHERE id = ?', [cleanName, cleanPhone, currentUser.id]);

      const updatedUser = {
        ...currentUser,
        name: cleanName,
        phone: cleanPhone
      };
      session.set(updatedUser);

      return { success: true, user: updatedUser, message: 'Profile updated successfully' };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  });

  ipcMain.handle('auth:changePassword', async (event, data) => {
    try {
      const currentUser = session.get();
      if (!currentUser) {
        return { success: false, error: 'Unauthorized: Please login' };
      }

      const { currentPassword, newPassword } = data;
      if (!currentPassword || !newPassword) {
        return { success: false, error: 'Current password and new password are required' };
      }

      if (newPassword.length < 6) {
        return { success: false, error: 'New password must be at least 6 characters long' };
      }

      const [users] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [currentUser.id]);
      if (users.length === 0) {
        return { success: false, error: 'User not found' };
      }

      const isValid = await bcrypt.compare(currentPassword, users[0].password_hash);
      if (!isValid) {
        return { success: false, error: 'Current password is incorrect' };
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, currentUser.id]);

      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: 'Failed to change password' };
    }
  });
}

module.exports = { registerAuthHandlers };
