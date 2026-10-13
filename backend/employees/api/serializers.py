from rest_framework import serializers

from employees.models import Employee
from projects.models import Project


# ============================================
# SIMPLE PROJECT (for nesting)
# ============================================

class SimpleProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'project_code', 'project_name', 'pi_name']


# ============================================
# EMPLOYEE — LIST
# ============================================

class EmployeeListSerializer(serializers.ModelSerializer):
    employee_type_display = serializers.CharField(
        source='get_employee_type_display',
        read_only=True
    )
    manpower_type_display = serializers.CharField(
        source='get_manpower_type_display',
        read_only=True
    )
    assigned_project_name = serializers.CharField(
        source='assigned_project.project_name',
        read_only=True
    )
    assigned_project_code = serializers.CharField(
        source='assigned_project.project_code',
        read_only=True
    )

    class Meta:
        model = Employee
        fields = [
            'id',
            'employee_code',
            'reference_no',
            'full_name',
            'designation',
            'department',
            'employee_type',
            'employee_type_display',
            'email',
            'phone',
            'joining_date',
            'leaving_date',
            'assigned_project',
            'assigned_project_name',
            'assigned_project_code',
            'project_role',
            'manpower_type',
            'manpower_type_display',
            'is_active',
            'created_at',
            'updated_at',
        ]


# ============================================
# EMPLOYEE — DETAIL
# ============================================

class EmployeeDetailSerializer(serializers.ModelSerializer):
    employee_type_display = serializers.CharField(
        source='get_employee_type_display',
        read_only=True
    )
    manpower_type_display = serializers.CharField(
        source='get_manpower_type_display',
        read_only=True
    )
    account_type_display = serializers.CharField(
        source='get_account_type_display',
        read_only=True
    )
    assigned_project_detail = SimpleProjectSerializer(
        source='assigned_project',
        read_only=True
    )

    class Meta:
        model = Employee
        fields = '__all__'
        read_only_fields = [
            'employee_code',
            'created_at',
            'updated_at',
            'created_by',
            'updated_by',
            'is_deleted',
            'deleted_at',
        ]


# ============================================
# EMPLOYEE — CREATE / UPDATE
# ============================================

class EmployeeCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = [
            'reference_no',
            'full_name',
            'designation',
            'department',
            'employee_type',
            'email',
            'phone',
            'address',
            'joining_date',
            'leaving_date',
            'assigned_project',
            'project_role',
            'manpower_type',
            'bank_name',
            'account_number',
            'ifsc_code',
            'bank_branch',
            'account_type',
            'is_active',
        ]

    def validate_full_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Full name zaroori hai.")
        return value.strip()

    def validate_designation(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Designation zaroori hai.")
        return value.strip()

    def validate_phone(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Phone zaroori hai.")
        return value.strip()

    def validate(self, attrs):
        """Joining date aur leaving date check karo."""
        joining = attrs.get('joining_date') or (
            self.instance.joining_date if self.instance else None
        )
        leaving = attrs.get('leaving_date') or (
            self.instance.leaving_date if self.instance else None
        )

        if joining and leaving and leaving < joining:
            raise serializers.ValidationError({
                'leaving_date': 'Leaving date joining date se pehle nahi ho sakti.'
            })
        return attrs

    def validate_ifsc_code(self, value):
        """IFSC format check (agar diya hai)."""
        if value and len(value) != 11:
            raise serializers.ValidationError(
                "IFSC code 11 characters ka hona chahiye."
            )
        return value.upper() if value else value