const { INDIA_TAX_CONFIG, SUPPORTED_COUNTRIES } = require('./taxConfig');

/**
 * Calculates progressive individual salaried income tax for India under
 * the New Tax Regime for AY 2026-27 / FY 2025-26.
 * Note: This is an educational estimation tool, not official tax advice.
 * 
 * @param {number} annualSalary - Gross annual income in INR
 * @returns {object} Calculated tax breakdown
 */
exports.calculateIndiaTax = (annualSalary) => {
    const config = INDIA_TAX_CONFIG;
    
    // Calculate taxable salary after standard deduction
    const taxableSalary = Math.max(0, annualSalary - config.standardDeduction);
    
    // Progressive tax slab calculation
    let slabTax = 0;
    for (const slab of config.slabs) {
        if (taxableSalary > slab.min) {
            const taxableInSlab = Math.min(taxableSalary, slab.max) - slab.min;
            slabTax += taxableInSlab * slab.rate;
        }
    }
    
    // Section 87A rebate calculation
    // Under New Tax Regime (AY 2026-27), full tax rebate is provided if taxable income <= ₹12,00,000
    let rebate87A = 0;
    if (taxableSalary <= config.section87ARebateMaxIncome) {
        rebate87A = slabTax;
    }
    
    const taxAfterRebate = Math.max(0, slabTax - rebate87A);
    
    // Health & Education Cess (4%)
    const cess = taxAfterRebate * config.cessRate;
    
    // Total Estimated Tax Amount
    const estimatedTax = Math.round(taxAfterRebate + cess);
    
    // Effective Tax Rate (%)
    const effectiveTaxRate = Number(((estimatedTax / annualSalary) * 100).toFixed(2));
    
    // Annual Net Pay After Tax
    const annualNetAfterTax = annualSalary - estimatedTax;
    
    return {
        country: SUPPORTED_COUNTRIES.INDIA,
        currency: config.currency,
        annualSalary,
        estimatedTax,
        effectiveTaxRate,
        annualNetAfterTax,
        estimatedAnnualNetAfterTax: annualNetAfterTax,
        taxYear: config.taxYear,
        regime: config.regime,
        assumptions: config.assumptions,
        disclaimer: config.disclaimer
    };
};
