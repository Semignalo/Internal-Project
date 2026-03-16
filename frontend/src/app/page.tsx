"use client";

import { useEffect, useState } from "react";
import { FolderKanban, TrendingUp, AlertCircle, Clock } from "lucide-react";

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Guest");

  useEffect(() => {
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1">Good morning, {userName}!</h2>
          <p className="text-gray-500 dark:text-gray-400">Here's what's happening in your agency today.</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Projects"
          value={metrics.activeProjects}
          trend="+2 this week"
          icon={<FolderKanban className="text-blue-500" />}
          gradient="from-blue-500/10 to-indigo-500/10"
        />
        <MetricCard
          title="Tasks Pending Review"
          value={metrics.pendingTasks}
          trend="Requires attention"
          icon={<Clock className="text-amber-500" />}
          gradient="from-amber-500/10 to-orange-500/10"
        />
        <MetricCard
          title="Revisions Requested"
          value={metrics.revisions}
          trend="-12% from last week"
          icon={<AlertCircle className="text-rose-500" />}
          gradient="from-rose-500/10 to-pink-500/10"
        />
        <MetricCard
          title="Team Velocity"
          value={`${metrics.velocity}%`}
          trend="+4% this month"
          icon={<TrendingUp className="text-emerald-500" />}
          gradient="from-emerald-500/10 to-teal-500/10"
        />
      </div>

      {/* Main Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Projects List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold">Active Projects Health</h3>
          <div className="glass-card p-6 flex flex-col gap-5 text-sm md:text-base">
            {projects.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 py-4 text-center">No active projects right now.</p>
            ) : (
              projects.map((project: any, index: number) => (
                <div key={project.id}>
                  <ProjectRow
                    name={project.name}
                    client={project.clientName}
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

        {/* Team Workload */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Team Workload</h3>
          <div className="glass-card p-6 flex flex-col gap-6 text-sm md:text-base border border-blue-100 dark:border-blue-900/50">
            {workload.map((user: any) => (
              <WorkloadRow
                key={user.name}
                name={user.name}
                tasks={user.tasks || 0}
                level={user.level}
                levelColor={
                  user.level === "OVERLOADED" ? "text-rose-500 bg-rose-500/10" :
                    user.level === "LOW" ? "text-emerald-500 bg-emerald-500/10" : "text-blue-500 bg-blue-500/10"
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Subcomponents
function MetricCard({ title, value, trend, icon, gradient }: any) {
  return (
    <div className="glass-card p-6 relative overflow-hidden group">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} blur-2xl group-hover:bg-opacity-80 transition-all`}></div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="p-3 bg-white/50 dark:bg-black/50 rounded-2xl shadow-sm border border-[var(--card-border)] backdrop-blur-md">
          {icon}
        </div>
      </div>
      <div className="relative z-10">
        <h4 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</h4>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{trend}</span>
        </div>
      </div>
    </div>
  );
}

function ProjectRow({ name, client, progress, status, color }: any) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 hover:bg-white/30 dark:hover:bg-black/10 p-3 -mx-3 rounded-xl transition-colors cursor-pointer group">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className={`w-1.5 h-10 rounded-full ${color} shadow-sm group-hover:scale-110 transition-transform`}></div>
        <div className="truncate">
          <h4 className="font-semibold text-gray-900 dark:text-white truncate">{name}</h4>
          <p className="text-xs text-gray-500 truncate">{client}</p>
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

function WorkloadRow({ name, tasks, level, levelColor }: any) {
  return (
    <div className="flex items-center justify-between hover:bg-white/40 dark:hover:bg-black/20 p-2.5 -mx-2.5 rounded-xl transition-colors cursor-pointer">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] ring-1 ring-black/5 dark:ring-white/10">
          {name.charAt(0)}
        </div>
        <div className="truncate">
          <h4 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 truncate">{name}</h4>
          <p className="text-[13px] text-gray-500 mt-0.5">{tasks} active tasks</p>
        </div>
      </div>
      <span className={`text-[11px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full shadow-sm ${levelColor} shrink-0`}>
        {level}
      </span>
    </div>
  );
}
