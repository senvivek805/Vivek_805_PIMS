from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import (
    LeaveType,
    LeavePolicy,
    LeaveBalance,
    LeaveApplication,
    Attendance,
)

@admin.register(LeaveType)
class LeaveTypeAdmin(ModelAdmin):
    list_display = ("name", "code", "is_active")
    search_fields = ("name", "code")
    list_filter = ("is_active",)

@admin.register(LeavePolicy)
class LeavePolicyAdmin(ModelAdmin):
    list_display = ("designation", "leave_type", "accrual_type", "accrual_amount", "min_attendance_days")
    list_filter = ("accrual_type", "leave_type")
    search_fields = ("designation",)

@admin.register(LeaveBalance)
class LeaveBalanceAdmin(ModelAdmin):
    list_display = ("employee", "leave_type", "year_start_date", "total_accrued", "used_days")
    list_filter = ("leave_type", "year_start_date")
    search_fields = ("employee__full_name", "employee__employee_code")

@admin.register(LeaveApplication)
class LeaveApplicationAdmin(ModelAdmin):
    list_display = ("employee", "leave_type", "from_date", "to_date", "total_days", "status")
    list_filter = ("status", "leave_type")
    search_fields = ("employee__full_name", "employee__employee_code")

@admin.register(Attendance)
class AttendanceAdmin(ModelAdmin):
    list_display = ("employee", "date", "status", "check_in", "check_out")
    list_filter = ("status", "date")
    search_fields = ("employee__full_name", "employee__employee_code")