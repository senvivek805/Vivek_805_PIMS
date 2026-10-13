from django.db import models

from core.models import BaseModel
from projects.models import Project


# ============================================
# EMPLOYEE / MANPOWER
# ============================================

class Employee(BaseModel):
    """
    Employee Master — faculty, staff, JRF, SRF, RA, project staff.
    """
    EMPLOYEE_TYPE_CHOICES = [
        ('faculty', 'Faculty'),
        ('staff', 'Staff'),
        ('jrf', 'JRF (Junior Research Fellow)'),
        ('srf', 'SRF (Senior Research Fellow)'),
        ('ra', 'RA (Research Associate)'),
        ('project_staff', 'Project Staff'),
        ('consultant', 'Consultant'),
        ('other', 'Other'),
    ]

    MANPOWER_TYPE_CHOICES = [
        ('full_time', 'Full-Time'),
        ('part_time', 'Part-Time'),
        ('contract', 'Contract'),
        ('visiting', 'Visiting'),
    ]

    ACCOUNT_TYPE_CHOICES = [
        ('savings', 'Savings'),
        ('current', 'Current'),
        ('other', 'Other'),
    ]

    # ============================================
    # BASIC INFO
    # ============================================
    employee_code = models.CharField(
        max_length=50,
        unique=True,
        verbose_name='Employee Code',
        help_text='Auto-generated: EMP-000001'
    )
    reference_no = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Reference No.',
        help_text='Department/Agency ka existing code (optional)'
    )
    full_name = models.CharField(
        max_length=300,
        verbose_name='Full Name'
    )
    designation = models.CharField(
        max_length=200,
        verbose_name='Designation'
    )
    department = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Department'
    )
    employee_type = models.CharField(
        max_length=20,
        choices=EMPLOYEE_TYPE_CHOICES,
        default='staff',
        verbose_name='Employee Type'
    )

    # ============================================
    # CONTACT
    # ============================================
    email = models.EmailField(blank=True, verbose_name='Email')
    phone = models.CharField(max_length=20, verbose_name='Phone')
    address = models.TextField(blank=True, verbose_name='Address')

    # ============================================
    # DATES
    # ============================================
    joining_date = models.DateField(verbose_name='Joining Date')
    leaving_date = models.DateField(
        null=True,
        blank=True,
        verbose_name='Leaving Date'
    )

    # ============================================
    # PROJECT ASSIGNMENT
    # ============================================
    assigned_project = models.ForeignKey(
        Project,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employees',
        verbose_name='Assigned Project'
    )
    project_role = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Role in Project',
        help_text='e.g., Research Assistant, Lab Assistant'
    )
    manpower_type = models.CharField(
        max_length=20,
        choices=MANPOWER_TYPE_CHOICES,
        default='full_time',
        verbose_name='Manpower Type'
    )

    # ============================================
    # BANK DETAILS
    # ============================================
    bank_name = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Bank Name'
    )
    account_number = models.CharField(
        max_length=50,
        blank=True,
        verbose_name='Account Number'
    )
    ifsc_code = models.CharField(
        max_length=20,
        blank=True,
        verbose_name='IFSC Code'
    )
    bank_branch = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Bank Branch'
    )
    account_type = models.CharField(
        max_length=20,
        choices=ACCOUNT_TYPE_CHOICES,
        blank=True,
        verbose_name='Account Type'
    )

    # ============================================
    # STATUS
    # ============================================
    is_active = models.BooleanField(
        default=True,
        verbose_name='Is Active'
    )

    class Meta:
        db_table = 'pims_employees'
        ordering = ['full_name']
        verbose_name = 'Employee'
        verbose_name_plural = 'Employees'

    def __str__(self):
        return f"{self.employee_code} — {self.full_name}"

    def save(self, *args, **kwargs):
        # Auto-generate employee code if not provided
        if not self.employee_code:
            last = Employee.objects.order_by('-id').first()
            if last and last.employee_code:
                try:
                    num = int(last.employee_code.split('-')[1])
                    new_num = num + 1
                except (IndexError, ValueError):
                    new_num = 1
            else:
                new_num = 1
            self.employee_code = f"EMP-{new_num:06d}"
        super().save(*args, **kwargs)