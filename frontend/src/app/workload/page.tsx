"use client";

import { useEffect, useRef, useState } from "react";
import {
    Users, TrendingUp, Filter, BarChart3, Activity, Briefcase,
    Download, X, Calendar, CheckCircle2, AlertTriangle, Clock,
    ChevronDown, Star, RefreshCw, FileText, Table2
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtDate(d: Date) {
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function toInputDate(d: Date) {
    return d.toISOString().split("T")[0];
}

function statusLabel(s: string) {
    const map: Record<string, string> = {
        COMPLETED: "Completed", APPROVED: "Approved", DONE: "Done",
        TODO: "To Do", IN_PROGRESS: "In Progress", PLANNING: "Planning",
        REVISION: "Revision", INTERNAL_REVIEW: "Internal Review", CLIENT_REVIEW: "Client Review",
    };
    return map[s] ?? s;
}

// ─── CSV Export ──────────────────────────────────────────────────────────────

function exportToCSV(reportData: any, startDate: string, endDate: string) {
    const rows: string[][] = [];

    // Header info
    rows.push(["Pao Planner — Team Performance Report"]);
    rows.push([`Period: ${fmtDate(new Date(startDate))} – ${fmtDate(new Date(endDate))}`]);
    rows.push([`Generated: ${new Date().toLocaleString("id-ID")}`]);
    rows.push([]);

    // Summary
    const s = reportData.summary;
    rows.push(["TEAM SUMMARY"]);
    rows.push(["Total Members", s.totalMembers]);
    rows.push(["Tasks in Period", s.totalTasksInPeriod]);
    rows.push(["Completed", s.totalCompleted]);
    rows.push(["Overdue", s.totalOverdue]);
    rows.push(["Team Completion Rate", `${s.teamCompletionRate}%`]);
    rows.push(["Top Performer", s.topPerformer ? `${s.topPerformer.name} (${s.topPerformer.completionRate}%)` : "N/A"]);
    rows.push([]);

    // Member table header
    rows.push(["MEMBER PERFORMANCE"]);
    rows.push([
        "Name", "Email", "Role", "Workload Level",
        "Tasks Assigned", "Completed", "In Progress", "Overdue",
        "Completion Rate", "Avg Days to Complete", "Total Revisions", "Projects Involved"
    ]);

    for (const m of reportData.members) {
        rows.push([
            m.name, m.email, m.role.replace("_", " "), m.workloadLevel,
            m.totalAssigned, m.completed, m.inProgress, m.overdue,
            `${m.completionRate}%`,
            m.avgDaysToComplete !== null ? `${m.avgDaysToComplete} days` : "N/A",
            m.totalRevisions,
            m.projects.join("; "),
        ]);
    }

    rows.push([]);

    // Task detail per member
    rows.push(["TASK DETAILS"]);
    rows.push(["Member", "Task", "Status", "Priority", "Deadline", "Revisions", "Project", "Division"]);
    for (const m of reportData.members) {
        for (const t of m.tasks) {
            rows.push([
                m.name, t.title, statusLabel(t.status), t.priority,
                t.deadline ? new Date(t.deadline).toLocaleDateString("id-ID") : "—",
                t.revisionCount, t.project ?? "—", t.division ?? "—"
            ]);
        }
    }

    const csv = rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `team-performance_${startDate}_${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// ─── Export Modal ─────────────────────────────────────────────────────────────

function ExportModal({ onClose }: { onClose: () => void }) {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [startDate, setStartDate] = useState(toInputDate(firstDayOfMonth));
    const [endDate, setEndDate] = useState(toInputDate(today));
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<any>(null);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<"summary" | "members" | "tasks">("summary");
    const overlayRef = useRef<HTMLDivElement>(null);

    const presets = [
        { label: "This Month", start: toInputDate(firstDayOfMonth), end: toInputDate(today) },
        {
            label: "Last Month",
            start: toInputDate(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
            end: toInputDate(new Date(today.getFullYear(), today.getMonth(), 0)),
        },
        {
            label: "Last 7 Days",
            start: toInputDate(new Date(today.getTime() - 7 * 86400000)),
            end: toInputDate(today),
        },
        {
            label: "Last 30 Days",
            start: toInputDate(new Date(today.getTime() - 30 * 86400000)),
            end: toInputDate(today),
        },
        {
            label: "This Year",
            start: toInputDate(new Date(today.getFullYear(), 0, 1)),
            end: toInputDate(today),
        },
    ];

    async function fetchReport() {
        if (!startDate || !endDate) { setError("Please select start and end date."); return; }
        if (new Date(startDate) > new Date(endDate)) { setError("Start date cannot be after end date."); return; }
        setError("");
        setLoading(true);
        setReportData(null);
        try {
            const res = await fetch(`/api/reports/team-performance?startDate=${startDate}&endDate=${endDate}`);
            if (!res.ok) throw new Error("Failed to fetch report");
            const data = await res.json();
            setReportData(data);
        } catch (e) {
            setError("Failed to load report. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const levelColor = (l: string) =>
        l === "OVERLOADED" ? "text-rose-500 bg-rose-500/10" :
            l === "HIGH" ? "text-orange-500 bg-orange-500/10" :
                l === "LOW" ? "text-emerald-500 bg-emerald-500/10" :
                    "text-blue-500 bg-blue-500/10";

    return (
        <div
            ref={overlayRef}
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
            <div className="bg-white dark:bg-[#12141a] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">

                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-white/10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-500/10 rounded-xl">
                            <BarChart3 className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Team Performance Report</h3>
                            <p className="text-sm text-gray-500">Select a date range to generate and export</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Date Range Picker */}
                <div className="px-6 py-5 border-b border-gray-200 dark:border-white/10 shrink-0">
                    <div className="flex flex-wrap items-end gap-4">
                        {/* Preset Buttons */}
                        <div className="flex flex-wrap gap-2 flex-1">
                            {presets.map(p => (
                                <button
                                    key={p.label}
                                    onClick={() => { setStartDate(p.start); setEndDate(p.end); setReportData(null); }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${startDate === p.start && endDate === p.end
                                        ? "bg-blue-500 text-white border-blue-500"
                                        : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-500"
                                        }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        {/* Custom Date Inputs */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={e => { setStartDate(e.target.value); setReportData(null); }}
                                    className="px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                />
                            </div>
                            <span className="text-gray-400 text-sm">to</span>
                            <input
                                type="date"
                                value={endDate}
                                max={toInputDate(today)}
                                onChange={e => { setEndDate(e.target.value); setReportData(null); }}
                                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            />
                            <button
                                onClick={fetchReport}
                                disabled={loading}
                                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 transition-colors shadow-sm shadow-blue-500/30"
                            >
                                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
                                {loading ? "Loading..." : "Generate"}
                            </button>
                        </div>
                    </div>
                    {error && <p className="text-sm text-rose-500 mt-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{error}</p>}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto">
                    {!reportData && !loading && (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
                            <BarChart3 className="w-14 h-14 opacity-20" />
                            <p className="text-base font-medium">Select a date range and click Generate</p>
                        </div>
                    )}

                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-10 h-10 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
                            <p className="text-sm text-gray-500">Calculating team performance...</p>
                        </div>
                    )}

                    {reportData && (
                        <div className="flex flex-col">
                            {/* Tab Bar */}
                            <div className="flex items-center gap-1 px-6 py-3 border-b border-gray-200 dark:border-white/10 sticky top-0 bg-white dark:bg-[#12141a] z-10">
                                {[
                                    { id: "summary", label: "Summary", icon: TrendingUp },
                                    { id: "members", label: "Members", icon: Users },
                                    { id: "tasks", label: "Task Detail", icon: FileText },
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                            ? "bg-blue-500/10 text-blue-500"
                                            : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                                            }`}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                ))}
                                <div className="ml-auto">
                                    <p className="text-xs text-gray-400">
                                        {fmtDate(new Date(reportData.dateRange.startDate))} – {fmtDate(new Date(reportData.dateRange.endDate))}
                                    </p>
                                </div>
                            </div>

                            {/* Summary Tab */}
                            {activeTab === "summary" && (
                                <div className="p-6 space-y-6">
                                    {/* KPI Cards */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {[
                                            { label: "Team Members", value: reportData.summary.totalMembers, color: "text-blue-500", bg: "bg-blue-500/10", icon: Users },
                                            { label: "Tasks Assigned", value: reportData.summary.totalTasksInPeriod, color: "text-purple-500", bg: "bg-purple-500/10", icon: Briefcase },
                                            { label: "Completed", value: reportData.summary.totalCompleted, color: "text-emerald-500", bg: "bg-emerald-500/10", icon: CheckCircle2 },
                                            { label: "Overdue", value: reportData.summary.totalOverdue, color: "text-rose-500", bg: "bg-rose-500/10", icon: AlertTriangle },
                                            { label: "Team Completion Rate", value: `${reportData.summary.teamCompletionRate}%`, color: "text-amber-500", bg: "bg-amber-500/10", icon: TrendingUp },
                                            { label: "Top Performer", value: reportData.summary.topPerformer?.name ?? "N/A", subValue: reportData.summary.topPerformer ? `${reportData.summary.topPerformer.completionRate}% rate` : "", color: "text-yellow-500", bg: "bg-yellow-500/10", icon: Star },
                                        ].map(kpi => (
                                            <div key={kpi.label} className="glass-card p-5 flex flex-col gap-3">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${kpi.bg}`}>
                                                    <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium mb-1">{kpi.label}</p>
                                                    <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                                                    {kpi.subValue && <p className="text-xs text-gray-400 mt-0.5">{kpi.subValue}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Completion Rate Bar per member */}
                                    <div className="glass-card p-5">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-blue-500" />
                                            Completion Rate by Member
                                        </h4>
                                        <div className="flex flex-col gap-3">
                                            {[...reportData.members]
                                                .sort((a: any, b: any) => b.completionRate - a.completionRate)
                                                .map((m: any) => (
                                                    <div key={m.userId} className="flex items-center gap-4">
                                                        <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                                                            {m.name.charAt(0)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between mb-1">
                                                                <span className="text-sm font-medium truncate">{m.name}</span>
                                                                <span className="text-sm font-bold ml-2 shrink-0">{m.completionRate}%</span>
                                                            </div>
                                                            <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-700 ${m.completionRate >= 75 ? "bg-emerald-500" : m.completionRate >= 40 ? "bg-amber-500" : "bg-rose-500"}`}
                                                                    style={{ width: `${m.completionRate}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <span className="text-xs text-gray-400 shrink-0">{m.totalAssigned} tasks</span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Members Tab */}
                            {activeTab === "members" && (
                                <div className="p-6">
                                    <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-white/10">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs text-gray-500 uppercase tracking-wider">
                                                    <th className="px-5 py-3">Member</th>
                                                    <th className="px-5 py-3 text-center">Assigned</th>
                                                    <th className="px-5 py-3 text-center">Done</th>
                                                    <th className="px-5 py-3 text-center">In Progress</th>
                                                    <th className="px-5 py-3 text-center">Overdue</th>
                                                    <th className="px-5 py-3 text-center">Rate</th>
                                                    <th className="px-5 py-3 text-center">Avg Days</th>
                                                    <th className="px-5 py-3 text-center">Revisions</th>
                                                    <th className="px-5 py-3">Workload</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                                {reportData.members.map((m: any) => (
                                                    <tr key={m.userId} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                        <td className="px-5 py-3">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-tr from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-300">
                                                                    {m.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-gray-900 dark:text-white">{m.name}</p>
                                                                    <p className="text-[11px] text-gray-400">{m.role.replace("_", " ")}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3 text-center">
                                                            <span className="font-bold text-gray-800 dark:text-gray-200">{m.totalAssigned}</span>
                                                        </td>
                                                        <td className="px-5 py-3 text-center">
                                                            <span className="font-bold text-emerald-500">{m.completed}</span>
                                                        </td>
                                                        <td className="px-5 py-3 text-center">
                                                            <span className="font-bold text-blue-500">{m.inProgress}</span>
                                                        </td>
                                                        <td className="px-5 py-3 text-center">
                                                            <span className={`font-bold ${m.overdue > 0 ? "text-rose-500" : "text-gray-400"}`}>{m.overdue}</span>
                                                        </td>
                                                        <td className="px-5 py-3 text-center">
                                                            <span className={`font-bold text-sm ${m.completionRate >= 75 ? "text-emerald-500" : m.completionRate >= 40 ? "text-amber-500" : "text-rose-500"}`}>
                                                                {m.completionRate}%
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-3 text-center">
                                                            <span className="text-gray-600 dark:text-gray-400 text-sm">
                                                                {m.avgDaysToComplete !== null ? `${m.avgDaysToComplete}d` : "—"}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-3 text-center">
                                                            <span className={`font-bold ${m.totalRevisions > 0 ? "text-orange-500" : "text-gray-400"}`}>{m.totalRevisions}</span>
                                                        </td>
                                                        <td className="px-5 py-3">
                                                            <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${levelColor(m.workloadLevel)}`}>
                                                                {m.workloadLevel}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Tasks Tab */}
                            {activeTab === "tasks" && (
                                <div className="p-6 space-y-6">
                                    {reportData.members.filter((m: any) => m.tasks.length > 0).map((m: any) => (
                                        <div key={m.userId}>
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-300">
                                                    {m.name.charAt(0)}
                                                </div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white">{m.name}</h4>
                                                <span className="text-xs text-gray-400">{m.tasks.length} tasks</span>
                                            </div>
                                            <div className="flex flex-col gap-2 ml-10">
                                                {m.tasks.map((t: any) => {
                                                    const isDone = ["COMPLETED", "APPROVED", "DONE"].includes(t.status);
                                                    const isOverdue = t.deadline && new Date(t.deadline) < new Date() && !isDone;
                                                    return (
                                                        <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                            <div className={`w-1.5 h-8 rounded-full shrink-0 ${isDone ? "bg-emerald-500" : isOverdue ? "bg-rose-500" : "bg-blue-500"}`} />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{t.title}</p>
                                                                <p className="text-[11px] text-gray-400 mt-0.5">{t.project ?? "No Project"}{t.division ? ` · ${t.division}` : ""}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${isDone ? "bg-emerald-500/10 text-emerald-500" : isOverdue ? "bg-rose-500/10 text-rose-500" : "bg-blue-500/10 text-blue-500"}`}>
                                                                    {statusLabel(t.status)}
                                                                </span>
                                                                {t.deadline && (
                                                                    <span className={`text-[11px] flex items-center gap-1 ${isOverdue ? "text-rose-500" : "text-gray-400"}`}>
                                                                        <Clock className="w-3 h-3" />
                                                                        {new Date(t.deadline).toLocaleDateString("en-GB")}
                                                                    </span>
                                                                )}
                                                                {t.revisionCount > 0 && (
                                                                    <span className="text-[11px] text-orange-500 flex items-center gap-1">
                                                                        <RefreshCw className="w-3 h-3" />
                                                                        ×{t.revisionCount}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                    {reportData.members.every((m: any) => m.tasks.length === 0) && (
                                        <div className="flex flex-col items-center py-16 gap-3 text-gray-400">
                                            <FileText className="w-12 h-12 opacity-20" />
                                            <p className="text-sm">No tasks found in this period</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                {reportData && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-gray-50/50 dark:bg-white/2">
                        <p className="text-xs text-gray-400">
                            {reportData.summary.totalMembers} members · {reportData.summary.totalTasksInPeriod} tasks in period
                        </p>
                        <button
                            onClick={() => exportToCSV(reportData, startDate, endDate)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-500/30"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WorkloadPage() {
    const [team, setTeam] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [exportOpen, setExportOpen] = useState(false);
    const [roleFilter, setRoleFilter] = useState("ALL");

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

    const allRoles = ["ALL", ...Array.from(new Set(team.map(u => u.role)))];
    const filteredTeam = roleFilter === "ALL" ? team : team.filter(u => u.role === roleFilter);

    const totalMembers = team.length;
    const overloadedCount = team.filter(u => u.workloadLevel === "OVERLOADED").length;
    const activeTasksAcrossTeam = team.reduce((acc, u) => acc + (u._count?.taskAssignments || 0), 0);

    const sortedTeam = [...filteredTeam].sort((a, b) =>
        (b._count?.taskAssignments || 0) - (a._count?.taskAssignments || 0)
    );

    return (
        <>
            {exportOpen && <ExportModal onClose={() => setExportOpen(false)} />}

            <div className="space-y-8 fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight mb-1">Team Workload</h2>
                        <p className="text-gray-500 dark:text-gray-400">Monitor bandwidth, reassign tasks, and prevent burnout.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Role Filter */}
                        <div className="relative">
                            <select
                                value={roleFilter}
                                onChange={e => setRoleFilter(e.target.value)}
                                className="appearance-none flex items-center gap-2 pl-4 pr-9 py-2 rounded-xl text-sm font-medium border border-[var(--card-border)] bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                            >
                                {allRoles.map(r => (
                                    <option key={r} value={r}>{r === "ALL" ? "All Roles" : r.replace("_", " ")}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>

                        <button
                            onClick={() => setExportOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-sm shadow-blue-500/30"
                        >
                            <Download className="w-4 h-4" /> Export Report
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
                            <p className="text-sm mt-1 text-rose-500/80 font-medium">
                                {overloadedCount > 0 ? "Requires task redistribution" : "All members at normal capacity"}
                            </p>
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

                {/* Bandwidth Matrix */}
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
                                        const rawCapacity = (tasks / 15) * 100;
                                        const capacityPercent = Math.min(Math.max(rawCapacity, 5), 100);
                                        const level = user.workloadLevel;
                                        const levelColor =
                                            level === "OVERLOADED" ? "text-rose-500 border-rose-500 bg-rose-500/10" :
                                                level === "LOW" ? "text-emerald-500 border-emerald-500 bg-emerald-500/10" :
                                                    "text-blue-500 border-blue-500 bg-blue-500/10";
                                        const progressColor =
                                            level === "OVERLOADED" ? "bg-rose-500" :
                                                level === "LOW" ? "bg-emerald-500" : "bg-blue-500";

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
                                                            <div className={`h-full ${progressColor} rounded-full`} style={{ width: `${capacityPercent}%` }} />
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
                                    {sortedTeam.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                                                No team members found for the selected role.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
