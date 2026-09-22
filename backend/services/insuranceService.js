const db = require('../config/database');

const SCENARIO_BENCHMARKS = {
    LOW_USAGE: 10000,
    MEDIUM_USAGE: 30000,
    HIGH_USAGE: 150000
};

/**
 * Classifies medical expenses into usage scenario level
 */
function classifyScenario(expenses) {
    if (expenses <= 15000) return 'LOW_USAGE';
    if (expenses <= 50000) return 'MEDIUM_USAGE';
    return 'HIGH_USAGE';
}

/**
 * Calculates estimated annual healthcare costs for a single insurance plan.
 * 
 * Educational Calculation Model:
 * 1. annualPremium = monthlyPremium * 12
 * 2. deductiblePaid = min(estimatedMedicalExpenses, deductible)
 * 3. postDeductibleExpenses = max(0, estimatedMedicalExpenses - deductible)
 * 4. postDeductibleUserShare = postDeductibleExpenses * (copayPercent / 100)
 * 5. totalUserMedicalCost = min(outOfPocketMaximum, deductiblePaid + postDeductibleUserShare)
 * 6. totalEstimatedAnnualCost = annualPremium + totalUserMedicalCost
 */
function calculateSinglePlanCost(plan, estimatedMedicalExpenses, scenarioInput) {
    const planName = plan.name || plan.planName || 'Insurance Plan';
    const monthlyPremium = Number(plan.monthlyPremium);
    const deductible = Number(plan.deductible);
    const outOfPocketMaximum = Number(plan.outOfPocketMaximum);
    const copayPercent = plan.copayPercent !== undefined ? Number(plan.copayPercent) : 0;

    let expenses = estimatedMedicalExpenses;
    let scenario = scenarioInput;

    if (expenses === undefined || expenses === null) {
        const normScenario = scenario ? String(scenario).toUpperCase().trim() : 'MEDIUM_USAGE';
        if (normScenario.includes('LOW')) {
            scenario = 'LOW_USAGE';
            expenses = SCENARIO_BENCHMARKS.LOW_USAGE;
        } else if (normScenario.includes('HIGH')) {
            scenario = 'HIGH_USAGE';
            expenses = SCENARIO_BENCHMARKS.HIGH_USAGE;
        } else {
            scenario = 'MEDIUM_USAGE';
            expenses = SCENARIO_BENCHMARKS.MEDIUM_USAGE;
        }
    } else {
        expenses = Number(expenses);
        scenario = classifyScenario(expenses);
    }

    const annualPremium = monthlyPremium * 12;

    // Out-of-pocket medical expense calculation
    const deductiblePaid = Math.min(expenses, deductible);
    const postDeductibleExpenses = Math.max(0, expenses - deductible);
    const postDeductibleUserShare = postDeductibleExpenses * (copayPercent / 100);

    const totalUserMedicalCost = Math.min(outOfPocketMaximum, deductiblePaid + postDeductibleUserShare);
    const estimatedAnnualHealthcareCost = annualPremium + totalUserMedicalCost;

    return {
        planName,
        monthlyPremium,
        annualPremium,
        deductible,
        outOfPocketMaximum,
        estimatedMedicalExpenses: expenses,
        estimatedAnnualHealthcareCost,
        scenario
    };
}

exports.getAllInsurancePlans = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM insurance_plans ORDER BY created_at DESC', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

exports.simulateInsurancePlan = ({ plan, estimatedMedicalExpenses, scenario }) => {
    const result = calculateSinglePlanCost(plan, estimatedMedicalExpenses, scenario);
    return {
        success: true,
        data: result
    };
};

exports.compareInsurancePlans = ({ plans, estimatedMedicalExpenses, scenario }) => {
    let resolvedExpenses = estimatedMedicalExpenses;
    let resolvedScenario = scenario;

    if (resolvedExpenses === undefined || resolvedExpenses === null) {
        const normScenario = scenario ? String(scenario).toUpperCase().trim() : 'MEDIUM_USAGE';
        if (normScenario.includes('LOW')) {
            resolvedScenario = 'LOW_USAGE';
            resolvedExpenses = SCENARIO_BENCHMARKS.LOW_USAGE;
        } else if (normScenario.includes('HIGH')) {
            resolvedScenario = 'HIGH_USAGE';
            resolvedExpenses = SCENARIO_BENCHMARKS.HIGH_USAGE;
        } else {
            resolvedScenario = 'MEDIUM_USAGE';
            resolvedExpenses = SCENARIO_BENCHMARKS.MEDIUM_USAGE;
        }
    } else {
        resolvedExpenses = Number(resolvedExpenses);
        resolvedScenario = classifyScenario(resolvedExpenses);
    }

    const comparisons = plans.map(plan => calculateSinglePlanCost(plan, resolvedExpenses, resolvedScenario));

    return {
        success: true,
        data: {
            estimatedMedicalExpenses: resolvedExpenses,
            scenario: resolvedScenario,
            comparisons,
            note: "This comparison presents calculated estimated annual costs for educational reference. The optimal plan depends on your personal health usage expectations, risk tolerance, and preference for fixed vs. out-of-pocket costs."
        }
    };
};
