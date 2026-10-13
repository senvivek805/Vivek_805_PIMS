from django.db.models import Q, Count
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from materials.models import (
    Material,
    MaterialCategory,
    MaterialReceipt,
    MaterialReceiptItem,
    MaterialIssue,
    MaterialIssueItem,
    MaterialReturnNote,
    MaterialReturnNoteItem,
)
from .serializers import (
    MaterialCategorySerializer,
    MaterialListSerializer,
    MaterialDetailSerializer,
    MaterialCreateUpdateSerializer,
    MaterialReceiptListSerializer,
    MaterialReceiptDetailSerializer,
    MaterialReceiptCreateUpdateSerializer,
    MaterialIssueListSerializer,
    MaterialIssueDetailSerializer,
    MaterialIssueCreateUpdateSerializer,
    MaterialReturnNoteListSerializer,
    MaterialReturnNoteDetailSerializer,
    MaterialReturnNoteCreateUpdateSerializer,
)

# ============================================
# MATERIAL CATEGORIES
# ============================================

@api_view(['GET'])
def material_category_list(request):
    """Get all material categories."""
    categories = MaterialCategory.objects.filter(
        is_deleted=False
    ).order_by('order', 'name')

    serializer = MaterialCategorySerializer(categories, many=True)
    return Response(serializer.data)


# ============================================
# MATERIALS — LIST + CREATE
# ============================================

