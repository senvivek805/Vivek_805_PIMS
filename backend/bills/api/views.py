from django.db.models import Q, Sum
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from bills.models import BillEntry, BillEntryItem
from .serializers import (
    BillEntryListSerializer,
    BillEntryDetailSerializer,
    BillEntryCreateUpdateSerializer,
)


# ============================================
# BILL ENTRIES — LIST + CREATE
# ============================================

@api_view(['GET', 'POST'])
def bill_entry_list_create(request):
    """
    GET  → List all bill entries
    POST → Create new bill entry
    """
    if request.method == 'GET':
        project_id = request.query_params.get('project')
        vendor_id = request.query_params.get('vendor')
        status_filter = request.query_params.get('status')
        search = request.query_params.get('search')

        bills = BillEntry.objects.filter(
            is_deleted=False
        ).select_related('project', 'vendor', 'purchase_order')

        if project_id:
            bills = bills.filter(project_id=project_id)
        if vendor_id:
            bills = bills.filter(vendor_id=vendor_id)
        if status_filter:
            bills = bills.filter(status=status_filter)
        if search:
            bills = bills.filter(
                Q(bill_no__icontains=search) |
                Q(document_no__icontains=search) |
                Q(recipient_name__icontains=search) |
                Q(particulars__icontains=search) |
                Q(vendor__vendor_name__icontains=search) |
                Q(project__project_name__icontains=search) |
                Q(project__project_code__icontains=search) |
                Q(purchase_order__po_number__icontains=search)
            )

        bills = bills.order_by('-bill_date', '-created_at')

        total_payable = bills.aggregate(
            total=Sum('total_payable')
        )['total'] or 0

        serializer = BillEntryListSerializer(bills, many=True)
        return Response({
            'count': bills.count(),
            'total_payable': float(total_payable),
            'results': serializer.data,
        })

    elif request.method == 'POST':
        serializer = BillEntryCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            bill = serializer.save()
            if request.user.is_authenticated:
                bill.created_by = request.user
                bill.save()

            return Response(
                BillEntryDetailSerializer(bill).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================
# BILL ENTRY — DETAIL
# ============================================

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def bill_entry_detail(request, pk):
    """
    GET    → Detail
    PUT    → Full update
    PATCH  → Partial update
    DELETE → Soft delete
    """
    bill = get_object_or_404(BillEntry, pk=pk, is_deleted=False)

    if request.method == 'GET':
        serializer = BillEntryDetailSerializer(bill)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = BillEntryCreateUpdateSerializer(
            bill,
            data=request.data,
            partial=partial
        )
        if serializer.is_valid():
            updated = serializer.save()
            if request.user.is_authenticated:
                updated.updated_by = request.user
                updated.save()
            return Response(BillEntryDetailSerializer(updated).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        bill.soft_delete(
            user=request.user if request.user.is_authenticated else None
        )
        return Response(
            {'message': 'Bill Entry deleted successfully.'},
            status=status.HTTP_200_OK
        )


# ============================================
# BILL ENTRY — STATS
# ============================================

@api_view(['GET'])
def bill_entry_stats(request):
    """Stats for dashboard."""
    bills = BillEntry.objects.filter(is_deleted=False)

    total = bills.count()
    total_payable = bills.aggregate(
        total=Sum('total_payable')
    )['total'] or 0

    status_wise = []
    status_choices = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ]
    for code, label in status_choices:
        count = bills.filter(status=code).count()
        amount = bills.filter(status=code).aggregate(
            total=Sum('total_payable')
        )['total'] or 0
        status_wise.append({
            'status': code,
            'label': label,
            'count': count,
            'amount': float(amount),
        })

    return Response({
        'total_bills': total,
        'total_payable': float(total_payable),
        'status_wise': status_wise,
    })