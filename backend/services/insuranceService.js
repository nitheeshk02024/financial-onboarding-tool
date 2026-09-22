const db = require('../config/database');

exports.getAllInsurancePlans = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM insurance_plans ORDER BY created_at DESC', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};
