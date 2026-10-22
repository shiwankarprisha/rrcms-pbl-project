import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { Notification } from "../types";
import { useAuth } from "../context/AuthContext";
import { Bell, CheckCheck, Clock, ExternalLink, Trash2 } from "lucide-react";

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch {
      // Silently catch background poll failures
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 12000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !(n.isRead ?? n.read)).length;

  const handleMarkAsRead = async (id: number, link?: string | null) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n)),
      );
      if (link) {
        setIsOpen(false);
        navigate(link);
      }
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Clear all your notifications? This cannot be undone."))
      return;

    try {
      setLoading(true);
      await api.clearAllNotifications();
      setNotifications([]);
    } catch (err) {
      console.error("Failed to clear notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await api.markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, read: true })),
      );
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[1.1rem] h-[1.1rem] px-1 text-[10px] font-bold text-white bg-red-600 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <button
        onClick={handleClearAll}
        disabled={loading || notifications.length === 0}
        className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 disabled:opacity-50"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Clear all
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium flex items-center gap-1 disabled:opacity-50"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                No notifications right now
              </div>
            ) : (
              notifications.map((n) => {
                const isUnread = !(n.isRead ?? n.read);
                const targetLink = n.linkUrl ?? n.link;

                return (
                  <div
                    key={n.id}
                    onClick={() => handleMarkAsRead(n.id, targetLink)}
                    className={`p-3.5 text-xs transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 flex flex-col gap-1 ${
                      isUnread
                        ? "bg-indigo-50/40 dark:bg-indigo-950/20"
                        : "opacity-75"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`font-semibold ${
                          isUnread
                            ? "text-slate-900 dark:text-slate-100"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {n.title}
                      </span>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(n.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" · "}
                        {new Date(n.createdAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {targetLink && (
                        <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                          View details <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
