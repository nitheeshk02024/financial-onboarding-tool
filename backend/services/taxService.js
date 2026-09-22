const taxConfig = require('./tax/taxConfig');
const { calculateIndiaTax } = require('./tax/indiaTax');
const { calculateUsaTax } = require('./tax/usaTax');
const { calculateUkTax } = require('./tax/ukTax');
const { calculateCanadaTax } = require('./tax/canadaTax');
const { calculateGermanyTax } = require('./tax/germanyTax');

/**
 * Main tax service dispatcher for multi-country calculations.
 * @param {object} param0
 * @param {number} param0.annualSalary
 * @param {string} param0.country
 * @returns {object} calculation result
 */
exports.calculateTax = async ({ annualSalary, country }) => {
    if (!country || typeof country !== 'string') {
        return {
            success: false,
            message: "Country is required."
        };
    }

    const normalizedCountry = country.trim().toLowerCase();
    const resolvedCountry = taxConfig.COUNTRY_ALIASES[normalizedCountry];

    if (resolvedCountry === taxConfig.SUPPORTED_COUNTRIES.INDIA) {
        const data = calculateIndiaTax(annualSalary);
        return {
            success: true,
            data
        };
    }

    if (resolvedCountry === taxConfig.SUPPORTED_COUNTRIES.USA) {
        const data = calculateUsaTax(annualSalary);
        return {
            success: true,
            data
        };
    }

    if (resolvedCountry === taxConfig.SUPPORTED_COUNTRIES.UK) {
        const data = calculateUkTax(annualSalary);
        return {
            success: true,
            data
        };
    }

    if (resolvedCountry === taxConfig.SUPPORTED_COUNTRIES.CANADA) {
        const data = calculateCanadaTax(annualSalary);
        return {
            success: true,
            data
        };
    }

    if (resolvedCountry === taxConfig.SUPPORTED_COUNTRIES.GERMANY) {
        const data = calculateGermanyTax(annualSalary);
        return {
            success: true,
            data
        };
    }

    return {
        success: false,
        message: "Tax calculation for this country is not yet implemented."
    };
};
