// Tax Service foundation
exports.calculateTax = async (ctc, regime = 'new') => {
    return {
        ctc,
        regime,
        note: 'Tax calculation service foundation ready'
    };
};
