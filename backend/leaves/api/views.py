from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.utils import timezone
from leaves.models import LeaveType, LeaveApplication, LeaveBalance, Attendance, LeavePolicy
from .serializers import LeaveTypeSerializer, LeaveApplicationSerializer, LeaveBalanceSerializer, AttendanceSerializer, LeavePolicySerializer

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

# 3. Leave Balance (Calculation Logic ke saath)
class LeaveBalanceListView(generics.ListAPIView):
    serializer_class = LeaveBalanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Sirf current year ka balance dikhayenge
        return LeaveBalance.objects.all().order_by('employee__full_name')

# 4. Attendance (List & Mark)
class AttendanceListCreateView(generics.ListCreateAPIView):
    queryset = Attendance.objects.all().order_by('-date')
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

# 5. Approve/Reject Leave Action
class ApproveRejectLeaveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            leave = LeaveApplication.objects.get(pk=pk)
            action = request.data.get('action') # 'approve' or 'reject'
            
            if action == 'approve':
                leave.status = 'approved'
                leave.approved_by = request.user
                leave.approved_at = timezone.now()
                
                # TODO: Yahan Leave Balance minus karne ka logic aayega
                
            elif action == 'reject':
                leave.status = 'rejected'
                leave.rejection_reason = request.data.get('reason', '')
            
            leave.save()
            return Response({'status': 'success', 'message': f'Leave {action}d successfully'})
        except LeaveApplication.DoesNotExist:
            return Response({'error': 'Leave not found'}, status=status.HTTP_404_NOT_FOUND)