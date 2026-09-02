import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type NotificationType = 'rule' | 'alert' | 'system' | 'success' | 'info';

export interface Notification {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  type: NotificationType;
  timestamp: number;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (title: string, desc: string, type: NotificationType) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = 'legalmetrix_notifications';

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      { id: '1', title: 'System Connected', desc: 'Real-time notifications are now active.', time: 'Just now', read: false, type: 'system', timestamp: Date.now() },
    ];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // Update relative times every minute (simplified for now, just keep time string static or recompute)
  // For simplicity, we store the actual timestamp and compute 'time' when rendering if needed, 
  // but to keep compatibility with DashboardLayout, we'll store a 'time' string and also a timestamp.
  const updateRelativeTimes = (notifs: Notification[]) => {
    const now = Date.now();
    return notifs.map(n => {
      const diffInMinutes = Math.floor((now - n.timestamp) / 60000);
      let timeStr = 'Just now';
      if (diffInMinutes > 0 && diffInMinutes < 60) {
        timeStr = `${diffInMinutes}m ago`;
      } else if (diffInMinutes >= 60 && diffInMinutes < 1440) {
        timeStr = `${Math.floor(diffInMinutes / 60)}h ago`;
      } else if (diffInMinutes >= 1440) {
        timeStr = `${Math.floor(diffInMinutes / 1440)}d ago`;
      }
      return { ...n, time: timeStr };
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => updateRelativeTimes(prev));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const addNotification = (title: string, desc: string, type: NotificationType = 'info') => {
    const newNotif: Notification = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      title,
      desc,
      type,
      read: false,
      time: 'Just now',
      timestamp: Date.now(),
    };
    
    setNotifications(prev => {
      const updated = [newNotif, ...prev].slice(0, 50); // Keep max 50
      return updateRelativeTimes(updated);
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
