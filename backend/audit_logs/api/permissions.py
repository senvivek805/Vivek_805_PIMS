from rest_framework.permissions import BasePermission


class IsAdminOrManager(BasePermission):
    """
    Sirf Admin aur Manager ko access.
    Superuser ko hamesha allow.
    """
    message = "Only Admin and Manager can access this."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        # Superuser override
        if user.is_superuser:
            return True

        role = getattr(user, "role", None)
        if not role:
            return False

        # Role FK hai to .name, warna string direct
        role_name = getattr(role, "name", str(role)).strip().lower()
        return role_name in ("admin", "manager")