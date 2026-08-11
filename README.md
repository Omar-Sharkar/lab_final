# Smart Restaurant Management System with AI Features

A full-stack **Web Application** built for a University Software Engineering Project. It provides a complete restaurant management platform covering digital menu browsing, QR table ordering, kitchen display system (KDS), automated billing, raw inventory control, customer feedback, and 5 AI-powered features using the **Google Gemini API**.

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Web Server** | Node.js + Express.js + `express-session` |
| **Client Frontend** | HTML5, CSS3, Vanilla JavaScript, Bootstrap 5 |
| **Data Visualization** | Chart.js |
| **Backend & Logic** | Node.js (`AsyncLocalStorage` Session Context) |
| **Database** | MySQL 8.0+ (`mysql2/promise`) |
| **AI Integration** | Google Gemini API (`@google/generative-ai`) |
| **Authentication** | `bcryptjs` (Password hashing) + Express Session |
| **QR Code** | `qrcode` package |

---

## 🏗️ Application Architecture & Security

```
smart-restaurant/
├── server.js                 # Express Web Server & RPC API router
├── main.js                   # Optional Electron desktop process
├── preload.js                # Optional Electron contextBridge
├── .env / .env.example       # Environment variables
├── database/
│   └── schema.sql            # MySQL table structure (14 tables)
└── src/
    ├── main/                 # Node.js backend logic
    │   ├── database/         # MySQL connection pool & seed
    │   ├── ipc/              # Business logic handlers (Auth, Foods, Orders, AI...)
    │   ├── services/         # Gemini AI Service
    │   └── utils/            # AsyncLocalStorage Session & helpers
    └── renderer/             # Web Frontend SPA
        ├── index.html        # Web Shell HTML
        ├── css/              # Custom styling
        ├── js/
        │   ├── api.js        # Web API Client Bridge (window.api)
        │   ├── app.js        # Hash-based SPA Router
        │   ├── utils.js      # Toast, Cart Manager & Modals
        │   ├── components/   # Navbar & Sidebar
        │   └── pages/        # Customer, Admin, Kitchen page modules
```

**Security Measures:**
- `contextIsolation: true`
- `nodeIntegration: false`
- Renderer process accesses database and Gemini API strictly through `preload.js` and `ipcRenderer.invoke()`.
- API Keys and database credentials are stored in `.env` server-side and never exposed to the frontend.

---

## 🔑 Demo Credentials

| Role | Email | Password | Allowed Access |
|------|-------|----------|----------------|
| **Admin / Manager** | `admin@restaurant.com` | `admin123` | Full Admin Dashboard, Foods, Inventory, Reports, AI Hub |
| **Kitchen Staff** | `kitchen@restaurant.com` | `kitchen123` | Kitchen Display System (Live Orders Board) |
| **Customer** | `customer@restaurant.com` | `customer123` | Digital Menu, QR Table Ordering, Cart, Chatbot, AI Picks |

---

## 🤖 Implemented AI Features (Google Gemini API)

1. **AI Food Recommendations**: Recommends personalized menu items based on customer order history, category preferences, and popular dishes.
2. **AI Restaurant Chatbot**: Gemini-powered chatbot trained on actual menu items, prices, and order status without inventing false dishes.
3. **Food Demand Prediction**: Analyzes 30-day order velocity to predict next-period demand (High/Medium/Low) to reduce food waste.
4. **Inventory Run-Out Forecast**: Predicts which raw ingredients will run empty soon based on usage rates and alerts the admin.
5. **Customer Review Sentiment Analysis**: Classifies reviews as Positive/Neutral/Negative and extracts key topics (food quality, service, wait time).

> *Note: If the Gemini API key is missing or rate-limited, the application automatically falls back to intelligent built-in statistical algorithms without breaking core restaurant operations.*

---

## ⚙️ Setup & Installation Instructions

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MySQL Server**: v8.0+ running on `localhost:3306`

### 2. Database Configuration
Ensure MySQL is running on your machine.
Create a `.env` file from `.env.example`:

```bash
# Copy example env
cp .env.example .env
```

Edit `.env` with your MySQL credentials and Gemini API Key:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=smart_restaurant

GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Install Dependencies
Navigate into the project directory and install npm packages:

```bash
cd smart-restaurant
npm install
```

### 4. Run the Application
Start the Electron desktop application:

```bash
npm start
```

For developer tools mode:

```bash
npm run dev
```

> *The database schema and demo seed data will automatically initialize upon first app launch!*

---

## 🧪 24-Step End-to-End Verification Checklist

1. Launch application -> App initializes MySQL database & seed data automatically.
2. Login as Customer (`customer@restaurant.com` / `customer123`) or use the Quick Demo Login buttons.
3. Select Table #1 using the Simulated QR Table Selector.
4. Browse Digital Menu -> Filter by category or search.
5. Click **AI Recommendations** -> View personalized food suggestions.
6. Add items (e.g. Classic Beef Burger, Coca Cola) to Cart.
7. Open Cart -> Add kitchen notes -> Click **Place Order Now**.
8. Order status opens on Live Order Tracker -> Shows status: **Pending**.
9. Log in as Kitchen Staff (`kitchen@restaurant.com` / `kitchen123`).
10. Open Kitchen Display System -> Accept order (**Confirmed**) -> Mark **Preparing** -> Mark **Ready**.
11. Customer tracker updates in real-time -> Mark **Completed** in Kitchen.
12. Customer views itemized Bill receipt with tax breakdown & print option.
13. Customer submits 5-star rating and written review.
14. Log in as Admin (`admin@restaurant.com` / `admin123`).
15. View Admin Dashboard -> Revenue totals, 30-day sales chart, top foods.
16. Go to **AI Analytics Hub**:
    - **Demand Prediction**: View predicted order numbers per food item.
    - **Inventory Prediction**: View run-out alerts for ingredients.
    - **Sentiment Analysis**: View review sentiment breakdown and common praised/complained topics.
17. Open **Inventory Management** -> Click **Restock** -> Add stock quantity -> Verify current stock updates.
18. Test **AI Chatbot** -> Ask: *"What is the price of Chicken Burger?"* or *"What do you recommend?"* -> Receive accurate response based on restaurant database.
