from django.db import models
from django.conf import settings
from datetime import date
from dateutil.relativedelta import relativedelta

class LeaveType(models.Model):
    name = models.CharField(max_length=50, unique=True)
    code = models.CharField(max_length=10, unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "pims_leave_types"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.code})"


class LeavePolicy(models.Model):
    """
    Ye table batati hai ki kis designation ko kaisi leave milegi.
    """
    ACCRUAL_CHOICES = [
        ("monthly", "Monthly (e.g. 1.5 per month)"),
        ("yearly", "Yearly (e.g. 8 per year)"),
    ]

    designation = models.CharField(max_length=100, help_text="Exact designation name as per Employee Master")
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE, related_name="policies")
    accrual_type = models.CharField(max_length=20, choices=ACCRUAL_CHOICES)
    accrual_amount = models.DecimalField(max_digits=5, decimal_places=2, help_text="E.g. 1.5, 2.5, 8")
    min_attendance_days = models.PositiveIntegerField(default=0, help_text="Required attendance days per month for accrual (e.g. 20 for EL)")
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "pims_leave_policies"
        unique_together = [["designation", "leave_type"]]

    def __str__(self):
        return f"{self.designation} - {self.leave_type.code}"


class LeaveBalance(models.Model):
    """
    Ye table employee ka current leave balance track karti hai.
    Year employee ki joining date se start hota hai.
    """
    employee = models.ForeignKey("employees.Employee", on_delete=models.CASCADE, related_name="leave_balances")
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE, related_name="balances")
    
    year_start_date = models.DateField()
    year_end_date = models.DateField()
    
    total_accrued = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Total leaves earned so far")
    used_days = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Leaves taken")
    
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "pims_leave_balances"
        unique_together = [["employee", "leave_type", "year_start_date"]]
        ordering = ["-year_start_date", "employee"]

    @property
    def balance_days(self):
        return float(self.total_accrued) - float(self.used_days)

    def __str__(self):
        return f"{self.employee} - {self.leave_type.code} ({self.balance_days} left)"


class LeaveApplication(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("cancelled", "Cancelled"),
    ]

    employee = models.ForeignKey("employees.Employee", on_delete=models.CASCADE, related_name="leave_applications")
    leave_type = models.ForeignKey(LeaveType, on_delete=models.PROTECT, related_name="applications")
    
    from_date = models.DateField()
    to_date = models.DateField()
    total_days = models.DecimalField(max_digits=5, decimal_places=1, default=0)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    applied_at = models.DateTimeField(auto_now_add=True)
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="approved_leaves")
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)

    class Meta:
        db_table = "pims_leave_applications"
        ordering = ["-applied_at"]

    def save(self, *args, **kwargs):
        if self.from_date and self.to_date:
            delta = (self.to_date - self.from_date).days + 1
            self.total_days = delta
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.employee} - {self.leave_type.code} ({self.from_date} to {self.to_date})"


class Attendance(models.Model):
    STATUS_CHOICES = [
        ("present", "Present"),
        ("absent", "Absent"),
        ("half_day", "Half Day"),
        ("leave", "On Leave"),
        ("holiday", "Holiday"),
        ("wfh", "Work From Home"),
    ]

    employee = models.ForeignKey("employees.Employee", on_delete=models.CASCADE, related_name="attendance_records")
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="present")
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    remarks = models.TextField(blank=True)

    marked_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="marked_attendance")
    marked_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "pims_attendance"
        unique_together = [["employee", "date"]]
        ordering = ["-date", "employee"]

    def __str__(self):
        return f"{self.employee} - {self.date} - {self.get_status_display()}"