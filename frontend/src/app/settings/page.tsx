"use client";

import { Save, Building2, Workflow, Tags, Users2, ShieldAlert } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-8 fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-1">System Settings</h2>
                    <p className="text-gray-500 dark:text-gray-400">Configure agency-wide properties, roles, and automated workflows.</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5">
                    <Save className="w-4 h-4" /> Save Changes
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">

                {/* Left Navigation Menu (Simulated UI) */}
                <div className="w-full lg:w-64 shrink-0 flex flex-col gap-2">
                    <SettingsTab active icon={<Building2 className="w-4 h-4" />} label="General Agency" />
                    <SettingsTab icon={<Users2 className="w-4 h-4" />} label="Team Roles" />
                    <SettingsTab icon={<Workflow className="w-4 h-4" />} label="Stages & Pipelines" />
                    <SettingsTab icon={<Tags className="w-4 h-4" />} label="Custom Labels" />
                    <SettingsTab icon={<ShieldAlert className="w-4 h-4" />} label="Data & Security" />
                </div>

                {/* Main Settings Panel */}
                <div className="flex-1 glass-card p-8 min-h-[500px] flex flex-col gap-8 w-full">

                    <div className="border-b border-[var(--card-border)] pb-6 mb-2">
                        <h3 className="text-xl font-bold mb-1">General Agency</h3>
                        <p className="text-sm text-gray-500">Update your internal name and base configuration.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 max-w-3xl">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Agency Name</label>
                            <input
                                type="text"
                                defaultValue="STARINC Digital"
                                className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Base Timezone</label>
                            <select className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                                <option>Jakarta (GMT+7)</option>
                                <option>Singapore (GMT+8)</option>
                            </select>
                        </div>
                    </div>

                    <div className="border-t border-[var(--card-border)] pt-8 mt-4 flex flex-col gap-4 max-w-3xl">
                        <div>
                            <h4 className="font-semibold mb-1">Force Dark Mode Internally</h4>
                            <p className="text-sm text-gray-500">Toggle whether staff applications are permanently stuck on dark mode to match branding.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer mt-2 w-fit">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="flex-1"></div>
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-5 w-fit">
                        <h4 className="font-bold text-rose-500 mb-1 flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> Danger Zone</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 max-w-sm">Flushing all caches or restarting the API can interrupt active background workers rendering your Next.js queues.</p>
                        <button className="text-xs font-bold text-rose-500 px-4 py-2 bg-white dark:bg-black/40 border border-rose-500/50 hover:bg-rose-500 hover:text-white transition-colors rounded-lg">
                            Wipe Local Cache
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
}

function SettingsTab({ label, active, icon }: { label: string, active?: boolean, icon: React.ReactNode }) {
    return (
        <button className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all text-left
            ${active
                ? 'bg-white dark:bg-[#1a1c23] shadow-sm border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white'
                : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
            }`}>
            {icon} {label}
        </button>
    );
}
