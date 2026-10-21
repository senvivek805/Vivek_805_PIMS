from rest_framework import permissions

class PIMSRolePermission(permissions.BasePermission):
    """
    Ye ek smart permission hai jo HTTP Method ke hisaab se decide karti hai:
    - GET (View): Sabhi logged-in users
    - POST, PUT, PATCH (Create/Edit): Admin, Manager, Operator
    - DELETE: Sirf Admin
    """
    def has_permission(self, request, view):
        # 1. Agar user login nahi hai, toh kuch nahi kar sakta
        if not request.user or not request.user.is_authenticated:
            return False
            
        # 2. Superuser (Creator) sab kuch kar sakta hai
        if request.user.is_superuser:
            return True
            
        # 3. User ka role nikaalo (agar role nahi hai to viewer maan lo)
        role_code = 'viewer'
        if hasattr(request.user, 'role') and request.user.role:
            role_code = request.user.role.code

        # 4. View karne ke liye (GET) sabko allow karo
        if request.method in permissions.SAFE_METHODS:
            return True

        # 5. Delete karne ke liye (DELETE) sirf Admin allow hai
        if request.method == 'DELETE':
            return role_code == 'admin'

        # 6. Naya add ya edit karne ke liye (POST, PUT, PATCH) Admin, Manager, Operator allow hain
        if request.method in ['POST', 'PUT', 'PATCH']:
            return role_code in ['admin', 'manager', 'operator']

        return False