const db = require('../config/database');

exports.getAllSalaries = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM salaries ORDER BY created_at DESC', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

exports.calculateUserSalary = ({ annualSalary, tax, insurance, otherDeductions }) => {
    const totalDeductions = tax + insurance + otherDeductions;
    const annualNetPay = annualSalary - totalDeductions;
    const monthlyGrossPay = annualSalary / 12;
    const monthlyNetPay = annualNetPay / 12;

    return {
        annualSalary,
        totalDeductions,
        annualNetPay,
        monthlyGrossPay,
        monthlyNetPay
    };
};
