import { useState, useEffect, useCallback, useRef } from 'react';
import { NotificationItem } from '../types';

interface UseNotificationSyncOptions {
  storageKeyPrefix: string; // ví dụ: 'sportbook-admin', 'sportbook-owner', 'sportbook-customer'
  fetchNotifications: (clearedTimestamp: number, readIds: string[]) => Promise<NotificationItem[]>;
  dependencies?: any[];
}

export function useNotificationSync({
  storageKeyPrefix,
  fetchNotifications,
  dependencies = [],
}: UseNotificationSyncOptions) {
  const readKey = `${storageKeyPrefix}-read-notifs`;
  const clearedKey = `${storageKeyPrefix}-cleared-timestamp`;

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Lưu fetchNotifications vào ref để tránh thay đổi dependency gây re-render loop
  const fetchRef = useRef(fetchNotifications);
  fetchRef.current = fetchNotifications;

  const getReadIds = useCallback((): string[] => {
    try {
      const raw = localStorage.getItem(readKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, [readKey]);

  const getClearedTimestamp = useCallback((): number => {
    try {
      const raw = localStorage.getItem(clearedKey);
      return raw ? Number(raw) || 0 : 0;
    } catch {
      return 0;
    }
  }, [clearedKey]);

  const refresh = useCallback(async () => {
    try {
      const readIds = getReadIds();
      const clearedTimestamp = getClearedTimestamp();
      const items = await fetchRef.current(clearedTimestamp, readIds);
      if (Array.isArray(items)) {
        items.sort((a, b) => b.timestamp - a.timestamp);
        setNotifications(items.slice(0, 20));
      }
    } catch (err) {
      console.error(`[NotificationSync:${storageKeyPrefix}] Lỗi tải thông báo:`, err);
    }
  }, [storageKeyPrefix, getReadIds, getClearedTimestamp]);

  // Chỉ chạy khi mount hoặc khi dependencies thực tế thay đổi
  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));

    // Polling định kỳ mỗi 60 giây ngầm trong background
    const interval = setInterval(() => {
      refresh();
    }, 60000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKeyPrefix, refresh, ...dependencies]);

  const markAsRead = useCallback(
    (id: string) => {
      try {
        const existing = getReadIds();
        if (!existing.includes(id)) {
          localStorage.setItem(readKey, JSON.stringify([...existing, id]));
        }
      } catch {}
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true } : item))
      );
    },
    [readKey, getReadIds]
  );

  const markAllAsRead = useCallback(() => {
    const currentIds = notifications.map((n) => n.id);
    try {
      const existing = getReadIds();
      const updated = Array.from(new Set([...existing, ...currentIds]));
      localStorage.setItem(readKey, JSON.stringify(updated));
    } catch {}
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [notifications, readKey, getReadIds]);

  const clearAll = useCallback(() => {
    try {
      localStorage.setItem(clearedKey, String(Date.now()));
    } catch {}
    setNotifications([]);
  }, [clearedKey]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    loading,
    refresh,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
}
