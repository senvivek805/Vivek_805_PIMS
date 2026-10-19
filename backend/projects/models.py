from django.db import models
from django.conf import settings

from core.models import BaseModel


class Agency(BaseModel):
    """
    Funding agency — jaise DST, DBT, CSIR, IIT(BHU) etc.
    """
    name = models.CharField(max_length=200, unique=True)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    contact_person = models.CharField(max_length=200, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)

    class Meta:
        db_table = 'pims_agencies'
        verbose_name_plural = 'Agencies'
        ordering = ['name']

    def __str__(self):
        return f"{self.code} — {self.name}"


class Department(BaseModel):
    """
    Department — jaise CSE, ECE, Mechanical, Civil etc.
    """
    name = models.CharField(max_length=200, unique=True)
    code = models.CharField(max_length=50, unique=True)
    hod_name = models.CharField(max_length=200, blank=True, verbose_name='HOD Name')
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'pims_departments'
        ordering = ['name']

    def __str__(self):
        return f"{self.code} — {self.name}"


class Project(BaseModel):
    """
    Project Master — PIMS ka core table.
    """
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('on_hold', 'On Hold'),
        ('cancelled', 'Cancelled'),
        ('pending', 'Pending Approval'),
    ]

    # Basic Info
    project_code = models.CharField(max_length=50, unique=True)
    project_name = models.CharField(max_length=500)
    description = models.TextField(blank=True)
    total_sanctioned_amount = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=0, 
        verbose_name="Total Sanctioned Amount",
        help_text="Total amount sanctioned by funding agency (e.g., 20000000)"
    )

    # Relations
    agency = models.ForeignKey(
        Agency,
        on_delete=models.PROTECT,
        related_name='projects',
        null=True, blank=True
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        related_name='projects',
        null=True, blank=True
    )

    # Dates
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    # People
    pi_name = models.CharField(max_length=200, verbose_name='Principal Investigator')
    co_pi_name = models.CharField(max_length=200, blank=True, verbose_name='Co-PI')
    coordinator_name = models.CharField(max_length=200, blank=True)

    # Financial
    sanctioned_amount = models.DecimalField(
        max_digits=15, decimal_places=2,
        default=0,
        help_text='Total sanctioned amount (₹)'
    )

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')

    # Extra
    remarks = models.TextField(blank=True)

    class Meta:
        db_table = 'pims_projects'
        ordering = ['-created_at']
        verbose_name = 'Project'
        verbose_name_plural = 'Projects'

    def __str__(self):
        return f"{self.project_code} — {self.project_name}"

    @property
    def duration_days(self):
        """Project kitne din ka hai."""
        if self.start_date and self.end_date:
            return (self.end_date - self.start_date).days
        return None
    

class ProjectPI(BaseModel):
    """
    Project PI / Co-PI / Coordinator — ek project me multiple ho sakte hain.
    """
    ROLE_CHOICES = [
        ('pi', 'Principal Investigator'),
        ('co_pi', 'Co-Principal Investigator'),
        ('coordinator', 'Coordinator'),
        ('mentor', 'Mentor'),
        ('investigator', 'Investigator'),
    ]

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='pis',
        verbose_name='Project'
    )
    name = models.CharField(max_length=200, verbose_name='Name')
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='co_pi',
        verbose_name='Role'
    )
    designation = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Designation',
        help_text='Jaise: Professor, Associate Professor, etc.'
    )
    email = models.EmailField(blank=True, verbose_name='Email')
    phone = models.CharField(max_length=20, blank=True, verbose_name='Phone')
    department = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Department/Institution'
    )
    order = models.IntegerField(
        default=0,
        verbose_name='Display Order',
        help_text='Chhota number pehle dikhega'
    )

    class Meta:
        db_table = 'pims_project_pis'
        ordering = ['order', 'id']
        verbose_name = 'Project PI'
        verbose_name_plural = 'Project PIs'

    def __str__(self):
        return f"{self.name} ({self.get_role_display()}) — {self.project.project_code}"


class ProjectSanctionedHead(BaseModel):
    """
    Project ke andar har Budget Head ka kitna paisa sanctioned hai.
    (e.g., Manpower: 50L, Equipment: 1Cr)
    """
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='sanctioned_heads'
    )
    budget_head = models.ForeignKey(
        'funds.BudgetHead',
        on_delete=models.CASCADE,
        related_name='project_sanctions'
    )
    sanctioned_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name="Sanctioned Amount"
    )

    class Meta:
        db_table = 'pims_project_sanctioned_heads'
        unique_together = ('project', 'budget_head')
        verbose_name = 'Project Sanctioned Head'
        verbose_name_plural = 'Project Sanctioned Heads'

    def __str__(self):
        return f"{self.project.project_code} - {self.budget_head.name} - {self.sanctioned_amount}"