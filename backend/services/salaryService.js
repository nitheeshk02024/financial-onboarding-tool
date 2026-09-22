const db = require('../config/database');

exports.getAllSalaries = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM salaries ORDER BY created_at DESC', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};
