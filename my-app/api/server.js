const express = require("express");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;
const SECRET_KEY = "supersecretkey"; // Change this in production

// Connect to SQLite database
const db = new Database(__dirname + "/../Database/database.sqlite", { verbose: console.log });

console.log("✅ Connected to database.");

// Ensure users table exists
db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
                                         id INTEGER PRIMARY KEY AUTOINCREMENT,
                                         name TEXT NOT NULL,
                                         email TEXT UNIQUE NOT NULL,
                                         password TEXT NOT NULL,
                                         phone TEXT,
                                         address TEXT,
                                         cardnumber TEXT,
                                         carddate DATE,
                                         cvv TEXT
    )
`).run();
console.log("✅ Users table ensured.");

// Ensure products table exists
db.prepare(`
    CREATE TABLE IF NOT EXISTS products (
                                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                                            name TEXT NOT NULL,
                                            category TEXT NOT NULL,
                                            price REAL NOT NULL,
                                            imagelink TEXT NOT NULL,
                                            numberofunits INTEGER
    )
`).run();
console.log("✅ Products table ensured.");

db.prepare(`
    CREATE TABLE IF NOT EXISTS tickets (
                                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                                            description TEXT,
                                            status TEXT
    )
`).run();
console.log("✅ Tickets table ensured.");

db.prepare(`
    CREATE TABLE IF NOT EXISTS orders (
                                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                                          userid INTEGER,
                                          productid INTEGER,
                                          price TEXT,
                                          address TEXT,
                                          numberofunits INTEGER
    );
`).run();
console.log("✅ Orders table ensured.");


db.prepare(`
    CREATE TABLE IF NOT EXISTS privileges (
                                              id INTEGER PRIMARY KEY AUTOINCREMENT,
                                              password TEXT NOT NULL
    );
`).run();
console.log("✅ Orders table ensured.");



// Middleware
app.use(cors());
app.use(express.json());

// Get all open tickets
app.get("/tickets", (req, res) => {
    const tickets = db.prepare("SELECT * FROM tickets WHERE status = 'OPEN'").all();
    res.json(tickets);
});

// Close a ticket
app.post("/tickets/:id/close", (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare("UPDATE tickets SET status = 'CLOSED' WHERE id = ?");
    const result = stmt.run(id);

    if (result.changes > 0) {
        res.json({ message: `Ticket ${id} closed successfully.` });
    } else {
        res.status(404).json({ error: "Ticket not found or already closed." });
    }
});


app.get("/inventory", (req, res) => {
    try {
        const products = db.prepare("SELECT * FROM products").all();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/inventory/add", (req, res) => {
    const { name, category, price, units } = req.body;
    if (!name || !category || !price || !units) {
        return res.status(400).json({ error: "Missing product details" });
    }
    try {
        const stmt = db.prepare("INSERT INTO products (name, category, price, imagelink, numberofunits) VALUES (?, ?, ?, ?, ?)");
        stmt.run(name, category, price, units);
        res.json({ message: "Product added successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/customers", (req, res) => {
    const customers = db.prepare("SELECT id, name, phone, address FROM users").all();
    res.json(customers);
});

app.get("/orders/summary", (req, res) => {
    try {
        const summary = db.prepare("SELECT COUNT(id) as totalOrders, SUM(price * numberofunits) as totalAmount FROM orders").get();
        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const validateAdminCredentials = (id, password) => {
    try {
        const admin = db.prepare("SELECT * FROM privileges WHERE id = ?").get(id);

        if (!admin || admin.password !== password) {
            return { success: false, error: "Invalid Admin Credentials" };
        }

        return { success: true, admin };
    } catch (error) {
        console.error("Admin validation error:", error);
        return { success: false, error: "Internal Server Error" };
    }
};

//Admin auth
app.post("/loginadmin", (req, res) => {
    const { id, password } = req.body;

    const result = validateAdminCredentials(id, password);

    if (!result.success) {
        return res.status(401).json({ success: false, error: result.error });
    }

    const token = jwt.sign({ adminId: result.admin.id }, SECRET_KEY, { expiresIn: "2h" });

    res.json({ success: true, token, admin: { id: result.admin.id } });
});




// **🔵 Register User (Signup)**
app.post("/register", async (req, res) => {
    const { name, email, password, phone, address } = req.body;

    try {
        const checkStmt = db.prepare("SELECT * FROM users WHERE email = ?");
        if (checkStmt.get(email)) {
            return res.status(400).json({ error: "Email already in use" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const insertStmt = db.prepare("INSERT INTO users (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)");
        insertStmt.run(name, email, hashedPassword, phone, address);

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// **🟢 Login User**
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const userStmt = db.prepare("SELECT * FROM users WHERE email = ?");
        const user = userStmt.get(email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: "2h" });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// **🟣 Get Profile (Protected Route)**
app.get("/profile", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const userStmt = db.prepare("SELECT id, name, email FROM users WHERE id = ?");
        const user = userStmt.get(decoded.id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Profile error:", error);
        res.status(401).json({ error: "Invalid token" });
    }
});

// **🛍 Get Products**
app.get("/products", (req, res) => {
    try {
        const products = db.prepare("SELECT id, name, category, price, imagelink AS image_url FROM products").all();
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

// **Start Server**
app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
});
