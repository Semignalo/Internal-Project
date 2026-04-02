"use client";

import { Search, Bell, Plus, Menu, Sun, Moon, AlertTriangle, Clock, RefreshCw, Eye, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

interface Notification {
    id: string;
    type: 'OVERDUE' | 'REVISION' | 'DEADLINE' | 'REVIEW';
    title: string;
    message: string;
    project: string | null;
    taskId: string;
    createdAt: string;
    priority: string;
}

function formatRelative(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 0) {
        // future date (deadline)
        const absDiff = Math.abs(diff);
        if (absDiff < 3600) return `in ${Math.floor(absDiff / 60)}m`;
        if (absDiff < 86400) return `in ${Math.floor(absDiff / 3600)}h`;
        return `in ${Math.floor(absDiff / 86400)}d`;
    }
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

const typeConfig = {
    OVERDUE: { icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    REVISION: { icon: RefreshCw, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    DEADLINE: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    REVIEW: { icon: Eye, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
};

export function Topbar({ onOpenMenu }: { onOpenMenu?: () => void }) {
    const pathname = usePathname();
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notifCount, setNotifCount] = useState(0);
    const [notifLoading, setNotifLoading] = useState(false);
    const [readIds, setReadIds] = useState<Set<string>>(new Set());
    const panelRef = useRef<HTMLDivElement>(null);
    const bellRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch notifications count on mount
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // refresh every minute
        return () => clearInterval(interval);
    }, []);

    // Close panel on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                panelRef.current && !panelRef.current.contains(e.target as Node) &&
                bellRef.current && !bellRef.current.contains(e.target as Node)
            ) {
                setNotifOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    async function fetchNotifications() {
        try {
            const userStr = localStorage.getItem("user");
            const userId = userStr ? JSON.parse(userStr).id : undefined;
            const url = userId ? `/api/notifications?userId=${userId}` : "/api/notifications";
            const res = await fetch(url);
            const data = await res.json();
            setNotifications(data.notifications || []);
            setNotifCount(data.count || 0);
        } catch (e) {
            console.error("Failed to fetch notifications", e);
        }
    }

    function handleBellClick() {
        setNotifOpen(prev => !prev);
        if (!notifOpen) {
            setNotifLoading(true);
            fetchNotifications().finally(() => setNotifLoading(false));
        }
    }

    function markAllRead() {
        setReadIds(new Set(notifications.map(n => n.id)));
    }

    const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

    return (
        <header className="h-16 md:h-20 glass-panel border-b px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 w-full transition-all duration-300">
            <div className="flex items-center gap-3 md:hidden">
                <button
                    onClick={onOpenMenu}
                    className="p-2 -ml-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            <div className="relative w-96 hidden lg:block group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search projects, tasks, or team members..."
                    className="w-full bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-sm transition-all shadow-inner focus:shadow-md focus:bg-white dark:focus:bg-black/40"
                />
            </div>

            <div className="flex items-center gap-4">
                {mounted && (
                    <button
                        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                        className="relative p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors group"
                        title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        {resolvedTheme === 'dark' ? (
                            <Sun className="w-5 h-5 text-gray-300 group-hover:text-amber-400 transition-colors" />
                        ) : (
                            <Moon className="w-5 h-5 text-gray-600 group-hover:text-blue-500 transition-colors" />
                        )}
                    </button>
                )}

                {/* Notification Bell */}
                <div className="relative">
                    <button
                        ref={bellRef}
                        onClick={handleBellClick}
                        className="relative p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors group"
                    >
                        <Bell className={`w-5 h-5 transition-colors ${notifOpen ? 'text-blue-500' : 'text-gray-600 dark:text-gray-300 group-hover:text-blue-500'}`} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 flex items-center justify-center bg-rose-500 rounded-full text-[10px] font-bold text-white px-1 border-2 border-[var(--sidebar-bg)] animate-pulse">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notification Panel */}
                    {notifOpen && (
                        <div
                            ref={panelRef}
                            className="absolute right-0 top-full mt-2 w-96 max-h-[75vh] flex flex-col rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#12141a] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                        >
                            {/* Panel Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/10">
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">Notifications</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">{unreadCount} unread</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllRead}
                                            className="text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors px-2 py-1 rounded-lg hover:bg-blue-500/10"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setNotifOpen(false)}
                                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Notification List */}
                            <div className="flex-1 overflow-y-auto">
                                {notifLoading ? (
                                    <div className="flex items-center justify-center py-10">
                                        <div className="w-6 h-6 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin"></div>
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
                                        <Bell className="w-10 h-10 opacity-30" />
                                        <p className="text-sm font-medium">All caught up!</p>
                                        <p className="text-xs text-center opacity-70">No pending actions or deadlines</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100 dark:divide-white/5">
                                        {notifications.map(notif => {
                                            const config = typeConfig[notif.type];
                                            const Icon = config.icon;
                                            const isRead = readIds.has(notif.id);

                                            return (
                                                <div
                                                    key={notif.id}
                                                    onClick={() => setReadIds(prev => new Set([...prev, notif.id]))}
                                                    className={`flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${isRead ? 'opacity-60' : ''}`}
                                                >
                                                    {/* Icon */}
                                                    <div className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${config.bg}`}>
                                                        <Icon className={`w-4 h-4 ${config.color}`} />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <span className={`text-[11px] font-bold uppercase tracking-wider ${config.color}`}>{notif.title}</span>
                                                            {!isRead && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>}
                                                        </div>
                                                        <p className="text-[13px] text-gray-800 dark:text-gray-200 leading-snug">{notif.message}</p>
                                                        {notif.project && (
                                                            <p className="text-[11px] text-gray-400 mt-1">{notif.project}</p>
                                                        )}
                                                    </div>

                                                    {/* Time */}
                                                    <span className="text-[11px] text-gray-400 shrink-0 mt-0.5">
                                                        {formatRelative(notif.createdAt)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Panel Footer */}
                            <div className="px-5 py-3 border-t border-gray-100 dark:border-white/10">
                                <Link
                                    href="/tasks"
                                    onClick={() => setNotifOpen(false)}
                                    className="block w-full text-center text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors py-1"
                                >
                                    View all tasks →
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {pathname !== '/projects' && (
                    <Link href="/projects" className="bg-black dark:bg-white text-white dark:text-black text-sm font-semibold px-5 py-2.5 rounded-full shadow-lg hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20 dark:hover:shadow-white/20 transition-all duration-300 active:scale-95 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Project
                    </Link>
                )}
            </div>
        </header>
    );
}
