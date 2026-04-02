"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FolderKanban, Users, ClipboardList, Settings, LogOut, X } from "lucide-react";

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                setUser(JSON.parse(userStr));
            } catch (e) { }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        router.push("/login");
    };

    return (
        <aside className={`w-64 glass-panel border-r shrink-0 flex flex-col justify-between fixed h-full z-40 transition-transform duration-300 md:translate-x-0 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg border border-blue-400/50 shadow-blue-500/20">
                            {/* Paw Print SVG */}
                            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" xmlns="http://www.w3.org/2000/svg">
                                <ellipse cx="6" cy="6" rx="2" ry="2.8" />
                                <ellipse cx="11.5" cy="4.5" rx="2" ry="2.5" />
                                <ellipse cx="17" cy="6" rx="2" ry="2.8" />
                                <ellipse cx="20" cy="11" rx="1.6" ry="2.2" />
                                <path d="M12 9.5c-3.5 0-6.5 2-7 5.5-.4 2.8 1.5 5 3.5 5 1 0 2-.5 3.5-.5s2.5.5 3.5.5c2 0 3.9-2.2 3.5-5-.5-3.5-3.5-5.5-7-5.5z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                            Pao Planner
                        </h1>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={onClose}
                        className="md:hidden p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="space-y-1">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 mt-8 px-3">
                        Overview
                    </p>
                    <NavItem href="/" icon={<LayoutDashboard />} label="Dashboard" active={pathname === "/"} onClick={onClose} />
                    <NavItem href="/projects" icon={<FolderKanban />} label="Projects" active={pathname.startsWith("/projects")} onClick={onClose} />
                    <NavItem href="/tasks" icon={<ClipboardList />} label="My Tasks" active={pathname.startsWith("/tasks")} onClick={onClose} />
                    <NavItem href="/workload" icon={<Users />} label="Team Workload" active={pathname.startsWith("/workload")} onClick={onClose} />

                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 mt-8 px-3">
                        System
                    </p>
                    <NavItem href="/settings" icon={<Settings />} label="Settings" active={pathname.startsWith("/settings")} onClick={onClose} />
                </nav>
            </div>

            <div className="p-6 border-t border-[var(--card-border)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-md shadow-pink-500/20">
                        {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                        <p className="text-sm font-semibold">{user?.name || "Guest"}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">{user?.role ? user.role.replace("_", " ") : "VISITOR"}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-500/10"
                    title="Log Out"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </aside>
    );
}

function NavItem({ href, icon, label, active = false, onClick }: { href: string, icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
                ? 'bg-black dark:bg-white text-white dark:text-black shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_12px_rgba(255,255,255,0.15)] font-semibold border border-transparent dark:border-white/20'
                : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'
                }`}
        >
            <span className={`${active ? 'opacity-100 scale-110' : 'opacity-70 group-hover:opacity-100 group-hover:scale-110'} transition-all duration-200`}>
                {icon}
            </span>
            <span className="text-sm">{label}</span>
        </Link>
    );
}
