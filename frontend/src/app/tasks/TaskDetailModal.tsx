"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2, Calendar, FileText, CheckCircle2, MessageSquare, Clock, Users, UploadCloud, Paperclip, Save, FolderKanban, LayoutList, Check, Edit2, Trash2 } from "lucide-react";

export default function TaskDetailModal({
    isOpen,
    onClose,
    task,
    onTaskUpdated,
    onTaskDeleted
}: {
    isOpen: boolean;
    onClose: () => void;
    task: any | null;
    onTaskUpdated?: (updatedTask: any) => void;
    onTaskDeleted?: (taskId: string) => void;
}) {
    const [localTask, setLocalTask] = useState<any>(null);
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Subtask States
    const [isAddingSubtask, setIsAddingSubtask] = useState(false);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

    // Division / Project States
    const [isEditingDivision, setIsEditingDivision] = useState(false);
    const [projects, setProjects] = useState<any[]>([]);
    const [divisions, setDivisions] = useState<any[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [selectedDivisionId, setSelectedDivisionId] = useState("");

    // Assignees States
    const [users, setUsers] = useState<any[]>([]);
    const [isEditingAssignees, setIsEditingAssignees] = useState(false);

    const titleInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const subtaskInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (task) {
            setLocalTask({ ...task });
            setSelectedProjectId(task.division?.projectId || "");
            setSelectedDivisionId(task.divisionId || "");
        }
    }, [task]);

    useEffect(() => {
        if (isOpen && projects.length === 0) {
            Promise.all([
                fetch("/api/projects").then(r => r.json()),
                fetch("/api/divisions").then(r => r.json()),
                fetch("/api/users").then(r => r.json())
            ]).then(([p, d, u]) => {
                setProjects(p.filter((x: any) => !x.deletedAt));
                setDivisions(d);
                setUsers(u);
            }).catch(console.error);
        }
    }, [isOpen, projects.length]);

    const filteredDivisions = divisions.filter(d => d.projectId === selectedProjectId);

    if (!isOpen || !localTask) return null;

    const isUrgent = localTask.priority === "URGENT" || localTask.priority === "HIGH";

    const handleSave = async (field: string, value: any) => {
        setLocalTask((prev: any) => ({ ...prev, [field]: value }));
        setIsSaving(true);
        try {
            const res = await fetch(`/api/tasks/${localTask.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: value })
            });
            if (res.ok) {
                const updated = await res.json();

                // Keep references for division/project if updated returned just IDs
                if (field === 'divisionId') {
                    const divisionObj = divisions.find(d => d.id === value);
                    updated.division = { ...divisionObj, project: projects.find(p => p.id === divisionObj?.projectId) };
                    setLocalTask((prev: any) => ({ ...prev, division: updated.division }));
                }

                if (field === 'assigneeIds') {
                    setLocalTask((prev: any) => ({ ...prev, assignees: updated.assignees }));
                }

                if (onTaskUpdated) onTaskUpdated(updated);
            }
        } catch (error) {
            console.error("Failed to update task", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteTask = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/tasks/${localTask.id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                if (onTaskDeleted) onTaskDeleted(localTask.id);
                onClose();
            }
        } catch (error) {
            console.error("Failed to delete task", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setIsUploading(true);
            const formData = new FormData();
            Array.from(e.target.files).forEach(file => {
                formData.append('files', file);
            });

            try {
                const res = await fetch(`/api/tasks/${localTask.id}/attachments`, {
                    method: 'POST',
                    body: formData
                });
                if (res.ok) {
                    const newAttachments = await res.json();
                    const updatedTask = {
                        ...localTask,
                        attachments: [...(localTask.attachments || []), ...newAttachments]
                    };
                    setLocalTask(updatedTask);
                    if (onTaskUpdated) onTaskUpdated(updatedTask);
                }
            } catch (error) {
                console.error("Failed to upload files", error);
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        }
    };

    const handleRemoveAttachment = async (attachmentId: string) => {
        try {
            const res = await fetch(`/api/tasks/attachments/${attachmentId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                const newAttachments = (localTask.attachments || []).filter((a: any) => a.id !== attachmentId);
                const updatedTask = { ...localTask, attachments: newAttachments };
                setLocalTask(updatedTask);
                if (onTaskUpdated) onTaskUpdated(updatedTask);
            }
        } catch (error) {
            console.error("Failed to remove attachment", error);
        }
    };

    const handleAddSubtask = async () => {
        if (!newSubtaskTitle.trim()) {
            setIsAddingSubtask(false);
            return;
        }

        try {
            const res = await fetch(`/api/tasks/${localTask.id}/subtasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newSubtaskTitle })
            });
            if (res.ok) {
                const newSubtask = await res.json();
                const updatedTask = {
                    ...localTask,
                    subtasks: [...(localTask.subtasks || []), newSubtask]
                };
                setLocalTask(updatedTask);
                setNewSubtaskTitle("");
                setIsAddingSubtask(false);
                if (onTaskUpdated) onTaskUpdated(updatedTask);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggleSubtask = async (subtaskId: string, currentStatus: boolean) => {
        // Optimistic toggle
        const updatedSubtasks = localTask.subtasks.map((s: any) =>
            s.id === subtaskId ? { ...s, isDone: !currentStatus } : s
        );
        const updatedTask = { ...localTask, subtasks: updatedSubtasks };
        setLocalTask(updatedTask);
        if (onTaskUpdated) onTaskUpdated(updatedTask);

        try {
            await fetch(`/api/tasks/subtasks/${subtaskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isDone: !currentStatus })
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteSubtask = async (subtaskId: string) => {
        // Optimistic delete
        const updatedSubtasks = localTask.subtasks.filter((s: any) => s.id !== subtaskId);
        const updatedTask = { ...localTask, subtasks: updatedSubtasks };
        setLocalTask(updatedTask);
        if (onTaskUpdated) onTaskUpdated(updatedTask);

        try {
            await fetch(`/api/tasks/subtasks/${subtaskId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity p-4">
            <div
                className="absolute inset-0 z-40"
                onClick={onClose}
            />

            <div className="relative z-50 w-full max-w-3xl bg-white dark:bg-[#12141a] rounded-2xl shadow-2xl flex flex-col pop-in overflow-hidden border border-[var(--card-border)] max-h-[90vh]">
                {/* Header */}
                <div className="flex items-start justify-between px-6 py-5 border-b border-[var(--card-border)] bg-gray-50/50 dark:bg-white/5">
                    <div className="flex flex-col gap-2 flex-1 mr-8">
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md
                ${isUrgent
                                    ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 ring-1 ring-inset ring-rose-500/20'
                                    : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 ring-1 ring-inset ring-blue-500/20'}`}>
                                {localTask.priority || "MEDIUM"}
                            </span>

                            {localTask.division?.project && (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 ring-1 ring-inset ring-purple-500/20 flex items-center gap-1">
                                    <FolderKanban className="w-3 h-3" /> {localTask.division.project.name}
                                </span>
                            )}

                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300 ring-1 ring-inset ring-gray-500/20">
                                {localTask.division?.name || "Unassigned Div"}
                            </span>
                            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
                        </div>

                        {isEditingTitle ? (
                            <input
                                ref={titleInputRef}
                                type="text"
                                className="text-xl font-bold bg-white dark:bg-black/50 border border-blue-500 rounded p-1 p-0.5 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                value={localTask.title}
                                onChange={(e) => setLocalTask({ ...localTask, title: e.target.value })}
                                onBlur={() => {
                                    setIsEditingTitle(false);
                                    if (localTask.title !== task.title) handleSave('title', localTask.title);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') titleInputRef.current?.blur();
                                }}
                                autoFocus
                            />
                        ) : (
                            <h2
                                className="text-xl font-bold leading-tight cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 rounded px-1 -mx-1 transition-colors"
                                onClick={() => setIsEditingTitle(true)}
                                title="Click to edit title"
                            >
                                {localTask.title}
                            </h2>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors absolute right-4 top-4"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Body */}
                <div className="p-6 flex-1 overflow-y-auto w-full">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        {/* Main Left Content */}
                        <div className="md:col-span-2 space-y-8">

                            {/* Description */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white text-sm">
                                        <FileText className="w-4 h-4 text-gray-500" /> Description
                                    </h4>
                                    {!isEditingDesc && (
                                        <button onClick={() => setIsEditingDesc(true)} className="text-xs font-semibold text-blue-500 hover:text-blue-600 dark:text-blue-400">
                                            Edit
                                        </button>
                                    )}
                                </div>

                                {isEditingDesc ? (
                                    <div className="space-y-2">
                                        <textarea
                                            className="w-full bg-white dark:bg-black/40 border border-[var(--card-border)] rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[120px]"
                                            value={localTask.description || ""}
                                            onChange={(e) => setLocalTask({ ...localTask, description: e.target.value })}
                                            placeholder="Write your task details here..."
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setLocalTask({ ...localTask, description: task.description });
                                                    setIsEditingDesc(false);
                                                }}
                                                className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsEditingDesc(false);
                                                    handleSave('description', localTask.description);
                                                }}
                                                className="px-3 py-1.5 text-xs font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-1"
                                            >
                                                <Save className="w-3.5 h-3.5" /> Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className="bg-gray-50/50 dark:bg-black/20 p-4 rounded-xl border border-[var(--card-border)] text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                                        onClick={() => setIsEditingDesc(true)}
                                    >
                                        {localTask.description ? localTask.description : <span className="italic opacity-50">No description provided. Click to add one.</span>}
                                    </div>
                                )}
                            </div>

                            {/* Attachments UI Simulation */}
                            <div>
                                <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-3 text-sm">
                                    <Paperclip className="w-4 h-4 text-gray-500" /> Attachments
                                </h4>

                                <div className="space-y-3">
                                    {/* Dropper */}
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
                                    >
                                        <UploadCloud className="w-8 h-8 text-blue-500" />
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload or drag and drop</p>
                                        <p className="text-xs text-gray-500">SVG, PNG, JPG or PDF (max. 10MB)</p>
                                        <input
                                            type="file"
                                            multiple
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                        />
                                    </div>

                                    {/* Uploaded Files List */}
                                    {isUploading && (
                                        <div className="flex items-center justify-center p-4">
                                            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                            <span className="ml-2 text-sm text-gray-500">Uploading files...</span>
                                        </div>
                                    )}
                                    {localTask.attachments && localTask.attachments.length > 0 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                            {localTask.attachments.map((file: any) => (
                                                <div key={file.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-[var(--card-border)] bg-white dark:bg-black/20 group">
                                                    <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                                                        <FileText className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate hover:text-blue-500 transition-colors cursor-pointer block">{file.fileName}</a>
                                                        <p className="text-[10px] text-gray-500">{(file.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveAttachment(file.id)}
                                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Subtasks */}
                            <div>
                                <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-3 text-sm">
                                    <CheckCircle2 className="w-4 h-4 text-gray-500" /> Subtasks ({(localTask.subtasks?.length) || 0})
                                </h4>

                                <div className="space-y-2">
                                    {localTask.subtasks?.length > 0 ? localTask.subtasks.map((s: any) => (
                                        <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--card-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                                            <input
                                                type="checkbox"
                                                className="rounded text-blue-500 focus:ring-blue-500/50 cursor-pointer w-4 h-4"
                                                checked={s.isDone || false}
                                                onChange={() => handleToggleSubtask(s.id, s.isDone)}
                                            />
                                            <span className={`text-sm flex-1 ${s.isDone ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>{s.title}</span>
                                            <button
                                                onClick={() => handleDeleteSubtask(s.id)}
                                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )) : (
                                        <div className="text-sm text-gray-500 italic p-4 text-center border border-[var(--card-border)] rounded-xl bg-gray-50/50 dark:bg-white/5">
                                            No subtasks created yet.
                                        </div>
                                    )}

                                    {isAddingSubtask ? (
                                        <div className="flex items-center gap-2 mt-2">
                                            <input
                                                ref={subtaskInputRef}
                                                type="text"
                                                className="flex-1 bg-white dark:bg-black/40 border border-[var(--card-border)] rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500"
                                                placeholder="What needs to be done?"
                                                value={newSubtaskTitle}
                                                onChange={e => setNewSubtaskTitle(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') handleAddSubtask();
                                                    if (e.key === 'Escape') setIsAddingSubtask(false);
                                                }}
                                                autoFocus
                                            />
                                            <button
                                                onClick={handleAddSubtask}
                                                className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                                            >
                                                Add
                                            </button>
                                            <button
                                                onClick={() => setIsAddingSubtask(false)}
                                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setIsAddingSubtask(true);
                                                setTimeout(() => subtaskInputRef.current?.focus(), 50);
                                            }}
                                            className="text-sm font-medium hover:text-blue-500 transition-colors mt-2 text-gray-500 flex items-center gap-1"
                                        >
                                            + Add Subtask
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar Meta */}
                        <div className="space-y-6 bg-gray-50/50 dark:bg-black/20 p-5 rounded-2xl border border-[var(--card-border)] h-fit">

                            {/* Project & Division block */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h5 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        <FolderKanban className="w-3.5 h-3.5" /> Location
                                    </h5>
                                    {!isEditingDivision && (
                                        <button onClick={() => setIsEditingDivision(true)} className="text-[10px] font-semibold text-blue-500 hover:underline flex items-center gap-1">
                                            <Edit2 className="w-3 h-3" /> Edit
                                        </button>
                                    )}
                                </div>
                                {isEditingDivision ? (
                                    <div className="space-y-3 bg-white dark:bg-[#1a1c23] p-3 rounded-xl border border-[var(--card-border)] shadow-sm">
                                        <div>
                                            <label className="text-[10px] font-semibold text-gray-500 uppercase">Project</label>
                                            <select
                                                value={selectedProjectId}
                                                onChange={e => setSelectedProjectId(e.target.value)}
                                                className="w-full mt-1 p-1.5 text-xs rounded-md border border-[var(--card-border)] bg-gray-50 dark:bg-black/50 text-gray-900 dark:text-gray-100"
                                            >
                                                <option value="">Select project...</option>
                                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-semibold text-gray-500 uppercase">Division</label>
                                            <select
                                                value={selectedDivisionId}
                                                onChange={e => setSelectedDivisionId(e.target.value)}
                                                disabled={!selectedProjectId}
                                                className="w-full mt-1 p-1.5 text-xs rounded-md border border-[var(--card-border)] bg-gray-50 dark:bg-black/50 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                                            >
                                                <option value="">Select division...</option>
                                                {filteredDivisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex justify-end gap-2 pt-1 border-t border-[var(--card-border)] mt-2">
                                            <button onClick={() => setIsEditingDivision(false)} className="text-[10px] font-medium text-gray-500 px-2 py-1">Cancel</button>
                                            <button
                                                onClick={() => {
                                                    setIsEditingDivision(false);
                                                    if (selectedDivisionId !== localTask.divisionId) handleSave('divisionId', selectedDivisionId);
                                                }}
                                                className="text-[10px] font-bold text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-md"
                                                disabled={!selectedDivisionId}
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2 bg-white dark:bg-[#1a1c23] p-3 rounded-xl border border-[var(--card-border)] shadow-sm">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 font-medium uppercase">Project</span>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{localTask.division?.project?.name || "No Project"}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 font-medium uppercase">Division</span>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <LayoutList className="w-3.5 h-3.5 text-blue-500" />
                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{localTask.division?.name || "Unassigned"}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <hr className="border-[var(--card-border)]" />

                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h5 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        <Users className="w-3.5 h-3.5" /> Assignees
                                    </h5>
                                    <button
                                        onClick={() => setIsEditingAssignees(!isEditingAssignees)}
                                        className="text-[10px] font-semibold text-blue-500 hover:underline flex items-center gap-1"
                                    >
                                        <Edit2 className="w-3 h-3" /> {isEditingAssignees ? "Done" : "Edit"}
                                    </button>
                                </div>

                                {isEditingAssignees ? (
                                    <div className="bg-white dark:bg-[#1a1c23] p-1.5 rounded-xl border border-[var(--card-border)] shadow-sm max-h-48 overflow-y-auto">
                                        {users.map(u => {
                                            const isSelected = localTask.assignees?.some((a: any) => a.userId === u.id);
                                            return (
                                                <label key={u.id} className="flex items-center gap-3 p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded text-blue-500 focus:ring-blue-500/50 cursor-pointer w-4 h-4"
                                                        checked={isSelected}
                                                        onChange={(e) => {
                                                            let newIds = [];
                                                            if (e.target.checked) {
                                                                newIds = [...(localTask.assignees?.map((a: any) => a.userId) || []), u.id];
                                                            } else {
                                                                newIds = (localTask.assignees?.map((a: any) => a.userId) || []).filter((id: string) => id !== u.id);
                                                            }
                                                            handleSave('assigneeIds', newIds);
                                                        }}
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium leading-none">{u.name}</p>
                                                        <p className="text-[10px] text-gray-500 mt-0.5 uppercase">{u.role}</p>
                                                    </div>
                                                </label>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {localTask.assignees?.length > 0 ? localTask.assignees.map((a: any, i: number) => (
                                            <div key={i} className="flex items-center gap-2 bg-white dark:bg-[#1a1c23] px-3 py-1.5 rounded-full border border-[var(--card-border)] shadow-sm">
                                                <div className="w-5 h-5 bg-gradient-to-tr from-blue-400 to-indigo-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                                                    {a.user?.name ? a.user.name.charAt(0) : 'U'}
                                                </div>
                                                <span className="text-xs font-semibold">{a.user?.name || "Unknown"}</span>
                                            </div>
                                        )) : (
                                            <span className="text-xs bg-gray-100 dark:bg-white/10 px-3 py-1.5 rounded-full italic font-medium">
                                                Unassigned
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <hr className="border-[var(--card-border)]" />

                            <div>
                                <h5 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5" /> Timeline
                                </h5>
                                <div className="flex flex-col gap-3 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium text-xs">Created</span>
                                        <span className="font-semibold">{new Date(localTask.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium text-xs">Deadline</span>
                                        {localTask.deadline ? (
                                            <span className="font-bold text-[11px] text-white bg-rose-500 px-2 py-0.5 rounded shadow-sm">
                                                {new Date(localTask.deadline).toLocaleDateString()}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 italic text-xs font-medium">No deadline</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <hr className="border-[var(--card-border)]" />

                            <div>
                                <h5 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <MessageSquare className="w-3.5 h-3.5" /> Actions
                                </h5>
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => handleSave('status', localTask.status === 'INTERNAL_REVIEW' ? 'IN_PROGRESS' : 'INTERNAL_REVIEW')}
                                        className="w-full text-xs font-bold py-2.5 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20 active:scale-95"
                                    >
                                        {localTask.status === 'INTERNAL_REVIEW' ? 'Return to Progress' : 'Move to Review'}
                                    </button>
                                    <button
                                        onClick={() => handleSave('status', 'COMPLETED')}
                                        className="w-full text-xs font-bold py-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20 active:scale-95"
                                    >
                                        Mark as Complete
                                    </button>
                                </div>
                            </div>

                            <hr className="border-[var(--card-border)]" />

                            <div>
                                <h5 className="text-[11px] font-bold text-rose-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Trash2 className="w-3.5 h-3.5" /> Danger Zone
                                </h5>
                                <button
                                    onClick={() => {
                                        if (confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
                                            handleDeleteTask();
                                        }
                                    }}
                                    disabled={isDeleting}
                                    className="w-full text-xs font-bold py-2.5 rounded-lg border border-rose-500/30 text-rose-600 hover:bg-rose-50 hover:border-rose-500 dark:hover:bg-rose-500/10 dark:text-rose-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Task"}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            <style jsx>{`
        .pop-in {
          animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
        </div>
    );
}
