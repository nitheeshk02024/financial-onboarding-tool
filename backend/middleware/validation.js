exports.validateSalaryInput = (req, res, next) => {
    const { annualCtc } = req.body;
    if (annualCtc !== undefined && (typeof annualCtc !== 'number' || annualCtc < 0)) {
        return res.status(400).json({ status: 'error', message: 'annualCtc must be a positive number' });
    }
    next();
};

exports.validateSalaryCalculation = (req, res, next) => {
    const { annualSalary, tax, insurance, otherDeductions } = req.body;

    if (annualSalary === undefined || typeof annualSalary !== 'number' || isNaN(annualSalary) || annualSalary <= 0) {
        return res.status(400).json({
            success: false,
            error: 'annualSalary is required and must be a number greater than 0'
        });
    }

    if (tax === undefined || typeof tax !== 'number' || isNaN(tax) || tax < 0) {
        return res.status(400).json({
            success: false,
            error: 'tax is required and must be a non-negative number'
        });
    }

    if (insurance === undefined || typeof insurance !== 'number' || isNaN(insurance) || insurance < 0) {
        return res.status(400).json({
            success: false,
            error: 'insurance is required and must be a non-negative number'
        });
    }

    if (otherDeductions === undefined || typeof otherDeductions !== 'number' || isNaN(otherDeductions) || otherDeductions < 0) {
        return res.status(400).json({
            success: false,
            error: 'otherDeductions is required and must be a non-negative number'
        });
    }

    next();
};

exports.validateInsuranceInput = (req, res, next) => {
    const { monthlyPremium, copayPercent } = req.body;
    if (monthlyPremium !== undefined && monthlyPremium < 0) {
        return res.status(400).json({ status: 'error', message: 'monthlyPremium must be >= 0' });
    }
    if (copayPercent !== undefined && (copayPercent < 0 || copayPercent > 100)) {
        return res.status(400).json({ status: 'error', message: 'copayPercent must be between 0 and 100' });
    }
    next();
};

exports.validateTaxInput = (req, res, next) => {
    const { annualSalary, country } = req.body;

    if (annualSalary === undefined || typeof annualSalary !== 'number' || isNaN(annualSalary) || !isFinite(annualSalary) || annualSalary <= 0) {
        return res.status(400).json({
            success: false,
            error: 'annualSalary is required and must be a number greater than 0'
        });
    }

    if (!country || typeof country !== 'string' || country.trim() === '') {
        return res.status(400).json({
            success: false,
            error: 'country is required and must be a valid string'
        });
    }

    next();
};

function validateSinglePlan(plan, prefix = '') {
    if (!plan || typeof plan !== 'object') {
        return `${prefix}plan object is required`;
    }
    const name = plan.name || plan.planName;
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return `${prefix}plan name is required`;
    }
    if (plan.monthlyPremium === undefined || typeof plan.monthlyPremium !== 'number' || isNaN(plan.monthlyPremium) || plan.monthlyPremium < 0) {
        return `${prefix}monthlyPremium is required and must be a non-negative number`;
    }
    if (plan.deductible === undefined || typeof plan.deductible !== 'number' || isNaN(plan.deductible) || plan.deductible < 0) {
        return `${prefix}deductible is required and must be a non-negative number`;
    }
    if (plan.outOfPocketMaximum === undefined || typeof plan.outOfPocketMaximum !== 'number' || isNaN(plan.outOfPocketMaximum) || plan.outOfPocketMaximum < 0) {
        return `${prefix}outOfPocketMaximum is required and must be a non-negative number`;
    }
    if (plan.outOfPocketMaximum < plan.deductible) {
        return `${prefix}outOfPocketMaximum cannot be less than deductible`;
    }
    return null;
}

exports.validateInsuranceSimulation = (req, res, next) => {
    const { plan, estimatedMedicalExpenses, scenario } = req.body;

    const planError = validateSinglePlan(plan);
    if (planError) {
        return res.status(400).json({ success: false, error: planError });
    }

    if (estimatedMedicalExpenses !== undefined && estimatedMedicalExpenses !== null) {
        if (typeof estimatedMedicalExpenses !== 'number' || isNaN(estimatedMedicalExpenses) || estimatedMedicalExpenses < 0) {
            return res.status(400).json({
                success: false,
                error: 'estimatedMedicalExpenses must be a non-negative number'
            });
        }
    } else if (!scenario) {
        return res.status(400).json({
            success: false,
            error: 'Either estimatedMedicalExpenses or scenario is required'
        });
    }

    next();
};

exports.validateInsuranceComparison = (req, res, next) => {
    const { plans, estimatedMedicalExpenses, scenario } = req.body;

    if (!Array.isArray(plans) || plans.length < 1) {
        return res.status(400).json({
            success: false,
            error: 'plans must be an array containing at least one plan'
        });
    }

    for (let i = 0; i < plans.length; i++) {
        const error = validateSinglePlan(plans[i], `Plan ${i + 1}: `);
        if (error) {
            return res.status(400).json({ success: false, error });
        }
    }

    if (estimatedMedicalExpenses !== undefined && estimatedMedicalExpenses !== null) {
        if (typeof estimatedMedicalExpenses !== 'number' || isNaN(estimatedMedicalExpenses) || estimatedMedicalExpenses < 0) {
            return res.status(400).json({
                success: false,
                error: 'estimatedMedicalExpenses must be a non-negative number'
            });
        }
    } else if (!scenario) {
        return res.status(400).json({
            success: false,
            error: 'Either estimatedMedicalExpenses or scenario is required'
        });
    }

    next();
};


