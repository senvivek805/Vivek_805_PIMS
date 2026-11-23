from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.utils import timezone

from leaves.models import LeaveType, LeaveApplication, LeaveBalance, Attendance, LeavePolicy
from leaves.services import calculate_employee_leave_balances
from .serializers import (
    LeaveTypeSerializer,
    LeaveApplicationSerializer,
    LeaveBalanceSerializer,
    AttendanceSerializer,
    LeavePolicySerializer,
)


# 1. Leave Types (Dropdown ke liye)
class LeaveTypeListView(generics.ListAPIView):
    queryset = LeaveType.objects.filter(is_active=True)
    serializer_class = LeaveTypeSerializer
    permission_classes = [IsAuthenticated]


# 2. Leave Applications (List & Apply)
class LeaveApplicationListCreateView(generics.ListCreateAPIView):
    queryset = LeaveApplication.objects.all().order_by('-applied_at')
    serializer_class = LeaveApplicationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        instance = serializer.save()
        # New leave is 'pending' — no balance change yet.
        # But recalc keeps numbers consistent.
        calculate_employee_leave_balances(instance.employee_id)


# 3. Leave Balance (List) - ROLE BASED FILTERING
class LeaveBalanceListView(generics.ListAPIView):
    serializer_class = LeaveBalanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        from employees.models import Employee

        # 1. Check if user is Admin/Manager or Superuser
        is_admin = getattr(user, 'is_superuser', False) or getattr(user, 'is_staff', False)
        
        # Custom Role check (if PIMS has roles)
        if hasattr(user, 'role') and user.role:
            role_name = getattr(user.role, 'name', '')
            if role_name in ['Admin', 'Manager']:
                is_admin = True

        # 2. Check if admin requested a full refresh
        refresh = self.request.query_params.get('refresh')
        
        if is_admin:
            if refresh == 'all':
                for emp in Employee.objects.all():
                    try:
                        calculate_employee_leave_balances(emp.id)
                    except Exception:
                        pass
            
            # Admin sees everyone's balance
            return LeaveBalance.objects.all().order_by('employee__full_name', 'leave_type__name')
        
        else:
            # Normal employee sees only their own balance
            employee = getattr(user, 'employee', None) or Employee.objects.filter(
                email=getattr(user, 'email', None)
            ).first()
            
            if employee:
                try:
                    calculate_employee_leave_balances(employee.id)
                except Exception:
                    pass
                return LeaveBalance.objects.filter(employee=employee).order_by('leave_type__name')
            
            return LeaveBalance.objects.none()


# 4. Attendance (List & Mark)
class AttendanceListCreateView(generics.ListCreateAPIView):
    queryset = Attendance.objects.all().order_by('-date')
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        instance = serializer.save()
        # Attendance affects EL accrual — recalc balance
        calculate_employee_leave_balances(instance.employee_id)


# 5. Approve/Reject Leave Action
class ApproveRejectLeaveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            leave = LeaveApplication.objects.get(pk=pk)
            action = request.data.get('action')  # 'approve' or 'reject'

            if action == 'approve':
                leave.status = 'approved'
                leave.approved_by = request.user
                leave.approved_at = timezone.now()
            elif action == 'reject':
                leave.status = 'rejected'
                leave.rejection_reason = request.data.get('reason', '')
            else:
                return Response(
                    {'error': 'Invalid action. Use "approve" or "reject".'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            leave.save()

            # KEY FIX: Recalculate balance after status change.
            # Used days = sum of 'approved' leaves → auto-handled.
            calculate_employee_leave_balances(leave.employee_id)

            return Response({'status': 'success', 'message': f'Leave {action}d successfully'})
        except LeaveApplication.DoesNotExist:
            return Response({'error': 'Leave not found'}, status=status.HTTP_404_NOT_FOUND)