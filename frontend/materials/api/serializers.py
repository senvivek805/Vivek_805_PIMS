from rest_framework import serializers

from materials.models import MaterialCategory, Material


# ============================================
# MATERIAL CATEGORY
# ============================================

class MaterialCategorySerializer(serializers.ModelSerializer):
    material_count = serializers.SerializerMethodField()

    class Meta:
        model = MaterialCategory
        fields = [
            'id',
            'name',
            'code',
            'description',
            'order',
            'material_count',
        ]

    def get_material_count(self, obj):
        return obj.materials.filter(is_deleted=False).count()


# ============================================
# MATERIAL — LIST
# ============================================

class MaterialListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source='category.name',
        read_only=True
    )
    category_code = serializers.CharField(
        source='category.code',
        read_only=True
    )
    unit_display = serializers.CharField(
        source='get_unit_display',
        read_only=True
    )

    class Meta:
        model = Material
        fields = [
            'id',
            'material_code',
            'material_name',
            'category',
            'category_name',
            'category_code',
            'unit',
            'unit_display',
            'hsn_code',
            'gst_rate',
            'description',
            'is_active',
            'created_at',
            'updated_at',
        ]


# ============================================
# MATERIAL — DETAIL
# ============================================

class MaterialDetailSerializer(serializers.ModelSerializer):
    category_detail = MaterialCategorySerializer(
        source='category',
        read_only=True
    )
    unit_display = serializers.CharField(
        source='get_unit_display',
        read_only=True
    )

    class Meta:
        model = Material
        fields = '__all__'
        read_only_fields = [
            'material_code',
            'created_at',
            'updated_at',
            'created_by',
            'updated_by',
            'is_deleted',
            'deleted_at',
        ]


# ============================================
# MATERIAL — CREATE / UPDATE
# ============================================

class MaterialCreateUpdateSerializer(serializers.ModelSerializer):
    # ✅ Explicit DecimalField for gst_rate
    gst_rate = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        coerce_to_string=False,
        required=False,
        default=18,
    )

    class Meta:
        model = Material
        fields = [
            'material_name',
            'category',
            'unit',
            'hsn_code',
            'gst_rate',
            'description',
            'is_active',
        ]

    def validate_material_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Material name zaroori hai.")
        return value.strip()