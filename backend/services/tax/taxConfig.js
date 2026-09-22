module.exports = {
    SUPPORTED_COUNTRIES: {
        INDIA: 'India',
        USA: 'United States',
        UK: 'United Kingdom',
        CANADA: 'Canada',
        GERMANY: 'Germany'
    },
    COUNTRY_ALIASES: {
        'india': 'India',
        'in': 'India',
        'usa': 'United States',
        'us': 'United States',
        'united states': 'United States',
        'united states of america': 'United States',
        'uk': 'United Kingdom',
        'united kingdom': 'United Kingdom',
        'gb': 'United Kingdom',
        'great britain': 'United Kingdom',
        'canada': 'Canada',
        'ca': 'Canada',
        'germany': 'Germany',
        'de': 'Germany'
    },
    INDIA_TAX_CONFIG: {
        currency: 'INR',
        taxYear: 'AY 2026-27',
        regime: 'New Tax Regime',
        standardDeduction: 75000,
        section87ARebateMaxIncome: 1200000,
        cessRate: 0.04,
        slabs: [
            { min: 0, max: 400000, rate: 0.00 },
            { min: 400000, max: 800000, rate: 0.05 },
            { min: 800000, max: 1200000, rate: 0.10 },
            { min: 1200000, max: 1600000, rate: 0.15 },
            { min: 1600000, max: 2000000, rate: 0.20 },
            { min: 2000000, max: 2400000, rate: 0.25 },
            { min: 2400000, max: Infinity, rate: 0.30 }
        ]
    }
};
