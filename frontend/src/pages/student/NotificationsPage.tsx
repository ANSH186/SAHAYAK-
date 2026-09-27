import React, { useState, useEffect } from 'react';
import { AppNotification } from '../../types';
import { api } from '../../lib/api';
import { NotificationCard } from '../../components/cards/NotificationCard';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Bell, CheckCheck, Filter, Sparkles, Loader2 } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNotifications = async () => {
    try {
      const data = await api.notifications.list();
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (err) {
      console.warn('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    try {
      await api.notifications.markRead(id);
    } catch (err) {
      console.warn('Failed to mark read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await api.notifications.markAllRead();
    } catch (err) {
      console.warn('Failed to mark all read:', err);
    }
  };

  const filtered = notifications.filter(n => filter === 'ALL' || !n.read);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sahayak-blue-ice text-sahayak-blue font-semibold text-xs mb-1">
            <Bell className="w-3.5 h-3.5" />
            <span>Activity Stream</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
            Campus Notifications
          </h1>
          <p className="text-xs sm:text-sm text-sahayak-text-secondary">
            Real-time updates on match radar findings, proctor verifications, and handover alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAllAsRead}
            className="px-3.5 py-2 rounded-xl bg-sahayak-cream-soft border border-sahayak-brown/15 text-xs font-semibold text-sahayak-text-primary hover:border-sahayak-blue flex items-center gap-1.5 transition-all"
          >
            <CheckCheck className="w-3.5 h-3.5 text-sahayak-blue" />
            <span>Mark all read</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'ALL'
              ? 'bg-sahayak-blue text-white shadow-neumorph-sm'
              : 'bg-sahayak-cream-soft border border-sahayak-brown/15 text-sahayak-text-secondary hover:border-sahayak-blue'
          }`}
        >
          All Updates ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'UNREAD'
              ? 'bg-sahayak-blue text-white shadow-neumorph-sm'
              : 'bg-sahayak-cream-soft border border-sahayak-brown/15 text-sahayak-text-secondary hover:border-sahayak-blue'
          }`}
        >
          Unread ({notifications.filter(n => !n.read).length})
        </button>
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <EmptyState
          title="All Caught Up!"
          description="You have no unread notifications or pending action items right now."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
            />
          ))}
        </div>
      )}
    </div>
  );
};
