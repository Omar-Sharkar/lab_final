const { session, sanitizeString } = require('../utils/helpers');
const geminiService = require('../services/geminiService');

function registerAIHandlers(ipcMain, pool) {
  // ── AI Feature 1: Recommendations ──
  ipcMain.handle('ai:getRecommendations', async (event, userId) => {
    try {
      const uid = userId || session.getUserId();

      // Customer history
      const [history] = uid ? await pool.query(`
        SELECT f.id as food_id, f.name as food_name, f.category_id, COUNT(*) as order_count
        FROM order_items oi
        JOIN foods f ON oi.food_id = f.id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.user_id = ?
        GROUP BY f.id
        ORDER BY order_count DESC
      `, [uid]) : [[]];

      // Available foods
      const [allFoods] = await pool.query(`
        SELECT f.*, c.name as category_name 
        FROM foods f
        JOIN food_categories c ON f.category_id = c.id
        WHERE f.is_available = TRUE
      `);

      // Popular foods
      const [popular] = await pool.query(`
        SELECT f.id as food_id, f.name as food_name, COUNT(*) as order_count
        FROM order_items oi
        JOIN foods f ON oi.food_id = f.id
        GROUP BY f.id
        ORDER BY order_count DESC
        LIMIT 5
      `);

      const recommendations = await geminiService.getFoodRecommendation(history, allFoods, popular);

      // Attach full food details to recommendations
      const detailedRecs = recommendations.map(rec => {
        const fullFood = allFoods.find(f => f.id === rec.food_id);
        return {
          ...rec,
          food: fullFood || null
        };
      }).filter(r => r.food !== null);

      return { success: true, recommendations: detailedRecs };
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return { success: false, error: 'Failed to fetch food recommendations' };
    }
  });

  // ── AI Feature 2: Chatbot ──
  ipcMain.handle('ai:chat', async (event, userId, message) => {
    try {
      const uid = userId || session.getUserId();
      const cleanMessage = sanitizeString(message || '');

      if (!cleanMessage) return { success: false, error: 'Message cannot be empty' };

      // Save user message to database
      if (uid) {
        await pool.query('INSERT INTO chat_messages (user_id, role, message) VALUES (?, ?, ?)', [uid, 'user', cleanMessage]);
      }

      // Gather context
      const [menu] = await pool.query(`
        SELECT f.name, f.price, f.description, f.is_available, f.ingredients_info, c.name as category_name
        FROM foods f
        JOIN food_categories c ON f.category_id = c.id
      `);

      const [popularItems] = await pool.query(`
        SELECT f.name as food_name, COUNT(*) as order_count
        FROM order_items oi
        JOIN foods f ON oi.food_id = f.id
        GROUP BY f.id
        ORDER BY order_count DESC
        LIMIT 5
      `);

      // Active order status if user logged in
      let orderStatus = null;
      if (uid) {
        const [activeOrders] = await pool.query(`
          SELECT id, status FROM orders WHERE user_id = ? AND status != 'completed' ORDER BY created_at DESC LIMIT 1
        `, [uid]);

        if (activeOrders.length > 0) {
          orderStatus = activeOrders[0];
          const [items] = await pool.query(`
            SELECT f.name as food_name FROM order_items oi JOIN foods f ON oi.food_id = f.id WHERE oi.order_id = ?
          `, [orderStatus.id]);
          orderStatus.items = items;
        }
      }

      // Chat history
      let chatHistoryText = '';
      if (uid) {
        const [history] = await pool.query('SELECT role, message FROM chat_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 6', [uid]);
        chatHistoryText = history.reverse().map(h => `${h.role === 'user' ? 'Customer' : 'Assistant'}: ${h.message}`).join('\n');
      }

      const context = { menu, popularItems, orderStatus, chatHistory: chatHistoryText };
      const reply = await geminiService.chatWithRestaurantAI(cleanMessage, context);

      // Save assistant reply to database
      if (uid) {
        await pool.query('INSERT INTO chat_messages (user_id, role, message) VALUES (?, ?, ?)', [uid, 'assistant', reply]);
      }

      return { success: true, reply };
    } catch (error) {
      console.error('Error processing chatbot message:', error);
      return { success: false, error: 'Failed to process chat message' };
    }
  });

  ipcMain.handle('ai:getChatHistory', async (event, userId) => {
    try {
      const uid = userId || session.getUserId();
      if (!uid) return { success: true, messages: [] };

      const [messages] = await pool.query('SELECT id, role, message, created_at FROM chat_messages WHERE user_id = ? ORDER BY created_at ASC', [uid]);
      return { success: true, messages };
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return { success: false, error: 'Failed to fetch chat history' };
    }
  });

  // ── AI Feature 3: Demand Prediction ──
  ipcMain.handle('ai:getDemandPrediction', async () => {
    try {
      if (!session.isAdmin()) {
        return { success: false, error: 'Unauthorized: Admin access required' };
      }

      // Order stats per food over last 30 days
      const [orderStats] = await pool.query(`
        SELECT 
          f.id as food_id, 
          f.name as food_name, 
          COUNT(DISTINCT oi.order_id) as total_orders,
          SUM(oi.quantity) as total_quantity,
          SUM(CASE WHEN o.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN oi.quantity ELSE 0 END) as recent_orders,
          ROUND(SUM(oi.quantity) / 30.0, 2) as avg_per_day
        FROM foods f
        LEFT JOIN order_items oi ON f.id = oi.food_id
        LEFT JOIN orders o ON oi.order_id = o.id
        GROUP BY f.id
      `);

      const [foods] = await pool.query('SELECT id, name FROM foods');

      const prediction = await geminiService.getDemandPrediction(orderStats, foods);
      return { success: true, ...prediction };
    } catch (error) {
      console.error('Error fetching demand prediction:', error);
      return { success: false, error: 'Failed to generate demand prediction' };
    }
  });

  // ── AI Feature 4: Inventory Prediction ──
  ipcMain.handle('ai:getInventoryPrediction', async () => {
    try {
      if (!session.isAdmin()) {
        return { success: false, error: 'Unauthorized: Admin access required' };
      }

      const [ingredients] = await pool.query('SELECT * FROM ingredients');

      // Daily usage stats from inventory transactions
      const [usageData] = await pool.query(`
        SELECT 
          ingredient_id,
          ROUND(SUM(quantity) / 30.0, 2) as avg_daily
        FROM inventory_transactions
        WHERE type = 'out' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY ingredient_id
      `);

      const prediction = await geminiService.getInventoryPrediction(ingredients, usageData);
      return { success: true, ...prediction };
    } catch (error) {
      console.error('Error fetching inventory prediction:', error);
      return { success: false, error: 'Failed to generate inventory prediction' };
    }
  });

  // ── AI Feature 5: Sentiment Analysis ──
  ipcMain.handle('ai:analyzeSentiment', async () => {
    try {
      if (!session.isAdmin()) {
        return { success: false, error: 'Unauthorized: Admin access required' };
      }

      const [reviews] = await pool.query(`
        SELECT r.*, sr.id as has_sentiment_result
        FROM reviews r
        LEFT JOIN sentiment_results sr ON r.id = sr.review_id
      `);

      const analysis = await geminiService.analyzeSentiment(reviews);

      // Save any newly computed results into sentiment_results table
      if (analysis.results && Array.isArray(analysis.results)) {
        for (const res of analysis.results) {
          await pool.query(`
            INSERT INTO sentiment_results (review_id, sentiment, score, topics) 
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE sentiment = VALUES(sentiment), score = VALUES(score), topics = VALUES(topics)
          `, [res.review_id, res.sentiment, res.score, JSON.stringify(res.topics || [])]);
        }
      }

      return { success: true, ...analysis };
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return { success: false, error: 'Failed to analyze review sentiment' };
    }
  });
}

module.exports = { registerAIHandlers };
