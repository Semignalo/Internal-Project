"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Calendar, FolderKanban, User } from "lucide-react";
import { useForm } from "react-hook-form";

type ProjectFormData = {
    name: string;
    clientName: string;
    projectType: string;
    managerId: string;
    startDate: string;
    deadline: string;
};

export default function CreateProjectModal({
    isOpen,
    onClose,
    onSuccess
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newProject: any) => void;
}) {
    const [users, setUsers] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ProjectFormData>();

    useEffect(() => {
        if (isOpen) {
            fetch("/api/users")
                .then(res => res.json())
                .then(data => setUsers(data.filter((u: any) => u.deletedAt === null)))
                .catch(err => console.error("Error fetching users:", err));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const onSubmit = async (data: ProjectFormData) => {
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...data,
                    startDate: new Date(data.startDate).toISOString(),
                    deadline: new Date(data.deadline).toISOString(),
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create project");
            }

            const newProject = await response.json();
            reset();
            onSuccess(newProject);
            onClose();
        } catch (error) {
            console.error(error);
            alert("Something went wrong while creating the project.");
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
                    <h2 className="text-lg font-bold">New Project</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 flex-1">
                    <form id="project-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        <div className="space-y-4 text-sm">
                            <div>
                                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                                    <FolderKanban className="w-4 h-4 text-gray-400" /> Project Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Nike Summer Campaign"
                                    className={`w-full px-4 py-2.5 rounded-xl border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
                                    {...register("name", { required: true })}
                                />
                                {errors.name && <span className="text-xs text-red-500 mt-1 block">Project name is required</span>}
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400" /> Client / Brand Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Nike Inc."
                                    className={`w-full px-4 py-2.5 rounded-xl border ${errors.clientName ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
                                    {...register("clientName", { required: true })}
                                />
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1.5">Project Type</label>
                                <select
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-900 dark:text-white"
                                    {...register("projectType", { required: true })}
                                >
                                    <option className="dark:bg-[#1a1c23]" value="">Select a type...</option>
                                    <option className="dark:bg-[#1a1c23]" value="Campaign">Marketing Campaign</option>
                                    <option className="dark:bg-[#1a1c23]" value="Branding">Branding Identity</option>
                                    <option className="dark:bg-[#1a1c23]" value="Video Production">Video Production</option>
                                    <option className="dark:bg-[#1a1c23]" value="Web Development">Web Development</option>
                                    <option className="dark:bg-[#1a1c23]" value="Social Media">Social Media Management</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1.5">Project Manager</label>
                                <select
                                    className={`w-full px-4 py-2.5 rounded-xl border ${errors.managerId ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-900 dark:text-white`}
                                    {...register("managerId", { required: true })}
                                >
                                    <option className="dark:bg-[#1a1c23]" value="">Select a manager...</option>
                                    {users.map((u: any) => (
                                        <option className="dark:bg-[#1a1c23]" key={u.id} value={u.id}>
                                            {u.name} ({u.role})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-gray-400" /> Start Date
                                    </label>
                                    <input
                                        type="date"
                                        className={`w-full px-3 py-2.5 rounded-xl border ${errors.startDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-900 dark:text-gray-100`}
                                        {...register("startDate", { required: true })}
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-gray-400" /> Deadline
                                    </label>
                                    <input
                                        type="date"
                                        className={`w-full px-3 py-2.5 rounded-xl border ${errors.deadline ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-900 dark:text-gray-100`}
                                        {...register("deadline", { required: true })}
                                    />
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
                            form="project-form"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:pointer-events-none flex justify-center items-center"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Project"}
                        </button>
                    </div>
                </div>
            </div>
            <style jsx>{`
        .slide-in-right {
          animation: slideInRight 0.3s ease-out forwards;
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
        </div>
    );
}
