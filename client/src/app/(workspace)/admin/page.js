'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../utils/api';
import { Shield, Users, Check, AlertCircle, Loader } from 'lucide-react';

const ALL_PERMISSIONS = ['read', 'create', 'update', 'delete'];

const PERM_COLORS = {
  read:   'bg-zinc-700/40 text-zinc-300 border-zinc-700',
  create: 'bg-emerald-700/20 text-emerald-400 border-emerald-700/40',
  update: 'bg-indigo-700/20 text-indigo-400 border-indigo-700/40',
  delete: 'bg-red-700/20 text-red-400 border-red-700/40',
};

export default function AdminPanelPage() {
  const { user, isMasterAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [saving, setSaving] = useState(null); // userId currently being saved
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text }

  // Redirect non-admins away
  useEffect(() => {
    if (!authLoading && !isMasterAdmin) {
      router.replace('/');
    }
  }, [authLoading, isMasterAdmin]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isMasterAdmin) loadUsers();
  }, [isMasterAdmin]);

  const togglePermission = (userId, perm) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u._id !== userId) return u;
        const current = u.permissions || [];
        // 'read' cannot be removed
        if (perm === 'read') return u;
        const updated = current.includes(perm)
          ? current.filter((p) => p !== perm)
          : [...current, perm];
        return { ...u, permissions: updated };
      })
    );
  };

  const savePermissions = async (userId, permissions) => {
    setSaving(userId);
    setMessage(null);
    try {
      const data = await api.put(`/admin/users/${userId}/permissions`, { permissions });
      setMessage({ type: 'success', text: `Updated permissions for ${data.user.username}` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(null);
    }
  };

  if (authLoading || !isMasterAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950">
        <Loader size={22} className="text-zinc-500 animate-spin" />
      </div>
    );
  }

  const regularUsers = users.filter((u) => u.role !== 'masterAdmin');

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-950 p-6 sm:p-10 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Shield size={20} className="text-amber-400" />
          <h1 className="text-xl font-bold text-white tracking-tight">Admin Panel</h1>
        </div>
        <p className="text-xs text-zinc-500 max-w-xl">
          Manage user access permissions. Toggle permissions per user and click Save. <span className="text-zinc-400 font-medium">read</span> is always granted and cannot be removed.
        </p>
      </div>

      {/* Toast message */}
      {message && (
        <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold border ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          <AlertCircle size={14} />
          <span>{message.text}</span>
        </div>
      )}

      {/* Permission Legend */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Permission Types:</span>
        {ALL_PERMISSIONS.map((p) => (
          <span key={p} className={`text-[10px] font-bold px-2 py-0.5 rounded border ${PERM_COLORS[p]}`}>
            {p}
          </span>
        ))}
      </div>

      {/* Users Table */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
          <Users size={15} className="text-zinc-400" />
          <h2 className="text-sm font-bold text-white">Registered Users</h2>
          <span className="text-[10px] text-zinc-600 ml-auto">{regularUsers.length} users</span>
        </div>

        {loadingUsers ? (
          <div className="flex items-center justify-center py-12 text-zinc-600">
            <Loader size={20} className="animate-spin" />
          </div>
        ) : regularUsers.length === 0 ? (
          <div className="text-center py-10 text-zinc-600 text-xs border border-dashed border-zinc-900 rounded-xl">
            No registered users yet.
          </div>
        ) : (
          <div className="space-y-3">
            {regularUsers.map((u) => (
              <div
                key={u._id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-zinc-900 bg-zinc-900/10 hover:bg-zinc-900/20 transition"
              >
                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{u.username}</p>
                  <p className="text-[10px] text-zinc-500 truncate">{u.email}</p>
                </div>

                {/* Permission Toggles */}
                <div className="flex items-center gap-2 flex-wrap">
                  {ALL_PERMISSIONS.map((perm) => {
                    const isActive = (u.permissions || []).includes(perm);
                    const isReadonly = perm === 'read';
                    return (
                      <button
                        key={perm}
                        disabled={isReadonly}
                        onClick={() => togglePermission(u._id, perm)}
                        title={isReadonly ? "'read' is always granted" : `Toggle ${perm}`}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                          isActive
                            ? PERM_COLORS[perm]
                            : 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400'
                        } ${isReadonly ? 'opacity-60 cursor-default' : ''}`}
                      >
                        {isActive && <Check size={9} />}
                        <span>{perm}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Save Button */}
                <button
                  onClick={() => savePermissions(u._id, u.permissions)}
                  disabled={saving === u._id}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50 flex-shrink-0"
                >
                  {saving === u._id ? (
                    <Loader size={12} className="animate-spin" />
                  ) : (
                    <Check size={12} />
                  )}
                  <span>Save</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
