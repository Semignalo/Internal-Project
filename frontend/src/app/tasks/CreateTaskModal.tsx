"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Calendar, FileText, LayoutList, AlertTriangle, FolderKanban, Users } from "lucide-react";
import { useForm } from "react-hook-form";

type TaskFormData = {
    title: string;
    description: string;
    priority: string;
    projectId: string;
    divisionId: string;
    deadline: string;
};

export default function CreateTaskModal({
    isOpen,
    onClose,
    onSuccess,
    defaultColumn
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newTask: any) => void;
    defaultColumn?: string;
}) {
    const [projects, setProjects] = useState<any[]>([]);
    const [divisions, setDivisions] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<TaskFormData>({
        defaultValues: {
            priority: "MEDIUM"
        }
    });

    const selectedProjectId = watch("projectId");

    useEffect(() => {
        if (isOpen) {
            Promise.all([
                fetch("/api/projects").then(r => r.json()),
                fetch("/api/divisions").then(r => r.json()),
                fetch("/api/users").then(r => r.json())
            ])
                .then(([projectsData, divisionsData, usersData]) => {
                    setProjects(projectsData.filter((p: any) => p.deletedAt === null));
                    setDivisions(divisionsData);
                    setUsers(usersData);
                })
                .catch(err => console.error("Error fetching data:", err));
        }
    }, [isOpen]);

    const filteredDivisions = divisions.filter(d => d.projectId === selectedProjectId);

    if (!isOpen) return null;

    const onSubmit = async (data: TaskFormData) => {
        setIsSubmitting(true);
        try {
            const payload: any = {
                title: data.title,
                description: data.description,
                priority: data.priority,
                divisionId: data.divisionId,
                status: defaultColumn === "IN_PROGRESS" ? "IN_PROGRESS" : defaultColumn === "COMPLETED" ? "COMPLETED" : "TODO",
                assigneeIds: selectedUsers
            };

            if (data.deadline) {
                payload.deadline = new Date(data.deadline).toISOString();
            }

            const response = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Failed to create task");
            }

            const newTask = await response.json();
            reset();
            setSelectedUsers([]);
            onSuccess(newTask);
            onClose();
        } catch (error) {
            console.error(error);
            alert("Something went wrong while creating the task.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm transition-opacity">
            <div
                className="absolute inset-0 z-40"
                onClick={onClose}
            />

            <div className="relative z-50 w-full max-w-md h-full bg-white dark:bg-[#12141a] shadow-2xl flex flex-col slide-in-right overflow-y-auto border-l border-[var(--card-border)]">
                <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--card-border)] bg-gray-50/50 dark:bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                    <h2 className="text-lg font-bold">New Task</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 flex-1">
                    <form id="task-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        <div className="space-y-4 text-sm">
                            <div>
                                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-400" /> Task Title
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Design Homepage Wireframes"
                                    className={`w-full px-4 py-2.5 rounded-xl border ${errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
                                    {...register("title", { required: true })}
                                />
                                {errors.title && <span className="text-xs text-red-500 mt-1 block">Task title is required</span>}
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description (Optional)</label>
                                <textarea
                                    placeholder="Provide task instructions or details..."
                                    rows={4}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                                    {...register("description")}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                                        <FolderKanban className="w-4 h-4 text-gray-400" /> Project
                                    </label>
                                    <select
                                        className={`w-full px-4 py-2.5 rounded-xl border ${errors.projectId ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-900 dark:text-white`}
                                        {...register("projectId", { required: true })}
                                    >
                                        <option value="">Select a project...</option>
                                        {projects.map((p: any) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.projectId && <span className="text-xs text-red-500 mt-1 block">Project is required</span>}
                                </div>
                                <div>
                                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                                        <LayoutList className="w-4 h-4 text-gray-400" /> Division
                                    </label>
                                    <select
                                        className={`w-full px-4 py-2.5 rounded-xl border ${errors.divisionId ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-900 dark:text-white`}
                                        {...register("divisionId", { required: true })}
                                        disabled={!selectedProjectId}
                                    >
                                        <option value="">Select a division...</option>
                                        {filteredDivisions.map((d: any) => (
                                            <option key={d.id} value={d.id}>
                                                {d.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.divisionId && <span className="text-xs text-red-500 mt-1 block">Division is required</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                                        <AlertTriangle className="w-4 h-4 text-gray-400" /> Priority
                                    </label>
                                    <select
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-900 dark:text-white"
                                        {...register("priority")}
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                        <option value="URGENT">Urgent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-gray-400" /> Deadline (Optional)
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-900 dark:text-gray-100"
                                        {...register("deadline")}
                                    />
                                </div>
                            </div>

                            {/* Assignees */}
                            <div>
                                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-400" /> Assign Team Members
                                </label>
                                <div className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-black/20 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2">
                                    {users.map(u => (
                                        <label key={u.id} className="flex items-center gap-3 p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
                                            <input
                                                type="checkbox"
                                                className="rounded text-blue-500 focus:ring-blue-500/50 cursor-pointer w-4 h-4"
                                                checked={selectedUsers.includes(u.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedUsers(prev => [...prev, u.id]);
                                                    else setSelectedUsers(prev => prev.filter(id => id !== u.id));
                                                }}
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium leading-none">{u.name}</p>
                                                <p className="text-[10px] text-gray-500 mt-0.5 uppercase">{u.role}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-[var(--card-border)] bg-gray-50/50 dark:bg-white/5 sticky bottom-0 z-10">
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl font-medium border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1c23] hover:bg-gray-50 dark:hover:bg-[#20232a] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="task-form"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:pointer-events-none flex justify-center items-center"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Task"}
                        </button>
                    </div>
                </div>
            </div >
            <style jsx>{`
        .slide-in-right {
          animation: slideInRight 0.3s ease-out forwards;
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
        </div >
    );
}
