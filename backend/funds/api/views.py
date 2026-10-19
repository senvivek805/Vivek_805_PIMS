from django.db.models import Sum
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from funds.models import FundReceipt, BudgetCategory, BudgetHead, FundBreakup
from projects.models import Project, ProjectSanctionedHead
from bills.models import BillEntry

from .serializers import (
    FundReceiptListSerializer,
    FundReceiptDetailSerializer,
    FundReceiptCreateUpdateSerializer,
    FundBreakupListSerializer,
    FundBreakupCreateSerializer,
    BudgetCategorySerializer,
    BudgetHeadSerializer,
)


# ============================================
# BUDGET CATEGORIES
# ============================================

@api_view(['GET'])
def budget_category_list(request):
    """Saari budget categories."""
    categories = BudgetCategory.objects.filter(is_deleted=False).order_by('order')
    serializer = BudgetCategorySerializer(categories, many=True)
    return Response(serializer.data)


# ============================================
# BUDGET HEADS
# ============================================

@api_view(['GET'])
def budget_head_list(request):
    """Saare budget heads."""
    category_id = request.query_params.get('category')
    heads = BudgetHead.objects.filter(is_deleted=False, is_active=True)
    if category_id:
        heads = heads.filter(category_id=category_id)
    heads = heads.select_related('category').order_by('category__order', 'order')

    serializer = BudgetHeadSerializer(heads, many=True)
    return Response(serializer.data)


# ============================================
# FUND RECEIPTS — LIST + CREATE
# ============================================

