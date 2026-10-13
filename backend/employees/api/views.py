from django.db.models import Q, Count
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from employees.models import Employee
from .serializers import (
    EmployeeListSerializer,
    EmployeeDetailSerializer,
    EmployeeCreateUpdateSerializer,
)


# ============================================
# EMPLOYEE — LIST + CREATE
# ============================================

@api_view(['GET', 'POST'])
def employee_list_create(request):
    """
    GET  → Saare employees ki list
    POST → Naya employee create
    """
    if request.method == 'GET':
        employee_type = request.query_params.get('employee_type')
        manpower_type = request.query_params.get('manpower_type')
        project_id = request.query_params.get('project')
        is_active = request.query_params.get('is_active')
        search = request.query_params.get('search')
        department = request.query_params.get('department')

        employees = Employee.objects.filter(
            is_deleted=False
        ).select_related('assigned_project')

        if employee_type:
            employees = employees.filter(employee_type=employee_type)
        if manpower_type:
            employees = employees.filter(manpower_type=manpower_type)
        if project_id:
            employees = employees.filter(assigned_project_id=project_id)
        if is_active is not None and is_active != '':
            employees = employees.filter(is_active=is_active.lower() == 'true')
        if department:
            employees = employees.filter(department__iexact=department)
        if search:
            employees = employees.filter(
                Q(employee_code__icontains=search) |
                Q(full_name__icontains=search) |
                Q(reference_no__icontains=search) |
                Q(designation__icontains=search) |
                Q(department__icontains=search) |
                Q(phone__icontains=search) |
                Q(email__icontains=search) |
                Q(project_role__icontains=search)
            )

        employees = employees.order_by('full_name')

        serializer = EmployeeListSerializer(employees, many=True)
        return Response({
            'count': employees.count(),
            'results': serializer.data,
        })

    elif request.method == 'POST':
        serializer = EmployeeCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            employee = serializer.save()
            if request.user.is_authenticated:
                employee.created_by = request.user
                employee.save()

            return Response(
                EmployeeDetailSerializer(employee).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================
# EMPLOYEE — DETAIL
# ============================================

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def employee_detail(request, pk):
    """
    GET    → Ek employee ki details
    PUT    → Full update
    PATCH  → Partial update
    DELETE → Soft delete
    """
    employee = get_object_or_404(Employee, pk=pk, is_deleted=False)

    if request.method == 'GET':
        serializer = EmployeeDetailSerializer(employee)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = EmployeeCreateUpdateSerializer(
            employee,
            data=request.data,
            partial=partial
        )
        if serializer.is_valid():
            updated = serializer.save()
            if request.user.is_authenticated:
                updated.updated_by = request.user
                updated.save()
            return Response(EmployeeDetailSerializer(updated).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        employee.soft_delete(
            user=request.user if request.user.is_authenticated else None
        )
        return Response(
            {'message': 'Employee successfully delete ho gaya.'},
            status=status.HTTP_200_OK
        )


# ============================================
# EMPLOYEE — STATS
# ============================================

@api_view(['GET'])
def employee_stats(request):
    """
    Dashboard ke liye employee stats.
    """
    employees = Employee.objects.filter(is_deleted=False)

    total = employees.count()
    active = employees.filter(is_active=True).count()
    inactive = total - active

    # Type-wise breakdown
    type_wise = []
    type_choices = [
        ('faculty', 'Faculty'),
        ('staff', 'Staff'),
        ('jrf', 'JRF'),
        ('srf', 'SRF'),
        ('ra', 'RA'),
        ('project_staff', 'Project Staff'),
        ('consultant', 'Consultant'),
        ('other', 'Other'),
    ]
    for code, label in type_choices:
        count = employees.filter(employee_type=code).count()
        if count > 0:
            type_wise.append({
                'employee_type': code,
                'label': label,
                'count': count,
            })

    # Project-wise
    project_wise = list(
        employees.filter(assigned_project__isnull=False)
        .values(
            'assigned_project__id',
            'assigned_project__project_name',
            'assigned_project__project_code',
        )
        .annotate(count=Count('id'))
        .order_by('-count')[:5]
    )

    project_wise_formatted = [
        {
            'project_id': p['assigned_project__id'],
            'project_name': p['assigned_project__project_name'],
            'project_code': p['assigned_project__project_code'],
            'count': p['count'],
        }
        for p in project_wise
    ]

    return Response({
        'total_employees': total,
        'active_employees': active,
        'inactive_employees': inactive,
        'type_wise': type_wise,
        'project_wise': project_wise_formatted,
    })