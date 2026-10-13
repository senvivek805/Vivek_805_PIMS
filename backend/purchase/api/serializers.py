from decimal import Decimal
from rest_framework import serializers

from purchase.models import PurchaseOrder, PurchaseOrderItem
from projects.models import Project
from vendors.models import Vendor


# ============================================
# SIMPLE REFERENCE SERIALIZERS
# ============================================

class SimpleProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'project_code', 'project_name', 'pi_name']


class SimpleVendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = [
            'id', 'vendor_code', 'vendor_name',
            'address_line1', 'address_line2',
            'city', 'state', 'pincode',
            'gst_number', 'pan_number',
            'contact_person', 'phone', 'email',
        ]


# ============================================
# PO ITEM — READ
# ============================================

class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    material_name = serializers.CharField(
        source='material.material_name',
        read_only=True
    )
    material_code = serializers.CharField(
        source='material.material_code',
        read_only=True
    )
    item_type_display = serializers.CharField(
        source='get_item_type_display',
        read_only=True
    )

    class Meta:
        model = PurchaseOrderItem
        fields = [
            'id',
            'item_name',
            'item_type',
            'item_type_display',
            'material',
            'material_name',
            'material_code',
            'quantity',
            'received_quantity',
            'unit',
            'rate',
            'gst_rate',
            'cgst_amount',
            'sgst_amount',
            'igst_amount',
            'gst_amount',
            'amount',
            'order',
        ]
        read_only_fields = [
            'cgst_amount',
            'sgst_amount',
            'igst_amount',
            'gst_amount',
            'amount',
            'received_quantity',
        ]


# ============================================
# PO ITEM — CREATE
# ============================================

class PurchaseOrderItemCreateSerializer(serializers.ModelSerializer):
    quantity = serializers.DecimalField(
        max_digits=15,
        decimal_places=3,
        coerce_to_string=False,
        required=False,
        default=1,
    )
    rate = serializers.DecimalField(
        max_digits=15,
        decimal_places=2,
        coerce_to_string=False,
        required=False,
        default=0,
    )
    gst_rate = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        coerce_to_string=False,
        required=False,
        default=18,
    )

    class Meta:
        model = PurchaseOrderItem
        fields = [
            'item_name',
            'item_type',
            'material',
            'quantity',
            'unit',
            'rate',
            'gst_rate',
            'order',
        ]

    def validate_item_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Item name is required.")
        return value.strip()

    def validate(self, data):
        """
        Validate: if item_type is 'material', material must be selected.
        """
        item_type = data.get('item_type', 'material')
        material = data.get('material')

        if item_type == 'material' and not material:
            raise serializers.ValidationError(
                "Material is required when item type is 'Material'."
            )

        if item_type == 'service' and material:
            raise serializers.ValidationError(
                "Material should not be selected for 'Service' items."
            )

        return data


# ============================================
# PURCHASE ORDER — LIST
# ============================================

class PurchaseOrderListSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.vendor_name', read_only=True)
    vendor_code = serializers.CharField(source='vendor.vendor_code', read_only=True)
    project_code = serializers.CharField(source='project.project_code', read_only=True)
    project_name = serializers.CharField(source='project.project_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    gst_type_display = serializers.CharField(source='get_gst_type_display', read_only=True)
    item_count = serializers.SerializerMethodField()
    received_items_count = serializers.SerializerMethodField()
    total_items_count = serializers.SerializerMethodField()
    received_status = serializers.SerializerMethodField()
    is_fully_received = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseOrder
        fields = [
            'id',
            'po_number',
            'po_date',
            'department_school',
            'vendor',
            'vendor_name',
            'vendor_code',
            'project',
            'project_code',
            'project_name',
            'subject',
            'subtotal',
            'cgst_amount',
            'sgst_amount',
            'igst_amount',
            'gst_amount',
            'grand_total',
            'in_words',
            'gst_type',
            'gst_type_display',
            'status',
            'status_display',
            'item_count',
            'received_items_count',
            'total_items_count',
            'received_status',
            'is_fully_received',
            'created_at',
            'updated_at',
        ]

    def get_item_count(self, obj):
        return obj.item_count

    def get_received_items_count(self, obj):
        return obj.received_items_count

    def get_total_items_count(self, obj):
        return obj.total_items_count

    def get_received_status(self, obj):
        return obj.received_status

    def get_is_fully_received(self, obj):
        return obj.is_fully_received


# ============================================
# PURCHASE ORDER — DETAIL
# ============================================

class PurchaseOrderDetailSerializer(serializers.ModelSerializer):
    vendor_detail = SimpleVendorSerializer(source='vendor', read_only=True)
    project_detail = SimpleProjectSerializer(source='project', read_only=True)
    items = PurchaseOrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    gst_type_display = serializers.CharField(source='get_gst_type_display', read_only=True)
    tc_template_display = serializers.CharField(
        source='get_tc_template_display',
        read_only=True
    )

    class Meta:
        model = PurchaseOrder
        fields = '__all__'
        read_only_fields = [
            'subtotal',
            'cgst_amount',
            'sgst_amount',
            'igst_amount',
            'gst_amount',
            'grand_total',
            'in_words',
            'gst_type',
            'created_at',
            'updated_at',
            'created_by',
            'updated_by',
            'is_deleted',
            'deleted_at',
        ]


# ============================================
# PURCHASE ORDER — CREATE / UPDATE
# ============================================

class PurchaseOrderCreateUpdateSerializer(serializers.ModelSerializer):
    items = PurchaseOrderItemCreateSerializer(many=True, required=False)

    class Meta:
        model = PurchaseOrder
        fields = [
            # Basic
            'po_number',
            'po_date',
            'department_school',
            # Relations
            'vendor',
            'project',
            'budget_head',
            # Header fields
            'approximate_cost',
            'major_budget_head',
            'minor_budget_head',
            'budget_grant',
            'amount_spent',
            'balance_available',
            # Subject
            'subject',
            'body_description',
            # T&C
            'tc_template',
            'terms_conditions',
            # Extra
            'reference_no',
            'remarks',
            'status',
            # Items (nested)
            'items',
        ]

    def validate_po_number(self, value):
        """PO number must be unique."""
        qs = PurchaseOrder.objects.filter(po_number__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                "This PO number already exists."
            )
        return value.strip()

    def validate_items(self, value):
        if not value or len(value) == 0:
            raise serializers.ValidationError(
                "At least one item is required."
            )
        return value

    def create(self, validated_data):
        """Create PO and items."""
        items_data = validated_data.pop('items', [])

        po = PurchaseOrder.objects.create(**validated_data)

        for index, item_data in enumerate(items_data):
            if 'order' not in item_data or not item_data.get('order'):
                item_data['order'] = index + 1
            PurchaseOrderItem.objects.create(
                purchase_order=po,
                **item_data
            )

        po.calculate_totals()

        return po

    def update(self, instance, validated_data):
        """Update PO and replace items."""
        items_data = validated_data.pop('items', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data is not None:
            instance.items.all().delete()

            for index, item_data in enumerate(items_data):
                if 'order' not in item_data or not item_data.get('order'):
                    item_data['order'] = index + 1
                PurchaseOrderItem.objects.create(
                    purchase_order=instance,
                    **item_data
                )

            instance.calculate_totals()

        return instance