@api_view(['GET', 'POST'])
def fund_receipt_list_create(request):
    if request.method == 'GET':
        project_id = request.query_params.get('project')
        fy = request.query_params.get('financial_year')
        fund_type = request.query_params.get('fund_type')
        search = request.query_params.get('search')

        receipts = FundReceipt.objects.filter(is_deleted=False).select_related('project')

        if project_id:
            receipts = receipts.filter(project_id=project_id)
        if fy:
            receipts = receipts.filter(financial_year=fy)
        if fund_type:
            receipts = receipts.filter(fund_type=fund_type)
        if search:
            receipts = receipts.filter(
                receipt_reference_no__icontains=search
            ) | receipts.filter(
                project__project_code__icontains=search
            ) | receipts.filter(
                project__project_name__icontains=search
            )

        receipts = receipts.order_by('-receipt_date', '-created_at')
        total = receipts.aggregate(total=Sum('amount_received'))['total'] or 0

        serializer = FundReceiptListSerializer(receipts, many=True)
        return Response({
            'count': receipts.count(),
            'total_amount': float(total),
            'results': serializer.data,
        })

    elif request.method == 'POST':
        serializer = FundReceiptCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            receipt = serializer.save()
            if request.user.is_authenticated:
                receipt.created_by = request.user
                receipt.save()
            return Response(
                FundReceiptDetailSerializer(receipt).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================
# FUND RECEIPT — DETAIL
# ============================================

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def fund_receipt_detail(request, pk):
    receipt = get_object_or_404(FundReceipt, pk=pk, is_deleted=False)

    if request.method == 'GET':
        serializer = FundReceiptDetailSerializer(receipt)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = FundReceiptCreateUpdateSerializer(
            receipt, data=request.data, partial=partial
        )
        if serializer.is_valid():
            updated = serializer.save()
            if request.user.is_authenticated:
                updated.updated_by = request.user
                updated.save()
            return Response(FundReceiptDetailSerializer(updated).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        # Check karo breakup hai ya nahi
        if receipt.breakups.filter(is_deleted=False).exists():
            return Response(
                {'detail': 'Pehle saare breakups delete karo.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        receipt.soft_delete(user=request.user if request.user.is_authenticated else None)
        return Response({'message': 'Fund receipt delete ho gaya.'})


# ============================================
# FUND RECEIPT — STATS
# ============================================

@api_view(['GET'])
def fund_receipt_stats(request):
    receipts = FundReceipt.objects.filter(is_deleted=False)
    total_amount = receipts.aggregate(total=Sum('amount_received'))['total'] or 0

    fy_wise = list(
        receipts.values('financial_year')
        .annotate(total=Sum('amount_received'))
        .order_by('-financial_year')
    )
    type_wise = list(
        receipts.values('fund_type')
        .annotate(total=Sum('amount_received'))
        .order_by('-total')
    )

    return Response({
        'total_receipts': receipts.count(),
        'total_amount': float(total_amount),
        'fy_wise': [
            {'financial_year': item['financial_year'], 'total': float(item['total'] or 0)}
            for item in fy_wise
        ],
        'type_wise': [
            {'fund_type': item['fund_type'], 'total': float(item['total'] or 0)}
            for item in type_wise
        ],
    })


# ============================================
# FUND RECEIPTS — BY PROJECT
# ============================================

@api_view(['GET'])
def fund_receipts_by_project(request, project_id):
    project = get_object_or_404(Project, pk=project_id)
    receipts = FundReceipt.objects.filter(
        project=project, is_deleted=False
    ).order_by('-receipt_date')

    total = receipts.aggregate(total=Sum('amount_received'))['total'] or 0

    serializer = FundReceiptListSerializer(receipts, many=True)
    return Response({
        'project': {
            'id': project.id,
            'project_code': project.project_code,
            'project_name': project.project_name,
        },
        'count': receipts.count(),
        'total_amount': float(total),
        'results': serializer.data,
    })


# ============================================
# FUND BREAKUPS — LIST + CREATE
# ============================================

@api_view(['GET', 'POST'])
def fund_breakup_list_create(request):
    """
    GET  → Saare breakups (filter by receipt)
    POST → Naya breakup create
    """
    if request.method == 'GET':
        receipt_id = request.query_params.get('fund_receipt')
        breakups = FundBreakup.objects.filter(is_deleted=False)
        if receipt_id:
            breakups = breakups.filter(fund_receipt_id=receipt_id)
        breakups = breakups.select_related('category', 'budget_head', 'fund_receipt')
        breakups = breakups.order_by('category__order', 'budget_head__order', 'id')

        serializer = FundBreakupListSerializer(breakups, many=True)
        return Response({
            'count': breakups.count(),
            'results': serializer.data,
        })

    elif request.method == 'POST':
        serializer = FundBreakupCreateSerializer(data=request.data)
        if serializer.is_valid():
            breakup = serializer.save()
            # Auto-fill category from budget_head
            breakup.category = breakup.budget_head.category
            if request.user.is_authenticated:
                breakup.created_by = request.user
            breakup.save()

            return Response(
                FundBreakupListSerializer(breakup).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================
# FUND BREAKUP — DETAIL
# ============================================

@api_view(['GET', 'PATCH', 'DELETE'])
def fund_breakup_detail(request, pk):
    breakup = get_object_or_404(FundBreakup, pk=pk, is_deleted=False)

    if request.method == 'GET':
        return Response(FundBreakupListSerializer(breakup).data)

    elif request.method == 'PATCH':
        serializer = FundBreakupCreateSerializer(
            breakup, data=request.data, partial=True
        )
        if serializer.is_valid():
            updated = serializer.save()
            if request.user.is_authenticated:
                updated.updated_by = request.user
                updated.save()
            return Response(FundBreakupListSerializer(updated).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        breakup.soft_delete(user=request.user if request.user.is_authenticated else None)
        return Response({'message': 'Breakup delete ho gaya.'})


# ============================================
# FUND BREAKUP — BULK SAVE (for the UI)
# ============================================

@api_view(['POST'])
def fund_breakup_bulk_save(request, receipt_id):
    """
    Ek saath multiple breakups save karo (replace all).
    Body: {"breakups": [{"budget_head": 1, "amount": 2000000, "remarks": ""}, ...]}
    """
    receipt = get_object_or_404(FundReceipt, pk=receipt_id, is_deleted=False)

    breakups_data = request.data.get('breakups', [])

    # Validate total
    total_new = sum(float(b.get('amount', 0)) for b in breakups_data)

    if total_new > float(receipt.amount_received):
        return Response(
            {
                'detail': f'Total breakup receipt amount se zyada hai. '
                          f'Receipt: ₹{receipt.amount_received}, '
                          f'Aapka total: ₹{total_new}'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # Delete existing breakups (soft)
    receipt.breakups.filter(is_deleted=False).update(is_deleted=True)

    # Create new — but preserve spent_amount if budget_head same
    created = []
    for item in breakups_data:
        budget_head = get_object_or_404(BudgetHead, pk=item['budget_head'])

        # Preserve spent_amount from previous breakup (if same budget_head)
        previous_spent = FundBreakup.objects.filter(
            fund_receipt=receipt,
            budget_head=budget_head,
            is_deleted=True,
        ).aggregate(total=Sum('spent_amount'))['total'] or 0

        breakup = FundBreakup.objects.create(
            fund_receipt=receipt,
            category=budget_head.category,
            budget_head=budget_head,
            amount=item['amount'],
            spent_amount=previous_spent,   # ← YE ADD KARO
            remarks=item.get('remarks', ''),
            created_by=request.user if request.user.is_authenticated else None,
        )
        created.append(breakup)

    return Response({
        'message': f'{len(created)} breakups save ho gaye.',
        'total': total_new,
        'receipt_total': float(receipt.amount_received),
        'remaining': float(receipt.amount_received) - total_new,
        'results': FundBreakupListSerializer(created, many=True).data,
    })


# ============================================
# BUDGET OVERVIEW — FY-wise & Project-wise
# ============================================

@api_view(['GET'])
def budget_overview(request):
    """
    Budget overview — FY-wise, Project-wise summary.
    All FundBreakups ka aggregate with spent & balance.
    """
    fy = request.query_params.get('fy')  # e.g., '2024-25'
    project_id = request.query_params.get('project')

    # Base queryset
    receipts = FundReceipt.objects.filter(is_deleted=False)

    if fy:
        receipts = receipts.filter(financial_year=fy)
    if project_id:
        receipts = receipts.filter(project_id=project_id)

    # FY-wise summary
    fy_wise = []
    all_fys = (
        FundReceipt.objects.filter(is_deleted=False)
        .values_list('financial_year', flat=True)
        .distinct()
        .order_by('-financial_year')
    )

    for fy_item in all_fys:
        fy_receipts = receipts.filter(financial_year=fy_item)
        if not fy_receipts.exists():
            continue

        received = fy_receipts.aggregate(
            total=Sum('amount_received')
        )['total'] or 0

        breakups = FundBreakup.objects.filter(
            fund_receipt__in=fy_receipts,
            is_deleted=False,
        )

        allocated = breakups.aggregate(total=Sum('amount'))['total'] or 0
        spent = breakups.aggregate(total=Sum('spent_amount'))['total'] or 0

        fy_wise.append({
            'fy': fy_item,
            'received': float(received),
            'allocated': float(allocated),
            'spent': float(spent),
            'balance': float(allocated) - float(spent),
        })

    # Head-wise summary
    head_wise = []
    budget_heads = BudgetHead.objects.filter(is_deleted=False).order_by(
        'category__order', 'order'
    )

    for head in budget_heads:
        breakups = FundBreakup.objects.filter(
            budget_head=head,
            fund_receipt__in=receipts,
            is_deleted=False,
        )

        if not breakups.exists():
            continue

        allocated = breakups.aggregate(total=Sum('amount'))['total'] or 0
        spent = breakups.aggregate(total=Sum('spent_amount'))['total'] or 0

        head_wise.append({
            'head_id': head.id,
            'head_name': head.name,
            'head_code': head.code,
            'category_name': head.category.name,
            'category_code': head.category.code,
            'allocated': float(allocated),
            'spent': float(spent),
            'balance': float(allocated) - float(spent),
            'utilization_percentage': round(
                (float(spent) / float(allocated) * 100) if allocated else 0, 2
            ),
        })

    # Project-wise summary
    project_wise = []
    project_ids = receipts.values_list('project_id', flat=True).distinct()

    for pid in project_ids:
        if not pid:
            continue
        proj_receipts = receipts.filter(project_id=pid)
        proj = proj_receipts.first().project

        received = proj_receipts.aggregate(
            total=Sum('amount_received')
        )['total'] or 0

        breakups = FundBreakup.objects.filter(
            fund_receipt__in=proj_receipts,
            is_deleted=False,
        )

        allocated = breakups.aggregate(total=Sum('amount'))['total'] or 0
        spent = breakups.aggregate(total=Sum('spent_amount'))['total'] or 0

        project_wise.append({
            'project_id': pid,
            'project_code': proj.project_code if proj else '—',
            'project_name': proj.project_name if proj else '—',
            'received': float(received),
            'allocated': float(allocated),
            'spent': float(spent),
            'balance': float(allocated) - float(spent),
        })

    # Totals
    total_received = receipts.aggregate(
        total=Sum('amount_received')
    )['total'] or 0

    total_breakups = FundBreakup.objects.filter(
        fund_receipt__in=receipts,
        is_deleted=False,
    )
    total_allocated = total_breakups.aggregate(total=Sum('amount'))['total'] or 0
    total_spent = total_breakups.aggregate(
        total=Sum('spent_amount')
    )['total'] or 0

    return Response({
        'summary': {
            'total_received': float(total_received),
            'total_allocated': float(total_allocated),
            'total_spent': float(total_spent),
            'total_balance': float(total_allocated) - float(total_spent),
        },
        'fy_wise': fy_wise,
        'head_wise': head_wise,
        'project_wise': project_wise,
        'available_fys': list(all_fys),
    })


# ============================================
# UC DATA API
# ============================================

@api_view(['GET'])
def project_uc_data(request, project_id):
    try:
        project = Project.objects.get(id=project_id, is_deleted=False)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=404)

    # 1. Get all FYs for this project
    fys = list(FundReceipt.objects.filter(
        project=project, is_deleted=False
    ).values_list('financial_year', flat=True).distinct().order_by('financial_year'))

    # 2. Get Sanctioned Amounts per Head
    sanctioned_heads = ProjectSanctionedHead.objects.filter(project=project, is_deleted=False)
    sanctioned_map = {sh.budget_head_id: float(sh.sanctioned_amount) for sh in sanctioned_heads}

    # 3. Get breakups
    breakups = FundBreakup.objects.filter(
        fund_receipt__project=project, 
        is_deleted=False
    ).select_related('budget_head', 'budget_head__category', 'fund_receipt')
    
    head_ids = set(sanctioned_map.keys())
    for b in breakups:
        if b.budget_head:
            head_ids.add(b.budget_head_id)
            
    heads_dict = {}
    
    # Initialize heads
    for head_id in head_ids:
        try:
            head = BudgetHead.objects.get(id=head_id)
        except BudgetHead.DoesNotExist:
            continue
            
        head_name_lower = head.name.lower()
        is_non_recurring = 'equipment' in head_name_lower or 'machinery' in head_name_lower
        category = 'Non-Recurring' if is_non_recurring else 'Recurring'
        
        heads_dict[head_id] = {
            'head_id': head.id,
            'head_name': head.name,
            'category': category,
            'total_sanctioned': sanctioned_map.get(head_id, 0.0),
            'fys': {}
        }

    # Populate breakups
    for b in breakups:
        if not b.budget_head:
            continue
        head_id = b.budget_head_id
        if head_id not in heads_dict:
            continue
            
        fy = b.fund_receipt.financial_year
        if fy not in heads_dict[head_id]['fys']:
            heads_dict[head_id]['fys'][fy] = {'allocated': 0, 'spent': 0}
            
        heads_dict[head_id]['fys'][fy]['allocated'] += float(b.amount)

    # Fallback: If total_sanctioned is 0, use the allocated amount from breakups
    for head_id, data in heads_dict.items():
        if data['total_sanctioned'] == 0:
            total_alloc = sum(fy['allocated'] for fy in data['fys'].values())
            data['total_sanctioned'] = total_alloc

    # 4. Calculate Spent (from BillEntry)
    bills = BillEntry.objects.filter(
        project=project,
        status__in=['approved', 'paid'],
        is_deleted=False,
        budget_head__isnull=False
    )
    
    for bill in bills:
        head_id = bill.budget_head.id
        if head_id in heads_dict:
            year = bill.bill_date.year
            month = bill.bill_date.month
            fy_start = year if month >= 4 else year - 1
            fy_str = f"{fy_start}-{str(fy_start + 1)[-2:]}"
            
            if fy_str in heads_dict[head_id]['fys']:
                gross = float(bill.bill_amount) + float(bill.cgst_amount) + float(bill.sgst_amount) + float(bill.igst_amount) + float(bill.other_charges)
                heads_dict[head_id]['fys'][fy_str]['spent'] += gross

    # 5. Format Response
    result_heads = []
    for head_id, data in heads_dict.items():
        fy_data = []
        for fy in fys:
            alloc = data['fys'].get(fy, {}).get('allocated', 0)
            spent = data['fys'].get(fy, {}).get('spent', 0)
            fy_data.append({
                'fy': fy,
                'allocated': alloc,
                'spent': spent,
                'balance': alloc - spent
            })
            
        result_heads.append({
            'head_id': head_id,
            'head_name': data['head_name'],
            'category': data['category'],
            'total_sanctioned': data['total_sanctioned'],
            'fy_data': fy_data
        })

    result_heads.sort(key=lambda x: (0 if 'Non-Recurring' in x['category'] else 1, x['head_name']))

    return Response({
        'project': {
            'id': project.id,
            'code': project.project_code,
            'name': project.project_name,
            'pi': project.project_pis.first().name if hasattr(project, 'project_pis') and project.project_pis.exists() else (project.pis.first().name if hasattr(project, 'pis') and project.pis.exists() else "N/A"),
            'agency': project.agency.name if project.agency else "N/A",
            'total_sanctioned_amount': float(project.total_sanctioned_amount or 0)
        },
        'fys': fys,
        'heads': result_heads
    })