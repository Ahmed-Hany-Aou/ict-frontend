import React, { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import api from '../services/api';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  created_at: string;
}

interface UserNotification {
  id: number;
  user_id: number;
  notification_id: number;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  notification: Notification;
}

const NotificationBell: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await api.get<{ count: number }>('/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ data: UserNotification[] }>('/notifications');
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark single notification as read
  const markAsRead = async (notificationId: number) => {
    try {
      await api.post(`/notifications/${notificationId}/mark-as-read`);

      // Update local state
      setNotifications(prev => prev.map(notif =>
        notif.notification_id === notificationId
          ? { ...notif, is_read: true, read_at: new Date().toISOString() }
          : notif
      ));

      // Update unread count
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');

      // Update local state
      setNotifications(prev => prev.map(notif => ({
        ...notif,
        is_read: true,
        read_at: new Date().toISOString()
      })));

      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Initial load
  useEffect(() => {
    fetchUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.notification-bell-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getTypeBadgeColor = (type: string): string => {
    switch (type) {
      case 'system':
        return 'bg-blue-100 text-blue-700';
      case 'broadcast':
        return 'bg-green-100 text-green-700';
      case 'personal':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="relative notification-bell-container">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center font-semibold shadow-lg animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-full sm:w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-semibold">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
                    title="Mark all as read"
                  >
                    <Check size={14} />
                    <span className="hidden sm:inline">Mark all</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded transition-colors"
                  aria-label="Close notifications"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[60vh] sm:max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto mb-3"></div>
                <p className="text-sm">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Bell size={56} className="mx-auto mb-3 opacity-20" />
                <p className="text-base font-medium">No notifications yet</p>
                <p className="text-sm text-gray-400 mt-1">We'll notify you when something new arrives</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map(userNotification => {
                  const notification = userNotification.notification;
                  const isUnread = !userNotification.is_read;

                  return (
                    <div
                      key={userNotification.id}
                      className={`p-4 transition-all duration-200 hover:bg-gray-50 ${
                        isUnread ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Unread Indicator Dot */}
                        {isUnread && (
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-semibold text-sm sm:text-base text-gray-900 break-words">
                              {notification.title}
                            </h4>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap flex-shrink-0 ${getTypeBadgeColor(notification.type)}`}>
                              {notification.type}
                            </span>
                          </div>

                          <p className="text-sm text-gray-700 mb-3 break-words whitespace-pre-wrap leading-relaxed">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs text-gray-500">
                              {formatDate(userNotification.created_at)}
                            </p>
                            {isUnread && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-2 py-1 rounded transition-colors font-medium"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer - Show if there are notifications */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-center">
              <p className="text-xs text-gray-500">
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
