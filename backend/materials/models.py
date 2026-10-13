from django.db import models

from core.models import BaseModel


# ============================================
# MATERIAL CATEGORY
# ============================================

class MaterialCategory(BaseModel):
    """
    Material Category — Electronics, Stationery, Chemicals, etc.
    """
    name = models.CharField(
        max_length=200,
        unique=True,
        verbose_name='Category Name'
    )
    code = models.CharField(
        max_length=50,
        unique=True,
        verbose_name='Category Code',
        help_text='e.g., ELEC, STAT, CHEM'
    )
    description = models.TextField(
        blank=True,
        verbose_name='Description'
    )
    order = models.IntegerField(
        default=0,
        verbose_name='Display Order'
    )

    class Meta:
        db_table = 'pims_material_categories'
        ordering = ['order', 'name']
        verbose_name = 'Material Category'
        verbose_name_plural = 'Material Categories'

    def __str__(self):
        return f"{self.code} — {self.name}"


# ============================================
# MATERIAL
# ============================================

class Material(BaseModel):
    """
    Material Master — all items/materials used in projects.
    """
    UNIT_CHOICES = [
        ('piece', 'Piece'),
        ('set', 'Set'),
        ('box', 'Box'),
        ('kg', 'Kilogram'),
        ('gram', 'Gram'),
        ('litre', 'Litre'),
        ('ml', 'Millilitre'),
        ('meter', 'Meter'),
        ('cm', 'Centimeter'),
        ('job', 'Job'),
        ('packet', 'Packet'),
        ('roll', 'Roll'),
        ('other', 'Other'),
    ]

    GST_RATE_CHOICES = [
        (0, '0% (Exempt)'),
        (5, '5%'),
        (12, '12%'),
        (18, '18%'),
        (28, '28%'),
    ]

    # ============================================
    # BASIC INFO
    # ============================================
    material_code = models.CharField(
        max_length=50,
        unique=True,
        verbose_name='Material Code',
        help_text='Auto-generated: MAT-000001'
    )
    material_name = models.CharField(
        max_length=300,
        verbose_name='Material Name'
    )
    category = models.ForeignKey(
        MaterialCategory,
        on_delete=models.PROTECT,
        related_name='materials',
        verbose_name='Category',
        null=True,
        blank=True
    )

    # ============================================
    # UNIT & GST
    # ============================================
    unit = models.CharField(
        max_length=20,
        choices=UNIT_CHOICES,
        default='piece',
        verbose_name='Unit'
    )
    hsn_code = models.CharField(
        max_length=20,
        blank=True,
        verbose_name='HSN Code',
        help_text='Harmonized System Nomenclature code'
    )
    gst_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=18,
        choices=GST_RATE_CHOICES,
        verbose_name='GST Rate (%)'
    )

    # ============================================
    # EXTRA
    # ============================================
    description = models.TextField(
        blank=True,
        verbose_name='Description'
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name='Is Active'
    )

    class Meta:
        db_table = 'pims_materials'
        ordering = ['material_name']
        verbose_name = 'Material'
        verbose_name_plural = 'Materials'

    def __str__(self):
        return f"{self.material_code} — {self.material_name}"

    def save(self, *args, **kwargs):
        # Auto-generate material code if not provided
        if not self.material_code:
            last = Material.objects.order_by('-id').first()
            if last and last.material_code:
                try:
                    num = int(last.material_code.split('-')[1])
                    new_num = num + 1
                except (IndexError, ValueError):
                    new_num = 1
            else:
                new_num = 1
            self.material_code = f"MAT-{new_num:06d}"
        super().save(*args, **kwargs)

    @property
    def total_received(self):
        """
        Total quantity received via Material Receipts.
        """
        from django.db.models import Sum
        total = self.receipt_items.filter(
            is_deleted=False,
            material_receipt__is_deleted=False,
        ).aggregate(
            total=Sum('received_quantity')
        )['total'] or 0
        return float(total)

    @property
    def total_issued(self):
        """
        Total quantity issued via Material Issues.
        """
        from django.db.models import Sum
        total = self.issue_items.filter(
            is_deleted=False,
            material_issue__is_deleted=False,
        ).aggregate(
            total=Sum('quantity')
        )['total'] or 0
        return float(total)

    @property
    def total_returned(self):
        """
        Total quantity returned (only 'good' condition).
        """
        from django.db.models import Sum
        total = self.return_items.filter(
            is_deleted=False,
            condition='good',
            material_return__is_deleted=False,
        ).aggregate(
            total=Sum('quantity')
        )['total'] or 0
        return float(total)

    @property
    def current_stock(self):
        """
        Current stock = Total Received - Total Issued + Total Returned (good).
        """
        return self.total_received - self.total_issued + self.total_returned


