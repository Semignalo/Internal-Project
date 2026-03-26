"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2, Calendar, FileText, CheckCircle2, FolderKanban, Clock, Users, Save, Briefcase, Activity, Plus, Edit2, Trash2 } from "lucide-react";

export default function ProjectDetailModal({
    isOpen,
    onClose,
    project,
    onProjectUpdated,
    onProjectDeleted
}: {
    isOpen: boolean;
    onClose: () => void;
    project: any | null;
    onProjectUpdated?: (updatedProject: any) => void;
    onProjectDeleted?: (projectId: string) => void;
}) {
    const [localProject, setLocalProject] = useState<any>(null);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Deletion states
    const [isDeleting, setIsDeleting] = useState(false);

    // Division states
    const [isAddingDivision, setIsAddingDivision] = useState(false);
    const [newDivisionName, setNewDivisionName] = useState("");
    const [newDivisionWeight, setNewDivisionWeight] = useState(10);

    const [editingDivisionId, setEditingDivisionId] = useState<string | null>(null);
    const [editDivisionName, setEditDivisionName] = useState("");
    const [editDivisionWeight, setEditDivisionWeight] = useState(0);

    const titleInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (project) {
            setLocalProject({ ...project });
        }
    }, [project]);

    if (!isOpen || !localProject) return null;

    const handleSave = async (field: string, value: any) => {
        setLocalProject((prev: any) => ({ ...prev, [field]: value }));
        setIsSaving(true);
        try {
            const res = await fetch(`/api/projects/${localProject.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: value })
            });
            if (res.ok) {
                const updated = await res.json();
                if (onProjectUpdated) onProjectUpdated({ ...updated, manager: localProject.manager }); // Preserve manager
            }
        } catch (error) {
            console.error("Failed to update project", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddDivision = async () => {
        if (!newDivisionName.trim()) return;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/divisions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newDivisionName,
                    progressWeight: Number(newDivisionWeight),
                    projectId: localProject.id
                })
            });
            if (res.ok) {
                const newDivision = await res.json();
                const updatedProject = {
                    ...localProject,
                    divisions: [...(localProject.divisions || []), newDivision]
                };
                setLocalProject(updatedProject);
                if (onProjectUpdated) onProjectUpdated(updatedProject);
                setNewDivisionName("");
                setNewDivisionWeight(10);
                setIsAddingDivision(false);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateDivision = async (divId: string) => {
        if (!editDivisionName.trim()) return;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/divisions/${divId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editDivisionName,
                    progressWeight: Number(editDivisionWeight)
                })
            });
            if (res.ok) {
                const updatedDivision = await res.json();
                const updatedProject = {
                    ...localProject,
                    divisions: localProject.divisions.map((d: any) => d.id === divId ? updatedDivision : d)
                };
                setLocalProject(updatedProject);
                if (onProjectUpdated) onProjectUpdated(updatedProject);
                setEditingDivisionId(null);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteProject = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/projects/${localProject.id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                if (onProjectDeleted) onProjectDeleted(localProject.id);
                onClose();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'REVISION': return 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 ring-amber-500/20';
            case 'PRODUCTION': return 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 ring-blue-500/20';
            case 'PLANNING': return 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 ring-purple-500/20';
            default: return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 ring-emerald-500/20';
        }
    };

    const isDone = localProject.status === "DONE";

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
                        <div className="flex items-center flex-wrap gap-2 mb-1">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ring-1 ring-inset ${getStatusColor(localProject.status)}`}>
                                {localProject.status.replace("_", " ")}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300 ring-1 ring-inset ring-gray-500/20 flex items-center gap-1">
                                <Briefcase className="w-3 h-3" /> {localProject.projectType}
                            </span>
                            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400 ml-1" />}
                        </div>

                        {isEditingTitle ? (
                            <input
                                ref={titleInputRef}
                                type="text"
                                className="text-2xl font-bold bg-white dark:bg-black/50 border border-blue-500 rounded p-1 p-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                value={localProject.name}
                                onChange={(e) => setLocalProject({ ...localProject, name: e.target.value })}
                                onBlur={() => {
                                    setIsEditingTitle(false);
                                    if (localProject.name !== project.name) handleSave('name', localProject.name);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') titleInputRef.current?.blur();
                                }}
                                autoFocus
                            />
                        ) : (
                            <h2
                                className="text-2xl font-bold leading-tight cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 rounded px-1 -mx-1 transition-colors"
                                onClick={() => setIsEditingTitle(true)}
                                title="Click to edit project name"
                            >
                                {localProject.name}
                            </h2>
                        )}
                        <p className="text-sm font-medium text-gray-500 px-1">{localProject.clientName}</p>
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

                            {/* Project Overview */}
                            <div>
                                <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-3 text-sm">
                                    <Activity className="w-4 h-4 text-gray-500" /> Overall Progress
                                </h4>
                                <div className="bg-gray-50/50 dark:bg-black/20 p-5 rounded-2xl border border-[var(--card-border)]">
                                    <div className="flex justify-between items-end mb-3">
                                        <div className="text-3xl font-black text-gray-900 dark:text-white">{Math.round(localProject.overallProgress)}%</div>
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{isDone ? "Completed" : "In Progress"}</span>
                                    </div>
                                    <div className="w-full bg-gray-200/60 dark:bg-gray-800/60 rounded-full h-3 shadow-inner overflow-hidden">
                                        <div
                                            className={`h-3 rounded-full transition-all duration-1000 ease-out shadow-sm
                                                ${localProject.status === 'REVISION' ? 'bg-amber-500' :
                                                    localProject.status === 'PLANNING' ? 'bg-purple-500' :
                                                        localProject.status === 'DONE' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                            style={{ width: `${localProject.overallProgress}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">
                                        Progress is automatically calculated based on the weighted completion of individual workflows and tasks inside this project.
                                    </p>
                                </div>
                            </div>

                            {/* Active Phases */}
                            <div>
                                <h4 className="flex items-center justify-between font-semibold text-gray-900 dark:text-white mb-3 text-sm">
                                    <span className="flex items-center gap-2">
                                        <FolderKanban className="w-4 h-4 text-gray-500" /> Active Phases / Workflow
                                    </span>
                                </h4>

                                <div className="space-y-3">
                                    {localProject.divisions?.length > 0 ? localProject.divisions.filter((d: any) => d.deletedAt === null).map((div: any) => (
                                        editingDivisionId === div.id ? (
                                            <div key={div.id} className="bg-white dark:bg-[#1a1c23] p-4 rounded-xl border border-blue-500 shadow-sm space-y-3">
                                                <div className="flex gap-3">
                                                    <div className="flex-1">
                                                        <label className="text-[10px] font-semibold text-gray-500 uppercase">Phase Name</label>
                                                        <input
                                                            type="text"
                                                            value={editDivisionName}
                                                            onChange={e => setEditDivisionName(e.target.value)}
                                                            className="w-full mt-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:border-blue-500"
                                                            autoFocus
                                                        />
                                                    </div>
                                                    <div className="w-24">
                                                        <label className="text-[10px] font-semibold text-gray-500 uppercase">Weight (%)</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="100"
                                                            value={editDivisionWeight}
                                                            onChange={e => setEditDivisionWeight(Number(e.target.value))}
                                                            className="w-full mt-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:border-blue-500"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-2 pt-2 border-t border-[var(--card-border)]">
                                                    <button onClick={() => setEditingDivisionId(null)} className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
                                                    <button onClick={() => handleUpdateDivision(div.id)} className="px-3 py-1.5 text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-1">
                                                        {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div key={div.id} className="group bg-white dark:bg-[#1a1c23] p-4 rounded-xl border border-[var(--card-border)] shadow-sm flex items-center justify-between hover:border-blue-500/50 transition-colors">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900 dark:text-white text-sm">{div.name}</span>
                                                    <span className="text-[10px] text-gray-500 font-medium tracking-wider">Weight: {div.progressWeight}%</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-right flex flex-col items-end">
                                                            <span className="text-xs font-bold text-blue-500">{Math.round(div.overallProgress || 0)}%</span>
                                                        </div>
                                                        <div className="w-16 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${div.overallProgress || 0}%` }}></div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setEditingDivisionId(div.id);
                                                            setEditDivisionName(div.name);
                                                            setEditDivisionWeight(div.progressWeight);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-blue-500 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                                                        title="Edit phase"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    )) : (
                                        <div className="text-sm text-gray-500 italic p-6 text-center border border-dashed border-[var(--card-border)] rounded-xl bg-gray-50/50 dark:bg-white/5">
                                            No phases created yet.
                                        </div>
                                    )}

                                    {isAddingDivision ? (
                                        <div className="bg-white dark:bg-[#1a1c23] p-4 rounded-xl border border-[var(--card-border)] shadow-sm space-y-3">
                                            <div>
                                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Phase Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Video Production"
                                                    value={newDivisionName}
                                                    onChange={e => setNewDivisionName(e.target.value)}
                                                    className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:border-blue-500"
                                                    autoFocus
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Progress Weight (%)</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="100"
                                                    value={newDivisionWeight}
                                                    onChange={e => setNewDivisionWeight(Number(e.target.value))}
                                                    className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:border-blue-500"
                                                />
                                            </div>
                                            <div className="flex justify-end gap-2 pt-2">
                                                <button onClick={() => setIsAddingDivision(false)} className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Cancel</button>
                                                <button onClick={handleAddDivision} className="px-3 py-1.5 text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-1">
                                                    {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} Add Phase
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setIsAddingDivision(true)}
                                            className="w-full py-3 rounded-xl border border-dashed border-[var(--card-border)] text-gray-500 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all font-medium text-sm flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" /> Create New Phase
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar Meta */}
                        <div className="space-y-6 bg-gray-50/50 dark:bg-black/20 p-5 rounded-2xl border border-[var(--card-border)] h-fit">

                            <div>
                                <h5 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Users className="w-3.5 h-3.5" /> Project Manager
                                </h5>
                                <div className="flex items-center gap-3 bg-white dark:bg-[#1a1c23] p-2.5 rounded-xl border border-[var(--card-border)] shadow-sm">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-white dark:ring-[#1a1c23]">
                                        {localProject.manager?.name ? localProject.manager.name.charAt(0) : "U"}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold">{localProject.manager?.name || "Unassigned"}</span>
                                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Manager</span>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-[var(--card-border)]" />

                            <div>
                                <h5 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5" /> Timeline
                                </h5>
                                <div className="flex flex-col gap-3 text-sm bg-white dark:bg-[#1a1c23] p-3 rounded-xl border border-[var(--card-border)] shadow-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium text-xs">Start Date</span>
                                        <span className="font-semibold text-xs">{new Date(localProject.startDate).toLocaleDateString('en-GB')}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium text-xs">Deadline</span>
                                        <span className={`font-bold text-[11px] px-2 py-0.5 rounded shadow-sm ${localProject.status === 'DONE' ? 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-300' : 'text-white bg-rose-500'}`}>
                                            {new Date(localProject.deadline).toLocaleDateString('en-GB')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-[var(--card-border)]" />

                            <div>
                                <h5 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Change Status
                                </h5>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleSave('status', 'PLANNING')}
                                        className={`text-[10px] font-bold py-2 rounded-lg transition-all border ${localProject.status === 'PLANNING' ? 'bg-purple-500 text-white border-purple-600 shadow-md shadow-purple-500/20' : 'bg-transparent text-purple-600 border-purple-500/30 hover:bg-purple-50 dark:hover:bg-purple-500/10 active:scale-95'}`}
                                    >
                                        PLANNING
                                    </button>
                                    <button
                                        onClick={() => handleSave('status', 'PRODUCTION')}
                                        className={`text-[10px] font-bold py-2 rounded-lg transition-all border ${localProject.status === 'PRODUCTION' ? 'bg-blue-500 text-white border-blue-600 shadow-md shadow-blue-500/20' : 'bg-transparent text-blue-600 border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-500/10 active:scale-95'}`}
                                    >
                                        PRODUCTION
                                    </button>
                                    <button
                                        onClick={() => handleSave('status', 'REVISION')}
                                        className={`text-[10px] font-bold py-2 rounded-lg transition-all border ${localProject.status === 'REVISION' ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20' : 'bg-transparent text-amber-600 border-amber-500/30 hover:bg-amber-50 dark:hover:bg-amber-500/10 active:scale-95'}`}
                                    >
                                        REVISION
                                    </button>
                                    <button
                                        onClick={() => handleSave('status', 'DONE')}
                                        className={`text-[10px] font-bold py-2 rounded-lg transition-all border ${localProject.status === 'DONE' ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20' : 'bg-transparent text-emerald-600 border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 active:scale-95'}`}
                                    >
                                        DONE
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
                                        if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
                                            handleDeleteProject();
                                        }
                                    }}
                                    disabled={isDeleting}
                                    className="w-full text-xs font-bold py-2.5 rounded-lg border border-rose-500/30 text-rose-600 hover:bg-rose-50 hover:border-rose-500 dark:hover:bg-rose-500/10 dark:text-rose-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Project"}
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
        </div >
    );
}
