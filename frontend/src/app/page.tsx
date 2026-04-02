"use client";

import { useEffect, useState } from "react";
import { FolderKanban, TrendingUp, AlertCircle, Clock, ArrowUp, ArrowDown, Minus, CheckCircle2, AlertTriangle, Activity, Users } from "lucide-react";
import Link from "next/link";

function formatRelative(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatActionLabel(action: string) {
  const map: Record<string, string> = {
    TASK_COMPLETED: "completed a task",
    TASK_CREATED: "created a task",
    REVISION_REQUESTED: "requested a revision",
    TASK_APPROVED: "approved a task",
    PROJECT_CREATED: "created a project",
    PROJECT_UPDATED: "updated a project",
    TASK_UPDATED: "updated a task",
    TASK_DELETED: "deleted a task",
  };
  return map[action] ?? action.toLowerCase().replace(/_/g, " ");
}

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Guest");
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUserName(JSON.parse(userStr).name.split(" ")[0]);
      } catch (e) { }
    }

    fetch("/api/dashboard")
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch dashboard data:", err);
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

  const metrics = data?.metrics || { activeProjects: 0, pendingTasks: 0, revisions: 0, velocity: 0 };
  const projects = data?.activeProjects || [];
  const workload = data?.teamWorkload || [];
  const upcomingDeadlines: any[] = data?.upcomingDeadlines || [];
  const overdueTasks: any[] = data?.overdueTasks || [];
  const recentActivity: any[] = data?.recentActivity || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1">{greeting}, {userName}!</h2>
          <p className="text-gray-500 dark:text-gray-400">Here's what's happening in your agency today.</p>
        </div>
        {overdueTasks.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-medium animate-pulse">
            <AlertTriangle className="w-4 h-4" />
            {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Projects"
          value={metrics.activeProjects}
          trend={metrics.activeProjectsTrend}
          trendLabel="this week"
          icon={<FolderKanban className="text-blue-500" />}
          gradient="from-blue-500/10 to-indigo-500/10"
        />
        <MetricCard
          title="Tasks Pending Review"
          value={metrics.pendingTasks}
          trend={metrics.pendingTasksTrend}
          trendLabel="from last week"
          icon={<Clock className="text-amber-500" />}
          gradient="from-amber-500/10 to-orange-500/10"
          invertTrend
        />
        <MetricCard
          title="Revisions Requested"
          value={metrics.revisions}
          trend={metrics.revisionsTrend}
          trendLabel="from last week"
          icon={<AlertCircle className="text-rose-500" />}
          gradient="from-rose-500/10 to-pink-500/10"
          invertTrend
        />
        <MetricCard
          title="Team Velocity"
          value={`${metrics.velocity}%`}
          trend={metrics.velocityTrend}
          trendLabel="vs last month"
          icon={<TrendingUp className="text-emerald-500" />}
          gradient="from-emerald-500/10 to-teal-500/10"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Active Projects */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Active Projects Health</h3>
              <Link href="/projects" className="text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors">View all →</Link>
            </div>
            <div className="glass-card p-6 flex flex-col gap-5 text-sm md:text-base">
              {projects.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 py-4 text-center">No active projects right now.</p>
              ) : (
                projects.map((project: any, index: number) => (
                  <div key={project.id}>
                    <ProjectRow
                      name={project.name}
                      client={project.clientName}
                      manager={project.manager?.name}
                      progress={Math.round(project.overallProgress || 0)}
                      status={project.status.replace("_", " ")}
                      color={
                        project.status === "REVISION" ? "bg-amber-500" :
                          project.status === "PLANNING" ? "bg-purple-500" :
                            project.status === "DONE" ? "bg-emerald-500" : "bg-blue-500"
                      }
                    />
                    {index < projects.length - 1 && <hr className="border-[var(--card-border)] mt-4" />}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Overdue + Upcoming Deadlines */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Overdue */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <h3 className="text-lg font-bold">Overdue Tasks</h3>
                {overdueTasks.length > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500">{overdueTasks.length}</span>
                )}
              </div>
              <div className="glass-card p-4 flex flex-col gap-3">
                {overdueTasks.length === 0 ? (
                  <div className="flex flex-col items-center py-4 gap-2 text-emerald-500">
                    <CheckCircle2 className="w-8 h-8" />
                    <p className="text-sm font-medium">All tasks on time!</p>
                  </div>
                ) : (
                  overdueTasks.map((task: any) => (
                    <DeadlineRow key={task.id} task={task} isOverdue />
                  ))
                )}
              </div>
            </div>

            {/* Upcoming */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold">Upcoming Deadlines</h3>
                {upcomingDeadlines.length > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">{upcomingDeadlines.length}</span>
                )}
              </div>
              <div className="glass-card p-4 flex flex-col gap-3">
                {upcomingDeadlines.length === 0 ? (
                  <p className="text-sm text-gray-400 italic text-center py-4">No upcoming deadlines in 7 days</p>
                ) : (
                  upcomingDeadlines.map((task: any) => (
                    <DeadlineRow key={task.id} task={task} isOverdue={false} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-8">
          {/* Team Workload */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">Team Workload</h3>
                <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse inline-block"></span>
              </div>
              <Link href="/workload" className="text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors">View all →</Link>
            </div>
            <div className="glass-card p-6 flex flex-col gap-4 border border-blue-100 dark:border-blue-900/50">
              {workload.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No team data available.</p>
              ) : (
                workload.map((user: any) => (
                  <WorkloadRow
                    key={user.id}
                    name={user.name}
                    tasks={user.tasks || 0}
                    level={user.level}
                    levelColor={
                      user.level === "OVERLOADED" ? "text-rose-500 bg-rose-500/10" :
                        user.level === "HIGH" ? "text-orange-500 bg-orange-500/10" :
                          user.level === "LOW" ? "text-emerald-500 bg-emerald-500/10" :
                            "text-blue-500 bg-blue-500/10"
                    }
                  />
                ))
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-500" />
              <h3 className="text-xl font-bold">Recent Activity</h3>
            </div>
            <div className="glass-card p-4 flex flex-col gap-3">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-gray-400 italic text-center py-4">No recent activity.</p>
              ) : (
                recentActivity.map((log: any) => (
                  <div key={log.id} className="flex items-start gap-3 py-2 border-b border-[var(--card-border)] last:border-0">
                    <div className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-tr from-purple-500/20 to-blue-500/20 flex items-center justify-center text-xs font-bold text-purple-400">
                      {log.userName?.charAt(0) ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] leading-snug text-gray-800 dark:text-gray-200">
                        <span className="font-semibold">{log.userName}</span>{" "}
                        <span className="text-gray-500">{formatActionLabel(log.action)}</span>
                        {log.projectName && (
                          <span className="text-gray-500"> in <span className="font-medium text-gray-700 dark:text-gray-300">{log.projectName}</span></span>
                        )}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{formatRelative(log.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Subcomponents ---

function MetricCard({ title, value, trend, trendLabel, icon, gradient, invertTrend = false }: any) {
  const isPositive = trend > 0;
  const isNeutral = trend === 0;
  const isGood = invertTrend ? !isPositive : isPositive;

  return (
    <div className="glass-card p-6 relative overflow-hidden group">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} blur-2xl group-hover:bg-opacity-80 transition-all`}></div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="p-3 bg-white/50 dark:bg-black/50 rounded-2xl shadow-sm border border-[var(--card-border)] backdrop-blur-md">
          {icon}
        </div>
        {trend !== undefined && !isNeutral && (
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isGood ? 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400' : 'text-rose-600 bg-rose-500/10 dark:text-rose-400'}`}>
            {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(trend)}
          </span>
        )}
        {isNeutral && (
          <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full text-gray-500 bg-gray-500/10">
            <Minus className="w-3 h-3" /> 0
          </span>
        )}
      </div>
      <div className="relative z-10">
        <h4 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</h4>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
          {trendLabel && <span className="text-xs font-medium text-gray-400 truncate">{trendLabel}</span>}
        </div>
      </div>
    </div>
  );
}

function ProjectRow({ name, client, manager, progress, status, color }: any) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 hover:bg-white/30 dark:hover:bg-black/10 p-3 -mx-3 rounded-xl transition-colors cursor-pointer group">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className={`w-1.5 h-10 rounded-full ${color} shadow-sm group-hover:scale-110 transition-transform`}></div>
        <div className="truncate">
          <h4 className="font-semibold text-gray-900 dark:text-white truncate">{name}</h4>
          <p className="text-xs text-gray-500 truncate">{client}{manager ? ` · ${manager}` : ''}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-8 w-full sm:w-1/2">
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1.5 px-0.5">
            <span className="font-medium text-gray-600 dark:text-gray-300">Progress</span>
            <span className="font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200/60 dark:bg-gray-800/60 rounded-full h-1.5 shadow-inner overflow-hidden">
            <div className={`${color} h-1.5 rounded-full transition-all duration-1000 ease-out`} style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        <div className="w-24 text-right flex-shrink-0">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${color.replace('bg-', 'text-')} bg-white dark:bg-black shadow-sm ring-1 ring-inset ${color.replace('bg-', 'ring-')}/20 inline-block`}>
            {status}
          </span>
        </div>
      </div>
    </div>
  );
}

function DeadlineRow({ task, isOverdue }: { task: any; isOverdue: boolean }) {
  const deadline = new Date(task.deadline);
  const now = new Date();
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const assigneeNames = task.assignees?.map((a: any) => a.user?.name).filter(Boolean).join(", ") || "Unassigned";

  return (
    <div className={`flex flex-col gap-1 p-3 rounded-xl border transition-colors ${isOverdue
      ? 'border-rose-200 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-500/5'
      : 'border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5'
      }`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-semibold text-gray-900 dark:text-white leading-snug truncate">{task.title}</p>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${isOverdue
          ? 'bg-rose-500/15 text-rose-500'
          : diffDays === 0 ? 'bg-rose-500/15 text-rose-500'
            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
          }`}>
          {isOverdue ? `${Math.abs(diffDays)}d overdue` : diffDays === 0 ? 'Today' : `${diffDays}d left`}
        </span>
      </div>
      <p className="text-[11px] text-gray-500 truncate">{task.division?.project?.name} · {assigneeNames}</p>
    </div>
  );
}

function WorkloadRow({ name, tasks, level, levelColor }: any) {
  return (
    <div className="flex items-center justify-between hover:bg-white/40 dark:hover:bg-black/20 p-2.5 -mx-2.5 rounded-xl transition-colors cursor-pointer">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] ring-1 ring-black/5 dark:ring-white/10">
          {name.charAt(0)}
        </div>
        <div className="truncate">
          <h4 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 truncate">{name}</h4>
          <p className="text-[13px] text-gray-500 mt-0.5">{tasks} active task{tasks !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <span className={`text-[11px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full shadow-sm ${levelColor} shrink-0`}>
        {level}
      </span>
    </div>
  );
}
