from django.db import models

from core.models import BaseModel
from projects.models import Project
from vendors.models import Vendor
from funds.models import BudgetHead


# ============================================
# CONSTANTS
# ============================================

IIT_BHU_STATE = "Uttar Pradesh"


# ============================================
# PURCHASE ORDER
# ============================================

class PurchaseOrder(BaseModel):
    """
    Purchase Order — IIT(BHU) Annexure-IV format.
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('approved', 'Approved'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    TC_TEMPLATE_CHOICES = [
        ('material', 'Material Purchase'),
        ('service', 'Service / Consultancy'),
        ('custom', 'Custom'),
    ]

    # ============================================
    # BASIC INFO
    # ============================================
    po_number = models.CharField(
        max_length=200,
        unique=True,
        verbose_name='Order No.',
        help_text='e.g., IIT(BHU)/CE/DSS/PO-26-27/04'
    )
    po_date = models.DateField(verbose_name='Date')

    # ============================================
    # HEADER — Department Details
    # ============================================
    department_school = models.CharField(
        max_length=200,
        verbose_name='Department/School',
        help_text='e.g., Civil Engineering'
    )
    approximate_cost = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name='Approximate Cost (₹)'
    )
    major_budget_head = models.CharField(
        max_length=300,
        blank=True,
        verbose_name='Major Budget Head',
        help_text='e.g., National Ganga Plan - 4066'
    )
    minor_budget_head = models.CharField(
        max_length=400,
        blank=True,
        verbose_name='Minor Budget Head',
        help_text='e.g., R&D/TSA/4066/NMCG/Civil/24-25/13/636'
    )
    budget_grant = models.CharField(
        max_length=300,
        blank=True,
        verbose_name='Budget Grant Rs.'
    )
    amount_spent = models.CharField(
        max_length=300,
        blank=True,
        verbose_name='Amount spent including commitments'
    )
    balance_available = models.CharField(
        max_length=300,
        blank=True,
        verbose_name='Balance available Rs.'
    )

    # ============================================
    # RELATIONS
    # ============================================
    project = models.ForeignKey(
        Project,
        on_delete=models.PROTECT,
        related_name='purchase_orders',
        verbose_name='Project',
        null=True,
        blank=True
    )
    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.PROTECT,
        related_name='purchase_orders',
        verbose_name='Vendor'
    )
    budget_head = models.ForeignKey(
        BudgetHead,
        on_delete=models.PROTECT,
        related_name='purchase_orders',
        null=True,
        blank=True,
        verbose_name='Budget Head (Fund)',
        help_text='Fund breakup se link (optional)'
    )

    # ============================================
    # SUBJECT & BODY
    # ============================================
    subject = models.CharField(
        max_length=300,
        blank=True,
        verbose_name='Subject'
    )
    body_description = models.TextField(
        blank=True,
        verbose_name='Description'
    )

    # ============================================
    # TERMS & CONDITIONS
    # ============================================
    tc_template = models.CharField(
        max_length=20,
        choices=TC_TEMPLATE_CHOICES,
        default='material',
        verbose_name='T&C Template'
    )
    terms_conditions = models.TextField(
        blank=True,
        verbose_name='Terms & Conditions'
    )

    # ============================================
    # FINANCIAL (Auto-calculated)
    # ============================================
    subtotal = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name='Subtotal (Base Amount) (₹)'
    )
    cgst_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name='Total CGST (₹)'
    )
    sgst_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name='Total SGST (₹)'
    )
    igst_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name='Total IGST (₹)'
    )
    gst_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name='Total GST (₹)',
        help_text='CGST + SGST + IGST'
    )
    grand_total = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name='Grand Total (₹)'
    )
    in_words = models.CharField(
        max_length=500,
        blank=True,
        verbose_name='In Words'
    )

    # ============================================
    # GST TYPE (auto-detected from vendor state)
    # ============================================
    gst_type = models.CharField(
        max_length=20,
        choices=[
            ('cgst_sgst', 'CGST + SGST (Intra-State)'),
            ('igst', 'IGST (Inter-State)'),
        ],
        default='cgst_sgst',
        verbose_name='GST Type'
    )

    # ============================================
    # STATUS
    # ============================================
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        verbose_name='Status'
    )

    # ============================================
    # EXTRA
    # ============================================
    reference_no = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Reference No.'
    )
    remarks = models.TextField(blank=True, verbose_name='Remarks')

    class Meta:
        db_table = 'pims_purchase_orders'
        ordering = ['-po_date', '-created_at']
        verbose_name = 'Purchase Order'
        verbose_name_plural = 'Purchase Orders'

    def __str__(self):
        return f"{self.po_number} — {self.vendor.vendor_name}"

    def detect_gst_type(self):
        """Compare vendor state with IIT(BHU) state to decide GST type."""
        if self.vendor and self.vendor.state:
            if self.vendor.state.strip().lower() == IIT_BHU_STATE.strip().lower():
                return 'cgst_sgst'
            else:
                return 'igst'
        return 'cgst_sgst'

    def calculate_totals(self):
        """
        Subtotal, CGST, SGST, IGST, Grand Total, In Words — auto calculate.
        """
        from num2words import num2words

        self.gst_type = self.detect_gst_type()

        items = self.items.filter(is_deleted=False)

        subtotal = 0
        cgst_total = 0
        sgst_total = 0
        igst_total = 0

        for item in items:
            qty = float(item.quantity or 0)
            rate = float(item.rate or 0)
            base = qty * rate
            gst_rate = float(item.gst_rate or 0)

            subtotal += base

            if self.gst_type == 'cgst_sgst':
                cgst = (base * (gst_rate / 2)) / 100
                sgst = (base * (gst_rate / 2)) / 100
                cgst_total += cgst
                sgst_total += sgst
            else:
                igst = (base * gst_rate) / 100
                igst_total += igst

        gst_total = cgst_total + sgst_total + igst_total
        grand = subtotal + gst_total

        self.subtotal = subtotal
        self.cgst_amount = cgst_total
        self.sgst_amount = sgst_total
        self.igst_amount = igst_total
        self.gst_amount = gst_total
        self.grand_total = grand

        try:
            rupees = int(grand)
            paise = int(round((grand - rupees) * 100))

            words = num2words(rupees, lang='en_IN').title()

            if paise > 0:
                paise_words = num2words(paise, lang='en_IN').title()
                self.in_words = f"Rupees {words} and {paise_words} Paise Only"
            else:
                self.in_words = f"Rupees {words} Only"
        except Exception:
            self.in_words = ""

        self.save(update_fields=[
            'subtotal',
            'cgst_amount', 'sgst_amount', 'igst_amount',
            'gst_amount', 'grand_total', 'in_words', 'gst_type'
        ])

    @property
    def item_count(self):
        return self.items.filter(is_deleted=False).count()

    @property
    def received_items_count(self):
        """
        How many items are fully received.
        """
        items = self.items.filter(is_deleted=False)
        count = 0
        for item in items:
            ordered = float(item.quantity or 0)
            received = float(item.received_quantity or 0)
            if received >= ordered:
                count += 1
        return count

    @property
    def total_items_count(self):
        """
        Total items in this PO.
        """
        return self.items.filter(is_deleted=False).count()

    @property
    def received_status(self):
        """
        String representation: '0/10', '8/10', '10/10'
        """
        total = self.total_items_count
        if total == 0:
            return "0/0"
        return f"{self.received_items_count}/{total}"

    @property
    def is_fully_received(self):
        """
        True if all items are fully received.
        """
        total = self.total_items_count
        if total == 0:
            return False
        return self.received_items_count == total

    def check_and_update_status(self):
        """
        Check if all items are fully received.
        If yes, update status to 'completed'.
        Only works for 'draft' and 'approved' statuses.
        """
        if self.status in ['cancelled', 'completed']:
            return False

        items = self.items.filter(is_deleted=False)

        if not items.exists():
            return False

        all_received = True
        for item in items:
            ordered = float(item.quantity or 0)
            received = float(item.received_quantity or 0)
            if received < ordered:
                all_received = False
                break

        if all_received:
            self.status = 'completed'
            self.save(update_fields=['status'])
            return True

        return False


# ============================================
# PURCHASE ORDER ITEM
# ============================================

class PurchaseOrderItem(BaseModel):
    """
    Purchase Order line item — IIT(BHU) format.
    """
    GST_RATE_CHOICES = [
        (0, '0% (Exempt)'),
        (5, '5%'),
        (12, '12%'),
        (18, '18%'),
        (28, '28%'),
    ]

    ITEM_TYPE_CHOICES = [
        ('material', 'Material'),
        ('service', 'Service'),
    ]

    purchase_order = models.ForeignKey(
        PurchaseOrder,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='Purchase Order'
    )

    # ============================================
    # ITEM TYPE & MATERIAL LINK
    # ============================================
    item_type = models.CharField(
        max_length=20,
        choices=ITEM_TYPE_CHOICES,
        default='material',
        verbose_name='Item Type',
        help_text='Material = stock item, Service = job/work'
    )
    material = models.ForeignKey(
        'materials.Material',
        on_delete=models.PROTECT,
        related_name='po_items',
        verbose_name='Material',
        null=True,
        blank=True,
        help_text='Required if item_type is material'
    )

    # ============================================
    # ITEM DETAILS
    # ============================================
    item_name = models.TextField(
        verbose_name='Item / Service Description'
    )

    # ============================================
    # QUANTITY & RATE
    # ============================================
    quantity = models.DecimalField(
        max_digits=15,
        decimal_places=3,
        default=1,
        verbose_name='Quantity'
    )
    received_quantity = models.DecimalField(
        max_digits=15,
        decimal_places=3,
        default=0,
        verbose_name='Received Quantity',
        help_text='Auto-updated from Material Receipts'
    )
    unit = models.CharField(
        max_length=30,
        blank=True,
        verbose_name='Unit',
        help_text='e.g., Job, Piece, Kg, Litre'
    )
    rate = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name='Rate (₹)'
    )

    # ============================================
    # GST RATE
    # ============================================
    gst_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=18,
        choices=GST_RATE_CHOICES,
        verbose_name='GST Rate (%)',
        help_text='5, 12, 18, 28'
    )

    # ============================================
    # GST AMOUNTS (auto-calculated)
    # ============================================
    cgst_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name='CGST (₹)'
    )
    sgst_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name='SGST (₹)'
    )
    igst_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name='IGST (₹)'
    )
    gst_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name='Total GST (₹)'
    )

    # ============================================
    # LINE TOTAL
    # ============================================
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name='Amount (₹)',
        help_text='Auto: (Qty × Rate) + GST'
    )

    # ============================================
    # ORDER
    # ============================================
    order = models.IntegerField(
        default=0,
        verbose_name='Display Order'
    )

    class Meta:
        db_table = 'pims_purchase_order_items'
        ordering = ['order', 'id']
        verbose_name = 'PO Item'
        verbose_name_plural = 'PO Items'

    def __str__(self):
        return f"{self.item_name[:50]} — {self.quantity} {self.unit} × ₹{self.rate}"

    def save(self, *args, **kwargs):
        """
        Auto-calculate CGST, SGST, IGST, GST, Amount.
        """
        if self.quantity and self.rate:
            base = float(self.quantity) * float(self.rate)
            gst_rate = float(self.gst_rate or 0)

            gst_type = 'cgst_sgst'
            if self.purchase_order_id:
                try:
                    gst_type = self.purchase_order.gst_type or 'cgst_sgst'
                except Exception:
                    pass

            if gst_type == 'cgst_sgst':
                cgst = (base * (gst_rate / 2)) / 100
                sgst = (base * (gst_rate / 2)) / 100
                igst = 0
            else:
                cgst = 0
                sgst = 0
                igst = (base * gst_rate) / 100

            self.cgst_amount = cgst
            self.sgst_amount = sgst
            self.igst_amount = igst
            self.gst_amount = cgst + sgst + igst
            self.amount = base + float(self.gst_amount)

        super().save(*args, **kwargs)