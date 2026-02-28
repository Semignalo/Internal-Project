"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Users, ClipboardList, Settings } from "lucide-react";

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 glass-panel border-r shrink-0 flex flex-col justify-between fixed h-full z-10 hidden md:flex">
            <div className="p-6">
                <div className="flex items-center gap-2 mb-10">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg border border-blue-400/50 shadow-blue-500/20">
                        <FolderKanban className="text-white w-6 h-6" strokeWidth={2.5} />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                        STARINC OS
                    </h1>
                </div>

                <nav className="space-y-1">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 mt-8 px-3">
                        Overview
                    </p>
                    <NavItem href="/" icon={<LayoutDashboard />} label="Dashboard" active={pathname === "/"} />
                    <NavItem href="/projects" icon={<FolderKanban />} label="Projects" active={pathname.startsWith("/projects")} />
                    <NavItem href="/tasks" icon={<ClipboardList />} label="My Tasks" active={pathname.startsWith("/tasks")} />
                    <NavItem href="/workload" icon={<Users />} label="Team Workload" active={pathname.startsWith("/workload")} />

                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 mt-8 px-3">
                        System
                    </p>
                    <NavItem href="/settings" icon={<Settings />} label="Settings" active={pathname.startsWith("/settings")} />
                </nav>
            </div>

            <div className="p-6 border-t border-[var(--card-border)]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-md shadow-pink-500/20">
                        SJ
                    </div>
                    <div>
                        <p className="text-sm font-semibold">Sam Johnson</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Founder</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}

function NavItem({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <Link
            href={href}
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
