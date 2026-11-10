export const getQueueList = (response) => {
    const payload = response?.data?.data ?? response?.data ?? [];
    if (Array.isArray(payload)) return payload;
    return payload.queue || payload.items || payload.results || [];
};

export const getActiveQueueList = (response) => getQueueList(response).filter((item) => {
    const status = String(item?.status || 'WAITING').toUpperCase();
    return ['WAITING', 'IN_CONSULTATION'].includes(status);
});

export const getQueueStatusBadgeVariant = (status = '') => {
    const upper = String(status).toUpperCase();
    if (upper === 'COMPLETED') return 'success';
    if (upper === 'IN_CONSULTATION') return 'warning';
    if (upper === 'SKIPPED' || upper === 'CANCELLED') return 'danger';
    return 'info'; // WAITING
};
