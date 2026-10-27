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
import pandas as pd
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from vendors.models import Vendor
from projects.models import Project, Agency, Department

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def import_excel_data(request):
    file = request.FILES.get('file')
    data_type = request.data.get('type')

    if not file:
        return Response({"error": "No file uploaded."}, status=400)

    try:
        # File read karo
        if file.name.endswith('.csv'):
            df = pd.read_csv(file)
        else:
            df = pd.read_excel(file)

        # ============================================
        # VENDORS IMPORT
        # ============================================
        if data_type == 'vendors':
            required_cols = ['vendor_name', 'vendor_type', 'phone', 'city', 'state', 'address_line1', 'contact_person']
            for col in required_cols:
                if col not in df.columns:
                    return Response({"error": f"Missing column in Excel: {col}"}, status=400)

            count = 0
            for index, row in df.iterrows():
                def get_val(key, default=''):
                    val = row.get(key, default)
                    return str(val).strip() if pd.notna(val) else str(default)

                v_code = get_val('vendor_code')
                
                defaults = {
                    'vendor_name': get_val('vendor_name'),
                    'vendor_type': get_val('vendor_type', 'supplier'),
                    'reference_no': get_val('reference_no'),
                    'description': get_val('description'),
                    'gst_number': get_val('gst_number'),
                    'pan_number': get_val('pan_number'),
                    'tan_number': get_val('tan_number'),
                    'address_line1': get_val('address_line1'),
                    'address_line2': get_val('address_line2'),
                    'city': get_val('city'),
                    'state': get_val('state'),
                    'pincode': get_val('pincode'),
                    'country': get_val('country', 'India'),
                    'contact_person': get_val('contact_person'),
                    'email': get_val('email'),
                    'phone': get_val('phone'),
                    'alternate_phone': get_val('alternate_phone'),
                    'bank_name': get_val('bank_name'),
                    'account_number': get_val('account_number'),
                    'ifsc_code': get_val('ifsc_code'),
                    'bank_branch': get_val('bank_branch'),
                    'account_type': get_val('account_type', 'savings'),
                    'is_active': True
                }

                if v_code:
                    Vendor.objects.update_or_create(vendor_code=v_code, defaults=defaults)
                else:
                    Vendor.objects.create(**defaults)
                count += 1

            return Response({"message": f"Successfully imported {count} vendors."})

        # ============================================
        # PROJECTS IMPORT
        # ============================================
        elif data_type == 'projects':
            required_cols = ['project_code', 'project_name', 'pi_name', 'sanctioned_amount', 'start_date', 'end_date']
            for col in required_cols:
                if col not in df.columns:
                    return Response({"error": f"Missing column in Excel: {col}"}, status=400)

            count = 0
            for index, row in df.iterrows():
                def get_val(key, default=''):
                    val = row.get(key, default)
                    return str(val).strip() if pd.notna(val) else str(default)

                p_code = get_val('project_code')
                if not p_code:
                    continue

                agency_code = get_val('agency_code')
                dept_code = get_val('department_code')
                
                agency = Agency.objects.filter(code=agency_code).first() if agency_code else None
                department = Department.objects.filter(code=dept_code).first() if dept_code else None

                try:
                    start_date = pd.to_datetime(row['start_date']).date() if pd.notna(row['start_date']) else None
                    end_date = pd.to_datetime(row['end_date']).date() if pd.notna(row['end_date']) else None
                except:
                    start_date, end_date = None, None

                Project.objects.update_or_create(
                    project_code=p_code,
                    defaults={
                        'project_name': get_val('project_name'),
                        'pi_name': get_val('pi_name'),
                        'co_pi_name': get_val('co_pi_name'),
                        'sanctioned_amount': float(row['sanctioned_amount']) if pd.notna(row['sanctioned_amount']) else 0,
                        'total_sanctioned_amount': float(row['sanctioned_amount']) if pd.notna(row['sanctioned_amount']) else 0,
                        'start_date': start_date,
                        'end_date': end_date,
                        'status': get_val('status', 'active'),
                        'description': get_val('description'),
                        'agency': agency,
                        'department': department,
                    }
                )
                count += 1

            return Response({"message": f"Successfully imported {count} projects."})

        # ============================================
        # MATERIALS IMPORT
        # ============================================
        elif data_type == 'materials':
            from materials.models import Material, MaterialCategory

            required_cols = ['material_name', 'unit', 'gst_rate']
            for col in required_cols:
                if col not in df.columns:
                    return Response({"error": f"Missing column in Excel: {col}"}, status=400)

            count = 0
            for index, row in df.iterrows():
                def get_val(key, default=''):
                    val = row.get(key, default)
                    return str(val).strip() if pd.notna(val) else str(default)

                m_code = get_val('material_code')
                category_name = get_val('category_name')
                
                category = MaterialCategory.objects.filter(name__iexact=category_name).first() if category_name else None

                defaults = {
                    'material_name': get_val('material_name'),
                    'category': category,
                    'unit': get_val('unit', 'nos'),
                    'hsn_code': get_val('hsn_code'),
                    'gst_rate': float(row['gst_rate']) if pd.notna(row['gst_rate']) else 0,
                    'description': get_val('description'),
                    'is_active': True
                }

                if m_code:
                    Material.objects.update_or_create(material_code=m_code, defaults=defaults)
                else:
                    Material.objects.create(**defaults)
                count += 1

            return Response({"message": f"Successfully imported {count} materials."})

        # ============================================
        # EMPLOYEES IMPORT
        # ============================================
        elif data_type == 'employees':
            from employees.models import Employee
            from projects.models import Project
            from django.utils import timezone

            required_cols = ['full_name', 'designation', 'employee_type', 'phone', 'joining_date']
            for col in required_cols:
                if col not in df.columns:
                    return Response({"error": f"Missing column in Excel: {col}"}, status=400)

            count = 0
            for index, row in df.iterrows():
                def get_val(key, default=''):
                    val = row.get(key, default)
                    return str(val).strip() if pd.notna(val) else str(default)

                e_code = get_val('employee_code')
                proj_code = get_val('assigned_project_code')
                
                # Project dhundho (agar code diya hai)
                project = Project.objects.filter(project_code=proj_code).first() if proj_code else None

                # Dates handle karo (Agar khali ho to aaj ki date daal do)
                try:
                    joining = pd.to_datetime(row['joining_date']).date() if pd.notna(row['joining_date']) else timezone.now().date()
                    leaving = pd.to_datetime(row['leaving_date']).date() if pd.notna(row.get('leaving_date')) else None
                except:
                    joining = timezone.now().date()
                    leaving = None

                defaults = {
                    'reference_no': get_val('reference_no'),
                    'full_name': get_val('full_name'),
                    'designation': get_val('designation'),
                    'department': get_val('department'),
                    'employee_type': get_val('employee_type', 'staff'),
                    'phone': get_val('phone'),
                    'email': get_val('email'),
                    'address': get_val('address'),
                    'joining_date': joining,
                    'leaving_date': leaving,
                    'assigned_project': project,
                    'project_role': get_val('project_role'), # 👈 YAHAN FIX HUA HAI
                    'manpower_type': get_val('manpower_type', 'full_time'),
                    'bank_name': get_val('bank_name'),
                    'account_number': get_val('account_number'),
                    'ifsc_code': get_val('ifsc_code'),
                    'bank_branch': get_val('bank_branch'),
                    'account_type': get_val('account_type', 'savings'),
                    'is_active': True
                }

                if e_code:
                    Employee.objects.update_or_create(employee_code=e_code, defaults=defaults)
                else:
                    Employee.objects.create(**defaults)
                count += 1

            return Response({"message": f"Successfully imported {count} employees."})

        # ============================================
        # BILLS IMPORT (Form 5)
        # ============================================
        elif data_type == 'bills':
            from bills.models import BillEntry
            from projects.models import Project
            from vendors.models import Vendor
            from purchase.models import PurchaseOrder
            from funds.models import BudgetHead

            required_cols = ['bill_no', 'bill_date', 'project_code', 'vendor_code', 'bill_amount']
            for col in required_cols:
                if col not in df.columns:
                    return Response({"error": f"Missing column in Excel: {col}"}, status=400)

            count = 0
            for index, row in df.iterrows():
                def get_val(key, default=''):
                    val = row.get(key, default)
                    return str(val).strip() if pd.notna(val) else str(default)

                b_no = get_val('bill_no')
                if not b_no:
                    continue

                # Relations dhundho
                p_code = get_val('project_code')
                v_code = get_val('vendor_code')
                po_no = get_val('po_number')
                bh_code = get_val('budget_head_code')

                project = Project.objects.filter(project_code=p_code).first()
                vendor = Vendor.objects.filter(vendor_code=v_code).first()
                po = PurchaseOrder.objects.filter(po_number=po_no).first() if po_no else None
                budget_head = BudgetHead.objects.filter(code=bh_code).first() if bh_code else None

                if not project or not vendor:
                    continue # Skip if essential relation is missing

                # Date handle karo
                try:
                    b_date = pd.to_datetime(row['bill_date']).date() if pd.notna(row['bill_date']) else None
                except:
                    b_date = None

                # Amounts handle karo
                base = float(row['bill_amount']) if pd.notna(row['bill_amount']) else 0

                defaults = {
                    'bill_date': b_date,
                    'project': project,
                    'vendor': vendor,
                    'purchase_order': po,
                    'budget_head': budget_head,
                    'recipient_name': get_val('recipient_name', vendor.vendor_name),
                    'particulars': get_val('particulars'),
                    'bill_amount': base,
                    'cgst_rate': float(row['cgst_rate']) if pd.notna(row.get('cgst_rate')) else 0,
                    'sgst_rate': float(row['sgst_rate']) if pd.notna(row.get('sgst_rate')) else 0,
                    'igst_rate': float(row['igst_rate']) if pd.notna(row.get('igst_rate')) else 0,
                    'tds_gst_rate': float(row['tds_gst_rate']) if pd.notna(row.get('tds_gst_rate')) else 0,
                    'tds_income_tax_rate': float(row['tds_income_tax_rate']) if pd.notna(row.get('tds_income_tax_rate')) else 0,
                    'penalty': float(row['penalty']) if pd.notna(row.get('penalty')) else 0,
                    'pbg_security': float(row['pbg_security']) if pd.notna(row.get('pbg_security')) else 0,
                    'other_charges': float(row['other_charges']) if pd.notna(row.get('other_charges')) else 0,
                    'status': get_val('status', 'draft'),
                }

                BillEntry.objects.update_or_create(bill_no=b_no, defaults=defaults)
                count += 1

            return Response({"message": f"Successfully imported {count} bills."})
        else:
            return Response({"error": "Invalid data type."}, status=400)

    except Exception as e:
        return Response({"error": str(e)}, status=500)