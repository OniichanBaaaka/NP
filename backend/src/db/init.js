const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const { seedDatabase } = require('./seed');

function initDatabase() {
  try {
    console.log('--- Initializing SQLite Schema ---');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Thực thi các câu lệnh tạo bảng
    db.exec(schemaSql);
    console.log('Schema created/verified successfully!');

    // Seed data mẫu
    seedDatabase(db);
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };
