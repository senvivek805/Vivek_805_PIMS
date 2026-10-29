from django.urls import path
from .views import (
    LeaveTypeListView,
    LeaveApplicationListCreateView,
    LeaveBalanceListView,
    AttendanceListCreateView,
    ApproveRejectLeaveView
)

urlpatterns = [
    path('leave-types/', LeaveTypeListView.as_view(), name='leave-types'),
    path('leave-applications/', LeaveApplicationListCreateView.as_view(), name='leave-applications'),
    path('leave-balances/', LeaveBalanceListView.as_view(), name='leave-balances'),
    path('attendance/', AttendanceListCreateView.as_view(), name='attendance'),
    path('leave-applications/<int:pk>/action/', ApproveRejectLeaveView.as_view(), name='leave-action'),
]