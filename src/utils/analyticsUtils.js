export const getAnalyticsData = (response) => {
    return response?.data?.data ?? response?.data ?? {};
};

export const normalizeCmdDashboard = (data = {}) => {
    const numberFrom = (...values) => {
        const value = values.find((candidate) => candidate !== undefined && candidate !== null);
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    };

    const revenue = numberFrom(data.revenue, data.totalRevenue, data.total_revenue, data.revenueRealized, data.revenue_realized);
    const expenses = numberFrom(data.operatingExpenses, data.operating_expenses, data.expenses, data.totalExpenses, data.total_expenses, data.budgetTotal, data.budget_total);

    return {
        ...data,
        revenue,
        expenses,
        netOperatingIncome: numberFrom(data.netOperatingIncome, data.net_operating_income, data.netIncome, data.net_income, revenue - expenses),
        totalPatients: numberFrom(data.patientVolume, data.patient_volume, data.totalPatients, data.total_patients, data.patientCount, data.patient_count),
        activeAppointments: numberFrom(data.activeAppointments, data.active_appointments, data.appointmentCount, data.appointment_count),
    };
};

export const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₦0.00';
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
};

export const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat('en-US').format(num);
};
