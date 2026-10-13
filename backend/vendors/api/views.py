from django.db.models import Q, Count
from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from vendors.models import Vendor
from .serializers import (
    VendorListSerializer,
    VendorDetailSerializer,
    VendorCreateUpdateSerializer,
)

# ============================================
# VENDOR — LIST + CREATE
# ============================================

@api_view(['GET', 'POST'])
def vendor_list_create(request):
    """
    GET  → Saare vendors ki list
    POST → Naya vendor create
    """
    if request.method == 'GET':
        vendor_type = request.query_params.get('vendor_type')
        is_active = request.query_params.get('is_active')
        search = request.query_params.get('search')
        city = request.query_params.get('city')

        vendors = Vendor.objects.filter(is_deleted=False)

        if vendor_type:
            vendors = vendors.filter(vendor_type=vendor_type)
        if is_active is not None and is_active != '':
            vendors = vendors.filter(is_active=is_active.lower() == 'true')
        if city:
            vendors = vendors.filter(city__iexact=city)
        if search:
            vendors = vendors.filter(
                Q(vendor_code__icontains=search) |
                Q(vendor_name__icontains=search) |
                Q(reference_no__icontains=search) |
                Q(contact_person__icontains=search) |
                Q(phone__icontains=search) |
                Q(email__icontains=search) |
                Q(gst_number__icontains=search) |
                Q(pan_number__icontains=search)
            )

        vendors = vendors.order_by('vendor_name')

        serializer = VendorListSerializer(vendors, many=True)
        return Response({
            'count': vendors.count(),
            'results': serializer.data,
        })

    elif request.method == 'POST':
        serializer = VendorCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            vendor = serializer.save()
            if request.user.is_authenticated:
                vendor.created_by = request.user
                vendor.save()

            return Response(
                VendorDetailSerializer(vendor).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================
# VENDOR — DETAIL
# ============================================

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def vendor_detail(request, pk):
    """
    GET    → Ek vendor ki details
    PUT    → Full update
    PATCH  → Partial update
    DELETE → Soft delete
    """
    vendor = get_object_or_404(Vendor, pk=pk, is_deleted=False)

    if request.method == 'GET':
        serializer = VendorDetailSerializer(vendor)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = VendorCreateUpdateSerializer(
            vendor,
            data=request.data,
            partial=partial
        )
        if serializer.is_valid():
            updated = serializer.save()
            if request.user.is_authenticated:
                updated.updated_by = request.user
                updated.save()
            return Response(VendorDetailSerializer(updated).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        vendor.soft_delete(
            user=request.user if request.user.is_authenticated else None
        )
        return Response(
            {'message': 'Vendor successfully delete ho gaya.'},
            status=status.HTTP_200_OK
        )


# ============================================
# VENDOR — STATS
# ============================================

@api_view(['GET'])
def vendor_stats(request):
    """
    Dashboard ke liye vendor stats.
    """
    vendors = Vendor.objects.filter(is_deleted=False)

    total = vendors.count()
    active = vendors.filter(is_active=True).count()
    inactive = total - active

    # Type-wise breakdown
    type_wise = []
    type_choices = [
        ('supplier', 'Supplier'),
        ('contractor', 'Contractor'),
        ('consultant', 'Consultant'),
        ('service', 'Service Provider'),
        ('manufacturer', 'Manufacturer'),
        ('other', 'Other'),
    ]
    for code, label in type_choices:
        count = vendors.filter(vendor_type=code).count()
        if count > 0:
            type_wise.append({
                'vendor_type': code,
                'label': label,
                'count': count,
            })

    # State-wise (top 5)
    state_wise = list(
        vendors.values('state')
        .annotate(count=Count('id'))
        .order_by('-count')[:5]
    )

    return Response({
        'total_vendors': total,
        'active_vendors': active,
        'inactive_vendors': inactive,
        'type_wise': type_wise,
        'state_wise': state_wise,
    })