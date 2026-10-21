import { useAuth } from "./useAuth";

export function usePermissions() {
  const { user } = useAuth();
  
  // Agar user Superuser hai, toh use automatically Admin maan lo
  const isSuperUser = user?.is_superuser || false;
  
  // Agar role nahi hai aur superuser hai to 'admin', warna 'viewer' default
  const roleCode = user?.role_code || (isSuperUser ? "admin" : "viewer");

  return {
    roleCode,
    isAdmin: roleCode === "admin" || isSuperUser,
    isManager: roleCode === "manager",
    isOperator: roleCode === "operator",
    isViewer: roleCode === "viewer",

    // Centralized Permissions
    canCreate: isSuperUser || ["admin", "manager", "operator"].includes(roleCode),
    canEdit: isSuperUser || ["admin", "manager", "operator"].includes(roleCode),
    canDelete: isSuperUser || ["admin"].includes(roleCode),
  };
}