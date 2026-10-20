from rest_framework import serializers

from projects.models import Agency, Department, Project, ProjectPI


# ============================================
# AGENCY
# ============================================

class AgencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Agency
        fields = ['id', 'name', 'code', 'description', 'contact_person', 'contact_email', 'contact_phone']


# ============================================
# DEPARTMENT
# ============================================

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'hod_name', 'description']


# ============================================
# PROJECT PI
# ============================================

class ProjectPISerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = ProjectPI
        fields = [
            'id', 'project', 'name', 'role', 'role_display',
            'designation', 'email', 'phone', 'department', 'order',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'project', 'created_at', 'updated_at']


class ProjectPICreateSerializer(serializers.ModelSerializer):
    """Nested PI create ke liye — project field nahi chahiye."""

    class Meta:
        model = ProjectPI
        fields = [
            'name', 'role', 'designation', 'email', 'phone', 'department', 'order',
        ]

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("PI ka naam zaroori hai.")
        return value.strip()


# ============================================
# PROJECT — LIST
# ============================================

class ProjectListSerializer(serializers.ModelSerializer):
    agency_name = serializers.CharField(source='agency.name', read_only=True)
    agency_code = serializers.CharField(source='agency.code', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    department_code = serializers.CharField(source='department.code', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    # PI names from ProjectPI table
    pi_names = serializers.SerializerMethodField()
    co_pi_names = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'project_code', 'project_name', 'description',
            'agency', 'agency_name', 'agency_code',
            'department', 'department_name', 'department_code',
            'start_date', 'end_date',
            'pi_name', 'co_pi_name', 'coordinator_name',
            'pi_names', 'co_pi_names',
            'sanctioned_amount',
            'total_sanctioned_amount',
            'status', 'status_display',
            'remarks',
            'created_at', 'updated_at',
        ]

    def get_pi_names(self, obj):
        pis = obj.pis.filter(is_deleted=False, role='pi').order_by('order')
        if pis.exists():
            return [p.name for p in pis]
        return [obj.pi_name] if obj.pi_name else []

    def get_co_pi_names(self, obj):
        co_pis = obj.pis.filter(is_deleted=False, role='co_pi').order_by('order')
        if co_pis.exists():
            return [p.name for p in co_pis]
        return [obj.co_pi_name] if obj.co_pi_name else []


# ============================================
# PROJECT — DETAIL
# ============================================

class ProjectDetailSerializer(serializers.ModelSerializer):
    agency_detail = AgencySerializer(source='agency', read_only=True)
    department_detail = DepartmentSerializer(source='department', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    pis = ProjectPISerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = [
            'created_at', 'updated_at', 'created_by', 'updated_by',
            'is_deleted', 'deleted_at',
        ]


# ============================================
# PROJECT — CREATE / UPDATE (with nested PIs)
# ============================================

class ProjectCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Project create/update with nested PIs.
    Frontend se ye structure aayega:
    {
        "project_code": "...",
        "project_name": "...",
        "agency": 1,
        "department": 1,
        "pis": [
            {"name": "Dr. X", "role": "pi", "order": 1, ...},
            {"name": "Dr. Y", "role": "co_pi", "order": 2, ...}
        ]
    }
    """
    pis = ProjectPICreateSerializer(many=True, required=False)

    class Meta:
        model = Project
        fields = [
            'project_code', 'project_name', 'description',
            'agency', 'department',
            'start_date', 'end_date',
            'pi_name', 'co_pi_name', 'coordinator_name',
            'sanctioned_amount', 
            'total_sanctioned_amount', # <-- Ye nayi line add ki hai
            'status', 'remarks',
            'pis',
        ]

    def validate_project_code(self, value):
        """Project code unique hona chahiye."""
        qs = Project.objects.filter(project_code__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Ye project code already exists hai.")
        return value.upper()

    def validate_sanctioned_amount(self, value):
        """Amount negative nahi hona chahiye."""
        if value is not None and value < 0:
            raise serializers.ValidationError("Amount negative nahi ho sakta.")
        return value

    def validate(self, attrs):
        """Start date end date se pehle honi chahiye."""
        start = attrs.get('start_date') or (self.instance.start_date if self.instance else None)
        end = attrs.get('end_date') or (self.instance.end_date if self.instance else None)

        if start and end and end < start:
            raise serializers.ValidationError({
                'end_date': 'End date start date se pehle nahi ho sakti.'
            })
        return attrs

    def create(self, validated_data):
        """Naya project + nested PIs create karo."""
        pis_data = validated_data.pop('pis', [])
        project = Project.objects.create(**validated_data)

        # PIs create karo
        for index, pi_data in enumerate(pis_data):
            if not pi_data.get('order'):
                pi_data['order'] = index + 1
            ProjectPI.objects.create(project=project, **pi_data)

        return project

    def update(self, instance, validated_data):
        """Project update + nested PIs replace karo."""
        pis_data = validated_data.pop('pis', None)

        # Project fields update
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Agar pis provided hain to replace karo
        if pis_data is not None:
            # Soft delete existing PIs
            instance.pis.all().delete()

            # Naye PIs create karo
            for index, pi_data in enumerate(pis_data):
                if not pi_data.get('order'):
                    pi_data['order'] = index + 1
                ProjectPI.objects.create(project=instance, **pi_data)

        return instance