from django.db import models

from core.models import BaseModel


# ============================================
# BILL ENTRY (Form 5)
# ============================================

class BillEntry(BaseModel):
    """
    Bill Entry — Form 5 (Bill for Direct Payment by Finance Section).
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ]

    # ============================================
    # DOCUMENT NUMBER (Auto)
    # ============================================
    document_no = models.CharField(
        max_length=50,
        unique=True,
        verbose_name='Document No.',
        help_text='Auto-generated: PIMS/BILL/2026/0001'
    )

    # ============================================
    # BILL NUMBER (Manual)
    # ============================================
    bill_no = models.CharField(
        max_length=200,
        verbose_name='Bill No.',
        help_text='Manual entry: e.g., IIT(BHU)/CE/SLCR/25-26/001'
    )
    bill_date = models.DateField(verbose_name='Bill Date')

    # ============================================
    # DIARY VOUCHER
    # ============================================
    diary_voucher_no = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Diary Voucher No.'
    )
    diary_voucher_date = models.DateField(
        null=True,
        blank=True,
        verbose_name='Diary Voucher Date'
    )

    # ============================================
    # RELATIONS
    # ============================================
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.PROTECT,
        related_name='bill_entries',
        verbose_name='Project',
        null=True,
        blank=True
    )
    purchase_order = models.ForeignKey(
        'purchase.PurchaseOrder',
        on_delete=models.PROTECT,
        related_name='bill_entries',
        verbose_name='Purchase Order',
        null=True,
        blank=True
    )
    vendor = models.ForeignKey(
        'vendors.Vendor',
        on_delete=models.PROTECT,
        related_name='bill_entries',
        verbose_name='Vendor',
        null=True,
        blank=True
    )
    budget_head = models.ForeignKey(
        'funds.BudgetHead',
        on_delete=models.PROTECT,
        related_name='bill_entries',
        verbose_name='Budget Sub Head',
        null=True,
        blank=True,
        help_text='Manpower / Travel / Equipment etc.'
    )

    # ============================================
    # BUDGET HEADS (Auto-fill from Project)
    # ============================================
    major_budget_head = models.CharField(
        max_length=300,
        blank=True,
        verbose_name='Major Budget Head'
    )
    minor_budget_head = models.CharField(
        max_length=400,
        blank=True,
        verbose_name='Minor Budget Head'
    )
    # ============================================
    # SCHEME & COMPONENT CODE (Optional)
    # ============================================
    scheme_code = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Scheme Code',
        help_text='e.g., 4066'
    )
    component_code = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Component Code',
        help_text='e.g., 6.2.3'
    )
    # ============================================
    # RECIPIENT
    # ============================================
    recipient_name = models.CharField(
        max_length=300,
        verbose_name='Name of Recipient'
    )

    # ============================================
    # PARTICULARS
    # ============================================
    particulars = models.TextField(
        blank=True,
        verbose_name='Particulars',
        help_text='Description of the bill'
    )

        # ============================================
    # VENDOR BILL REFERENCE (Optional)
    # ============================================
    vendor_bill_no = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Vendor Bill No.',
        help_text='Vendor ka apna bill number'
    )
    vendor_bill_date = models.DateField(
        null=True,
        blank=True,
        verbose_name='Vendor Bill Date'
    )

    # ============================================
    # MANPOWER / ABSENTEE (Optional)
    # ============================================
    absentee = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Absentee',
        help_text='e.g., Nil, 2 days'
    )

    # ============================================
    # AMOUNTS
    # ============================================
    bill_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name='Bill Amount (₹)'
    )

    # ============================================
    # DEDUCTION RATES (%)
    # ============================================
    cgst_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        verbose_name='CGST Rate (%)'
    )
    sgst_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        verbose_name='SGST Rate (%)'
    )
    igst_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        verbose_name='IGST Rate (%)'
    )
    tds_gst_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        verbose_name='TDS under GST Rate (%)'
    )
    tds_income_tax_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        verbose_name='Income Tax Deduction Rate (%)'
    )

    # ============================================
    # DEDUCTION AMOUNTS (₹)
    # ============================================
    cgst_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name='CGST Amount (₹)'
    )
    sgst_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name='SGST Amount (₹)'
    )
    igst_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name='IGST Amount (₹)'
    )
    tds_gst = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name='TDS under GST (₹)'
    )
    tds_income_tax = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name='Income Tax Deduction (₹)'
    )
    penalty = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name='Penalty / Other Deduction (₹)'
    )
    penalty_applicable = models.BooleanField(
        default=False,
        verbose_name='Penalty Applicable',
        help_text='As per work/purchase order'
    )

    pbg_security = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name='PBG Security Deduction (₹)'
    )
    pbg_applicable = models.BooleanField(
        default=False,
        verbose_name='PBG Security Applicable',
        help_text='As per work/purchase order'
    )

    # Other charges (No Tax) — e.g., Toll, Parking
    other_charges = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name='Other Charges (No Tax) (₹)',
        help_text='e.g., Toll, Parking (no GST applies)'
    )
    other_charges_remarks = models.CharField(
        max_length=300,
        blank=True,
        verbose_name='Other Charges Remarks',
        help_text='e.g., Toll Tax, Parking Charges'
    )
    total_payable = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name='Total Payable Amount (₹)'
    )
    in_words = models.CharField(
        max_length=500,
        blank=True,
        verbose_name='In Words'
    )

    # ============================================
    # RTGS — BENEFICIARY BANK DETAILS
    # ============================================
    bank_account_name = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Account Name'
    )
    bank_account_no = models.CharField(
        max_length=50,
        blank=True,
        verbose_name='Account Number'
    )
    bank_name = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Bank Name'
    )
    bank_branch = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Branch'
    )
    bank_ifsc = models.CharField(
        max_length=20,
        blank=True,
        verbose_name='IFSC Code'
    )
    bank_account_type = models.CharField(
        max_length=50,
        blank=True,
        verbose_name='Account Type',
        help_text='Savings / Current / Cash Credit'
    )
    bank_address = models.TextField(
        blank=True,
        verbose_name='Bank Address'
    )
    rtgs_purpose = models.CharField(
        max_length=300,
        blank=True,
        verbose_name='RTGS Purpose'
    )

    # ============================================
    # STATUS & EXTRA
    # ============================================
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        verbose_name='Status'
    )
    remarks = models.TextField(blank=True, verbose_name='Remarks')

    class Meta:
        db_table = 'pims_bill_entries'
        ordering = ['-bill_date', '-created_at']
        verbose_name = 'Bill Entry'
        verbose_name_plural = 'Bill Entries'

    def __str__(self):
        return f"{self.bill_no} — {self.recipient_name}"

    def save(self, *args, **kwargs):
        # Auto-generate document number
        if not self.document_no:
            from django.utils import timezone
            year = timezone.now().year
            last = BillEntry.objects.filter(
                document_no__startswith=f'PIMS/BILL/{year}/'
            ).order_by('-id').first()

            if last and last.document_no:
                try:
                    num = int(last.document_no.split('/')[-1])
                    new_num = num + 1
                except (IndexError, ValueError):
                    new_num = 1
            else:
                new_num = 1

            self.document_no = f"PIMS/BILL/{year}/{new_num:04d}"

        # Auto-calculate deduction amounts from rates
        base = float(self.bill_amount or 0)

        # ============================================
        # GST (ADD to base)
        # ============================================
        self.cgst_amount = (base * float(self.cgst_rate or 0)) / 100
        self.sgst_amount = (base * float(self.sgst_rate or 0)) / 100
        self.igst_amount = (base * float(self.igst_rate or 0)) / 100
        total_gst = (
            float(self.cgst_amount or 0)
            + float(self.sgst_amount or 0)
            + float(self.igst_amount or 0)
        )

        # Total Bill Amount = Base + GST + Other Charges
        total_bill = base + total_gst + float(self.other_charges or 0)

        # ============================================
        # TDS under GST (DEDUCT)
        # ============================================
        self.tds_gst = (base * float(self.tds_gst_rate or 0)) / 100

        # ============================================
        # TDS Income Tax (DEDUCT)
        # ============================================
        self.tds_income_tax = (
            base * float(self.tds_income_tax_rate or 0)
        ) / 100

        # ============================================
        # Total Payable = Total Bill - Deductions
        # ============================================
        self.total_payable = (
            total_bill
            - float(self.tds_gst or 0)
            - float(self.tds_income_tax or 0)
            - float(self.penalty or 0)
            - float(self.pbg_security or 0)
        )

        # Auto-generate in_words
        try:
            from num2words import num2words
            total = float(self.total_payable or 0)
            rupees = int(total)
            paise = int(round((total - rupees) * 100))

            words = num2words(rupees, lang='en_IN').title()

            if paise > 0:
                paise_words = num2words(paise, lang='en_IN').title()
                self.in_words = f"Rupees {words} and {paise_words} Paise Only"
            else:
                self.in_words = f"Rupees {words} Only"
        except Exception:
            self.in_words = ""

        super().save(*args, **kwargs)

        # ============================================
        # UPDATE FUND BREAKUP — Budget deduct karo
        # ============================================
        self._update_fund_breakup()

    def _update_fund_breakup(self):
        """
        Form 5 approve hone pe Fund Breakup me spent_amount update karo.
        Sirf approved/paid status pe karo. (Calculation based on Gross Amount)
        """
        from funds.models import FundBreakup
        from django.db.models import Sum, F, Value, DecimalField
        from django.db.models.functions import Coalesce

        if not self.budget_head:
            return

        # Is budget_head ka FundBreakup dhundo
        breakups = FundBreakup.objects.filter(
            budget_head=self.budget_head,
            is_deleted=False,
        )

        if self.project:
            breakups = breakups.filter(
                fund_receipt__project=self.project
            )

        if not breakups.exists():
            return

        # Saare approved/paid bills ka total nikaalo
        approved_bills = BillEntry.objects.filter(
            budget_head=self.budget_head,
            is_deleted=False,
            status__in=['approved', 'paid'],
        )

        if self.project:
            approved_bills = approved_bills.filter(project=self.project)

        # Gross Amount = Base + CGST + SGST + IGST + Other Charges
        total_spent = approved_bills.aggregate(
            total=Sum(
                Coalesce(F('bill_amount'), Value(0)) +
                Coalesce(F('cgst_amount'), Value(0)) +
                Coalesce(F('sgst_amount'), Value(0)) +
                Coalesce(F('igst_amount'), Value(0)) +
                Coalesce(F('other_charges'), Value(0)),
                output_field=DecimalField()
            )
        )['total'] or 0

        # Har breakup me spent_amount update karo
        for breakup in breakups:
            breakup.spent_amount = total_spent
            breakup.save(update_fields=['spent_amount'])

    @property
    def item_count(self):
        return self.items.filter(is_deleted=False).count()


# ============================================
# BILL ENTRY ITEM (Line Items)
# ============================================

class BillEntryItem(BaseModel):
    """
    Bill Entry Item — Form 5 table ki line items.
    """
    bill_entry = models.ForeignKey(
        BillEntry,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='Bill Entry'
    )

    # ============================================
    # LINE ITEM DETAILS
    # ============================================
    date = models.DateField(
        null=True,
        blank=True,
        verbose_name='Date'
    )
    particulars = models.TextField(
        verbose_name='Particulars',
        help_text='Description of this line item'
    )
    amount_rs = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name='Amount (Rs.)'
    )
    amount_paise = models.DecimalField(
        max_digits=2,
        decimal_places=0,
        default=0,
        verbose_name='Amount (Paise)'
    )
    remarks = models.CharField(
        max_length=300,
        blank=True,
        verbose_name='Remarks'
    )

    # ============================================
    # ORDER
    # ============================================
    order = models.IntegerField(
        default=0,
        verbose_name='Display Order'
    )

    class Meta:
        db_table = 'pims_bill_entry_items'
        ordering = ['order', 'id']
        verbose_name = 'Bill Entry Item'
        verbose_name_plural = 'Bill Entry Items'

    def __str__(self):
        return f"{self.particulars[:50]} — ₹{self.amount_rs}"