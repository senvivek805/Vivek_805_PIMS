from django.db import models

from core.models import BaseModel
from projects.models import Project


# ============================================
# FUND RECEIPT
# ============================================

class FundReceipt(BaseModel):
    """
    Fund Receipt — project ke liye milne wala fund record.
    """
    FUND_TYPE_CHOICES = [
        ('grant', 'Grant'),
        ('consultancy', 'Consultancy'),
        ('donation', 'Donation'),
        ('sponsored', 'Sponsored Project'),
        ('seed', 'Seed Money'),
        ('infra', 'Infrastructure'),
        ('other', 'Other'),
    ]

    project = models.ForeignKey(
        Project,
        on_delete=models.PROTECT,
        related_name='fund_receipts',
        verbose_name='Project'
    )

    financial_year = models.CharField(
        max_length=20,
        verbose_name='Financial Year',
        help_text='Format: 2024-25, 2025-26, etc.'
    )

    receipt_date = models.DateField(verbose_name='Receipt Date')

    receipt_reference_no = models.CharField(
        max_length=100,
        verbose_name='Reference No.',
        help_text='Bank reference / cheque no. / transaction ID'
    )

    fund_type = models.CharField(
        max_length=20,
        choices=FUND_TYPE_CHOICES,
        default='grant',
        verbose_name='Fund Type'
    )

    amount_received = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        verbose_name='Amount Received (₹)'
    )

    remarks = models.TextField(blank=True, verbose_name='Remarks')

    class Meta:
        db_table = 'pims_fund_receipts'
        ordering = ['-receipt_date', '-created_at']
        verbose_name = 'Fund Receipt'
        verbose_name_plural = 'Fund Receipts'

    def __str__(self):
        return f"{self.receipt_reference_no} — ₹{self.amount_received} ({self.project.project_code})"

    @property
    def total_breakup_amount(self):
        """Kitna breakup ho gaya."""
        from django.db.models import Sum
        total = self.breakups.filter(is_deleted=False).aggregate(
            total=Sum('amount')
        )['total'] or 0
        return total

    @property
    def remaining_amount(self):
        """Kitna breakup baaki hai."""
        return (self.amount_received or 0) - self.total_breakup_amount

    @property
    def breakup_percentage(self):
        """Kitna % breakup hua."""
        if not self.amount_received:
            return 0
        return (self.total_breakup_amount / self.amount_received) * 100


# ============================================
# BUDGET CATEGORY (Recurring / Non-Recurring)
# ============================================

class BudgetCategory(BaseModel):
    """
    Budget Category — Recurring or Non-Recurring.
    Ye 2 fixed categories hain (Admin se editable).
    """
    name = models.CharField(
        max_length=50,
        unique=True,
        verbose_name='Name',
        help_text='e.g., Recurring, Non-Recurring'
    )
    code = models.CharField(
        max_length=20,
        unique=True,
        verbose_name='Code',
        help_text='e.g., REC, NON_REC'
    )
    description = models.TextField(blank=True, verbose_name='Description')
    order = models.IntegerField(
        default=0,
        verbose_name='Display Order',
        help_text='Chhota number pehle dikhega'
    )

    class Meta:
        db_table = 'pims_budget_categories'
        ordering = ['order', 'name']
        verbose_name = 'Budget Category'
        verbose_name_plural = 'Budget Categories'

    def __str__(self):
        return f"{self.name} ({self.code})"


# ============================================
# BUDGET HEAD (Manpower, Travel, Equipment, etc.)
# ============================================

class BudgetHead(BaseModel):
    """
    Budget Head — Fund allocation ke heads (Manpower, Travel, Equipment, etc.)
    Admin se editable — add/edit/delete.
    """
    category = models.ForeignKey(
        BudgetCategory,
        on_delete=models.PROTECT,
        related_name='budget_heads',
        verbose_name='Budget Category',
        help_text='Recurring ya Non-Recurring'
    )
    name = models.CharField(
        max_length=200,
        verbose_name='Name',
        help_text='e.g., Manpower/Fellowship, Travel, Equipment'
    )
    code = models.CharField(
        max_length=50,
        unique=True,
        verbose_name='Code',
        help_text='e.g., MANPOWER, TRAVEL, EQUIPMENT'
    )
    description = models.TextField(blank=True, verbose_name='Description')
    order = models.IntegerField(
        default=0,
        verbose_name='Display Order',
        help_text='Chhota number pehle dikhega'
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name='Active',
        help_text='Inactive heads breakup form me nahi dikhenge'
    )

    class Meta:
        db_table = 'pims_budget_heads'
        ordering = ['category__order', 'order', 'name']
        verbose_name = 'Budget Head'
        verbose_name_plural = 'Budget Heads'

    def __str__(self):
        return f"{self.name} ({self.category.code})"


# ============================================
# FUND BREAKUP (Actual allocation)
# ============================================

class FundBreakup(BaseModel):
    """
    Fund Breakup — Fund Receipt ka allocation Budget Head me.
    Ek receipt me multiple breakups ho sakte hain.
    """
    fund_receipt = models.ForeignKey(
        FundReceipt,
        on_delete=models.CASCADE,
        related_name='breakups',
        verbose_name='Fund Receipt'
    )
    category = models.ForeignKey(
        BudgetCategory,
        on_delete=models.PROTECT,
        related_name='breakups',
        verbose_name='Category',
        help_text='Auto-fill hoga Budget Head se'
    )
    budget_head = models.ForeignKey(
        BudgetHead,
        on_delete=models.PROTECT,
        related_name='breakups',
        verbose_name='Budget Head'
    )
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        verbose_name='Allocated Amount (₹)'
    )
    spent_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name='Spent Amount (₹)',
        help_text='Auto-updated from Form 5 bills'
    )
    remarks = models.TextField(blank=True, verbose_name='Remarks')

    class Meta:
        db_table = 'pims_fund_breakups'
        ordering = ['category__order', 'budget_head__order', 'id']
        verbose_name = 'Fund Breakup'
        verbose_name_plural = 'Fund Breakups'

    def __str__(self):
        return f"{self.fund_receipt.receipt_reference_no} — {self.budget_head.name}: ₹{self.amount}"

    def save(self, *args, **kwargs):
        # Auto-fill category from budget_head
        if self.budget_head and not self.category:
            self.category = self.budget_head.category
        super().save(*args, **kwargs)

    @property
    def balance(self):
        """Kitna amount bacha hai."""
        return float(self.amount or 0) - float(self.spent_amount or 0)

    @property
    def utilization_percentage(self):
        """Kitna % utilize hua."""
        if not self.amount:
            return 0
        return (float(self.spent_amount or 0) / float(self.amount)) * 100

    @property
    def is_fully_utilized(self):
        """Poora amount khatam ho gaya?"""
        return float(self.spent_amount or 0) >= float(self.amount or 0)