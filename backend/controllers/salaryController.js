const salaryService = require('../services/salaryService');

exports.getSalaries = async (req, res) => {
    try {
        const salaries = await salaryService.getAllSalaries();
        res.json({ status: 'success', data: salaries });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};
