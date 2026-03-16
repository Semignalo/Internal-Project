"use client";

import { useState, useEffect } from "react";
import { Save, Building2, Workflow, Tags, Users2, ShieldAlert, Plus, Edit2, Trash2, X, Loader2 } from "lucide-react";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("general");

    return (
        <div className="space-y-8 fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-1">System Settings</h2>
                    <p className="text-gray-500 dark:text-gray-400">Configure agency-wide properties, roles, and automated workflows.</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Navigation Menu */}
                <div className="w-full lg:w-64 shrink-0 flex flex-col gap-2">
                    <SettingsTab
                        active={activeTab === "general"}
                        onClick={() => setActiveTab("general")}
                        icon={<Building2 className="w-4 h-4" />}
                        label="General Agency"
                    />
                    <SettingsTab
                        active={activeTab === "team"}
                        onClick={() => setActiveTab("team")}
                        icon={<Users2 className="w-4 h-4" />}
                        label="Team Roles & Users"
                    />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-h-[500px] w-full">
                    {activeTab === "general" && <GeneralSettings />}
                    {activeTab === "team" && <TeamManagement />}
                </div>
            </div>
        </div>
    );
}

function SettingsTab({ label, active, icon, onClick }: { label: string, active?: boolean, icon: React.ReactNode, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all text-left
            ${active
                    ? 'bg-white dark:bg-[#1a1c23] shadow-sm border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white'
                    : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                }`}
        >
            {icon} {label}
        </button>
    );
}

// Subcomponents
function GeneralSettings() {
    return (
        <div className="glass-card p-8 flex flex-col gap-8 fade-in">
            <div className="flex justify-between items-center border-b border-[var(--card-border)] pb-6 mb-2">
                <div>
                    <h3 className="text-xl font-bold mb-1">General Agency</h3>
                    <p className="text-sm text-gray-500">Update your internal name and base configuration.</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5">
                    <Save className="w-4 h-4" /> Save
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 max-w-3xl">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Agency Name</label>
                    <input type="text" defaultValue="STARINC Digital" className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Base Timezone</label>
                    <select className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                        <option>Jakarta (GMT+7)</option>
                        <option>Singapore (GMT+8)</option>
                    </select>
                </div>
            </div>

            <div className="border-t border-[var(--card-border)] pt-8 flex flex-col gap-4 max-w-3xl">
                <div>
                    <h4 className="font-semibold mb-1">Force Dark Mode Internally</h4>
                    <p className="text-sm text-gray-500">Toggle whether staff applications are permanently stuck on dark mode to match branding.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer mt-2 w-fit">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
            </div>
        </div>
    )
}

function TeamManagement() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        setLoading(true);
        fetch('/api/users')
            .then(res => res.json())
            .then(data => {
                setUsers(data.filter((u: any) => u.deletedAt === null));
                setLoading(false);
            })
            .catch(console.error);
    };

    const handleAddUser = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEditUser = (user: any) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
        try {
            const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
            if (res.ok) fetchUsers();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6 fade-in">
            <div className="glass-card p-6 flex items-center justify-between border border-[var(--card-border)]">
                <div>
                    <h3 className="text-xl font-bold mb-1">Team Directory</h3>
                    <p className="text-sm text-gray-500">Manage access and account roles for your agency staff.</p>
                </div>
                <button
                    onClick={handleAddUser}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
                >
                    <Plus className="w-4 h-4" /> Add User
                </button>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[var(--card-border)] bg-black/5 dark:bg-white/5 text-xs text-gray-500 uppercase font-semibold">
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--card-border)]">
                            {loading && (
                                <tr><td colSpan={4} className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-500" /></td></tr>
                            )}
                            {!loading && users.map(user => (
                                <tr key={user.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-xs font-bold ring-1 ring-white/10 shadow-sm">
                                                {user.name.charAt(0)}
                                            </div>
                                            <span className="font-semibold">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-black/5 dark:bg-white/10 rounded-md text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                        <button onClick={() => handleEditUser(user)} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors bg-white/5 rounded-md hover:bg-blue-500/10">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteUser(user.id)} className="p-1.5 text-gray-400 hover:text-rose-500 transition-colors bg-white/5 rounded-md hover:bg-rose-500/10">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <UserFormModal
                    userToEdit={editingUser}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => { setIsModalOpen(false); fetchUsers(); }}
                />
            )}
        </div>
    )
}

function UserFormModal({ onClose, onSuccess, userToEdit }: { onClose: () => void, onSuccess: () => void, userToEdit?: any }) {
    const [formData, setFormData] = useState({
        name: userToEdit?.name || '',
        email: userToEdit?.email || '',
        password: '',
        role: userToEdit?.role || 'MEMBER'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = { ...formData };
            if (userToEdit && !payload.password) {
                delete (payload as any).password;
            }

            const url = userToEdit ? `/api/users/${userToEdit.id}` : "/api/users";
            const method = userToEdit ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                onSuccess();
            } else {
                alert(`Failed to ${userToEdit ? 'update' : 'create'} user. Make sure email is valid.`);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-[#12141a] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-[var(--card-border)]">
                <div className="flex items-center justify-between p-5 border-b border-[var(--card-border)] bg-gray-50/50 dark:bg-white/5">
                    <h3 className="font-bold text-lg">{userToEdit ? 'Edit User' : 'Add New User'}</h3>
                    <button onClick={onClose} className="p-1 text-gray-500 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Full Name</label>
                        <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Email (used for login)</label>
                        <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Password {userToEdit && <span className="font-normal text-gray-500">(Leave blank to keep current)</span>}</label>
                        <input required={!userToEdit} type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} minLength={6} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Role Configuration</label>
                        <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                            <option value="MEMBER">Staff / Member (Can execute tasks)</option>
                            <option value="PROJECT_MANAGER">Project Manager (Can create projects)</option>
                            <option value="ADMIN">Administrator</option>
                        </select>
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[var(--card-border)] hover:bg-black/5 dark:hover:bg-white/5 font-medium transition-colors">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors flex justify-center items-center">
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (userToEdit ? "Update User" : "Save User")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
