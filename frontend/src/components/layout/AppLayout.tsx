"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
        const user = localStorage.getItem("user");
        if (!user && pathname !== "/login") {
            router.push("/login");
        }
    }, [pathname, router]);

    if (!mounted) return null;

    if (pathname === "/login") {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex fade-in">
                {children}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent flex">
            <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
            <div className={`flex-1 flex flex-col min-h-screen relative transition-all duration-300 md:ml-64`}>
                <Topbar onOpenMenu={() => setIsMobileMenuOpen(true)} />
                <div className={`fade-in ${['/', '/tasks', '/projects', '/workload', '/settings'].includes(pathname) || pathname.startsWith('/projects/')
                        ? 'p-4 md:px-8 md:py-6 w-full'
                        : 'p-4 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden'
                    }`}>
                    {children}
                </div>
            </div>

            {/* Backdrop for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
}
