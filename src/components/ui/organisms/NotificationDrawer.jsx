'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/atoms/Button';
import { X, Bell, CheckCheck, Check, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { subscribeToNotificationsRefresh } from '@/utils/notificationEvents';

const getNotificationId = (notification) => notification.id || notification._id || notification.notificationId || notification.notification_id;

export const NotificationDrawer = ({ isOpen, onClose, onNotificationUpdate }) => {
const [notifications, setNotifications] = useState([]);
const [loading, setLoading] = useState(false);

const fetchNotifications = useCallback(async ({ quiet = false } = {}) => {
    try {
    setLoading(true);
    const res = await api.get('/notifications');
    const payload = res.data?.data ?? res.data ?? [];
    const list = Array.isArray(payload) ? payload : payload.notifications || payload.items || payload.results || [];
    setNotifications(list);
    } catch (err) {
    if (!quiet) toast.error('Failed to load notifications.');
    } finally {
    setLoading(false);
    }
}, []);

useEffect(() => {
    if (!isOpen) return undefined;
    const initialFetchTimeout = window.setTimeout(() => fetchNotifications(), 0);
    const unsubscribe = subscribeToNotificationsRefresh(() => fetchNotifications({ quiet: true }));
    const timer = window.setInterval(() => fetchNotifications({ quiet: true }), 30_000);
    return () => {
        window.clearTimeout(initialFetchTimeout);
        unsubscribe();
        window.clearInterval(timer);
    };
}, [isOpen, fetchNotifications]);

const handleMarkAsRead = async (id) => {
    if (!id) {
    toast.error('This notification is missing its ID, so it cannot be marked as read.');
    return;
    }
    try {
    await api.patch(`/notifications/${encodeURIComponent(id)}/read`);
    setNotifications((prev) =>
        prev.map((n) => (String(getNotificationId(n)) === String(id) ? { ...n, isRead: true, is_read: true } : n))
    );
    if (onNotificationUpdate) onNotificationUpdate();
    } catch (err) {
    toast.error(err?.message || 'Failed to mark notification as read.');
    }
};

const handleMarkAllAsRead = async () => {
    try {
    await api.patch('/notifications/read-all');
    setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, is_read: true }))
    );
    toast.success('All notifications marked as read.');
    if (onNotificationUpdate) onNotificationUpdate();
    } catch (err) {
    toast.error('Failed to mark all as read.');
    }
};

if (!isOpen) return null;

return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
    <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 text-(--primary-color)">
            <Bell size={18} />
            </div>
            <div>
            <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
            </div>
        </div>
        <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
        >
            <X size={18} />
        </button>
        </div>

        {/* Actions Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">
            {notifications.filter((n) => !(n.isRead || n.is_read || n.read_at || n.readAt)).length} unread
        </span>
        <button
            onClick={handleMarkAllAsRead}
            className="text-xs font-bold text-(--primary-color) hover:underline flex items-center gap-1"
        >
            <CheckCheck size={14} />
            <span>Mark all as read</span>
        </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
            No notifications found.
            </div>
        ) : (
            notifications.map((n) => {
            const id = getNotificationId(n);
            const isRead = n.isRead || n.is_read || n.read_at || n.readAt;
            return (
                <div
                key={id}
                className={`p-4 rounded-2xl border transition-all flex flex-col gap-2 ${
                    isRead ? 'bg-white border-slate-200/60 opacity-75' : 'bg-teal-50/30 border-teal-200/60 shadow-xs'
                }`}
                >
                <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{n.title || 'Alert'}</h4>
                    {!isRead && (
                    <button
                        onClick={() => handleMarkAsRead(id)}
                        className="text-[10px] font-bold text-(--primary-color) hover:bg-white px-2 py-1 rounded-lg border border-teal-200 flex items-center gap-1 shrink-0"
                    >
                        <Check size={12} /> Mark read
                    </button>
                    )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message || n.content}</p>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-1">
                    <Clock size={12} />
                    <span>{(n.createdAt || n.created_at) ? new Date(n.createdAt || n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                </div>
                </div>
            );
            })
        )}
        </div>
    </div>
    </div>
);
};
