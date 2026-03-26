"use client";

import { Search, Bell, Plus, Menu, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Topbar({ onOpenMenu }: { onOpenMenu?: () => void }) {
    const pathname = usePathname();
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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

                <button className="relative p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors group">
                    <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-500 transition-colors" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse border-2 border-[var(--sidebar-bg)]"></span>
                </button>
                {pathname !== '/projects' && (
                    <Link href="/projects" className="bg-black dark:bg-white text-white dark:text-black text-sm font-semibold px-5 py-2.5 rounded-full shadow-lg hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20 dark:hover:shadow-white/20 transition-all duration-300 active:scale-95 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Project
                    </Link>
                )}
            </div>
        </header>
    );
}
