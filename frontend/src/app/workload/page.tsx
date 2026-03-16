"use client";

import { useEffect, useState } from "react";
import { Users, TrendingUp, Filter, BarChart3, Activity, Briefcase } from "lucide-react";

export default function WorkloadPage() {
    const [team, setTeam] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/users")
            .then(res => res.json())
            .then(json => {
                setTeam(json.filter((u: any) => u.deletedAt === null));
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch team data:", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 rounded-full border-4 border-blue-500/20 shadow-sm animate-spin border-t-blue-500"></div>
            </div>
        );
    }

    // Calculations for Summary
    const totalMembers = team.length;
    const overloadedCount = team.filter(u => u.workloadLevel === 'OVERLOADED').length;
    const activeTasksAcrossTeam = team.reduce((acc, u) => acc + (u._count?.taskAssignments || 0), 0);

    // Sort team by tasks descending to show busiest first
    const sortedTeam = [...team].sort((a, b) => {
        const tasksA = a._count?.taskAssignments || 0;
        const tasksB = b._count?.taskAssignments || 0;
        return tasksB - tasksA;
    });

    return (
        <div className="space-y-8 fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-1">Team Workload</h2>
                    <p className="text-gray-500 dark:text-gray-400">Monitor bandwidth, reassign tasks, and prevent burnout.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-[var(--card-border)] bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black transition-colors shadow-sm">
                        <Filter className="w-4 h-4" /> Filter Role
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-[#1a1c23] border border-[var(--card-border)] shadow-sm hover:shadow-md transition-shadow">
                        <BarChart3 className="w-4 h-4" /> Export Report
                    </button>
                </div>
            </div>

            {/* Capacity Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-2xl">
                            <Users className="w-6 h-6 text-blue-500" />
                        </div>
                        <span className="text-2xl font-bold">{totalMembers}</span>
                    </div>
                    <div>
                        <h4 className="text-gray-500 dark:text-gray-400 font-medium">Total Team Size</h4>
                        <p className="text-sm mt-1">Across all agency divisions</p>
                    </div>
                </div>

                <div className="glass-card p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-rose-500/10 rounded-2xl">
                            <Activity className="w-6 h-6 text-rose-500" />
                        </div>
                        <span className="text-2xl font-bold text-rose-500">{overloadedCount}</span>
                    </div>
                    <div>
                        <h4 className="text-gray-500 dark:text-gray-400 font-medium">Overloaded Members</h4>
                        <p className="text-sm mt-1 text-rose-500/80 font-medium">Requires task redistribution</p>
                    </div>
                </div>

                <div className="glass-card p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl">
                            <Briefcase className="w-6 h-6 text-emerald-500" />
                        </div>
                        <span className="text-2xl font-bold">{activeTasksAcrossTeam}</span>
                    </div>
                    <div>
                        <h4 className="text-gray-500 dark:text-gray-400 font-medium">Total Active Tasks</h4>
                        <p className="text-sm mt-1">Currently in progress or review</p>
                    </div>
                </div>
            </div>

            {/* Detailed Workload Matrix */}
            <div>
                <h3 className="text-xl font-bold mb-4">Bandwidth Matrix</h3>
                <div className="glass-card rounded-2xl overflow-hidden border border-[var(--card-border)]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-[var(--card-border)] bg-black/5 dark:bg-white/5 text-xs text-gray-500 uppercase tracking-widest font-semibold">
                                    <th className="px-6 py-4">Team Member</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4 w-1/3">Capacity Load</th>
                                    <th className="px-6 py-4 text-center">Active Tasks</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--card-border)]">
                                {sortedTeam.map((user) => {
                                    const tasks = user._count?.taskAssignments || 0;
                                    // A simple artificial capacity logic: > 10 is overloaded, < 5 is low
                                    const rawCapacity = (tasks / 15) * 100;
                                    const capacityPercent = Math.min(Math.max(rawCapacity, 5), 100);

                                    const level = user.workloadLevel;
                                    const levelColor =
                                        level === 'OVERLOADED' ? 'text-rose-500 border-rose-500 bg-rose-500/10' :
                                            level === 'LOW' ? 'text-emerald-500 border-emerald-500 bg-emerald-500/10' :
                                                'text-blue-500 border-blue-500 bg-blue-500/10';

                                    const progressColor =
                                        level === 'OVERLOADED' ? 'bg-rose-500' :
                                            level === 'LOW' ? 'bg-emerald-500' :
                                                'bg-blue-500';

                                    return (
                                        <tr key={user.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 shadow-sm border border-white/20">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 dark:text-white">{user.name}</h4>
                                                        <p className="text-xs text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                                    {user.role.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 bg-gray-200/50 dark:bg-gray-800/50 rounded-full h-1.5 overflow-hidden">
                                                        <div
                                                            className={`h-full ${progressColor} rounded-full`}
                                                            style={{ width: `${capacityPercent}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs font-bold w-10 text-right">{Math.round(capacityPercent)}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 text-sm font-bold">
                                                    {tasks}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-[11px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full border ${levelColor}`}>
                                                    {level}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
