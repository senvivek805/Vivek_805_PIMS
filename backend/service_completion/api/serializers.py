from rest_framework import serializers
from service_completion.models import ServiceCompletion

class ServiceCompletionSerializer(serializers.ModelSerializer):
    po_number = serializers.CharField(source='purchase_order.po_number', read_only=True)
    project_name = serializers.CharField(source='purchase_order.project.project_name', read_only=True)
    vendor_name = serializers.SerializerMethodField()

    class Meta:
        model = ServiceCompletion
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at', 'updated_at')

    def get_vendor_name(self, obj):
        po = obj.purchase_order
        if not po or not hasattr(po, 'vendor') or not po.vendor:
            return "N/A"
            
        vendor = po.vendor
        
        # Try different possible field names in Vendor model
        for field in ['name', 'firm_name', 'company_name', 'vendor_name']:
            if hasattr(vendor, field) and getattr(vendor, field):
                return getattr(vendor, field)
                
        # Fallback to string representation (jo bhi Vendor ka naam ho)
        return str(vendor)