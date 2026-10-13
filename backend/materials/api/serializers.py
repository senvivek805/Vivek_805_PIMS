from rest_framework import serializers

from materials.models import (
    MaterialCategory,
    Material,
    MaterialReceipt,
    MaterialReceiptItem,
    MaterialIssue,
    MaterialIssueItem,
    MaterialReturnNote,
    MaterialReturnNoteItem,
)

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
    total_received = serializers.SerializerMethodField()
    total_received = serializers.SerializerMethodField()
    total_issued = serializers.SerializerMethodField()
    total_returned = serializers.SerializerMethodField()
    current_stock = serializers.SerializerMethodField()

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
            'total_received',
            'total_issued',
            'total_returned',
            'current_stock',
            'created_at',
            'updated_at',
        ]

    def get_total_received(self, obj):
        return obj.total_received

    def get_total_issued(self, obj):
        return obj.total_issued

    def get_total_returned(self, obj):
        return obj.total_returned

    def get_current_stock(self, obj):
        return obj.current_stock


# ============================================
# MATERIAL — DETAIL
# ============================================

class MaterialDetailSerializer(serializers.ModelSerializer):
    category_detail = MaterialCategorySerializer(
        source='category',
        read_only=True
    )
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
            raise serializers.ValidationError("Material name is required.")
        return value.strip()

    def validate_gst_rate(self, value):
        if value is not None and (float(value) < 0 or float(value) > 100):
            raise serializers.ValidationError("GST must be between 0-100.")
        return value


# ============================================
# MATERIAL RECEIPT ITEM
# ============================================

class MaterialReceiptItemSerializer(serializers.ModelSerializer):
    pending_quantity = serializers.SerializerMethodField()
    po_number = serializers.CharField(
        source='po_item.purchase_order.po_number',
        read_only=True
    )
    material_code = serializers.CharField(
        source='material.material_code',
        read_only=True
    )

    class Meta:
        model = MaterialReceiptItem
        fields = [
            'id',
            'item_name',
            'ordered_quantity',
            'received_quantity',
            'pending_quantity',
            'unit',
            'po_item',
            'po_number',
            'material',
            'material_code',
            'remarks',
        ]

    def get_pending_quantity(self, obj):
        """
        Pending quantity at PO level (not receipt level).
        Uses PO item's received_quantity (total across all receipts).
        """
        if obj.po_item:
            po_ordered = float(obj.po_item.quantity or 0)
            po_received = float(obj.po_item.received_quantity or 0)
            return round(po_ordered - po_received, 3)
        return round(
            float(obj.ordered_quantity or 0) - float(obj.received_quantity or 0),
            3
        )


class MaterialReceiptItemCreateSerializer(serializers.ModelSerializer):
    ordered_quantity = serializers.DecimalField(
        max_digits=15,
        decimal_places=3,
        coerce_to_string=False,
        required=False,
        default=0,
    )
    received_quantity = serializers.DecimalField(
        max_digits=15,
        decimal_places=3,
        coerce_to_string=False,
        required=False,
        default=0,
    )

    class Meta:
        model = MaterialReceiptItem
        fields = [
            'item_name',
            'ordered_quantity',
            'received_quantity',
            'unit',
            'po_item',
            'material',
            'remarks',
        ]

    def validate_received_quantity(self, value):
        if value is None or float(value) < 0:
            raise serializers.ValidationError(
                "Received quantity cannot be negative."
            )
        return value


# ============================================
# MATERIAL RECEIPT — LIST
# ============================================

