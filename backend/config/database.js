const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const dbPath = path.resolve(__dirname, '..', process.env.DB_PATH || 'employease.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Failed to connect to SQLite database:', err.message);
    } else {
        console.log(`✅ Connected to SQLite database at: ${dbPath}`);
        initDatabaseSchema();
    }
});

function initDatabaseSchema() {
    db.serialize(() => {
        // Salaries table
        db.run(`
            CREATE TABLE IF NOT EXISTS salaries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                annual_ctc REAL NOT NULL,
                basic_percent REAL DEFAULT 50,
                hra_percent REAL DEFAULT 20,
                epf_percent REAL DEFAULT 12,
                regime TEXT DEFAULT 'new',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Insurance plans table
        db.run(`
            CREATE TABLE IF NOT EXISTS insurance_plans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                plan_name TEXT NOT NULL,
                plan_type TEXT,
                monthly_premium REAL NOT NULL,
                annual_deductible REAL NOT NULL,
                copay_percent REAL NOT NULL,
                out_of_pocket_max REAL NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Documents table
        db.run(`
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                filepath TEXT NOT NULL,
                parsed_status TEXT DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    });
}

module.exports = db;
