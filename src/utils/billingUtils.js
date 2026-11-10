export const formatCurrency = (amount = 0) => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
    }).format(Number(amount) || 0);
};

export const getInvoiceList = (response) => {
    const payload = response?.data?.data ?? response?.data ?? [];
    if (Array.isArray(payload)) return payload;
    return payload.invoices || payload.items || payload.results || [];
};

export const getExpenseList = (response) => {
    const payload = response?.data?.data ?? response?.data ?? [];
    if (Array.isArray(payload)) return payload;
    return payload.expenses || payload.items || payload.results || [];
};

export const getInvoiceBadgeVariant = (status = '') => {
    const upper = String(status).toUpperCase();
    if (upper === 'PAID') return 'success';
    if (upper === 'PARTIAL') return 'warning';
    if (upper === 'OVERDUE') return 'danger';
    return 'info'; // PENDING / UNPAID
};