@api_view(['GET', 'POST'])
def material_list_create(request):
    """
    GET  → List all materials
    POST → Create new material
    """
    if request.method == 'GET':
        category_id = request.query_params.get('category')
        unit = request.query_params.get('unit')
        gst_rate = request.query_params.get('gst_rate')
        is_active = request.query_params.get('is_active')
        search = request.query_params.get('search')

        materials = Material.objects.filter(
            is_deleted=False
        ).select_related('category')

        if category_id:
            materials = materials.filter(category_id=category_id)
        if unit:
            materials = materials.filter(unit=unit)
        if gst_rate:
            materials = materials.filter(gst_rate=gst_rate)
        if is_active is not None and is_active != '':
            materials = materials.filter(is_active=is_active.lower() == 'true')
        if search:
            materials = materials.filter(
                Q(material_code__icontains=search) |
                Q(material_name__icontains=search) |
                Q(hsn_code__icontains=search) |
                Q(description__icontains=search) |
                Q(category__name__icontains=search) |
                Q(category__code__icontains=search)
            )

        materials = materials.order_by('material_name')

        serializer = MaterialListSerializer(materials, many=True)
        return Response({
            'count': materials.count(),
            'results': serializer.data,
        })

    elif request.method == 'POST':
        serializer = MaterialCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            material = serializer.save()
            if request.user.is_authenticated:
                material.created_by = request.user
                material.save()

            return Response(
                MaterialDetailSerializer(material).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================
# MATERIAL — DETAIL
# ============================================

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def material_detail(request, pk):
    """
    GET    → Material detail
    PUT    → Full update
    PATCH  → Partial update
    DELETE → Soft delete
    """
    material = get_object_or_404(Material, pk=pk, is_deleted=False)

    if request.method == 'GET':
        serializer = MaterialDetailSerializer(material)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = MaterialCreateUpdateSerializer(
            material,
            data=request.data,
            partial=partial
        )
        if serializer.is_valid():
            updated = serializer.save()
            if request.user.is_authenticated:
                updated.updated_by = request.user
                updated.save()
            return Response(MaterialDetailSerializer(updated).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        material.soft_delete(
            user=request.user if request.user.is_authenticated else None
        )
        return Response(
            {'message': 'Material deleted successfully.'},
            status=status.HTTP_200_OK
        )


# ============================================
# MATERIAL — STATS
# ============================================

@api_view(['GET'])
def material_stats(request):
    """Material stats for dashboard."""
    materials = Material.objects.filter(is_deleted=False)

    total = materials.count()
    active = materials.filter(is_active=True).count()
    inactive = total - active

    category_wise = []
    categories = MaterialCategory.objects.filter(is_deleted=False).order_by('order')

    for cat in categories:
        count = materials.filter(category=cat).count()
        if count > 0:
            category_wise.append({
                'category_id': cat.id,
                'category_name': cat.name,
                'category_code': cat.code,
                'count': count,
            })

    return Response({
        'total_materials': total,
        'active_materials': active,
        'inactive_materials': inactive,
        'total_categories': categories.count(),
        'category_wise': category_wise,
    })


# ============================================
# MATERIAL RECEIPTS — LIST + CREATE
# ============================================

@api_view(['GET', 'POST'])
def material_receipt_list_create(request):
    """
    GET  → List all material receipts
    POST → Create new receipt
    """
    if request.method == 'GET':
        po_id = request.query_params.get('purchase_order')
        status_filter = request.query_params.get('status')
        search = request.query_params.get('search')

        receipts = MaterialReceipt.objects.filter(
            is_deleted=False
        ).select_related('purchase_order', 'vendor', 'project')

        if po_id:
            receipts = receipts.filter(purchase_order_id=po_id)
        if status_filter:
            receipts = receipts.filter(status=status_filter)
        if search:
            receipts = receipts.filter(
                Q(receipt_no__icontains=search) |
                Q(purchase_order__po_number__icontains=search) |
                Q(vendor__vendor_name__icontains=search)
            )

        receipts = receipts.order_by('-receipt_date', '-created_at')

        serializer = MaterialReceiptListSerializer(receipts, many=True)
        return Response({
            'count': receipts.count(),
            'results': serializer.data,
        })

    elif request.method == 'POST':
        serializer = MaterialReceiptCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            receipt = serializer.save()
            if request.user.is_authenticated:
                receipt.created_by = request.user
                receipt.save()

            return Response(
                MaterialReceiptDetailSerializer(receipt).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================
# MATERIAL RECEIPT — DETAIL
# ============================================

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def material_receipt_detail(request, pk):
    receipt = get_object_or_404(MaterialReceipt, pk=pk, is_deleted=False)

    if request.method == 'GET':
        serializer = MaterialReceiptDetailSerializer(receipt)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = MaterialReceiptCreateUpdateSerializer(
            receipt,
            data=request.data,
            partial=partial
        )
        if serializer.is_valid():
            updated = serializer.save()
            if request.user.is_authenticated:
                updated.updated_by = request.user
                updated.save()
            return Response(MaterialReceiptDetailSerializer(updated).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        receipt.soft_delete(
            user=request.user if request.user.is_authenticated else None
        )
        return Response(
            {'message': 'Material Receipt deleted successfully.'},
            status=status.HTTP_200_OK
        )


# ============================================
# MATERIAL RECEIPT — STATS
# ============================================

@api_view(['GET'])
def material_receipt_stats(request):
    receipts = MaterialReceipt.objects.filter(is_deleted=False)

    total = receipts.count()
    draft = receipts.filter(status='draft').count()
    partial = receipts.filter(status='partial').count()
    completed = receipts.filter(status='completed').count()

    return Response({
        'total_receipts': total,
        'draft_receipts': draft,
        'partial_receipts': partial,
        'completed_receipts': completed,
    })


# ============================================
# PO ITEMS FOR RECEIPT
# ============================================

@api_view(['GET'])
def po_items_for_receipt(request, po_id):
    """
    Get PO items for receipt form prefill.
    Only returns material-type items with pending > 0.
    """
    from purchase.models import PurchaseOrder, PurchaseOrderItem
    from django.db.models import Sum

    po = get_object_or_404(PurchaseOrder, pk=po_id, is_deleted=False)
    items = po.items.filter(is_deleted=False)

    result = []
    for item in items:
        # Skip service items (no receipt needed)
        if item.item_type == 'service':
            continue

        receipt_items = MaterialReceiptItem.objects.filter(
            po_item=item,
            is_deleted=False,
            material_receipt__is_deleted=False,
        )

        # Total received
        received_qty = receipt_items.aggregate(
            total=Sum('received_quantity')
        )['total'] or 0

        # Receipt numbers
        receipt_numbers = list(
            receipt_items.values_list(
                'material_receipt__receipt_no',
                flat=True
            ).distinct()
        )

        ordered = float(item.quantity or 0)
        received = float(received_qty)
        pending = ordered - received

        result.append({
            'id': item.id,
            'item_name': item.item_name,
            'item_type': item.item_type,
            'material': item.material_id,
            'material_name': item.material.material_name if item.material else None,
            'material_code': item.material.material_code if item.material else None,
            'ordered_quantity': ordered,
            'received_quantity': received,
            'pending_quantity': pending,
            'receipt_numbers': receipt_numbers,
            'unit': item.unit,
            'rate': float(item.rate or 0),
        })

    return Response({
        'po': {
            'id': po.id,
            'po_number': po.po_number,
            'po_date': po.po_date,
            'vendor': po.vendor_id,
            'vendor_name': po.vendor.vendor_name,
            'project': po.project_id if po.project else None,
            'grand_total': float(po.grand_total or 0),
        },
        'items': result,
    })


# ============================================
# MATERIAL ISSUES — LIST + CREATE
# ============================================

@api_view(['GET', 'POST'])
def material_issue_list_create(request):
    """
    GET  → List all material issues
    POST → Create new issue
    """
    if request.method == 'GET':
        employee_id = request.query_params.get('issued_to')
        project_id = request.query_params.get('project')
        status_filter = request.query_params.get('status')
        search = request.query_params.get('search')

        issues = MaterialIssue.objects.filter(
            is_deleted=False
        ).select_related('issued_to', 'project', 'purchase_order')

        if employee_id:
            issues = issues.filter(issued_to_id=employee_id)
        if project_id:
            issues = issues.filter(project_id=project_id)
        if status_filter:
            issues = issues.filter(status=status_filter)
        if search:
            issues = issues.filter(
                Q(issue_no__icontains=search) |
                Q(issued_to__full_name__icontains=search) |
                Q(issued_to__employee_code__icontains=search) |
                Q(project__project_name__icontains=search) |
                Q(project__project_code__icontains=search) |
                Q(purpose__icontains=search)
            )

        issues = issues.order_by('-issue_date', '-created_at')

        serializer = MaterialIssueListSerializer(issues, many=True)
        return Response({
            'count': issues.count(),
            'results': serializer.data,
        })

    elif request.method == 'POST':
        serializer = MaterialIssueCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            issue = serializer.save()
            if request.user.is_authenticated:
                issue.created_by = request.user
                issue.save()

            return Response(
                MaterialIssueDetailSerializer(issue).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================
# MATERIAL ISSUE — DETAIL
# ============================================

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def material_issue_detail(request, pk):
    issue = get_object_or_404(MaterialIssue, pk=pk, is_deleted=False)

    if request.method == 'GET':
        serializer = MaterialIssueDetailSerializer(issue)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = MaterialIssueCreateUpdateSerializer(
            issue,
            data=request.data,
            partial=partial
        )
        if serializer.is_valid():
            updated = serializer.save()
            if request.user.is_authenticated:
                updated.updated_by = request.user
                updated.save()
            return Response(MaterialIssueDetailSerializer(updated).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        issue.soft_delete(
            user=request.user if request.user.is_authenticated else None
        )
        return Response(
            {'message': 'Material Issue deleted successfully.'},
            status=status.HTTP_200_OK
        )


# ============================================
# MATERIAL ISSUE — STATS
# ============================================

@api_view(['GET'])
def material_issue_stats(request):
    issues = MaterialIssue.objects.filter(is_deleted=False)

    total = issues.count()
    draft = issues.filter(status='draft').count()
    issued = issues.filter(status='issued').count()
    returned = issues.filter(status='returned').count()

    return Response({
        'total_issues': total,
        'draft_issues': draft,
        'issued_issues': issued,
        'returned_issues': returned,
    })


# ============================================
# MATERIAL RETURN NOTES — LIST + CREATE
# ============================================

@api_view(['GET', 'POST'])
def material_return_list_create(request):
    """
    GET  → List all Material Return Notes
    POST → Create new MRN
    """
    if request.method == 'GET':
        employee_id = request.query_params.get('returned_by')
        project_id = request.query_params.get('project')
        status_filter = request.query_params.get('status')
        search = request.query_params.get('search')

        notes = MaterialReturnNote.objects.filter(
            is_deleted=False
        ).select_related('returned_by', 'material_issue', 'project')

        if employee_id:
            notes = notes.filter(returned_by_id=employee_id)
        if project_id:
            notes = notes.filter(project_id=project_id)
        if status_filter:
            notes = notes.filter(status=status_filter)
        if search:
            notes = notes.filter(
                Q(mrn_no__icontains=search) |
                Q(returned_by__full_name__icontains=search) |
                Q(returned_by__employee_code__icontains=search) |
                Q(material_issue__issue_no__icontains=search) |
                Q(project__project_name__icontains=search) |
                Q(reason__icontains=search)
            )

        notes = notes.order_by('-return_date', '-created_at')

        serializer = MaterialReturnNoteListSerializer(notes, many=True)
        return Response({
            'count': notes.count(),
            'results': serializer.data,
        })

    elif request.method == 'POST':
        serializer = MaterialReturnNoteCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            note = serializer.save()
            if request.user.is_authenticated:
                note.created_by = request.user
                note.save()

            return Response(
                MaterialReturnNoteDetailSerializer(note).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================
# MATERIAL RETURN NOTE — DETAIL
# ============================================

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def material_return_detail(request, pk):
    note = get_object_or_404(MaterialReturnNote, pk=pk, is_deleted=False)

    if request.method == 'GET':
        serializer = MaterialReturnNoteDetailSerializer(note)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = MaterialReturnNoteCreateUpdateSerializer(
            note,
            data=request.data,
            partial=partial
        )
        if serializer.is_valid():
            updated = serializer.save()
            if request.user.is_authenticated:
                updated.updated_by = request.user
                updated.save()
            return Response(MaterialReturnNoteDetailSerializer(updated).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        note.soft_delete(
            user=request.user if request.user.is_authenticated else None
        )
        return Response(
            {'message': 'Material Return Note deleted successfully.'},
            status=status.HTTP_200_OK
        )


# ============================================
# MATERIAL RETURN NOTE — STATS
# ============================================

@api_view(['GET'])
def material_return_stats(request):
    notes = MaterialReturnNote.objects.filter(is_deleted=False)

    total = notes.count()
    draft = notes.filter(status='draft').count()
    returned = notes.filter(status='returned').count()
    completed = notes.filter(status='completed').count()

    return Response({
        'total_returns': total,
        'draft_returns': draft,
        'returned_returns': returned,
        'completed_returns': completed,
    })


# ============================================
# LOW STOCK MATERIALS — ALERT
# ============================================

@api_view(['GET'])
def low_stock_materials(request):
    """
    Materials with low stock (or out of stock).
    For dashboard notification bell.
    """
    threshold = request.query_params.get('threshold', 10)
    try:
        threshold = float(threshold)
    except (ValueError, TypeError):
        threshold = 10

    materials = Material.objects.filter(
        is_deleted=False,
        is_active=True,
    )

    low_stock = []
    out_of_stock = []

    for mat in materials:
        stock = mat.current_stock
        if stock <= 0:
            out_of_stock.append({
                'id': mat.id,
                'material_code': mat.material_code,
                'material_name': mat.material_name,
                'unit': mat.unit,
                'current_stock': stock,
                'status': 'out_of_stock',
            })
        elif stock < threshold:
            low_stock.append({
                'id': mat.id,
                'material_code': mat.material_code,
                'material_name': mat.material_name,
                'unit': mat.unit,
                'current_stock': stock,
                'status': 'low_stock',
            })

    # Sort by stock (lowest first)
    low_stock.sort(key=lambda x: x['current_stock'])
    out_of_stock.sort(key=lambda x: x['material_name'])

    return Response({
        'count': len(low_stock) + len(out_of_stock),
        'low_stock_count': len(low_stock),
        'out_of_stock_count': len(out_of_stock),
        'threshold': threshold,
        'low_stock': low_stock,
        'out_of_stock': out_of_stock,
    })