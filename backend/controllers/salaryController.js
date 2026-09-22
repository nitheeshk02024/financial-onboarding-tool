const salaryService = require('../services/salaryService');

exports.getSalaries = async (req, res) => {
    try {
        const salaries = await salaryService.getAllSalaries();
        res.json({ status: 'success', data: salaries });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.calculateSalary = (req, res) => {
    try {
        const { annualSalary, tax, insurance, otherDeductions } = req.body;
        const result = salaryService.calculateUserSalary({
            annualSalary,
            tax,
            insurance,
            otherDeductions
        });

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
};
