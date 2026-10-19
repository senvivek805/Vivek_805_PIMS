from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from projects.models import Agency, Department, Project
from .serializers import (
    AgencySerializer,
    DepartmentSerializer,
    ProjectListSerializer,
    ProjectDetailSerializer,
    ProjectCreateUpdateSerializer,
)


# ============================================
# AGENCY API
# ============================================

@api_view(['GET'])
def agency_list(request):
    """Saari active agencies ki list."""
    agencies = Agency.objects.filter(is_deleted=False).order_by('name')
    serializer = AgencySerializer(agencies, many=True)
    return Response(serializer.data)


# ============================================
# DEPARTMENT API
# ============================================

@api_view(['GET'])
def department_list(request):
    """Saari active departments ki list."""
    departments = Department.objects.filter(is_deleted=False).order_by('name')
    serializer = DepartmentSerializer(departments, many=True)
    return Response(serializer.data)


# ============================================
# PROJECT API
# ============================================

@api_view(['GET', 'POST'])
def project_list_create(request):
    """
    GET  → Saare projects ki list
    POST → Naya project create
    """
    if request.method == 'GET':
        # Filters
        status_filter = request.query_params.get('status')
        agency_id = request.query_params.get('agency')
        search = request.query_params.get('search')

        projects = Project.objects.filter(is_deleted=False).select_related('agency', 'department')

        if status_filter:
            projects = projects.filter(status=status_filter)
        if agency_id:
            projects = projects.filter(agency_id=agency_id)
        if search:
            projects = projects.filter(
                project_name__icontains=search
            ) | projects.filter(
                project_code__icontains=search
            ) | projects.filter(
                pi_name__icontains=search
            )

        projects = projects.order_by('-created_at')

        serializer = ProjectListSerializer(projects, many=True)
        return Response({
            'count': projects.count(),
            'results': serializer.data,
        })

    elif request.method == 'POST':
        serializer = ProjectCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            project = serializer.save()
            if request.user.is_authenticated:
                project.created_by = request.user
                project.save()

            return Response(
                ProjectDetailSerializer(project).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def project_detail(request, pk):
    """
    GET    → Ek project ki details
    PUT    → Pura update
    PATCH  → Partial update
    DELETE → Soft delete
    """
    project = get_object_or_404(Project, pk=pk, is_deleted=False)

    if request.method == 'GET':
        serializer = ProjectDetailSerializer(project)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = ProjectCreateUpdateSerializer(
            project,
            data=request.data,
            partial=partial
        )
        if serializer.is_valid():
            updated = serializer.save()
            if request.user.is_authenticated:
                updated.updated_by = request.user
                updated.save()
            return Response(ProjectDetailSerializer(updated).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        project.soft_delete(user=request.user if request.user.is_authenticated else None)
        return Response(
            {'message': 'Project successfully delete ho gaya.'},
            status=status.HTTP_200_OK
        )


@api_view(['GET'])
def project_stats(request):
    """Dashboard ke liye stats."""
    active_projects = Project.objects.filter(is_deleted=False, status='active').count()
    completed_projects = Project.objects.filter(is_deleted=False, status='completed').count()
    on_hold_projects = Project.objects.filter(is_deleted=False, status='on_hold').count()
    total_projects = Project.objects.filter(is_deleted=False).count()

    total_sanctioned = sum(
        p.sanctioned_amount or 0
        for p in Project.objects.filter(is_deleted=False)
    )

    return Response({
        'total_projects': total_projects,
        'active_projects': active_projects,
        'completed_projects': completed_projects,
        'on_hold_projects': on_hold_projects,
        'total_sanctioned_amount': float(total_sanctioned),
    })


# ============================================
# PROJECT BUDGET SUMMARY
# ============================================

@api_view(['GET'])
def project_budget_summary(request, pk):
    """
    Project ka complete budget summary.
    - Total sanctioned
    - Total fund received
    - Balance to receive
    - Total breakup
    - Receipt-wise, Category-wise, FY-wise breakdown
    """
    from django.db.models import Sum
    from funds.models import FundReceipt, FundBreakup, BudgetCategory, BudgetHead

    project = get_object_or_404(Project, pk=pk, is_deleted=False)

    # ============================================
    # 1. TOTAL SANCTIONED
    # ============================================
    total_sanctioned = float(project.sanctioned_amount or 0)

    # ============================================
    # 2. FUND RECEIPTS
    # ============================================
    receipts = FundReceipt.objects.filter(
        project=project, is_deleted=False
    ).order_by('-receipt_date')

    total_received = receipts.aggregate(
        total=Sum('amount_received')
    )['total'] or 0
    total_received = float(total_received)

    balance_to_receive = total_sanctioned - total_received

    # ============================================
    # 3. FUND BREAKUPS (across all receipts)
    # ============================================
    breakups = FundBreakup.objects.filter(
        fund_receipt__project=project,
        fund_receipt__is_deleted=False,
        is_deleted=False
    ).select_related('category', 'budget_head', 'fund_receipt')

    total_breakup = breakups.aggregate(
        total=Sum('amount')
    )['total'] or 0
    total_breakup = float(total_breakup)

    remaining_to_breakup = total_received - total_breakup

    # ============================================
    # 4. RECEIPT-WISE SUMMARY
    # ============================================
    receipt_list = []
    for r in receipts:
        r_total = float(r.amount_received or 0)
        r_breakup = r.total_breakup_amount
        r_remaining = r_total - float(r_breakup)

        receipt_list.append({
            'id': r.id,
            'receipt_reference_no': r.receipt_reference_no,
            'receipt_date': r.receipt_date.isoformat() if r.receipt_date else None,
            'financial_year': r.financial_year,
            'fund_type': r.fund_type,
            'fund_type_display': r.get_fund_type_display(),
            'amount_received': r_total,
            'total_breakup': float(r_breakup),
            'remaining': r_remaining,
            'breakup_percentage': r.breakup_percentage,
            'is_fully_allocated': float(r_breakup) == r_total,
        })

    # ============================================
    # 5. CATEGORY-WISE BREAKUP (Recurring / Non-Recurring)
    # ============================================
    categories = BudgetCategory.objects.filter(is_deleted=False).order_by('order')
    breakup_by_category = []
    for cat in categories:
        cat_total = breakups.filter(category=cat).aggregate(
            total=Sum('amount')
        )['total'] or 0
        cat_total = float(cat_total)

        if cat_total > 0 or True:  # Show all categories
            breakup_by_category.append({
                'id': cat.id,
                'name': cat.name,
                'code': cat.code,
                'total': cat_total,
                'percentage': round(cat_total / total_breakup * 100, 2) if total_breakup > 0 else 0,
            })

    # ============================================
    # 6. HEAD-WISE BREAKUP
    # ============================================
    heads = BudgetHead.objects.filter(is_deleted=False).order_by('category__order', 'order')
    breakup_by_head = []
    for head in heads:
        head_total = breakups.filter(budget_head=head).aggregate(
            total=Sum('amount')
        )['total'] or 0
        head_total = float(head_total)

        if head_total > 0:
            breakup_by_head.append({
                'id': head.id,
                'name': head.name,
                'code': head.code,
                'category_id': head.category.id,
                'category_name': head.category.name,
                'category_code': head.category.code,
                'total': head_total,
                'percentage': round(head_total / total_breakup * 100, 2) if total_breakup > 0 else 0,
            })

    # Sort by total (descending)
    breakup_by_head.sort(key=lambda x: x['total'], reverse=True)

    # ============================================
    # 7. FY-WISE SUMMARY
    # ============================================
    fy_wise_raw = receipts.values('financial_year').annotate(
        total=Sum('amount_received')
    ).order_by('financial_year')

    fy_wise = []
    for item in fy_wise_raw:
        fy = item['financial_year']
        fy_total = float(item['total'] or 0)

        # Breakup for this FY
        fy_breakup = breakups.filter(
            fund_receipt__financial_year=fy
        ).aggregate(total=Sum('amount'))['total'] or 0

        fy_wise.append({
            'financial_year': fy,
            'received': fy_total,
            'breakup': float(fy_breakup),
        })

    # ============================================
    # 8. RESPONSE
    # ============================================
    return Response({
        'project': {
            'id': project.id,
            'project_code': project.project_code,
            'project_name': project.project_name,
            'pi_name': project.pi_name,
            'agency_name': project.agency.name if project.agency else None,
            'department_name': project.department.name if project.department else None,
            'start_date': project.start_date.isoformat() if project.start_date else None,
            'end_date': project.end_date.isoformat() if project.end_date else None,
            'status': project.status,
        },
        'summary': {
            'total_sanctioned': total_sanctioned,
            'total_received': total_received,
            'balance_to_receive': balance_to_receive,
            'total_breakup': total_breakup,
            'remaining_to_breakup': remaining_to_breakup,
            'received_percentage': round(total_received / total_sanctioned * 100, 2) if total_sanctioned > 0 else 0,
            'breakup_percentage': round(total_breakup / total_received * 100, 2) if total_received > 0 else 0,
        },
        'receipts': receipt_list,
        'breakup_by_category': breakup_by_category,
        'breakup_by_head': breakup_by_head,
        'fy_wise': fy_wise,
    })


# ============================================
# GLOBAL BUDGET OVERVIEW
# ============================================

@api_view(['GET'])
def budget_overview(request):
    """
    Saare projects ka budget overview.
    Dashboard global budget page ke liye.
    """
    from django.db.models import Sum
    from funds.models import FundReceipt, FundBreakup

    # Filters
    status_filter = request.query_params.get('status')
    agency_id = request.query_params.get('agency')
    search = request.query_params.get('search')

    projects = Project.objects.filter(is_deleted=False).select_related('agency', 'department')

    if status_filter:
        projects = projects.filter(status=status_filter)
    if agency_id:
        projects = projects.filter(agency_id=agency_id)
    if search:
        projects = projects.filter(
            project_name__icontains=search
        ) | projects.filter(
            project_code__icontains=search
        )

    # Build project-wise summary
    project_list = []
    total_sanctioned = 0
    total_received = 0
    total_breakup = 0

    for project in projects:
        p_sanctioned = float(project.sanctioned_amount or 0)

        receipts = FundReceipt.objects.filter(
            project=project, is_deleted=False
        )
        p_received = float(receipts.aggregate(
            total=Sum('amount_received')
        )['total'] or 0)

        breakups = FundBreakup.objects.filter(
            fund_receipt__project=project,
            fund_receipt__is_deleted=False,
            is_deleted=False
        )
        p_breakup = float(breakups.aggregate(
            total=Sum('amount')
        )['total'] or 0)

        p_balance = p_sanctioned - p_received
        p_breakup_pct = round(p_breakup / p_received * 100, 2) if p_received > 0 else 0

        project_list.append({
            'id': project.id,
            'project_code': project.project_code,
            'project_name': project.project_name,
            'pi_name': project.pi_name,
            'agency_name': project.agency.name if project.agency else None,
            'department_name': project.department.name if project.department else None,
            'status': project.status,
            'status_display': project.get_status_display(),
            'sanctioned': p_sanctioned,
            'received': p_received,
            'balance': p_balance,
            'breakup': p_breakup,
            'breakup_percentage': p_breakup_pct,
            'received_percentage': round(p_received / p_sanctioned * 100, 2) if p_sanctioned > 0 else 0,
        })

        total_sanctioned += p_sanctioned
        total_received += p_received
        total_breakup += p_breakup

    project_list.sort(key=lambda x: x['sanctioned'], reverse=True)

    return Response({
        'summary': {
            'total_projects': len(project_list),
            'total_sanctioned': total_sanctioned,
            'total_received': total_received,
            'total_breakup': total_breakup,
            'total_balance': total_sanctioned - total_received,
            'received_percentage': round(total_received / total_sanctioned * 100, 2) if total_sanctioned > 0 else 0,
        },
        'projects': project_list,
    })
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Q
from projects.models import Project
from vendors.models import Vendor
from purchase.models import PurchaseOrder
from bills.models import BillEntry

@api_view(['GET'])
def global_search(request):
    query = request.query_params.get('q', '').strip()
    
    # Agar 2 letter se chota search hai to khali return karo
    if not query or len(query) < 2:
        return Response({'projects': [], 'bills': [], 'vendors': [], 'purchase_orders': []})

    # 1. Projects
    projects = Project.objects.filter(
        Q(project_code__icontains=query) | Q(project_name__icontains=query),
        is_deleted=False
    )[:5]

    # 2. Bills (Form 5)
    bills = BillEntry.objects.filter(
        Q(bill_no__icontains=query) | Q(recipient_name__icontains=query) | Q(document_no__icontains=query),
        is_deleted=False
    )[:5]

    # 3. Vendors (Dhyan rahe: agar Vendor model me 'name' field nahi hai, to use apne hisaab se badalna, jaise 'firm_name')
    try:
        vendors = Vendor.objects.filter(
            Q(name__icontains=query) | Q(firm_name__icontains=query),
            is_deleted=False
        )[:5]
    except:
        vendors = Vendor.objects.filter(is_deleted=False)[:0] # Fallback

    # 4. Purchase Orders
    pos = PurchaseOrder.objects.filter(
        Q(po_number__icontains=query),
        is_deleted=False
    )[:5]

    # Response format
    return Response({
        'projects': [{'id': p.id, 'title': p.project_name, 'subtitle': p.project_code, 'url': f"/projects/{p.id}"} for p in projects],
        'bills': [{'id': b.id, 'title': b.bill_no, 'subtitle': b.recipient_name, 'url': f"/bills/{b.id}"} for b in bills],
        'vendors': [{'id': v.id, 'title': getattr(v, 'name', getattr(v, 'firm_name', 'Vendor')), 'subtitle': 'Vendor', 'url': f"/vendors/{v.id}"} for v in vendors],
        'purchase_orders': [{'id': po.id, 'title': po.po_number, 'subtitle': 'Purchase Order', 'url': f"/purchase/{po.id}"} for po in pos],
    })
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from projects.models import Project, ProjectSanctionedHead
from funds.models import BudgetHead

@api_view(['GET', 'POST'])
def project_sanctioned_heads(request, project_id):
    project = get_object_or_404(Project, id=project_id, is_deleted=False)

    if request.method == 'GET':
        heads = ProjectSanctionedHead.objects.filter(project=project, is_deleted=False)
        data = [{
            'id': h.id,
            'budget_head': h.budget_head_id,
            'budget_head_name': h.budget_head.name,
            'sanctioned_amount': float(h.sanctioned_amount)
        } for h in heads]
        return Response(data)

    elif request.method == 'POST':
        # Expecting body: { "heads": [ {"budget_head": 1, "sanctioned_amount": 500000}, ... ] }
        heads_data = request.data.get('heads', [])
        
        # Delete existing ones for this project (to replace with new)
        ProjectSanctionedHead.objects.filter(project=project).delete()

        created = []
        for item in heads_data:
            head_id = item.get('budget_head')
            amount = item.get('sanctioned_amount', 0)
            
            if head_id and float(amount) > 0:
                budget_head = BudgetHead.objects.get(id=head_id)
                obj = ProjectSanctionedHead.objects.create(
                    project=project,
                    budget_head=budget_head,
                    sanctioned_amount=amount
                )
                created.append(obj)

        return Response({'message': 'Sanctioned heads saved successfully', 'count': len(created)})