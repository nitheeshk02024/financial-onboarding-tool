const taxService = require('../services/taxService');

exports.calculateTax = async (req, res) => {
    try {
        const { annualSalary, country } = req.body;
        const result = await taxService.calculateTax({ annualSalary, country });

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'An internal server error occurred while calculating tax.'
        });
    }
};
