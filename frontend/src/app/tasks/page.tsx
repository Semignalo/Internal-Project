"use client";

import { useEffect, useState } from "react";
import { Plus, MoreHorizontal, MessageSquare, Paperclip, Clock, CheckCircle2, AlertCircle, FolderKanban } from "lucide-react";
import CreateTaskModal from "./CreateTaskModal";
import TaskDetailModal from "./TaskDetailModal";
import {
    DndContext,
    useDraggable,
    useDroppable,
    DragOverlay,
    defaultDropAnimationSideEffects,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export default function TasksPage() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [selectedDragTask, setSelectedDragTask] = useState<any>(null);
    const [defaultColumn, setDefaultColumn] = useState("TODO");
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [filterMode, setFilterMode] = useState<"MY_TASKS" | "ALL_TASKS">("MY_TASKS");

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
    }, []);

    // Require 8px movement before triggering drag, allowing standard clicks to pass through
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 }
        })
    );

    useEffect(() => {
        fetch(`/api/tasks?_t=${Date.now()}`)
            .then(res => res.json())
            .then(json => {
                // Filter out soft-deleted
                setTasks(json.filter((t: any) => t.deletedAt === null));
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch tasks data:", err);
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

    const columns = [
        { id: "TODO", title: "To Do", color: "bg-gray-500" },
        { id: "IN_PROGRESS", title: "In Progress", color: "bg-blue-500" },
        { id: "REVIEW", title: "In Review", color: "bg-amber-500" },
        { id: "COMPLETED", title: "Completed", color: "bg-emerald-500" },
    ];

    // Helper to map DB statuses to our 4 columns
    const getMappedStatus = (status: string) => {
        if (["TODO", "PLANNING"].includes(status)) return "TODO";
        if (["IN_PROGRESS", "REVISION"].includes(status)) return "IN_PROGRESS";
        if (["INTERNAL_REVIEW", "CLIENT_REVIEW"].includes(status)) return "REVIEW";
        if (["COMPLETED", "APPROVED", "DONE"].includes(status)) return "COMPLETED";
        return "TODO";
    };

    const handleDragEnd = async (event: any) => {
        const { active, over } = event;
        if (!over) return;

        const taskId = active.id;
        const newStatusColumn = over.id;
        const task = tasks.find(t => t.id === taskId);

        if (!task || getMappedStatus(task.status) === newStatusColumn) return;

        // Map column back to DB status
        let newDbStatus = newStatusColumn;
        if (newStatusColumn === "REVIEW") newDbStatus = "INTERNAL_REVIEW";
        if (newStatusColumn === "COMPLETED") newDbStatus = "COMPLETED";

        // Optimistic UI update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newDbStatus } : t));

        // API Call
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newDbStatus })
            });
            if (!res.ok) throw new Error("Update failed");
        } catch (error) {
            console.error(error);
            // Revert on error
            fetch(`/api/tasks?_t=${Date.now()}`)
                .then(res => res.json())
                .then(json => setTasks(json.filter((t: any) => t.deletedAt === null)));
        }
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={(event) => {
                const { active } = event;
                const task = tasks.find(t => t.id === active.id);
                setSelectedDragTask(task);
            }}
            onDragEnd={(event) => {
                handleDragEnd(event);
                setSelectedDragTask(null);
            }}
            onDragCancel={() => setSelectedDragTask(null)}
        >
            <div className="space-y-8 fade-in h-auto flex flex-col">
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight mb-1">Task Management</h2>
                        <p className="text-gray-500 dark:text-gray-400">Manage your daily assignments and track progress.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-black/5 dark:bg-white/5 rounded-xl p-1 flex items-center">
                            <button
                                onClick={() => setFilterMode("MY_TASKS")}
                                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${filterMode === "MY_TASKS" ? "bg-white dark:bg-[#1a1c23] shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
                            >
                                My Tasks
                            </button>
                            <button
                                onClick={() => setFilterMode("ALL_TASKS")}
                                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${filterMode === "ALL_TASKS" ? "bg-white dark:bg-[#1a1c23] shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
                            >
                                All Tasks
                            </button>
                        </div>
                        <button
                            onClick={() => {
                                setDefaultColumn("TODO");
                                setIsModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-black dark:bg-white dark:text-black text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
                        >
                            <Plus className="w-4 h-4" /> Add Task
                        </button>
                    </div>
                </div>

                <div className="flex gap-6 overflow-x-auto overflow-y-hidden pb-8 min-h-[65vh] snap-x">
                    {columns.map(column => {
                        let displayedTasks = tasks;
                        if (filterMode === "MY_TASKS" && currentUser) {
                            displayedTasks = tasks.filter(t => t.assignees?.some((a: any) => a.userId === currentUser.id));
                        }

                        const columnTasks = displayedTasks.filter(t => getMappedStatus(t.status) === column.id);

                        return (
                            <DroppableColumn
                                key={column.id}
                                column={column}
                                columnTasks={columnTasks}
                                onAddClick={() => {
                                    setDefaultColumn(column.id);
                                    setIsModalOpen(true);
                                }}
                                onTaskClick={(task: any) => setSelectedTask(task)}
                            />
                        );
                    })}
                </div>

                <CreateTaskModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    defaultColumn={defaultColumn}
                    onSuccess={(newTask: any) => {
                        // Refetch tasks to grab relations (like Division)
                        fetch(`/api/tasks?_t=${Date.now()}`)
                            .then(res => res.json())
                            .then(json => setTasks(json.filter((t: any) => t.deletedAt === null)));
                    }}
                />

                <TaskDetailModal
                    isOpen={!!selectedTask}
                    onClose={() => setSelectedTask(null)}
                    task={selectedTask}
                    onTaskUpdated={(updatedTask) => {
                        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
                        // Re-fetch everything silently to ensure consistency (like assignees resolving correctly)
                        fetch(`/api/tasks?_t=${Date.now()}`)
                            .then(res => res.json())
                            .then(json => setTasks(json.filter((t: any) => t.deletedAt === null)));
                    }}
                    onTaskDeleted={(deletedId) => {
                        setTasks(prev => prev.filter(t => t.id !== deletedId));
                    }}
                />
            </div>

            <DragOverlay
                dropAnimation={{
                    sideEffects: defaultDropAnimationSideEffects({
                        styles: { active: { opacity: '0.4' } }
                    })
                }}>
                {selectedDragTask ? (
                    <TaskCard task={selectedDragTask} onClick={() => { }} isOverlay={true} />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

// Subcomponents
function DroppableColumn({ column, columnTasks, onAddClick, onTaskClick }: any) {
    const { isOver, setNodeRef } = useDroppable({ id: column.id });

    return (
        <div className="flex-1 min-w-[320px] max-w-[380px] snap-center flex flex-col gap-4">
            {/* Column Header */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${column.color} shadow-sm`}></div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{column.title}</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-xs font-medium text-gray-500 dark:text-gray-400">
                        {columnTasks.length}
                    </span>
                </div>
                <button className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>

            {/* Column Drop Zone / Container */}
            <div
                ref={setNodeRef}
                className={`flex-1 glass-card p-3 rounded-2xl flex flex-col gap-3 min-h-[150px] transition-colors border-2
                    ${isOver ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/20' : 'border-[var(--card-bg)]/50 border-dashed lg:border-solid lg:border lg:bg-[var(--card-bg)]'}
                `}
            >
                {columnTasks.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 text-sm italic opacity-70 p-4 text-center">
                        No tasks in this stage
                    </div>
                ) : (
                    columnTasks.map((task: any) => (
                        <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
                    ))
                )}

                <button
                    onClick={onAddClick}
                    className="flex items-center justify-center gap-2 w-full py-2.5 mt-1 rounded-xl border border-dashed border-[var(--card-border)] hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium group"
                >
                    <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                    <span>Add card</span>
                </button>
            </div>
        </div>
    );
}

function TaskCard({ task, onClick, isOverlay = false }: { task: any, onClick: () => void, isOverlay?: boolean }) {
    const isUrgent = task.priority === "URGENT" || task.priority === "HIGH";

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
        data: task
    });

    // In DragOverlay mode, we don't apply Draggable translation
    const style: React.CSSProperties | undefined = isOverlay ? {
        cursor: 'grabbing',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        transform: 'rotate(2deg) scale(1.02)'
    } : (transform ? {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 0 : undefined,
        opacity: isDragging ? 0 : 1,
    } : undefined);

    if (isDragging && !isOverlay) {
        // Return a stable placeholder while moving
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-black/5 dark:bg-white/5 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl h-40 animate-pulse"
            />
        );
    }

    return (
        <div
            ref={isOverlay ? undefined : setNodeRef}
            style={style}
            {...(isOverlay ? {} : listeners)}
            {...(isOverlay ? {} : attributes)}
            onClick={onClick}
            className={`bg-white/80 dark:bg-[#12141a] backdrop-blur-md p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_16px_-6px_rgba(0,0,0,0.15)] transition-shadow group ${isOverlay ? '' : 'cursor-grab active:cursor-grabbing hover:-translate-y-0.5'}`}
        >

            {/* Labels */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md mb-1
          ${isUrgent
                        ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 ring-1 ring-inset ring-rose-500/20'
                        : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 ring-1 ring-inset ring-blue-500/20'}`}>
                    {task.priority || "MEDIUM"}
                </span>
                {task.division?.project && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md mb-1 bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 ring-1 ring-inset ring-purple-500/20 flex items-center gap-1">
                        <FolderKanban className="w-3 h-3" /> {task.division.project.name}
                    </span>
                )}
                {task.division && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md mb-1 bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300 ring-1 ring-inset ring-gray-500/20">
                        {task.division.name}
                    </span>
                )}
            </div>

            {/* Title */}
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 leading-relaxed group-hover:text-blue-500 transition-colors">
                {task.title}
            </h4>

            {/* Description Preview (if any) */}
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                {task.description || "No specific instructions provided for this task."}
            </p>

            <hr className="border-t border-[var(--card-border)] mb-3" />

            {/* Footer Meta */}
            <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500 text-xs font-medium">
                    {task.deadline && (
                        <div className={`flex items-center gap-1 ${isExpiringSoon(task.deadline) ? 'text-rose-500' : ''}`}>
                            <Clock className="w-3.5 h-3.5" />
                            <span>{new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>{(task.subtasks?.length) || 0}</span>
                    </div>

                    <div className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{task.revisionCount || 0}</span>
                    </div>
                </div>

                {/* Assignees */}
                <div className="flex -space-x-1.5 relative z-0">
                    {task.assignees?.slice(0, 3).map((a: any, i: number) => (
                        <div key={i} title={a.user?.name} className="w-6 h-6 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 border-[1.5px] border-white dark:border-[#1a1c23] flex items-center justify-center text-[9px] font-bold text-gray-600 dark:text-gray-300 shadow-sm relative hover:z-10 transition-transform hover:scale-110">
                            {a.user?.name ? a.user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                    ))}
                    {task.assignees?.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 border-[1.5px] border-white dark:border-[#1a1c23] flex items-center justify-center text-[8px] font-bold text-gray-500 shadow-sm relative z-0">
                            +{task.assignees.length - 3}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Avatar({ initials, gradient, z }: { initials: string, gradient: string, z: string }) {
    return (
        <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${gradient} border-2 border-white dark:border-[#0f1115] flex items-center justify-center text-xs font-bold text-white shadow-sm ${z}`}>
            {initials}
        </div>
    );
}

function isExpiringSoon(dateString: string) {
    if (!dateString) return false;
    const deadline = new Date(dateString);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
}
