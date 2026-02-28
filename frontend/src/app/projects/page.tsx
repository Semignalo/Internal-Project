"use client";

import { useEffect, useState } from "react";
import { FolderKanban, TrendingUp, AlertCircle, Clock, Search, Filter, Plus, MoreHorizontal, Calendar } from "lucide-react";
import CreateProjectModal from "./CreateProjectModal";
import ProjectDetailModal from "./ProjectDetailModal";

export default function ProjectsPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<any>(null);

    useEffect(() => {
        fetch("http://localhost:5000/projects")
            .then(res => res.json())
            .then(json => {
                // Filter out soft-deleted if applicable
                const activeProjects = json.filter((p: any) => p.deletedAt === null);
                setProjects(activeProjects);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch projects data:", err);
                setLoading(false);
            });
    }, []);

    const filteredProjects = projects.filter(p => {
        if (filter === "ALL") return true;
        return p.status === filter;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 rounded-full border-4 border-blue-500/20 shadow-sm animate-spin border-t-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-1">Projects Portfolio</h2>
                    <p className="text-gray-500 dark:text-gray-400">Manage, track, and monitor all active agency operations.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-[var(--card-border)] bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black transition-colors shadow-sm">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl hover:-translate-y-0.5"
                    >
                        <Plus className="w-4 h-4" /> Create Project
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 p-1 bg-black/5 dark:bg-white/5 rounded-xl w-fit border border-[var(--card-border)]">
                <TabButton label="All Projects" active={filter === "ALL"} onClick={() => setFilter("ALL")} count={projects.length} />
                <TabButton label="Production" active={filter === "PRODUCTION"} onClick={() => setFilter("PRODUCTION")} count={projects.filter(p => p.status === "PRODUCTION").length} />
                <TabButton label="Revision" active={filter === "REVISION"} onClick={() => setFilter("REVISION")} count={projects.filter(p => p.status === "REVISION").length} />
                <TabButton label="Planning" active={filter === "PLANNING"} onClick={() => setFilter("PLANNING")} count={projects.filter(p => p.status === "PLANNING").length} />
            </div>

            {/* Projects List */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--card-border)] bg-black/5 dark:bg-white/5 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
                                <th className="px-6 py-4 rounded-tl-xl">Project Info</th>
                                <th className="px-6 py-4">Manager</th>
                                <th className="px-6 py-4">Timeline</th>
                                <th className="px-6 py-4 w-1/4">Progress</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 rounded-tr-xl"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--card-border)]">
                            {filteredProjects.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <FolderKanban className="w-12 h-12 opacity-20" />
                                            <p>No projects match your current filter.</p>
                                            <button
                                                onClick={() => setFilter("ALL")}
                                                className="text-blue-500 hover:underline text-sm font-medium"
                                            >
                                                Clear filters
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProjects.map((project: any) => (
                                    <tr key={project.id} className="hover:bg-white/40 dark:hover:bg-black/20 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm
                          ${project.status === 'REVISION' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' :
                                                        project.status === 'PRODUCTION' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' :
                                                            project.status === 'PLANNING' ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' :
                                                                'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>
                                                    <FolderKanban className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div
                                                        onClick={() => setSelectedProject(project)}
                                                        className="font-semibold text-gray-900 dark:text-white text-[15px] group-hover:text-blue-500 transition-colors cursor-pointer"
                                                    >
                                                        {project.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-0.5">{project.clientName} • {project.projectType}</div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5">
                                            {project.manager ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                                                        {project.manager.name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-medium">{project.manager.name.split(' ')[0]}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400 italic">Unassigned</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1 text-sm">
                                                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                                                    <Calendar className="w-3.5 h-3.5 opacity-70" />
                                                    <span>
                                                        {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                {isExpiringSoon(project.deadline) && project.status !== "DONE" && (
                                                    <span className="text-xs font-semibold text-rose-500">Expiring soon</span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="w-full">
                                                <div className="flex justify-between text-xs mb-1.5">
                                                    <span className="font-medium text-gray-500">Progress</span>
                                                    <span className="font-bold">{project.overallProgress}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200/60 dark:bg-gray-800/60 rounded-full h-2 shadow-inner overflow-hidden">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-1000 ease-out shadow-sm
                              ${project.status === 'REVISION' ? 'bg-amber-500' :
                                                                project.status === 'PLANNING' ? 'bg-purple-500' :
                                                                    project.status === 'DONE' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                        style={{ width: `${project.overallProgress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5 text-center">
                                            <span className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-sm ring-1 ring-inset inline-block
                          ${project.status === 'REVISION' ? 'text-amber-600 ring-amber-500/20 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400' :
                                                    project.status === 'PRODUCTION' ? 'text-blue-600 ring-blue-500/20 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400' :
                                                        project.status === 'PLANNING' ? 'text-purple-600 ring-purple-500/20 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400' :
                                                            'text-emerald-600 ring-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
                                                {project.status.replace("_", " ")}
                                            </span>
                                        </td>

                                        <td className="px-6 py-5 text-right">
                                            <button
                                                title="View Project"
                                                onClick={() => setSelectedProject(project)}
                                                className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                                            >
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <CreateProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={(newProject: any) => {
                    // Refetch projects to get the nested relationships (like manager)
                    fetch("http://localhost:5000/projects")
                        .then(res => res.json())
                        .then(json => setProjects(json.filter((p: any) => p.deletedAt === null)));
                }}
            />

            <ProjectDetailModal
                isOpen={!!selectedProject}
                onClose={() => setSelectedProject(null)}
                project={selectedProject}
                onProjectUpdated={(updatedProject) => {
                    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
                }}
                onProjectDeleted={(deletedId) => {
                    setProjects(prev => prev.filter(p => p.id !== deletedId));
                }}
            />
        </div>
    );
}

// Utility components and functions
function TabButton({ label, active, onClick, count }: { label: string, active: boolean, onClick: () => void, count: number }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
        ${active
                    ? 'bg-white dark:bg-[#1a1c23] text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
        >
            {label}
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${active ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-black/5 dark:bg-white/10 text-gray-500 dark:text-gray-400'}`}>
                {count}
            </span>
        </button>
    );
}

function isExpiringSoon(dateString: string) {
    if (!dateString) return false;
    const deadline = new Date(dateString);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
}
