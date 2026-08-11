const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.model = null;
    this.initialize();
  }

  initialize() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        console.log('✅ Gemini AI service initialized');
      } catch (error) {
        console.warn('⚠️ Failed to initialize Gemini:', error.message);
      }
    } else {
      console.warn('⚠️ Gemini API key not configured. AI features will use fallback mode.');
    }
  }

  isAvailable() {
    return this.model !== null;
  }

  async generateContent(prompt) {
    if (!this.isAvailable()) {
      throw new Error('Gemini AI is not available');
    }
    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Gemini API error:', error.message);
      throw error;
    }
  }

  // ── AI Feature 1: Food Recommendation ──
  async getFoodRecommendation(customerHistory, allFoods, popularFoods) {
    if (!this.isAvailable()) {
      return this.fallbackRecommendation(customerHistory, allFoods, popularFoods);
    }

    const menuSummary = allFoods
      .filter(f => f.is_available)
      .map(f => `ID:${f.id} "${f.name}" (${f.category_name}) $${f.price} - ${f.description}`)
      .join('\n');

    const historySummary = customerHistory.length > 0
      ? customerHistory.map(h => `${h.food_name} (ordered ${h.order_count} times)`).join(', ')
      : 'No previous orders';

    const prompt = `You are a restaurant recommendation system. Based on the customer's order history and menu, suggest 3-5 food items they would enjoy.

CUSTOMER ORDER HISTORY: ${historySummary}

AVAILABLE MENU:
${menuSummary}

POPULAR ITEMS: ${popularFoods.map(p => p.food_name).join(', ')}

RULES:
1. ONLY recommend items from the AVAILABLE MENU above
2. Use the exact food IDs and names from the menu
3. Give personalized reasons based on their history
4. If no history, recommend popular items

Return ONLY a valid JSON array:
[{"food_id": 1, "food_name": "Name", "reason": "Why this suits them"}]`;

    try {
      const response = await this.generateContent(prompt);
      const jsonMatch = response.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Validate that recommended food IDs exist
        const validIds = new Set(allFoods.map(f => f.id));
        return parsed.filter(r => validIds.has(r.food_id));
      }
    } catch (error) {
      console.error('Recommendation error:', error.message);
    }
    return this.fallbackRecommendation(customerHistory, allFoods, popularFoods);
  }

  fallbackRecommendation(customerHistory, allFoods, popularFoods) {
    const orderedIds = new Set(customerHistory.map(h => h.food_id));
    const orderedCategories = new Set(customerHistory.map(h => h.category_id));

    // Prioritize: same category items not yet ordered, then popular items
    const sameCategoryRecs = allFoods
      .filter(f => orderedCategories.has(f.category_id) && !orderedIds.has(f.id) && f.is_available)
      .slice(0, 3)
      .map(f => ({ food_id: f.id, food_name: f.name, reason: `Based on your interest in ${f.category_name} dishes` }));

    const popularRecs = allFoods
      .filter(f => !orderedIds.has(f.id) && f.is_available)
      .sort((a, b) => {
        const aP = popularFoods.find(p => p.food_id === a.id);
        const bP = popularFoods.find(p => p.food_id === b.id);
        return (bP?.order_count || 0) - (aP?.order_count || 0);
      })
      .slice(0, 3)
      .map(f => ({ food_id: f.id, food_name: f.name, reason: 'Popular item you haven\'t tried yet' }));

    const combined = [...sameCategoryRecs, ...popularRecs];
    const seen = new Set();
    return combined.filter(r => {
      if (seen.has(r.food_id)) return false;
      seen.add(r.food_id);
      return true;
    }).slice(0, 5);
  }

  // ── AI Feature 2: Restaurant Chatbot ──
  async chatWithRestaurantAI(message, context) {
    if (!this.isAvailable()) {
      return this.fallbackChat(message, context);
    }

    const menuData = context.menu
      .map(f => `• ${f.name} ($${f.price}) - ${f.category_name} - ${f.is_available ? 'Available' : 'Unavailable'} - ${f.description}`)
      .join('\n');

    const prompt = `You are a friendly restaurant assistant chatbot for "Smart Restaurant". Answer using ONLY the data below.

MENU:
${menuData}

POPULAR: ${context.popularItems?.map(p => `${p.food_name} (${p.order_count} orders)`).join(', ') || 'N/A'}

${context.orderStatus ? `CUSTOMER ORDER: Order #${context.orderStatus.id} - Status: ${context.orderStatus.status} - Items: ${context.orderStatus.items?.map(i => i.food_name).join(', ')}` : ''}

${context.chatHistory ? `RECENT CHAT:\n${context.chatHistory}` : ''}

RULES:
- Only mention food items from the MENU above
- Give accurate prices
- If asked about something not in the data, say it's not available
- Be friendly, concise, and helpful
- For recommendations, suggest from popular or available items
- Don't make up any information

Customer: ${message}`;

    try {
      return await this.generateContent(prompt);
    } catch (error) {
      return this.fallbackChat(message, context);
    }
  }

  fallbackChat(message, context) {
    const msg = message.toLowerCase();
    const menu = context.menu || [];

    if (msg.includes('menu') || msg.includes('available') || msg.includes('food')) {
      const categories = [...new Set(menu.filter(f => f.is_available).map(f => f.category_name))];
      return `We have these categories available: ${categories.join(', ')}. You can browse our full menu to see all items with prices! Is there a specific category you're interested in?`;
    }

    if (msg.includes('price') || msg.includes('cost') || msg.includes('how much')) {
      const item = menu.find(f => msg.includes(f.name.toLowerCase()));
      if (item) return `${item.name} costs $${item.price}. ${item.description}`;
      return 'Could you please specify which item you\'d like to know the price of? You can check our menu for all prices.';
    }

    if (msg.includes('vegetarian') || msg.includes('veg')) {
      const vegItems = menu.filter(f => f.name.toLowerCase().includes('veg') || f.name.toLowerCase().includes('vegetable'));
      if (vegItems.length > 0) {
        return `Our vegetarian options include: ${vegItems.map(f => `${f.name} ($${f.price})`).join(', ')}`;
      }
      return 'We have several vegetarian-friendly options. Please check our menu for items marked with veggie descriptions.';
    }

    if (msg.includes('recommend') || msg.includes('suggest') || msg.includes('popular')) {
      const popular = context.popularItems?.slice(0, 3) || [];
      if (popular.length > 0) {
        return `Our most popular items are: ${popular.map(p => p.food_name).join(', ')}. I'd highly recommend trying these!`;
      }
      return 'I recommend checking out our burgers and chicken dishes - they\'re customer favorites!';
    }

    if (msg.includes('order') || msg.includes('status')) {
      if (context.orderStatus) {
        return `Your order #${context.orderStatus.id} is currently: ${context.orderStatus.status.toUpperCase()}. Items: ${context.orderStatus.items?.map(i => i.food_name).join(', ') || 'N/A'}`;
      }
      return 'I don\'t see any active orders. You can place a new order from our menu!';
    }

    if (msg.includes('ingredient') || msg.includes('allerg')) {
      const item = menu.find(f => msg.includes(f.name.toLowerCase()));
      if (item && item.ingredients_info) return `${item.name} contains: ${item.ingredients_info}`;
      return 'Please specify which dish you\'d like ingredient information for, and I\'ll be happy to help!';
    }

    return 'I\'m here to help! You can ask me about our menu, prices, recommendations, your order status, or ingredients in any dish. What would you like to know?';
  }

  // ── AI Feature 3: Demand Prediction ──
  async getDemandPrediction(orderStats, foods) {
    if (orderStats.length < 5) {
      return { predictions: [], message: 'Not enough historical data for reliable prediction. At least 5 orders are needed.' };
    }

    if (!this.isAvailable()) {
      return this.fallbackDemandPrediction(orderStats, foods);
    }

    const statsText = orderStats.map(s =>
      `${s.food_name}: ordered ${s.total_orders} times, ${s.recent_orders} times in last 7 days, avg ${s.avg_per_day} per day`
    ).join('\n');

    const prompt = `Analyze restaurant order data and predict next-week demand for each food item.

ORDER STATISTICS (last 30 days):
${statsText}

Return ONLY valid JSON:
{
  "predictions": [
    {"food_name": "Name", "predicted_demand": "High|Medium|Low", "estimated_orders": 15, "trend": "increasing|stable|decreasing", "reason": "brief reason"}
  ]
}`;

    try {
      const response = await this.generateContent(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Demand prediction error:', error.message);
    }
    return this.fallbackDemandPrediction(orderStats, foods);
  }

  fallbackDemandPrediction(orderStats, foods) {
    const predictions = orderStats.map(s => {
      const avgDaily = s.avg_per_day || 0;
      let demand = 'Low';
      let estimated = Math.round(avgDaily * 7);
      let trend = 'stable';

      if (avgDaily >= 1) { demand = 'High'; }
      else if (avgDaily >= 0.5) { demand = 'Medium'; }

      if (s.recent_orders > s.total_orders * 0.4) { trend = 'increasing'; }
      else if (s.recent_orders < s.total_orders * 0.15) { trend = 'decreasing'; }

      return {
        food_name: s.food_name,
        predicted_demand: demand,
        estimated_orders: Math.max(estimated, 1),
        trend,
        reason: `Based on ${s.total_orders} orders in 30 days (${s.recent_orders} recent)`
      };
    });

    return { predictions: predictions.sort((a, b) => b.estimated_orders - a.estimated_orders) };
  }

  // ── AI Feature 4: Inventory Prediction ──
  async getInventoryPrediction(ingredients, usageData) {
    if (!this.isAvailable()) {
      return this.fallbackInventoryPrediction(ingredients, usageData);
    }

    const invText = ingredients.map(i => {
      const usage = usageData.find(u => u.ingredient_id === i.id);
      return `${i.name}: ${i.current_stock} ${i.unit} (min: ${i.minimum_stock}), avg daily usage: ${usage?.avg_daily || 0} ${i.unit}`;
    }).join('\n');

    const prompt = `Analyze restaurant inventory and predict which ingredients will run out soon.

INVENTORY:
${invText}

Return ONLY valid JSON:
{
  "predictions": [
    {"ingredient_name": "Name", "current_stock": 4, "unit": "kg", "usage_rate": "High|Medium|Low", "status": "Critical|Warning|Normal", "days_until_empty": 2, "recommendation": "brief action"}
  ]
}`;

    try {
      const response = await this.generateContent(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Inventory prediction error:', error.message);
    }
    return this.fallbackInventoryPrediction(ingredients, usageData);
  }

  fallbackInventoryPrediction(ingredients, usageData) {
    const predictions = ingredients.map(i => {
      const usage = usageData.find(u => u.ingredient_id === i.id);
      const avgDaily = usage?.avg_daily || 0;
      const daysLeft = avgDaily > 0 ? Math.round(i.current_stock / avgDaily) : 999;

      let usageRate = 'Low';
      let status = 'Normal';
      let recommendation = 'Stock level adequate';

      if (avgDaily >= 0.5) usageRate = 'High';
      else if (avgDaily >= 0.2) usageRate = 'Medium';

      if (i.current_stock <= i.minimum_stock) {
        status = 'Critical';
        recommendation = `Restock immediately! Below minimum level of ${i.minimum_stock} ${i.unit}`;
      } else if (daysLeft <= 5) {
        status = 'Warning';
        recommendation = `May run out in ~${daysLeft} days. Consider restocking soon.`;
      }

      return {
        ingredient_name: i.name,
        current_stock: i.current_stock,
        unit: i.unit,
        usage_rate: usageRate,
        status,
        days_until_empty: daysLeft > 100 ? null : daysLeft,
        recommendation
      };
    });

    return {
      predictions: predictions.sort((a, b) => {
        const order = { Critical: 0, Warning: 1, Normal: 2 };
        return (order[a.status] || 2) - (order[b.status] || 2);
      })
    };
  }

  // ── AI Feature 5: Sentiment Analysis ──
  async analyzeSentiment(reviews) {
    if (!this.isAvailable()) {
      return this.fallbackSentiment(reviews);
    }

    const reviewText = reviews
      .filter(r => !r.has_sentiment_result)
      .map(r => `ID:${r.id} Rating:${r.rating}/5 Comment:"${r.comment}"`)
      .join('\n');

    if (!reviewText) {
      return this.fallbackSentiment(reviews);
    }

    const prompt = `Analyze these restaurant reviews. Classify sentiment and identify topics.

REVIEWS:
${reviewText}

Return ONLY valid JSON:
{
  "results": [
    {"review_id": 1, "sentiment": "positive|neutral|negative", "score": 0.85, "topics": ["food quality", "service"]}
  ],
  "summary": {
    "positive_pct": 72, "neutral_pct": 18, "negative_pct": 10,
    "common_positive": ["food taste"], "common_negative": ["waiting time"],
    "overall_sentiment": "positive"
  }
}`;

    try {
      const response = await this.generateContent(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Sentiment analysis error:', error.message);
    }
    return this.fallbackSentiment(reviews);
  }

  fallbackSentiment(reviews) {
    const results = reviews.map(r => {
      let sentiment = r.sentiment || 'neutral';
      let score = 0.5;
      if (!r.sentiment) {
        if (r.rating >= 4) { sentiment = 'positive'; score = 0.8 + (r.rating - 4) * 0.1; }
        else if (r.rating <= 2) { sentiment = 'negative'; score = 0.1 + (r.rating - 1) * 0.1; }
        else { score = 0.5; }
      } else {
        score = sentiment === 'positive' ? 0.85 : sentiment === 'negative' ? 0.2 : 0.5;
      }

      const topics = [];
      const text = (r.comment || '').toLowerCase();
      if (/food|taste|delicious|burger|pizza|chicken|pasta|cooked/.test(text)) topics.push('food quality');
      if (/service|staff|friendly|rude/.test(text)) topics.push('service');
      if (/wait|slow|time|quick|fast|delivery/.test(text)) topics.push('waiting time');
      if (/price|expensive|overpriced|cheap|cost/.test(text)) topics.push('price');
      if (/portion|size|amount/.test(text)) topics.push('portion size');
      if (/atmosphere|ambiance|nice|clean/.test(text)) topics.push('atmosphere');
      if (topics.length === 0) topics.push('general');

      return { review_id: r.id, sentiment, score: parseFloat(score.toFixed(2)), topics };
    });

    const total = results.length || 1;
    const pos = results.filter(r => r.sentiment === 'positive').length;
    const neg = results.filter(r => r.sentiment === 'negative').length;
    const neu = results.filter(r => r.sentiment === 'neutral').length;

    const allTopics = results.flatMap(r => r.topics);
    const posTopics = results.filter(r => r.sentiment === 'positive').flatMap(r => r.topics);
    const negTopics = results.filter(r => r.sentiment === 'negative').flatMap(r => r.topics);

    const topicCount = (arr) => {
      const map = {};
      arr.forEach(t => { map[t] = (map[t] || 0) + 1; });
      return Object.entries(map).sort((a, b) => b[1] - a[1]).map(e => e[0]);
    };

    return {
      results,
      summary: {
        positive_pct: Math.round((pos / total) * 100),
        neutral_pct: Math.round((neu / total) * 100),
        negative_pct: Math.round((neg / total) * 100),
        common_positive: topicCount(posTopics).slice(0, 3),
        common_negative: topicCount(negTopics).slice(0, 3),
        overall_sentiment: pos > neg ? 'positive' : neg > pos ? 'negative' : 'neutral'
      }
    };
  }
}

module.exports = new GeminiService();
