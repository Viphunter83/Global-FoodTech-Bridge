'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: string;
    isRead: boolean;
    link?: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    
    // Load unread count logic
    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('gftb_notifications');
        if (stored) {
            try {
                setNotifications(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to load notifications', e);
            }
        }
    }, []);

    // Save to localStorage when changed
    useEffect(() => {
        localStorage.setItem('gftb_notifications', JSON.stringify(notifications));
    }, [notifications]);

    const addNotification = useCallback((payload: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        const timestamp = new Date().toISOString();
        
        setNotifications(prev => [
            { ...payload, id, timestamp, isRead: false },
            ...prev
        ].slice(0, 50)); // Keep last 50
    }, []);

    const markAsRead = useCallback((id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            addNotification,
            markAsRead,
            markAllAsRead,
            clearNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
