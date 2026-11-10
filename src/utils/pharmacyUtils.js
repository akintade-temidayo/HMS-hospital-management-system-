/**
 * Formats numbers into Nigerian Naira currency string (₦).
 */
export const formatCurrency = (amount = 0) => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
    }).format(Number(amount) || 0);
};

/**
 * Safely extracts inventory or drug lists from API response envelopes.
 */
export const getPharmacyList = (response) => {
    const queue = [response?.data?.data, response?.data, response];
    const visited = new Set();
    let items = [];

    while (queue.length > 0) {
        const payload = queue.shift();
        if (!payload || typeof payload !== 'object' || visited.has(payload)) continue;
        if (Array.isArray(payload)) {
            items = payload;
            break;
        }
        visited.add(payload);
        for (const key of ['inventory', 'medications', 'items', 'results', 'data']) {
            if (payload[key]) queue.push(payload[key]);
        }
    }

    const firstValue = (...values) => values.find(
        (value) => value !== undefined && value !== null && (typeof value !== 'string' || value.trim() !== ''),
    );

    return items.map((item) => ({
        ...item,
        name: firstValue(item.name, item.itemName, item.item_name, item.medicationName, item.medication_name),
        quantity: firstValue(
            item.quantity,
            item.stockQuantity,
            item.stock_quantity,
            item.quantityInStock,
            item.quantity_in_stock,
        ),
        unitPrice: firstValue(item.unitPrice, item.unit_price, item.price),
        expiryDate: firstValue(item.expiryDate, item.expiry_date),
    }));
};

export const getPrescriptionList = (response) => {
    const queue = [response?.data?.data, response?.data, response];
    const visited = new Set();

    while (queue.length > 0) {
        const payload = queue.shift();
        if (!payload || typeof payload !== 'object' || visited.has(payload)) continue;
        if (Array.isArray(payload)) return payload;
        visited.add(payload);
        for (const key of ['prescriptions', 'items', 'results', 'records', 'data']) {
            if (payload[key]) queue.push(payload[key]);
        }
    }

    return [];
};

/**
 * Determines stock level badge variant based on remaining quantity.
 */
export const getStockStatusBadge = (quantity = 0) => {
    const qty = Number(quantity) || 0;
    if (qty === 0) return { label: 'Out of Stock', variant: 'danger' };
    if (qty <= 10) return { label: 'Low Stock', variant: 'warning' };
    return { label: 'In Stock', variant: 'success' };
};