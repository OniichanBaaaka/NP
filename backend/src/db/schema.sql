-- ========================================================
-- XIV STUDIO Database Schema
-- 7 Main Tables: xiv_users, xiv_categories, xiv_products,
--                xiv_orders, xiv_faqs, xiv_cart, xiv_wishlist
-- ========================================================

-- 1. Table: xiv_users
CREATE TABLE IF NOT EXISTS xiv_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('customer', 'employee', 'admin')) DEFAULT 'customer',
    phone TEXT,
    address TEXT,
    avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table: xiv_categories
CREATE TABLE IF NOT EXISTS xiv_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table: xiv_products
CREATE TABLE IF NOT EXISTS xiv_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    categoryId INTEGER NOT NULL,
    price REAL NOT NULL,
    salePrice REAL,
    stock INTEGER NOT NULL DEFAULT 0,
    soldCount INTEGER NOT NULL DEFAULT 0,
    images TEXT NOT NULL, -- JSON array of image URLs
    shortDescription TEXT,
    description TEXT,
    tags TEXT, -- JSON array of tags (e.g. ["streetwear", "oversized", "hoodie"])
    isFeatured INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoryId) REFERENCES xiv_categories (id) ON DELETE RESTRICT
);

-- 4. Table: xiv_orders
CREATE TABLE IF NOT EXISTS xiv_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderCode TEXT UNIQUE NOT NULL,
    userId INTEGER,
    customerInfo TEXT NOT NULL, -- JSON object: { name, email, phone, address, note }
    items TEXT NOT NULL, -- JSON array: [{ productId, name, price, quantity, size, image, sku }]
    totalAmount REAL NOT NULL,
    paymentMethod TEXT NOT NULL CHECK (paymentMethod IN ('vietqr', 'cod')),
    paymentStatus TEXT NOT NULL CHECK (paymentStatus IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
    orderStatus TEXT NOT NULL CHECK (orderStatus IN ('pending', 'confirmed', 'delivering', 'completed', 'cancelled')) DEFAULT 'pending',
    vietqrData TEXT, -- JSON object: { qrUrl, accountNo, bankCode, addInfo, amount }
    statusHistory TEXT, -- JSON array: [{ status, timestamp, note, updatedBy }]
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES xiv_users (id) ON DELETE SET NULL
);

-- 5. Table: xiv_faqs
CREATE TABLE IF NOT EXISTS xiv_faqs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Table: xiv_cart
CREATE TABLE IF NOT EXISTS xiv_cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    sessionId TEXT,
    items TEXT NOT NULL DEFAULT '[]', -- JSON array of cart items
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES xiv_users (id) ON DELETE CASCADE
);

-- 7. Table: xiv_wishlist
CREATE TABLE IF NOT EXISTS xiv_wishlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    productId INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(userId, productId),
    FOREIGN KEY (userId) REFERENCES xiv_users (id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES xiv_products (id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON xiv_products(categoryId);
CREATE INDEX IF NOT EXISTS idx_products_stock ON xiv_products(stock);
CREATE INDEX IF NOT EXISTS idx_orders_status ON xiv_orders(orderStatus);
CREATE INDEX IF NOT EXISTS idx_orders_user ON xiv_orders(userId);
CREATE INDEX IF NOT EXISTS idx_orders_code ON xiv_orders(orderCode);
