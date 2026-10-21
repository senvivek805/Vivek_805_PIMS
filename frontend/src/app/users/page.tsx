"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { NeoCard, NeoButton, NeoBadge, NeoIconBox, NeoInput } from "@/components/neumorphism";
import { Users, Plus, Search, Pencil, Trash2, X, AlertCircle, ShieldAlert } from "lucide-react";
import { getUsers, getRoles, createUser, updateUser, deleteUser, type User, type Role } from "@/lib/api/users";
import { usePermissions } from "@/hooks/usePermissions";

export default function UsersPage() {
  const { isAdmin } = usePermissions();
  
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    role: "",
    phone: "",
    designation: "",
    department: "",
    is_active: true,
  });

  async function loadData() {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const [usersData, rolesData] = await Promise.all([getUsers(), getRoles()]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      username: "", email: "", first_name: "", last_name: "",
      password: "", role: "", phone: "", designation: "", department: "", is_active: true,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingId(user.id);
    setFormData({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      password: "", // Don't show existing password
      role: user.role ? String(user.role) : "",
      phone: user.phone || "",
      designation: user.designation || "",
      department: user.department || "",
      is_active: user.is_active,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    try {
      const payload = {
        ...formData,
        role: formData.role ? Number(formData.role) : null,
      };

      if (editingId) {
        // If editing and password is empty, remove it from payload so it doesn't overwrite
        if (!payload.password) delete payload.password;
        await updateUser(editingId, payload);
      } else {
        await createUser(payload);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setFormError(err.message || "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to deactivate this user?")) {
      try {
        await deleteUser(id);
        loadData();
      } catch (err: any) {
        alert(err.message || "Failed to deactivate user");
      }
    }
  };

  // Agar user Admin nahi hai, toh Access Denied dikhao
  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <NeoCard className="text-center p-10 max-w-md">
            <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
            <p className="text-slate-500 mb-6">You do not have permission to view this page. Only Administrators can manage users.</p>
          </NeoCard>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <NeoIconBox size="lg" color="text-indigo-600">
              <Users className="h-6 w-6" />
            </NeoIconBox>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
              <p className="text-sm text-slate-500">Manage system users and their roles</p>
            </div>
          </div>
          <NeoButton variant="primary" icon={<Plus className="h-4 w-4" />} onClick={openAddModal}>
            New User
          </NeoButton>
        </div>

        {error && (
          <NeoCard padding="sm">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </NeoCard>
        )}

        {/* Users List */}
        <NeoCard padding="md">
          {loading ? (
            <div className="text-center py-10 text-slate-500">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-10 text-slate-500">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-300/60">
                    <th className="p-3 font-bold text-slate-500 uppercase text-xs">User</th>
                    <th className="p-3 font-bold text-slate-500 uppercase text-xs">Role</th>
                    <th className="p-3 font-bold text-slate-500 uppercase text-xs">Contact</th>
                    <th className="p-3 font-bold text-slate-500 uppercase text-xs">Status</th>
                    <th className="p-3 font-bold text-slate-500 uppercase text-xs text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-200/40 hover:bg-slate-50/50">
                      <td className="p-3">
                        <p className="font-bold text-slate-800">{u.full_name || u.username}</p>
                        <p className="text-xs text-slate-500">@{u.username} • {u.email}</p>
                      </td>
                      <td className="p-3">
                        <NeoBadge variant={u.role_code === 'admin' ? 'danger' : u.role_code === 'manager' ? 'warning' : 'primary'}>
                          {u.role_name || "No Role"}
                        </NeoBadge>
                      </td>
                      <td className="p-3">
                        <p className="text-slate-700">{u.phone || "—"}</p>
                        <p className="text-xs text-slate-500">{u.department || "—"}</p>
                      </td>
                      <td className="p-3">
                        <NeoBadge variant={u.is_active ? 'success' : 'neutral'}>
                          {u.is_active ? "Active" : "Inactive"}
                        </NeoBadge>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditModal(u)} className="h-8 w-8 rounded-lg flex items-center justify-center text-amber-600 bg-white shadow-sm hover:scale-105 transition-all">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(u.id)} className="h-8 w-8 rounded-lg flex items-center justify-center text-red-600 bg-white shadow-sm hover:scale-105 transition-all">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </NeoCard>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl p-6 rounded-3xl bg-[#e0e5ec] shadow-2xl relative my-8">
            <button onClick={() => !saving && setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800">
              <X className="h-5 w-5" />
            </button>
            
            <h2 className="text-xl font-bold text-slate-800 mb-6">
              {editingId ? "Edit User" : "Create New User"}
            </h2>
            
            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <NeoInput label="First Name" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} required />
                <NeoInput label="Last Name" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <NeoInput label="Username *" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
                <NeoInput label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <NeoInput 
                  label={editingId ? "New Password (leave blank to keep current)" : "Password *"} 
                  type="password" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  required={!editingId} 
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Role</label>
                  <select 
                    value={formData.role} 
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                    style={{ boxShadow: "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff" }}
                  >
                    <option value="">-- No Role (Viewer) --</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <NeoInput label="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                <NeoInput label="Designation" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <NeoInput label="Department" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
                <div className="flex items-center gap-3 pt-6 pl-2">
                  <input 
                    type="checkbox" 
                    id="is_active"
                    checked={formData.is_active} 
                    onChange={e => setFormData({...formData, is_active: e.target.checked})}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="is_active" className="text-sm font-semibold text-slate-700 cursor-pointer">
                    Account is Active
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <NeoButton type="submit" variant="primary" loading={saving} icon={<Users className="h-4 w-4" />}>
                  {saving ? "Saving..." : "Save User"}
                </NeoButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}