import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Header } from '../../components/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { CheckCircle, XCircle, Loader2, ShieldCheck, User, ChevronDown } from 'lucide-react';

export default function AdminDashboard() {
    const { toast } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingRole, setUpdatingRole] = useState(null);

    // Reject Confirmation State
    const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false);
    const [userToReject, setUserToReject] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Fetch from public profiles table
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            console.log('AdminDashboard: Fetched users', data);
            if (data && data.length > 0) {
                console.log('AdminDashboard: First user sample keys:', Object.keys(data[0]));
            }
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        setUpdatingRole(userId);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;

            // Update local state
            setUsers(users.map(user =>
                user.id === userId ? { ...user, role: newRole } : user
            ));
            toast.success('Role updated successfully');
        } catch (error) {
            console.error('Error updating role:', error);
            toast.error('Failed to update role: ' + (error.message || 'Unknown error'));
        } finally {
            setUpdatingRole(null);
        }
    };

    const handleApprove = async (userId) => {
        try {
            // Get the user's current role
            const user = users.find(u => u.id === userId);

            // Determine role safely
            const targetRole = user?.role === 'admin' ? 'admin' : (user?.role || 'professor');
            console.log(`AdminDashboard: Approving user ${userId} with role ${targetRole}`);

            // Update both is_approved and ensure role is set
            const { error } = await supabase
                .from('profiles')
                .update({
                    is_approved: true,
                    role: targetRole
                })
                .eq('id', userId);

            if (error) throw error;

            // Update local state
            setUsers(users.map(u =>
                u.id === userId ? {
                    ...u,
                    is_approved: true,
                    role: targetRole
                } : u
            ));
            toast.success('User approved');
        } catch (error) {
            console.error('Error approving user:', error);
            toast.error('Failed to approve user: ' + (error.message || 'Check console for details'));
        }
    };

    const handleRejectClick = (user) => {
        setUserToReject(user);
        setRejectConfirmOpen(true);
    };

    const confirmRejectUser = async () => {
        if (!userToReject) return;

        try {
            // Delete from profiles
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userToReject.id);

            if (error) throw error;

            // Note: We can't delete from auth.users from client-side without a backend function.
            // For now, removing from profiles prevents them from showing up here.
            // They would still exist in Auth but be "unapproved".

            setUsers(users.filter(user => user.id !== userToReject.id));
            toast.success('User rejected and removed from profiles');
        } catch (error) {
            console.error('Error rejecting user:', error);
            toast.error('Failed to reject user.');
        } finally {
            setRejectConfirmOpen(false);
            setUserToReject(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <Header userInitial="A" />

            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <ShieldCheck className="text-blue-600" size={32} />
                        Admin Dashboard
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Manage user approvals and system access.
                    </p>
                </div>

                <Card className="p-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Pending Approvals</h2>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="animate-spin text-blue-500" size={32} />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                            No users found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <th className="p-4 text-sm font-medium text-slate-500 dark:text-slate-400">User</th>
                                        <th className="p-4 text-sm font-medium text-slate-500 dark:text-slate-400">Email</th>
                                        <th className="p-4 text-sm font-medium text-slate-500 dark:text-slate-400">Role</th>
                                        <th className="p-4 text-sm font-medium text-slate-500 dark:text-slate-400">Status</th>
                                        <th className="p-4 text-sm font-medium text-slate-500 dark:text-slate-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs">
                                                        {user.full_name?.[0] || <User size={14} />}
                                                    </div>
                                                    <span className="font-medium text-slate-900 dark:text-white">{user.full_name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-600 dark:text-slate-300">{user.email}</td>
                                            <td className="p-4">
                                                {user.role === 'admin' ? (
                                                    <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                                        ADMIN
                                                    </span>
                                                ) : (
                                                    <div className="relative inline-block">
                                                        <select
                                                            value={user.role || 'student'}
                                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                            disabled={updatingRole === user.id}
                                                            className={`appearance-none px-3 py-1.5 pr-8 rounded text-xs font-medium cursor-pointer border-0 focus:ring-2 focus:ring-blue-500 ${user.role === 'professor'
                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                                } ${updatingRole === user.id ? 'opacity-50' : ''}`}
                                                        >
                                                            <option value="student">STUDENT</option>
                                                            <option value="professor">PROFESSOR</option>
                                                        </select>
                                                        <ChevronDown
                                                            size={12}
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-current"
                                                        />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {user.is_approved ? (
                                                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                                                        <CheckCircle size={14} /> Approved
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-sm font-medium">
                                                        <Loader2 size={14} className="animate-spin" /> Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                {!user.is_approved && (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3"
                                                            onClick={() => handleApprove(user.id)}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800 h-8 px-3"
                                                            onClick={() => handleRejectClick(user)}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </main>

            <ConfirmDialog
                isOpen={rejectConfirmOpen}
                onClose={() => setRejectConfirmOpen(false)}
                onConfirm={confirmRejectUser}
                title="Reject User?"
                description={`Are you sure you want to reject "${userToReject?.full_name}"? They will need to register again if this is a mistake.`}
                confirmText="Reject User"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    );
}
