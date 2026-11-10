const NOTIFICATIONS_REFRESH_EVENT = 'hms:notifications-refresh';
const TASKS_REFRESH_EVENT = 'hms:tasks-refresh';

export const requestNotificationsRefresh = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(NOTIFICATIONS_REFRESH_EVENT));
    }
};

export const subscribeToNotificationsRefresh = (callback) => {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener(NOTIFICATIONS_REFRESH_EVENT, callback);
    return () => window.removeEventListener(NOTIFICATIONS_REFRESH_EVENT, callback);
};

export const requestTasksRefresh = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(TASKS_REFRESH_EVENT));
    }
};

export const subscribeToTasksRefresh = (callback) => {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener(TASKS_REFRESH_EVENT, callback);
    return () => window.removeEventListener(TASKS_REFRESH_EVENT, callback);
};
