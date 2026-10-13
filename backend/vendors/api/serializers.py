from rest_framework import serializers

from vendors.models import Vendor


# ============================================
# VENDOR — LIST
# ============================================

class VendorListSerializer(serializers.ModelSerializer):
    vendor_type_display = serializers.CharField(
        source='get_vendor_type_display',
        read_only=True
    )
    account_type_display = serializers.CharField(
        source='get_account_type_display',
        read_only=True
    )

    class Meta:
        model = Vendor
        fields = [
            'id',
            'vendor_code',
            'reference_no',
            'vendor_name',
            'vendor_type',
            'vendor_type_display',
            'contact_person',
            'email',
            'phone',
            'city',
            'state',
            'gst_number',
            # ============================================
            # ADDRESS (Full)
            # ============================================
            'address_line1',
            'address_line2',
            'pincode',
            'country',
            # ============================================
            # TAX
            # ============================================
            'pan_number',
            'tan_number',
            # ============================================
            # BANK DETAILS (For RTGS / Form 5)
            # ============================================
            'bank_name',
            'account_number',
            'ifsc_code',
            'bank_branch',
            'account_type',
            'account_type_display',
            # ============================================
            # STATUS
            # ============================================
            'is_active',
            'created_at',
            'updated_at',
        ]


# ============================================
# VENDOR — DETAIL
# ============================================

class VendorDetailSerializer(serializers.ModelSerializer):
    vendor_type_display = serializers.CharField(
        source='get_vendor_type_display',
        read_only=True
    )
    account_type_display = serializers.CharField(
        source='get_account_type_display',
        read_only=True
    )

    class Meta:
        model = Vendor
        fields = '__all__'
        read_only_fields = [
            'vendor_code',
            'created_at',
            'updated_at',
            'created_by',
            'updated_by',
            'is_deleted',
            'deleted_at',
        ]


# ============================================
# VENDOR — CREATE / UPDATE
# ============================================

class VendorCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = [
            'reference_no',
            'vendor_name',
            'vendor_type',
            'description',
            # Tax
            'gst_number',
            'pan_number',
            'tan_number',
            # Address
            'address_line1',
            'address_line2',
            'city',
            'state',
            'pincode',
            'country',
            # Contact
            'contact_person',
            'email',
            'phone',
            'alternate_phone',
            # Bank
            'bank_name',
            'account_number',
            'ifsc_code',
            'bank_branch',
            'account_type',
            # Status
            'is_active',
        ]

    def validate_vendor_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Vendor name is required.")
        return value.strip()

    def validate_phone(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Phone is required.")
        return value.strip()

    def validate_gst_number(self, value):
        """GST format check (if provided)."""
        if value and len(value) not in [15]:
            raise serializers.ValidationError(
                "GST number must be 15 characters."
            )
        return value.upper() if value else value

    def validate_pan_number(self, value):
        """PAN format check (if provided)."""
        if value and len(value) != 10:
            raise serializers.ValidationError(
                "PAN number must be 10 characters."
            )
        return value.upper() if value else value