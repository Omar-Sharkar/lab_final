# How to Run the Smart Restaurant Management System

Follow these step-by-step instructions to set up and run the **Smart Restaurant Management System with AI Features** on your computer.

---

## 📋 Prerequisites

Before running the application, make sure you have the following installed:

1. **Node.js**: Version 18.0.0 or higher ([Download Node.js](https://nodejs.org/))
2. **MySQL Server**: Version 8.0 or higher (e.g., via MySQL Community Server, XAMPP, or WampServer)
3. **Google Gemini API Key**: Free tier API Key from [Google AI Studio](https://aistudio.google.com/)

---

## ⚙️ Step 1: Configure Environment Variables (.env)

Open the `.env` file located in the root of the `smart-restaurant` directory:

`smart-restaurant/.env`

Update your MySQL database password and Gemini API Key:

```env
# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=smart_restaurant

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note**:
> - If your MySQL `root` user has no password (e.g., default XAMPP setup), leave `DB_PASSWORD=` blank.
> - The database schema (`smart_restaurant`) and realistic seed data will be **created automatically** by the app when launched for the first time!

---

## 📦 Step 2: Install Node.js Dependencies

Open your command prompt or terminal in the project directory:

```bash
cd "d:\6th semester\Web Programming Lab\omar er shuna chuto\smart-restaurant"
```

Install all required npm dependencies:

```bash
npm install
```

---

## 🚀 Step 3: Launch the Web Application

To start the Web Application server, run:

```bash
npm start
```

Or for development mode:

```bash
npm run dev
```

Once started, open your web browser (Chrome, Edge, Firefox, Safari) and navigate to:

👉 **`http://localhost:3000`**

*(Note: Electron desktop mode remains available via `npm run start:electron` if needed)*

---

## 🔑 Demo Login Credentials

The system comes pre-seeded with 3 demo user roles for instant testing:

| User Role | Email | Password | Quick Demo Button |
|-----------|-------|----------|-------------------|
| **Admin / Manager** | `admin@restaurant.com` | `admin123` | Click **Admin** on login screen |
| **Kitchen Staff** | `kitchen@restaurant.com` | `kitchen123` | Click **Kitchen** on login screen |
| **Customer** | `john@example.com` or `customer@restaurant.com` | `customer123` | Click **Customer** on login screen |

---

## 🧪 Step 4: Testing the Main Workflow

1. **Log in as Customer**:
   - Go to **Digital Menu**.
   - Use the **Simulated Table Scan** dropdown at the top right to select **Table #1**.
   - Click **AI Recommendations** to see personalized picks.
   - Add items (e.g. *Classic Beef Burger*, *Coca Cola*) to cart and click **Place Order Now**.

2. **Log in as Kitchen Staff**:
   - Go to **Kitchen Display System**.
   - Click **Accept Order** → **Start Preparing** → **Mark Ready** → **Complete Order**.

3. **View Bill & Submit Review**:
   - Log back in as Customer -> Click **View Itemized Bill** or **Leave a Review**.

4. **Log in as Admin**:
   - View **Overview Dashboard** (Revenue, 30-Day Sales Chart, Top Foods).
   - Go to **AI Intelligence Hub** to see:
     - **Demand Prediction** (Est. 7-day order volumes per food)
     - **Inventory Run-Out Forecast** (Alerts for low stock ingredients)
     - **Customer Review Sentiment Analysis** (Positive/Neutral/Negative breakdown & common topics)
   - Go to **AI Chatbot** and ask questions like *"What is the price of Chicken Burger?"*

---

## ❓ Troubleshooting

### Issue 1: `ECONNREFUSED 127.0.0.1:3306` (MySQL Connection Failed)
- **Cause**: MySQL server is not running or running on a different port.
- **Solution**: 
  - Ensure MySQL service is started (e.g., start MySQL module in XAMPP Control Panel).
  - Verify `DB_PORT`, `DB_USER`, and `DB_PASSWORD` in your `.env` match your local MySQL installation.

### Issue 2: `npm is not recognized as an internal or external command`
- **Cause**: Node.js is not added to your Windows system PATH environment variable.
- **Solution**: Install Node.js from [nodejs.org](https://nodejs.org/) and check *"Add to PATH"* during installation.

### Issue 3: Gemini AI responses show fallback messages
- **Cause**: Invalid or missing Gemini API Key in `.env`.
- **Solution**: Get a free key from [Google AI Studio](https://aistudio.google.com/) and paste it into `.env` under `GEMINI_API_KEY=...`.