class MaterialReceiptListSerializer(serializers.ModelSerializer):
    po_number = serializers.CharField(
        source='purchase_order.po_number',
        read_only=True
    )
    vendor_name = serializers.CharField(
        source='vendor.vendor_name',
        read_only=True
    )
    vendor_code = serializers.CharField(
        source='vendor.vendor_code',
        read_only=True
    )
    project_code = serializers.CharField(
        source='project.project_code',
        read_only=True
    )
    project_name = serializers.CharField(
        source='project.project_name',
        read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = MaterialReceipt
        fields = [
            'id',
            'receipt_no',
            'receipt_date',
            'purchase_order',
            'po_number',
            'vendor',
            'vendor_name',
            'vendor_code',
            'project',
            'project_code',
            'project_name',
            'status',
            'status_display',
            'item_count',
            'remarks',
            'created_at',
            'updated_at',
        ]

    def get_item_count(self, obj):
        return obj.item_count


# ============================================
# MATERIAL RECEIPT — DETAIL
# ============================================

class MaterialReceiptDetailSerializer(serializers.ModelSerializer):
    items = MaterialReceiptItemSerializer(many=True, read_only=True)
    po_number = serializers.CharField(
        source='purchase_order.po_number',
        read_only=True
    )
    vendor_name = serializers.CharField(
        source='vendor.vendor_name',
        read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )

    class Meta:
        model = MaterialReceipt
        fields = '__all__'
        read_only_fields = [
            'receipt_no',
            'created_at',
            'updated_at',
            'created_by',
            'updated_by',
            'is_deleted',
            'deleted_at',
        ]


# ============================================
# MATERIAL RECEIPT — CREATE / UPDATE
# ============================================

class MaterialReceiptCreateUpdateSerializer(serializers.ModelSerializer):
    items = MaterialReceiptItemCreateSerializer(many=True, required=False)

    class Meta:
        model = MaterialReceipt
        fields = [
            'receipt_date',
            'purchase_order',
            'vendor',
            'project',
            'status',
            'remarks',
            'items',
        ]

    def validate_items(self, value):
        if not value or len(value) == 0:
            raise serializers.ValidationError(
                "At least one item is required."
            )
        return value

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        receipt = MaterialReceipt.objects.create(**validated_data)

        for item_data in items_data:
            MaterialReceiptItem.objects.create(
                material_receipt=receipt,
                **item_data
            )

        return receipt

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                MaterialReceiptItem.objects.create(
                    material_receipt=instance,
                    **item_data
                )

        return instance


# ============================================
# MATERIAL ISSUE ITEM
# ============================================

class MaterialIssueItemSerializer(serializers.ModelSerializer):
    material_name = serializers.CharField(
        source='material.material_name',
        read_only=True
    )
    material_code = serializers.CharField(
        source='material.material_code',
        read_only=True
    )

    class Meta:
        model = MaterialIssueItem
        fields = [
            'id',
            'material',
            'material_name',
            'material_code',
            'quantity',
            'unit',
            'remarks',
        ]


class MaterialIssueItemCreateSerializer(serializers.ModelSerializer):
    quantity = serializers.DecimalField(
        max_digits=15,
        decimal_places=3,
        coerce_to_string=False,
        required=True,
    )

    class Meta:
        model = MaterialIssueItem
        fields = [
            'material',
            'quantity',
            'unit',
            'remarks',
        ]

    def validate_quantity(self, value):
        if value is None or float(value) <= 0:
            raise serializers.ValidationError(
                "Quantity must be greater than 0."
            )
        return value


# ============================================
# MATERIAL ISSUE — LIST
# ============================================

class MaterialIssueListSerializer(serializers.ModelSerializer):
    issued_to_name = serializers.CharField(
        source='issued_to.full_name',
        read_only=True
    )
    issued_to_code = serializers.CharField(
        source='issued_to.employee_code',
        read_only=True
    )
    project_name = serializers.CharField(
        source='project.project_name',
        read_only=True
    )
    project_code = serializers.CharField(
        source='project.project_code',
        read_only=True
    )
    po_number = serializers.CharField(
        source='purchase_order.po_number',
        read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = MaterialIssue
        fields = [
            'id',
            'issue_no',
            'issue_date',
            'issued_to',
            'issued_to_name',
            'issued_to_code',
            'project',
            'project_name',
            'project_code',
            'purchase_order',
            'po_number',
            'purpose',
            'status',
            'status_display',
            'item_count',
            'remarks',
            'created_at',
            'updated_at',
        ]

    def get_item_count(self, obj):
        return obj.item_count


# ============================================
# MATERIAL ISSUE — DETAIL
# ============================================

class MaterialIssueDetailSerializer(serializers.ModelSerializer):
    items = MaterialIssueItemSerializer(many=True, read_only=True)
    issued_to_name = serializers.CharField(
        source='issued_to.full_name',
        read_only=True
    )
    issued_to_code = serializers.CharField(
        source='issued_to.employee_code',
        read_only=True
    )
    project_name = serializers.CharField(
        source='project.project_name',
        read_only=True
    )
    po_number = serializers.CharField(
        source='purchase_order.po_number',
        read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )

    class Meta:
        model = MaterialIssue
        fields = '__all__'
        read_only_fields = [
            'issue_no',
            'created_at',
            'updated_at',
            'created_by',
            'updated_by',
            'is_deleted',
            'deleted_at',
        ]


# ============================================
# MATERIAL ISSUE — CREATE / UPDATE
# ============================================

class MaterialIssueCreateUpdateSerializer(serializers.ModelSerializer):
    items = MaterialIssueItemCreateSerializer(many=True, required=False)

    class Meta:
        model = MaterialIssue
        fields = [
            'issue_date',
            'issued_to',
            'project',
            'purchase_order',
            'purpose',
            'status',
            'remarks',
            'items',
        ]

    def validate_items(self, value):
        if not value or len(value) == 0:
            raise serializers.ValidationError(
                "At least one item is required."
            )
        return value

    def validate(self, data):
        """
        Stock validation when status is 'issued'.
        On edit, consider original quantity of this issue as available.
        """
        status = data.get('status', 'draft')
        items = data.get('items', [])

        if status == 'issued':
            for item in items:
                material = item.get('material')
                quantity = item.get('quantity')
                if material and quantity:
                    available = material.current_stock

                    # On edit, add back original quantity of this issue
                    if self.instance:
                        original_item = self.instance.items.filter(
                            material=material,
                            is_deleted=False
                        ).first()
                        if original_item:
                            available += float(
                                original_item.quantity or 0
                            )

                    if float(quantity) > available:
                        raise serializers.ValidationError(
                            f"Insufficient stock for '{material.material_name}'. "
                            f"Available: {available}, Requested: {quantity}"
                        )

        return data

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        issue = MaterialIssue.objects.create(**validated_data)

        for item_data in items_data:
            MaterialIssueItem.objects.create(
                material_issue=issue,
                **item_data
            )

        return issue

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                MaterialIssueItem.objects.create(
                    material_issue=instance,
                    **item_data
                )

        return instance
    

# ============================================
# MATERIAL RETURN NOTE ITEM
# ============================================

class MaterialReturnNoteItemSerializer(serializers.ModelSerializer):
    material_name = serializers.CharField(
        source='material.material_name',
        read_only=True
    )
    material_code = serializers.CharField(
        source='material.material_code',
        read_only=True
    )
    condition_display = serializers.CharField(
        source='get_condition_display',
        read_only=True
    )

    class Meta:
        model = MaterialReturnNoteItem
        fields = [
            'id',
            'material',
            'material_name',
            'material_code',
            'quantity',
            'unit',
            'condition',
            'condition_display',
            'remarks',
        ]


class MaterialReturnNoteItemCreateSerializer(serializers.ModelSerializer):
    quantity = serializers.DecimalField(
        max_digits=15,
        decimal_places=3,
        coerce_to_string=False,
        required=True,
    )

    class Meta:
        model = MaterialReturnNoteItem
        fields = [
            'material',
            'quantity',
            'unit',
            'condition',
            'remarks',
        ]

    def validate_quantity(self, value):
        if value is None or float(value) <= 0:
            raise serializers.ValidationError(
                "Quantity must be greater than 0."
            )
        return value


# ============================================
# MATERIAL RETURN NOTE — LIST
# ============================================

class MaterialReturnNoteListSerializer(serializers.ModelSerializer):
    returned_by_name = serializers.CharField(
        source='returned_by.full_name',
        read_only=True
    )
    returned_by_code = serializers.CharField(
        source='returned_by.employee_code',
        read_only=True
    )
    issue_no = serializers.CharField(
        source='material_issue.issue_no',
        read_only=True
    )
    project_name = serializers.CharField(
        source='project.project_name',
        read_only=True
    )
    project_code = serializers.CharField(
        source='project.project_code',
        read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = MaterialReturnNote
        fields = [
            'id',
            'mrn_no',
            'return_date',
            'material_issue',
            'issue_no',
            'returned_by',
            'returned_by_name',
            'returned_by_code',
            'project',
            'project_name',
            'project_code',
            'reason',
            'status',
            'status_display',
            'item_count',
            'remarks',
            'created_at',
            'updated_at',
        ]

    def get_item_count(self, obj):
        return obj.item_count


# ============================================
# MATERIAL RETURN NOTE — DETAIL
# ============================================

class MaterialReturnNoteDetailSerializer(serializers.ModelSerializer):
    items = MaterialReturnNoteItemSerializer(many=True, read_only=True)
    returned_by_name = serializers.CharField(
        source='returned_by.full_name',
        read_only=True
    )
    returned_by_code = serializers.CharField(
        source='returned_by.employee_code',
        read_only=True
    )
    issue_no = serializers.CharField(
        source='material_issue.issue_no',
        read_only=True
    )
    project_name = serializers.CharField(
        source='project.project_name',
        read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )

    class Meta:
        model = MaterialReturnNote
        fields = '__all__'
        read_only_fields = [
            'mrn_no',
            'created_at',
            'updated_at',
            'created_by',
            'updated_by',
            'is_deleted',
            'deleted_at',
        ]


# ============================================
# MATERIAL RETURN NOTE — CREATE / UPDATE
# ============================================

class MaterialReturnNoteCreateUpdateSerializer(serializers.ModelSerializer):
    items = MaterialReturnNoteItemCreateSerializer(many=True, required=False)

    class Meta:
        model = MaterialReturnNote
        fields = [
            'return_date',
            'material_issue',
            'returned_by',
            'project',
            'reason',
            'status',
            'remarks',
            'items',
        ]

    def validate_items(self, value):
        if not value or len(value) == 0:
            raise serializers.ValidationError(
                "At least one item is required."
            )
        return value

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        note = MaterialReturnNote.objects.create(**validated_data)

        for item_data in items_data:
            MaterialReturnNoteItem.objects.create(
                material_return=note,
                **item_data
            )

        return note

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                MaterialReturnNoteItem.objects.create(
                    material_return=instance,
                    **item_data
                )

        return instance