from rest_framework import serializers

from accounts.models import User, Role


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name', 'code', 'description']


class UserSerializer(serializers.ModelSerializer):
    role_detail = RoleSerializer(source='role', read_only=True)
    role_name = serializers.CharField(source='role.name', read_only=True)
    role_code = serializers.CharField(source='role.code', read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'role',
            'role_detail',
            'role_name',
            'role_code',
            'phone',
            'designation',
            'department',
            'is_active',
            'is_staff',
            'is_superuser',
            'last_login',
        ]
        read_only_fields = ['id', 'last_login']

    def get_full_name(self, obj):
        name = f"{obj.first_name} {obj.last_name}".strip()
        return name or obj.username


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)