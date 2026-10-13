from rest_framework import serializers

from bills.models import BillEntry, BillEntryItem


# ============================================
# BILL ENTRY ITEM
# ============================================

class BillEntryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = BillEntryItem
        fields = [
            'id',
            'date',
            'particulars',
            'amount_rs',
            'amount_paise',
            'remarks',
            'order',
        ]


class BillEntryItemCreateSerializer(serializers.ModelSerializer):
    amount_rs = serializers.DecimalField(
        max_digits=15,
        decimal_places=2,
        coerce_to_string=False,
        required=False,
        default=0,
    )
    amount_paise = serializers.DecimalField(
        max_digits=2,
        decimal_places=0,
        coerce_to_string=False,
        required=False,
        default=0,
    )

    class Meta:
        model = BillEntryItem
        fields = [
            'date',
            'particulars',
            'amount_rs',
            'amount_paise',
            'remarks',
            'order',
        ]

    def validate_particulars(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Particulars is required.")
        return value.strip()


# ============================================
# BILL ENTRY — LIST
# ============================================

class BillEntryListSerializer(serializers.ModelSerializer):
    project_code = serializers.CharField(
        source='project.project_code',
        read_only=True
    )
    project_name = serializers.CharField(
        source='project.project_name',
        read_only=True
    )
    vendor_name = serializers.CharField(
        source='vendor.vendor_name',
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
        model = BillEntry
        fields = [
            'id',
            'document_no',
            'bill_no',
            'bill_date',
            'diary_voucher_no',
            'diary_voucher_date',
            'project',
            'project_code',
            'project_name',
            'purchase_order',
            'po_number',
            'vendor',
            'vendor_name',
            'recipient_name',
            'major_budget_head',
            'minor_budget_head',
            'scheme_code',
            'component_code',
            'bill_amount',
            # Rates
            'cgst_rate',
            'sgst_rate',
            'igst_rate',
            'tds_gst_rate',
            'tds_income_tax_rate',
            # Amounts
            'cgst_amount',
            'sgst_amount',
            'igst_amount',
            'tds_gst',
            'tds_income_tax',
            'penalty',
            'penalty_applicable',
            'pbg_security',
            'pbg_applicable',
            'other_charges',
            'other_charges_remarks',
            'total_payable',
            'status',
            'status_display',
            'item_count',
            'created_at',
            'updated_at',
        ]

    def get_item_count(self, obj):
        return obj.item_count


# ============================================
# BILL ENTRY — DETAIL
# ============================================

class BillEntryDetailSerializer(serializers.ModelSerializer):
    items = BillEntryItemSerializer(many=True, read_only=True)
    project_code = serializers.CharField(
        source='project.project_code',
        read_only=True
    )
    project_name = serializers.CharField(
        source='project.project_name',
        read_only=True
    )
    vendor_name = serializers.CharField(
        source='vendor.vendor_name',
        read_only=True
    )
    vendor_detail = serializers.SerializerMethodField()
    po_number = serializers.CharField(
        source='purchase_order.po_number',
        read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    budget_head_name = serializers.CharField(
        source='budget_head.name',
        read_only=True
    )

    class Meta:
        model = BillEntry
        fields = '__all__'
        read_only_fields = [
            'document_no',
            'total_payable',
            'in_words',
            'created_at',
            'updated_at',
            'created_by',
            'updated_by',
            'is_deleted',
            'deleted_at',
        ]

    def get_vendor_detail(self, obj):
        if not obj.vendor:
            return None
        v = obj.vendor
        return {
            'id': v.id,
            'vendor_code': v.vendor_code,
            'vendor_name': v.vendor_name,
            'address_line1': getattr(v, 'address_line1', ''),
            'address_line2': getattr(v, 'address_line2', ''),
            'city': getattr(v, 'city', ''),
            'state': getattr(v, 'state', ''),
            'pincode': getattr(v, 'pincode', ''),
            'gst_number': getattr(v, 'gst_number', ''),
            'pan_number': getattr(v, 'pan_number', ''),
            'contact_person': getattr(v, 'contact_person', ''),
            'phone': getattr(v, 'phone', ''),
            'email': getattr(v, 'email', ''),
            'bank_name': getattr(v, 'bank_name', ''),
            'bank_branch': getattr(v, 'bank_branch', ''),
            'bank_ifsc': getattr(v, 'bank_ifsc', ''),
            'account_number': getattr(v, 'account_number', ''),
            'account_type': getattr(v, 'account_type', ''),
        }


# ============================================
# BILL ENTRY — CREATE / UPDATE
# ============================================

class BillEntryCreateUpdateSerializer(serializers.ModelSerializer):
    items = BillEntryItemCreateSerializer(many=True, required=False)

    class Meta:
        model = BillEntry
        fields = [
            # Basic
            'bill_no',
            'bill_date',
            # Diary voucher
            'diary_voucher_no',
            'diary_voucher_date',
            # Relations
            'project',
            'purchase_order',
            'vendor',
            'budget_head',
            # Budget heads (auto-fill from project)
            'major_budget_head',
            'minor_budget_head',
            'scheme_code', 
            'component_code',
            # Recipient
            'recipient_name',
            'particulars',
            # Vendor Invoice (optional)
            'vendor_bill_no',
            'vendor_bill_date',
            'absentee',
            # ============================================
            # AMOUNTS — Base
            # ============================================
            'bill_amount',
            # ============================================
            # DEDUCTION RATES (%)
            # ============================================
            'cgst_rate',
            'sgst_rate',
            'igst_rate',
            'tds_gst_rate',
            'tds_income_tax_rate',
            # ============================================
            # DEDUCTION AMOUNTS (auto-calculated)
            # ============================================
            'cgst_amount',
            'sgst_amount',
            'igst_amount',
            'tds_gst',
            'tds_income_tax',
            'penalty',
            'penalty_applicable',
            'pbg_security',
            'pbg_applicable',
            'other_charges',
            'other_charges_remarks',
            # ============================================
            # RTGS — Bank details
            # ============================================
            'bank_account_name',
            'bank_account_no',
            'bank_name',
            'bank_branch',
            'bank_ifsc',
            'bank_account_type',
            'bank_address',
            'rtgs_purpose',
            # Status & extra
            'status',
            'remarks',
            # Items
            'items',
        ]

    def validate_bill_no(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Bill No. is required.")
        return value.strip()

    def validate_recipient_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Recipient name is required.")
        return value.strip()

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        bill = BillEntry.objects.create(**validated_data)

        for index, item_data in enumerate(items_data):
            if 'order' not in item_data or not item_data.get('order'):
                item_data['order'] = index + 1
            BillEntryItem.objects.create(
                bill_entry=bill,
                **item_data
            )

        return bill

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            for index, item_data in enumerate(items_data):
                if 'order' not in item_data or not item_data.get('order'):
                    item_data['order'] = index + 1
                BillEntryItem.objects.create(
                    bill_entry=instance,
                    **item_data
                )

        return instance