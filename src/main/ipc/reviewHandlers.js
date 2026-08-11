const { session, sanitizeString } = require('../utils/helpers');
const geminiService = require('../services/geminiService');

function registerReviewHandlers(ipcMain, pool) {
  ipcMain.handle('reviews:create', async (event, data) => {
    try {
      const userId = session.getUserId() || data.userId;
      if (!userId) {
        return { success: false, error: 'User must be logged in to submit a review' };
      }

      const { orderId, rating, comment } = data;
      if (!rating || rating < 1 || rating > 5) {
        return { success: false, error: 'Rating must be between 1 and 5' };
      }

      const cleanComment = sanitizeString(comment || '');

      // Simple heuristic initial sentiment
      let sentiment = 'neutral';
      if (rating >= 4) sentiment = 'positive';
      else if (rating <= 2) sentiment = 'negative';

      const [result] = await pool.query(
        'INSERT INTO reviews (user_id, order_id, rating, comment, sentiment) VALUES (?, ?, ?, ?, ?)',
        [userId, orderId || null, parseInt(rating), cleanComment, sentiment]
      );

      const reviewId = result.insertId;

      // Extract basic topics
      const topics = [];
      const lower = cleanComment.toLowerCase();
      if (/food|taste|delicious|burger|pizza|chicken|pasta/.test(lower)) topics.push('food quality');
      if (/service|staff|friendly/.test(lower)) topics.push('service');
      if (/wait|slow|time|quick|fast/.test(lower)) topics.push('waiting time');
      if (/price|expensive|cheap/.test(lower)) topics.push('price');
      if (topics.length === 0) topics.push('general');

      const score = rating >= 4 ? 0.85 : rating <= 2 ? 0.2 : 0.5;

      await pool.query(
        'INSERT INTO sentiment_results (review_id, sentiment, score, topics) VALUES (?, ?, ?, ?)',
        [reviewId, sentiment, score, JSON.stringify(topics)]
      );

      return { success: true, reviewId, message: 'Thank you for your feedback!' };
    } catch (error) {
      console.error('Error submitting review:', error);
      return { success: false, error: 'Failed to submit review' };
    }
  });

  ipcMain.handle('reviews:getAll', async () => {
    try {
      const [reviews] = await pool.query(`
        SELECT r.*, u.name as customer_name, u.email as customer_email,
               sr.sentiment as ai_sentiment, sr.score as ai_score, sr.topics
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        LEFT JOIN sentiment_results sr ON r.id = sr.review_id
        ORDER BY r.created_at DESC
      `);

      reviews.forEach(r => {
        if (r.topics && typeof r.topics === 'string') {
          try { r.topics = JSON.parse(r.topics); } catch (e) { r.topics = []; }
        }
      });

      return { success: true, reviews };
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return { success: false, error: 'Failed to fetch reviews' };
    }
  });

  ipcMain.handle('reviews:getByUser', async (event, userId) => {
    try {
      const uid = userId || session.getUserId();
      if (!uid) return { success: false, error: 'User ID is required' };

      const [reviews] = await pool.query(`
        SELECT r.*, o.id as order_number
        FROM reviews r
        LEFT JOIN orders o ON r.order_id = o.id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
      `, [uid]);

      return { success: true, reviews };
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      return { success: false, error: 'Failed to fetch user reviews' };
    }
  });
}

module.exports = { registerReviewHandlers };