# ============================================
# MATERIAL RECEIPT
# ============================================

class MaterialReceipt(BaseModel):
    """
    Material Receipt — PO ke against material receive karna.
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('partial', 'Partial Received'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    # ============================================
    # BASIC INFO
    # ============================================
    receipt_no = models.CharField(
        max_length=50,
        unique=True,
        verbose_name='Receipt No.',
        help_text='Auto-generated: MR-2026-0001'
    )
    receipt_date = models.DateField(verbose_name='Receipt Date')

    # ============================================
    # RELATIONS
    # ============================================
    purchase_order = models.ForeignKey(
        'purchase.PurchaseOrder',
        on_delete=models.PROTECT,
        related_name='material_receipts',
        verbose_name='Purchase Order'
    )
    vendor = models.ForeignKey(
        'vendors.Vendor',
        on_delete=models.PROTECT,
        related_name='material_receipts',
        verbose_name='Vendor'
    )
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.PROTECT,
        related_name='material_receipts',
        verbose_name='Project',
        null=True,
        blank=True
    )

    # ============================================
    # EXTRA
    # ============================================
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        verbose_name='Status'
    )
    remarks = models.TextField(blank=True, verbose_name='Remarks')

    class Meta:
        db_table = 'pims_material_receipts'
        ordering = ['-receipt_date', '-created_at']
        verbose_name = 'Material Receipt'
        verbose_name_plural = 'Material Receipts'

    def __str__(self):
        return f"{self.receipt_no} — {self.vendor.vendor_name}"

    def save(self, *args, **kwargs):
        # Auto-generate receipt number
        if not self.receipt_no:
            from django.utils import timezone
            year = timezone.now().year
            last = MaterialReceipt.objects.filter(
                receipt_no__startswith=f'MR-{year}-'
            ).order_by('-id').first()

            if last and last.receipt_no:
                try:
                    num = int(last.receipt_no.split('-')[-1])
                    new_num = num + 1
                except (IndexError, ValueError):
                    new_num = 1
            else:
                new_num = 1

            self.receipt_no = f"MR-{year}-{new_num:04d}"

        super().save(*args, **kwargs)

    @property
    def item_count(self):
        return self.items.filter(is_deleted=False).count()

    @property
    def total_received_qty(self):
        from django.db.models import Sum
        total = self.items.filter(is_deleted=False).aggregate(
            total=Sum('received_quantity')
        )['total'] or 0
        return total


# ============================================
# MATERIAL RECEIPT ITEM
# ============================================

class MaterialReceiptItem(BaseModel):
    """
    Material Receipt Item — ek receipt me multiple items.
    """
    material_receipt = models.ForeignKey(
        MaterialReceipt,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='Material Receipt'
    )
    po_item = models.ForeignKey(
        'purchase.PurchaseOrderItem',
        on_delete=models.PROTECT,
        related_name='receipt_items',
        verbose_name='PO Item',
        null=True,
        blank=True
    )
    material = models.ForeignKey(
        Material,
        on_delete=models.PROTECT,
        related_name='receipt_items',
        verbose_name='Material',
        null=True,
        blank=True,
        help_text='Optional link to Material Master'
    )

    # ============================================
    # QUANTITY
    # ============================================
    item_name = models.CharField(
        max_length=300,
        verbose_name='Item Name',
        help_text='From PO (auto-fill)'
    )
    ordered_quantity = models.DecimalField(
        max_digits=15,
        decimal_places=3,
        default=0,
        verbose_name='Ordered Qty'
    )
    received_quantity = models.DecimalField(
        max_digits=15,
        decimal_places=3,
        default=0,
        verbose_name='Received Qty'
    )
    unit = models.CharField(
        max_length=30,
        blank=True,
        verbose_name='Unit'
    )

    # ============================================
    # EXTRA
    # ============================================
    remarks = models.TextField(blank=True, verbose_name='Remarks')

    class Meta:
        db_table = 'pims_material_receipt_items'
        ordering = ['id']
        verbose_name = 'Material Receipt Item'
        verbose_name_plural = 'Material Receipt Items'

    def __str__(self):
        return f"{self.item_name[:50]} — {self.received_quantity} {self.unit}"

    @property
    def pending_quantity(self):
        """How much is still pending."""
        return float(self.ordered_quantity or 0) - float(self.received_quantity or 0)

    def save(self, *args, **kwargs):
        """
        Auto-update PO item's received_quantity when receipt item is saved.
        Also check if PO can be marked as completed.
        """
        super().save(*args, **kwargs)

        # Update PO item's received_quantity
        if self.po_item:
            from django.db.models import Sum
            total_received = MaterialReceiptItem.objects.filter(
                po_item=self.po_item,
                is_deleted=False,
                material_receipt__is_deleted=False,
            ).aggregate(
                total=Sum('received_quantity')
            )['total'] or 0

            # Update PO item
            self.po_item.received_quantity = total_received
            self.po_item.save(update_fields=['received_quantity'])

            # Check if PO can be marked as completed
            try:
                self.po_item.purchase_order.check_and_update_status()
            except Exception:
                # Silently ignore — don't break receipt save
                pass


# ============================================
# MATERIAL ISSUE
# ============================================

class MaterialIssue(BaseModel):
    """
    Material Issue — employee ko material issue karna.
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('issued', 'Issued'),
        ('returned', 'Returned'),
        ('cancelled', 'Cancelled'),
    ]

    # ============================================
    # BASIC INFO
    # ============================================
    issue_no = models.CharField(
        max_length=50,
        unique=True,
        verbose_name='Issue No.',
        help_text='Auto-generated: MI-2026-0001'
    )
    issue_date = models.DateField(verbose_name='Issue Date')

    # ============================================
    # RELATIONS
    # ============================================
    issued_to = models.ForeignKey(
        'employees.Employee',
        on_delete=models.PROTECT,
        related_name='material_issues',
        verbose_name='Issued To',
        help_text='Employee who received the material'
    )
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.PROTECT,
        related_name='material_issues',
        verbose_name='Project',
        null=True,
        blank=True
    )
    purchase_order = models.ForeignKey(
        'purchase.PurchaseOrder',
        on_delete=models.PROTECT,
        related_name='material_issues',
        verbose_name='Purchase Order',
        null=True,
        blank=True,
        help_text='Optional — which PO this material was issued against'
    )

    # ============================================
    # EXTRA
    # ============================================
    purpose = models.TextField(
        blank=True,
        verbose_name='Purpose',
        help_text='For what purpose it was issued'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        verbose_name='Status'
    )
    remarks = models.TextField(blank=True, verbose_name='Remarks')

    class Meta:
        db_table = 'pims_material_issues'
        ordering = ['-issue_date', '-created_at']
        verbose_name = 'Material Issue'
        verbose_name_plural = 'Material Issues'

    def __str__(self):
        return f"{self.issue_no} — {self.issued_to.employee_name}"

    def save(self, *args, **kwargs):
        # Auto-generate issue number
        if not self.issue_no:
            from django.utils import timezone
            year = timezone.now().year
            last = MaterialIssue.objects.filter(
                issue_no__startswith=f'MI-{year}-'
            ).order_by('-id').first()

            if last and last.issue_no:
                try:
                    num = int(last.issue_no.split('-')[-1])
                    new_num = num + 1
                except (IndexError, ValueError):
                    new_num = 1
            else:
                new_num = 1

            self.issue_no = f"MI-{year}-{new_num:04d}"

        super().save(*args, **kwargs)

    @property
    def item_count(self):
        return self.items.filter(is_deleted=False).count()

    @property
    def total_issued_qty(self):
        from django.db.models import Sum
        total = self.items.filter(is_deleted=False).aggregate(
            total=Sum('quantity')
        )['total'] or 0
        return total


