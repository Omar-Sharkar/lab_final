const bcrypt = require('bcryptjs');

async function seedDatabase(pool) {
  try {
    const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
    if (users[0].count > 0) {
      console.log('📦 Database already seeded');
      return;
    }

    console.log('🌱 Seeding database with sample data...');

    // ── Users ──
    const adminHash = bcrypt.hashSync('admin123', 10);
    const kitchenHash = bcrypt.hashSync('kitchen123', 10);
    const customerHash = bcrypt.hashSync('customer123', 10);

    await pool.query(`INSERT INTO users (name, email, password_hash, phone, role) VALUES
      ('Admin User', 'admin@restaurant.com', ?, '01700000001', 'admin'),
      ('Kitchen Staff', 'kitchen@restaurant.com', ?, '01700000002', 'kitchen'),
      ('John Doe', 'john@example.com', ?, '01700000003', 'customer'),
      ('Jane Smith', 'jane@example.com', ?, '01700000004', 'customer'),
      ('Mike Wilson', 'mike@example.com', ?, '01700000005', 'customer')
    `, [adminHash, kitchenHash, customerHash, customerHash, customerHash]);

    // ── Categories ──
    await pool.query(`INSERT INTO food_categories (name, description, image_url) VALUES
      ('Burgers', 'Juicy handcrafted burgers made with premium ingredients', '🍔'),
      ('Pizza', 'Wood-fired artisan pizzas with fresh toppings', '🍕'),
      ('Pasta', 'Authentic Italian pasta dishes', '🍝'),
      ('Rice Dishes', 'Flavorful rice-based meals from around the world', '🍚'),
      ('Chicken', 'Premium chicken specialties grilled to perfection', '🍗'),
      ('Drinks', 'Refreshing beverages and smoothies', '🥤'),
      ('Desserts', 'Irresistible sweet treats and desserts', '🍰')
    `);

    // ── Foods ──
    await pool.query(`INSERT INTO foods (category_id, name, description, price, image_url, is_available, ingredients_info) VALUES
      (1, 'Classic Beef Burger', 'Juicy beef patty with lettuce, tomato, onion, and our special sauce on a toasted sesame bun', 8.99, '🍔', 1, 'Beef patty, lettuce, tomato, onion, sesame bun, special sauce'),
      (1, 'Chicken Burger', 'Crispy chicken fillet with fresh lettuce, mayo, and pickles', 7.99, '🍔', 1, 'Chicken breast, lettuce, mayo, pickles, bun'),
      (1, 'Spicy Chicken Burger', 'Fiery chicken burger with jalapeños, pepper jack cheese, and chipotle mayo', 9.49, '🌶️', 1, 'Spicy chicken, jalapeños, pepper jack cheese, chipotle mayo, bun'),
      (1, 'Veggie Burger', 'Plant-based patty with avocado, sprouts, and herb dressing', 7.49, '🥬', 1, 'Veggie patty, avocado, sprouts, herb dressing, bun'),
      (2, 'Margherita Pizza', 'Classic pizza with fresh mozzarella, tomato sauce, and basil', 10.99, '🍕', 1, 'Pizza dough, mozzarella, tomato sauce, fresh basil'),
      (2, 'Pepperoni Pizza', 'Loaded with premium pepperoni and melted mozzarella', 12.99, '🍕', 1, 'Pizza dough, pepperoni, mozzarella, tomato sauce'),
      (2, 'BBQ Chicken Pizza', 'Grilled chicken with BBQ sauce, red onions, and mozzarella', 13.99, '🍕', 1, 'Pizza dough, grilled chicken, BBQ sauce, red onion, mozzarella'),
      (2, 'Vegetarian Pizza', 'Bell peppers, mushrooms, olives, onions, and fresh tomatoes', 11.49, '🥦', 1, 'Pizza dough, bell peppers, mushrooms, olives, onions, tomatoes, mozzarella'),
      (3, 'Spaghetti Bolognese', 'Classic meat sauce over al dente spaghetti, topped with parmesan', 11.99, '🍝', 1, 'Spaghetti, beef, tomato sauce, parmesan, herbs'),
      (3, 'Chicken Alfredo', 'Creamy alfredo sauce with grilled chicken over fettuccine', 12.49, '🍝', 1, 'Fettuccine, chicken breast, cream, butter, parmesan'),
      (3, 'Penne Arrabiata', 'Penne pasta in a spicy tomato and garlic sauce', 10.49, '🌶️', 1, 'Penne pasta, tomato, garlic, chili flakes, olive oil'),
      (4, 'Chicken Fried Rice', 'Wok-fried rice with chicken, vegetables, and soy sauce', 9.99, '🍚', 1, 'Rice, chicken, eggs, vegetables, soy sauce'),
      (4, 'Beef Biryani', 'Aromatic basmati rice layered with spiced beef and caramelized onions', 13.99, '🍚', 1, 'Basmati rice, beef, onions, biryani spices, saffron'),
      (4, 'Vegetable Fried Rice', 'Stir-fried rice with mixed vegetables and sesame oil', 8.49, '🥕', 1, 'Rice, mixed vegetables, eggs, sesame oil, soy sauce'),
      (5, 'Grilled Chicken', 'Herb-marinated chicken breast grilled to perfection, served with sides', 11.99, '🍗', 1, 'Chicken breast, herbs, olive oil, lemon'),
      (5, 'Chicken Wings (6pc)', 'Crispy fried chicken wings tossed in your choice of sauce', 8.99, '🍗', 1, 'Chicken wings, flour, spices, sauce'),
      (5, 'Chicken Tenders', 'Golden crispy chicken tenders with dipping sauce', 7.99, '🍗', 1, 'Chicken breast strips, breadcrumbs, flour, dipping sauce'),
      (5, 'Butter Chicken', 'Tender chicken in a rich, creamy tomato-based curry sauce', 12.99, '🍛', 1, 'Chicken, butter, tomato, cream, spices'),
      (6, 'Coca Cola', 'Classic refreshing cola (330ml)', 2.49, '🥤', 1, 'Carbonated water, sugar, cola flavoring'),
      (6, 'Fresh Orange Juice', 'Freshly squeezed orange juice (400ml)', 3.99, '🍊', 1, 'Fresh oranges'),
      (6, 'Mango Smoothie', 'Creamy mango smoothie with yogurt and honey', 4.99, '🥭', 1, 'Mango, yogurt, honey, ice'),
      (6, 'Iced Coffee', 'Cold brew coffee with milk and ice', 3.49, '☕', 1, 'Coffee, milk, ice, sugar'),
      (7, 'Chocolate Brownie', 'Warm fudgy brownie with chocolate sauce and vanilla ice cream', 5.99, '🍫', 1, 'Chocolate, butter, flour, eggs, sugar, vanilla ice cream'),
      (7, 'Vanilla Ice Cream', 'Three scoops of premium vanilla bean ice cream', 3.99, '🍨', 1, 'Cream, vanilla, sugar, milk'),
      (7, 'Cheesecake', 'New York style cheesecake with berry compote', 6.99, '🍰', 1, 'Cream cheese, sugar, eggs, graham cracker crust, berries')
    `);

    // ── Restaurant Tables ──
    await pool.query(`INSERT INTO restaurant_tables (table_number, capacity, status) VALUES
      (1, 2, 'available'), (2, 4, 'available'), (3, 4, 'available'),
      (4, 6, 'available'), (5, 2, 'available'), (6, 4, 'available'),
      (7, 8, 'available'), (8, 4, 'available'), (9, 6, 'available'),
      (10, 2, 'available')
    `);

    // ── Ingredients ──
    await pool.query(`INSERT INTO ingredients (name, unit, current_stock, minimum_stock, cost_per_unit) VALUES
      ('Beef Patty', 'kg', 15.00, 10.00, 12.00),
      ('Chicken Breast', 'kg', 8.00, 10.00, 8.50),
      ('Burger Buns', 'pcs', 50.00, 20.00, 0.50),
      ('Pizza Dough', 'pcs', 20.00, 10.00, 1.20),
      ('Mozzarella Cheese', 'kg', 5.00, 8.00, 9.00),
      ('Tomato Sauce', 'liters', 10.00, 5.00, 3.00),
      ('Spaghetti Noodles', 'kg', 12.00, 5.00, 2.50),
      ('Penne Pasta', 'kg', 8.00, 5.00, 2.50),
      ('Rice', 'kg', 25.00, 10.00, 2.00),
      ('Cooking Oil', 'liters', 15.00, 5.00, 4.00),
      ('Lettuce', 'kg', 3.00, 5.00, 3.50),
      ('Onions', 'kg', 10.00, 5.00, 1.50),
      ('Tomatoes', 'kg', 8.00, 5.00, 2.00),
      ('Pepperoni', 'kg', 6.00, 3.00, 15.00),
      ('Chicken Wings', 'kg', 4.00, 8.00, 7.00),
      ('Flour', 'kg', 20.00, 10.00, 1.00),
      ('Butter', 'kg', 5.00, 3.00, 6.00),
      ('Heavy Cream', 'liters', 4.00, 3.00, 5.00),
      ('Sugar', 'kg', 10.00, 5.00, 1.50),
      ('Eggs', 'pcs', 40.00, 20.00, 0.30)
    `);

    // ── Food-Ingredient Mappings ──
    await pool.query(`INSERT INTO food_ingredients (food_id, ingredient_id, quantity_needed) VALUES
      (1, 1, 0.200), (1, 3, 1.000), (1, 11, 0.050), (1, 13, 0.050), (1, 12, 0.030),
      (2, 2, 0.150), (2, 3, 1.000), (2, 11, 0.050),
      (3, 2, 0.150), (3, 3, 1.000), (3, 11, 0.050),
      (4, 3, 1.000), (4, 11, 0.100), (4, 13, 0.100), (4, 12, 0.050),
      (5, 4, 1.000), (5, 5, 0.150), (5, 6, 0.100),
      (6, 4, 1.000), (6, 5, 0.150), (6, 14, 0.100), (6, 6, 0.100),
      (7, 4, 1.000), (7, 2, 0.150), (7, 5, 0.150),
      (8, 4, 1.000), (8, 5, 0.150), (8, 12, 0.050), (8, 13, 0.050),
      (9, 7, 0.150), (9, 1, 0.150), (9, 6, 0.150),
      (10, 7, 0.150), (10, 2, 0.150), (10, 18, 0.100), (10, 17, 0.020),
      (11, 8, 0.150), (11, 6, 0.100), (11, 10, 0.020),
      (12, 9, 0.200), (12, 2, 0.100), (12, 10, 0.020), (12, 20, 1.000),
      (13, 9, 0.250), (13, 1, 0.200), (13, 10, 0.030), (13, 12, 0.050),
      (15, 2, 0.250), (15, 10, 0.020),
      (16, 15, 0.250), (16, 10, 0.050), (16, 16, 0.030),
      (17, 2, 0.200), (17, 16, 0.050), (17, 20, 1.000),
      (18, 2, 0.200), (18, 17, 0.030), (18, 6, 0.150), (18, 18, 0.100)
    `);

    // ── Historical Orders (30 orders over ~40 days for AI predictions) ──
    const orderData = [
      { date: '2026-07-01 12:30:00', userId: 3, tableId: 1, items: [{fid:1,qty:2,price:8.99},{fid:19,qty:2,price:2.49}] },
      { date: '2026-07-02 13:15:00', userId: 4, tableId: 3, items: [{fid:10,qty:1,price:12.49},{fid:20,qty:1,price:3.99}] },
      { date: '2026-07-03 12:00:00', userId: 3, tableId: 2, items: [{fid:2,qty:1,price:7.99},{fid:16,qty:1,price:8.99},{fid:21,qty:1,price:4.99}] },
      { date: '2026-07-05 18:30:00', userId: 5, tableId: 5, items: [{fid:6,qty:1,price:12.99},{fid:22,qty:1,price:3.49}] },
      { date: '2026-07-06 13:00:00', userId: 3, tableId: 1, items: [{fid:3,qty:1,price:9.49},{fid:12,qty:1,price:9.99},{fid:19,qty:1,price:2.49}] },
      { date: '2026-07-08 19:00:00', userId: 4, tableId: 4, items: [{fid:5,qty:1,price:10.99},{fid:14,qty:1,price:8.49}] },
      { date: '2026-07-10 12:45:00', userId: 5, tableId: 2, items: [{fid:9,qty:1,price:11.99},{fid:23,qty:1,price:5.99}] },
      { date: '2026-07-11 13:30:00', userId: 3, tableId: 3, items: [{fid:1,qty:1,price:8.99},{fid:16,qty:2,price:8.99},{fid:19,qty:2,price:2.49}] },
      { date: '2026-07-13 18:15:00', userId: 4, tableId: 1, items: [{fid:7,qty:1,price:13.99},{fid:25,qty:1,price:6.99},{fid:20,qty:1,price:3.99}] },
      { date: '2026-07-14 12:00:00', userId: 5, tableId: 6, items: [{fid:15,qty:1,price:11.99},{fid:12,qty:1,price:9.99},{fid:22,qty:1,price:3.49}] },
      { date: '2026-07-16 13:00:00', userId: 3, tableId: 2, items: [{fid:2,qty:2,price:7.99},{fid:21,qty:2,price:4.99}] },
      { date: '2026-07-17 19:30:00', userId: 4, tableId: 4, items: [{fid:11,qty:1,price:10.49},{fid:24,qty:1,price:3.99}] },
      { date: '2026-07-19 12:30:00', userId: 5, tableId: 3, items: [{fid:18,qty:1,price:12.99},{fid:13,qty:1,price:13.99},{fid:19,qty:2,price:2.49}] },
      { date: '2026-07-20 13:15:00', userId: 3, tableId: 1, items: [{fid:3,qty:1,price:9.49},{fid:17,qty:1,price:7.99},{fid:20,qty:1,price:3.99}] },
      { date: '2026-07-22 18:00:00', userId: 4, tableId: 5, items: [{fid:4,qty:1,price:7.49},{fid:8,qty:1,price:11.49},{fid:21,qty:1,price:4.99}] },
      { date: '2026-07-23 12:45:00', userId: 5, tableId: 2, items: [{fid:1,qty:1,price:8.99},{fid:6,qty:1,price:12.99}] },
      { date: '2026-07-25 13:30:00', userId: 3, tableId: 4, items: [{fid:16,qty:3,price:8.99},{fid:19,qty:3,price:2.49}] },
      { date: '2026-07-26 19:00:00', userId: 4, tableId: 1, items: [{fid:10,qty:1,price:12.49},{fid:25,qty:1,price:6.99},{fid:22,qty:1,price:3.49}] },
      { date: '2026-07-28 12:15:00', userId: 5, tableId: 3, items: [{fid:15,qty:1,price:11.99},{fid:9,qty:1,price:11.99}] },
      { date: '2026-07-29 13:00:00', userId: 3, tableId: 2, items: [{fid:1,qty:2,price:8.99},{fid:2,qty:1,price:7.99},{fid:19,qty:3,price:2.49}] },
      { date: '2026-07-31 18:30:00', userId: 4, tableId: 6, items: [{fid:7,qty:1,price:13.99},{fid:24,qty:2,price:3.99}] },
      { date: '2026-08-01 12:30:00', userId: 5, tableId: 1, items: [{fid:18,qty:1,price:12.99},{fid:12,qty:1,price:9.99},{fid:21,qty:1,price:4.99}] },
      { date: '2026-08-02 13:15:00', userId: 3, tableId: 4, items: [{fid:3,qty:2,price:9.49},{fid:16,qty:2,price:8.99},{fid:19,qty:2,price:2.49}] },
      { date: '2026-08-03 18:00:00', userId: 4, tableId: 3, items: [{fid:5,qty:1,price:10.99},{fid:11,qty:1,price:10.49},{fid:20,qty:1,price:3.99}] },
      { date: '2026-08-04 12:00:00', userId: 5, tableId: 2, items: [{fid:6,qty:2,price:12.99},{fid:22,qty:2,price:3.49}] },
      { date: '2026-08-05 13:30:00', userId: 3, tableId: 5, items: [{fid:2,qty:1,price:7.99},{fid:13,qty:1,price:13.99},{fid:23,qty:1,price:5.99}] },
      { date: '2026-08-06 19:15:00', userId: 4, tableId: 1, items: [{fid:8,qty:1,price:11.49},{fid:4,qty:1,price:7.49},{fid:21,qty:1,price:4.99}] },
      { date: '2026-08-07 12:45:00', userId: 5, tableId: 4, items: [{fid:1,qty:1,price:8.99},{fid:17,qty:1,price:7.99},{fid:19,qty:1,price:2.49}] },
      { date: '2026-08-08 13:00:00', userId: 3, tableId: 3, items: [{fid:16,qty:2,price:8.99},{fid:3,qty:1,price:9.49},{fid:22,qty:2,price:3.49}] },
      { date: '2026-08-09 18:30:00', userId: 4, tableId: 2, items: [{fid:10,qty:1,price:12.49},{fid:25,qty:1,price:6.99}] },
    ];

    for (const order of orderData) {
      const total = order.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
      const [result] = await pool.query(
        'INSERT INTO orders (user_id, table_id, status, total_amount, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [order.userId, order.tableId, 'completed', parseFloat(total.toFixed(2)), order.date, order.date]
      );
      const orderId = result.insertId;
      for (const item of order.items) {
        await pool.query(
          'INSERT INTO order_items (order_id, food_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
          [orderId, item.fid, item.qty, item.price, parseFloat((item.qty * item.price).toFixed(2))]
        );
      }
    }

    // Add two active orders for demo
    const [pendingOrder] = await pool.query(
      'INSERT INTO orders (user_id, table_id, status, total_amount, notes, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [3, 1, 'pending', 11.48, 'No onions please']
    );
    await pool.query('INSERT INTO order_items (order_id, food_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)',
      [pendingOrder.insertId, 1, 1, 8.99, 8.99, pendingOrder.insertId, 19, 1, 2.49, 2.49]);

    const [confirmOrder] = await pool.query(
      'INSERT INTO orders (user_id, table_id, status, total_amount, created_at) VALUES (?, ?, ?, ?, NOW())',
      [5, 6, 'confirmed', 17.98]
    );
    await pool.query('INSERT INTO order_items (order_id, food_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)',
      [confirmOrder.insertId, 6, 1, 12.99, 12.99, confirmOrder.insertId, 21, 1, 4.99, 4.99]);

    // ── Bills for completed orders ──
    const [completedOrders] = await pool.query('SELECT id, total_amount FROM orders WHERE status = ?', ['completed']);
    for (const order of completedOrders) {
      const taxRate = 5.00;
      const subtotal = parseFloat(order.total_amount);
      const taxAmount = parseFloat((subtotal * taxRate / 100).toFixed(2));
      const total = parseFloat((subtotal + taxAmount).toFixed(2));
      await pool.query(
        'INSERT INTO bills (order_id, subtotal, tax_rate, tax_amount, discount, total, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [order.id, subtotal, taxRate, taxAmount, 0, total, 'paid']
      );
    }

    // ── Reviews ──
    const reviewData = [
      { userId: 3, orderId: 1, rating: 5, comment: 'Absolutely delicious burgers! The beef was cooked to perfection. Will definitely come back!', sentiment: 'positive' },
      { userId: 4, orderId: 2, rating: 4, comment: 'Great pasta, loved the alfredo sauce. Service was good too. Quick delivery to our table.', sentiment: 'positive' },
      { userId: 5, orderId: 4, rating: 3, comment: 'Pizza was decent but nothing extraordinary. Average experience overall.', sentiment: 'neutral' },
      { userId: 3, orderId: 5, rating: 5, comment: 'The spicy chicken burger is amazing! Best in town. Love the chipotle mayo!', sentiment: 'positive' },
      { userId: 4, orderId: 6, rating: 2, comment: 'Had to wait 45 minutes for our food. Very disappointing service. Food was lukewarm.', sentiment: 'negative' },
      { userId: 5, orderId: 7, rating: 4, comment: 'Spaghetti was really good. Nice atmosphere and friendly staff. Would recommend.', sentiment: 'positive' },
      { userId: 3, orderId: 8, rating: 5, comment: 'As always, the burgers and wings are fantastic here! Great portion sizes too.', sentiment: 'positive' },
      { userId: 4, orderId: 9, rating: 1, comment: 'Food was cold when served. The pizza dough was undercooked. Very poor quality today.', sentiment: 'negative' },
      { userId: 5, orderId: 10, rating: 4, comment: 'Grilled chicken was juicy and well-seasoned. Good portion size and nice presentation.', sentiment: 'positive' },
      { userId: 3, orderId: 11, rating: 5, comment: 'Love this place! Chicken burger never disappoints. Fast service today.', sentiment: 'positive' },
      { userId: 4, orderId: 12, rating: 3, comment: 'Penne was okay. A bit overpriced for the portion size. Expected more.', sentiment: 'neutral' },
      { userId: 5, orderId: 13, rating: 4, comment: 'Butter chicken was authentic and flavorful. Rice was cooked perfectly. Will order again.', sentiment: 'positive' },
      { userId: 3, orderId: 14, rating: 5, comment: 'Everything was perfect! The tenders are crispy and the drinks are always fresh.', sentiment: 'positive' },
      { userId: 4, orderId: 15, rating: 4, comment: 'Great vegetarian options! The veggie burger was surprisingly delicious. Nice initiative.', sentiment: 'positive' },
      { userId: 5, orderId: 16, rating: 2, comment: 'Burger was dry and the pizza was too salty. Not up to usual standards. Disappointing visit.', sentiment: 'negative' },
    ];

    for (const r of reviewData) {
      await pool.query(
        'INSERT INTO reviews (user_id, order_id, rating, comment, sentiment, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [r.userId, r.orderId, r.rating, r.comment, r.sentiment,
         new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')]
      );
    }

    // ── Sentiment Results for existing reviews ──
    const [reviews] = await pool.query('SELECT id, rating, comment, sentiment FROM reviews');
    for (const r of reviews) {
      const topics = [];
      const text = (r.comment || '').toLowerCase();
      if (text.includes('food') || text.includes('taste') || text.includes('delicious') || text.includes('burger') || text.includes('pizza') || text.includes('chicken')) topics.push('food quality');
      if (text.includes('service') || text.includes('staff') || text.includes('friendly')) topics.push('service');
      if (text.includes('wait') || text.includes('slow') || text.includes('time') || text.includes('quick') || text.includes('fast')) topics.push('waiting time');
      if (text.includes('price') || text.includes('expensive') || text.includes('overpriced')) topics.push('price');
      if (text.includes('portion') || text.includes('size')) topics.push('portion size');
      if (text.includes('atmosphere') || text.includes('nice')) topics.push('atmosphere');
      if (topics.length === 0) topics.push('general');

      const score = r.sentiment === 'positive' ? 0.85 : r.sentiment === 'negative' ? 0.2 : 0.5;
      await pool.query(
        'INSERT INTO sentiment_results (review_id, sentiment, score, topics) VALUES (?, ?, ?, ?)',
        [r.id, r.sentiment, score, JSON.stringify(topics)]
      );
    }

    // ── Inventory Transactions (initial stock-in) ──
    const [ingredients] = await pool.query('SELECT id, current_stock FROM ingredients');
    for (const ing of ingredients) {
      await pool.query(
        'INSERT INTO inventory_transactions (ingredient_id, type, quantity, notes, created_at) VALUES (?, ?, ?, ?, ?)',
        [ing.id, 'in', ing.current_stock, 'Initial stock', '2026-07-01 08:00:00']
      );
    }

    console.log('✅ Database seeded successfully with sample data');
    console.log('   - 5 users (admin, kitchen, 3 customers)');
    console.log('   - 7 categories, 25 foods');
    console.log('   - 10 restaurant tables');
    console.log('   - 20 ingredients with food mappings');
    console.log('   - 32 orders (30 completed + 2 active)');
    console.log('   - 15 reviews with sentiment analysis');
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    // Don't throw - let the app continue without seed data
  }
}

module.exports = { seedDatabase };
