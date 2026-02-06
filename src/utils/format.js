const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
});

export const formatCurrency = (value) => {
    const numberValue = typeof value === 'string' ? Number(value) : value;
    if (!Number.isFinite(numberValue)) return '$0.00';
    return currencyFormatter.format(numberValue);
};

export const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