# ============================================
# MATERIAL ISSUE ITEM
# ============================================

class MaterialIssueItem(BaseModel):
    """
    Material Issue Item — ek issue me multiple items.
    """
    material_issue = models.ForeignKey(
        MaterialIssue,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='Material Issue'
    )
    material = models.ForeignKey(
        Material,
        on_delete=models.PROTECT,
        related_name='issue_items',
        verbose_name='Material',
        help_text='Link to Material Master'
    )

    # ============================================
    # QUANTITY
    # ============================================
    quantity = models.DecimalField(
        max_digits=15,
        decimal_places=3,
        default=0,
        verbose_name='Quantity'
    )
    unit = models.CharField(
        max_length=30,
        blank=True,
        verbose_name='Unit'
    )

    # ============================================
    # EXTRA
    # ============================================
    remarks = models.TextField(blank=True, verbose_name='Remarks')

    class Meta:
        db_table = 'pims_material_issue_items'
        ordering = ['id']
        verbose_name = 'Material Issue Item'
        verbose_name_plural = 'Material Issue Items'

    def __str__(self):
        return f"{self.material.material_name[:50]} — {self.quantity} {self.unit}"
    

# ============================================
# MATERIAL RETURN NOTE (MRN)
# ============================================

class MaterialReturnNote(BaseModel):
    """
    Material Return Note — employee se material wapas lena.
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('returned', 'Returned'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    # ============================================
    # BASIC INFO
    # ============================================
    mrn_no = models.CharField(
        max_length=50,
        unique=True,
        verbose_name='MRN No.',
        help_text='Auto-generated: MRN-2026-0001'
    )
    return_date = models.DateField(verbose_name='Return Date')

    # ============================================
    # RELATIONS
    # ============================================
    material_issue = models.ForeignKey(
        MaterialIssue,
        on_delete=models.PROTECT,
        related_name='return_notes',
        verbose_name='Material Issue',
        help_text='Kis issue se material wapas aaya',
        null=True,
        blank=True
    )
    returned_by = models.ForeignKey(
        'employees.Employee',
        on_delete=models.PROTECT,
        related_name='material_returns',
        verbose_name='Returned By',
        help_text='Employee who returned the material'
    )
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.PROTECT,
        related_name='material_returns',
        verbose_name='Project',
        null=True,
        blank=True
    )

    # ============================================
    # EXTRA
    # ============================================
    reason = models.TextField(
        blank=True,
        verbose_name='Reason for Return',
        help_text='Why material is being returned'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        verbose_name='Status'
    )
    remarks = models.TextField(blank=True, verbose_name='Remarks')

    class Meta:
        db_table = 'pims_material_return_notes'
        ordering = ['-return_date', '-created_at']
        verbose_name = 'Material Return Note'
        verbose_name_plural = 'Material Return Notes'

    def __str__(self):
        return f"{self.mrn_no} — {self.returned_by.full_name}"

    def save(self, *args, **kwargs):
        # Auto-generate MRN number
        if not self.mrn_no:
            from django.utils import timezone
            year = timezone.now().year
            last = MaterialReturnNote.objects.filter(
                mrn_no__startswith=f'MRN-{year}-'
            ).order_by('-id').first()

            if last and last.mrn_no:
                try:
                    num = int(last.mrn_no.split('-')[-1])
                    new_num = num + 1
                except (IndexError, ValueError):
                    new_num = 1
            else:
                new_num = 1

            self.mrn_no = f"MRN-{year}-{new_num:04d}"

        super().save(*args, **kwargs)

    @property
    def item_count(self):
        return self.items.filter(is_deleted=False).count()

    @property
    def total_returned_qty(self):
        from django.db.models import Sum
        total = self.items.filter(is_deleted=False).aggregate(
            total=Sum('quantity')
        )['total'] or 0
        return total


# ============================================
# MATERIAL RETURN NOTE ITEM
# ============================================

class MaterialReturnNoteItem(BaseModel):
    """
    Material Return Note Item — ek MRN me multiple items.
    """
    CONDITION_CHOICES = [
        ('good', 'Good'),
        ('damaged', 'Damaged'),
        ('lost', 'Lost'),
    ]

    material_return = models.ForeignKey(
        MaterialReturnNote,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='Material Return Note'
    )
    material = models.ForeignKey(
        Material,
        on_delete=models.PROTECT,
        related_name='return_items',
        verbose_name='Material',
        help_text='Link to Material Master'
    )

    # ============================================
    # QUANTITY
    # ============================================
    quantity = models.DecimalField(
        max_digits=15,
        decimal_places=3,
        default=0,
        verbose_name='Returned Quantity'
    )
    unit = models.CharField(
        max_length=30,
        blank=True,
        verbose_name='Unit'
    )

    # ============================================
    # CONDITION
    # ============================================
    condition = models.CharField(
        max_length=20,
        choices=CONDITION_CHOICES,
        default='good',
        verbose_name='Condition',
        help_text='Good / Damaged / Lost'
    )

    # ============================================
    # EXTRA
    # ============================================
    remarks = models.TextField(blank=True, verbose_name='Remarks')

    class Meta:
        db_table = 'pims_material_return_note_items'
        ordering = ['id']
        verbose_name = 'Material Return Note Item'
        verbose_name_plural = 'Material Return Note Items'

    def __str__(self):
        return f"{self.material.material_name[:50]} — {self.quantity} {self.unit}"

    def save(self, *args, **kwargs):
        """
        When return item is saved:
        - If condition is 'good', add quantity back to stock.
        - If damaged/lost, don't add back (they are not usable).
        """
        super().save(*args, **kwargs)