const { GERMANY_TAX_CONFIG, SUPPORTED_COUNTRIES } = require('./taxConfig');

/**
 * Calculates progressive individual income tax for Germany using the official BMF 2026 tariff formulas (Einkommensteuertarif 2026).
 * @param {number} annualSalary - Gross annual income in EUR
 * @returns {object} Calculated Germany tax details
 */
exports.calculateGermanyTax = (annualSalary) => {
    const config = GERMANY_TAX_CONFIG;
    
    // Taxable income (zvE)
    const x = annualSalary;
    let estimatedTax = 0;
    
    // Official BMF 2026 formula (Tarifzonen)
    if (x <= config.grundfreibetrag) {
        estimatedTax = 0;
    } else if (x <= 17005) {
        const y = (x - config.grundfreibetrag) / 10000;
        estimatedTax = (995.21 * y + 1400) * y;
    } else if (x <= 66760) {
        const z = (x - 17005) / 10000;
        estimatedTax = (208.85 * z + 2397) * z + 1014;
    } else if (x <= 277825) {
        estimatedTax = 0.42 * x - 10636;
    } else {
        estimatedTax = 0.45 * x - 18971;
    }
    
    estimatedTax = Math.round(Math.max(0, estimatedTax));
    const effectiveTaxRate = Number(((estimatedTax / annualSalary) * 100).toFixed(2));
    const estimatedAnnualNetAfterTax = annualSalary - estimatedTax;
    
    return {
        country: SUPPORTED_COUNTRIES.GERMANY,
        currency: config.currency,
        annualSalary,
        estimatedTax,
        effectiveTaxRate,
        estimatedAnnualNetAfterTax,
        taxYear: config.taxYear,
        assumptions: config.assumptions,
        disclaimer: config.disclaimer
    };
};
