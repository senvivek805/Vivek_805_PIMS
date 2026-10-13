from django.db.models import Q, Sum
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from purchase.models import PurchaseOrder, PurchaseOrderItem
from .serializers import (
    PurchaseOrderListSerializer,
    PurchaseOrderDetailSerializer,
    PurchaseOrderCreateUpdateSerializer,
)


# ============================================
# PURCHASE ORDER — LIST + CREATE
# ============================================

@api_view(['GET', 'POST'])
def purchase_order_list_create(request):
    """
    GET  → Saare POs ki list
    POST → Naya PO create
    """
    if request.method == 'GET':
        status_filter = request.query_params.get('status')
        project_id = request.query_params.get('project')
        vendor_id = request.query_params.get('vendor')
        search = request.query_params.get('search')

        pos = PurchaseOrder.objects.filter(
            is_deleted=False
        ).select_related('vendor', 'project')

        if status_filter:
            pos = pos.filter(status=status_filter)
        if project_id:
            pos = pos.filter(project_id=project_id)
        if vendor_id:
            pos = pos.filter(vendor_id=vendor_id)
        if search:
            pos = pos.filter(
                Q(po_number__icontains=search) |
                Q(subject__icontains=search) |
                Q(vendor__vendor_name__icontains=search) |
                Q(vendor__vendor_code__icontains=search) |
                Q(project__project_code__icontains=search) |
                Q(project__project_name__icontains=search) |
                Q(major_budget_head__icontains=search) |
                Q(minor_budget_head__icontains=search)
            )

        pos = pos.order_by('-po_date', '-created_at')

        total = pos.aggregate(total=Sum('grand_total'))['total'] or 0

        serializer = PurchaseOrderListSerializer(pos, many=True)
        return Response({
            'count': pos.count(),
            'total_amount': float(total),
            'results': serializer.data,
        })

    elif request.method == 'POST':
        serializer = PurchaseOrderCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            po = serializer.save()
            if request.user.is_authenticated:
                po.created_by = request.user
                po.save()

            return Response(
                PurchaseOrderDetailSerializer(po).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================
# PURCHASE ORDER — DETAIL
# ============================================

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def purchase_order_detail(request, pk):
    """
    GET    → Ek PO ki details
    PUT    → Full update
    PATCH  → Partial update
    DELETE → Soft delete
    """
    po = get_object_or_404(PurchaseOrder, pk=pk, is_deleted=False)

    if request.method == 'GET':
        serializer = PurchaseOrderDetailSerializer(po)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = PurchaseOrderCreateUpdateSerializer(
            po,
            data=request.data,
            partial=partial
        )
        if serializer.is_valid():
            updated = serializer.save()
            if request.user.is_authenticated:
                updated.updated_by = request.user
                updated.save()
            return Response(PurchaseOrderDetailSerializer(updated).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        po.soft_delete(
            user=request.user if request.user.is_authenticated else None
        )
        return Response(
            {'message': 'Purchase Order successfully delete ho gaya.'},
            status=status.HTTP_200_OK
        )


# ============================================
# PURCHASE ORDER — STATS
# ============================================

@api_view(['GET'])
def purchase_order_stats(request):
    """
    Dashboard ke liye PO stats.
    """
    pos = PurchaseOrder.objects.filter(is_deleted=False)

    total = pos.count()
    total_amount = pos.aggregate(total=Sum('grand_total'))['total'] or 0

    # Status-wise
    status_wise = []
    status_choices = [
        ('draft', 'Draft'),
        ('approved', 'Approved'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    for code, label in status_choices:
        count = pos.filter(status=code).count()
        amount = pos.filter(status=code).aggregate(
            total=Sum('grand_total')
        )['total'] or 0
        status_wise.append({
            'status': code,
            'label': label,
            'count': count,
            'amount': float(amount),
        })

    return Response({
        'total_orders': total,
        'total_amount': float(total_amount),
        'status_wise': status_wise,
    })
# ============================================
# PENDING PURCHASE ORDERS — ALERT
# ============================================

@api_view(['GET'])
def pending_purchase_orders(request):
    """
    Woh POs jinke koi item fully receive nahi hua.
    Dashboard alert ke liye.
    """
    from django.db.models import Sum, F, Q
    from materials.models import MaterialReceiptItem

    # Saare active POs (non-cancelled, non-deleted)
    pos = PurchaseOrder.objects.filter(
        is_deleted=False,
        status__in=['draft', 'approved'],
    ).select_related('vendor', 'project').prefetch_related('items')

    pending_pos = []

    for po in pos:
        po_items = po.items.filter(is_deleted=False)
        if not po_items.exists():
            continue

        total_items = po_items.count()
        fully_received_count = 0
        pending_items_list = []

        for item in po_items:
            ordered_qty = float(item.quantity or 0)

            # Kitna receive ho gaya
            received_qty = MaterialReceiptItem.objects.filter(
                po_item=item,
                is_deleted=False,
                material_receipt__is_deleted=False,
            ).aggregate(total=Sum('received_quantity'))['total'] or 0
            received_qty = float(received_qty)

            if received_qty >= ordered_qty:
                fully_received_count += 1
            else:
                pending_qty = ordered_qty - received_qty
                pending_items_list.append({
                    'item_name': item.item_name,
                    'ordered_qty': ordered_qty,
                    'received_qty': received_qty,
                    'pending_qty': pending_qty,
                    'unit': item.unit,
                })

        # Agar koi bhi item pending hai to alert
        if pending_items_list:
            pending_pos.append({
                'id': po.id,
                'po_number': po.po_number,
                'po_date': po.po_date.isoformat() if po.po_date else None,
                'vendor_name': po.vendor.vendor_name,
                'project_name': po.project.project_name if po.project else None,
                'grand_total': float(po.grand_total or 0),
                'total_items': total_items,
                'fully_received': fully_received_count,
                'pending_count': len(pending_items_list),
                'pending_items': pending_items_list,
            })

    # Sort — sabse zyada pending items pehle
    pending_pos.sort(key=lambda x: x['pending_count'], reverse=True)

    return Response({
        'count': len(pending_pos),
        'total_pending_items': sum(p['pending_count'] for p in pending_pos),
        'results': pending_pos,
    })