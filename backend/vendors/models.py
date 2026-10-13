from django.db import models

from core.models import BaseModel


# ============================================
# VENDOR
# ============================================

class Vendor(BaseModel):
    """
    Vendor Master — suppliers, contractors, consultants, service providers.
    """
    VENDOR_TYPE_CHOICES = [
        ('supplier', 'Supplier'),
        ('contractor', 'Contractor'),
        ('consultant', 'Consultant'),
        ('service', 'Service Provider'),
        ('manufacturer', 'Manufacturer'),
        ('other', 'Other'),
    ]

    ACCOUNT_TYPE_CHOICES = [
        ('savings', 'Savings'),
        ('current', 'Current'),
        ('other', 'Other'),
    ]

    # ============================================
    # BASIC INFO
    # ============================================
    vendor_code = models.CharField(
        max_length=50,
        unique=True,
        verbose_name='Vendor Code',
        help_text='Auto-generated: VND-000001'
    )
    reference_no = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Reference No.',
        help_text='Department/Agency ka existing code (optional)'
    )
    vendor_name = models.CharField(
        max_length=300,
        verbose_name='Vendor Name'
    )
    vendor_type = models.CharField(
        max_length=20,
        choices=VENDOR_TYPE_CHOICES,
        default='supplier',
        verbose_name='Vendor Type'
    )
    description = models.TextField(
        blank=True,
        verbose_name='Description'
    )

    # ============================================
    # TAX INFO
    # ============================================
    gst_number = models.CharField(
        max_length=20,
        blank=True,
        verbose_name='GST Number'
    )
    pan_number = models.CharField(
        max_length=20,
        blank=True,
        verbose_name='PAN Number'
    )
    tan_number = models.CharField(
        max_length=20,
        blank=True,
        verbose_name='TAN Number'
    )

    # ============================================
    # ADDRESS
    # ============================================
    address_line1 = models.CharField(
        max_length=300,
        verbose_name='Address Line 1'
    )
    address_line2 = models.CharField(
        max_length=300,
        blank=True,
        verbose_name='Address Line 2'
    )
    city = models.CharField(max_length=100, verbose_name='City')
    state = models.CharField(max_length=100, verbose_name='State')
    pincode = models.CharField(max_length=10, verbose_name='Pincode')
    country = models.CharField(
        max_length=100,
        default='India',
        verbose_name='Country'
    )

    # ============================================
    # CONTACT
    # ============================================
    contact_person = models.CharField(
        max_length=200,
        verbose_name='Contact Person'
    )
    email = models.EmailField(blank=True, verbose_name='Email')
    phone = models.CharField(max_length=20, verbose_name='Phone')
    alternate_phone = models.CharField(
        max_length=20,
        blank=True,
        verbose_name='Alternate Phone'
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
        db_table = 'pims_vendors'
        ordering = ['vendor_name']
        verbose_name = 'Vendor'
        verbose_name_plural = 'Vendors'

    def __str__(self):
        return f"{self.vendor_code} — {self.vendor_name}"

    def save(self, *args, **kwargs):
        # Auto-generate vendor code if not provided
        if not self.vendor_code:
            last = Vendor.objects.order_by('-id').first()
            if last and last.vendor_code:
                try:
                    num = int(last.vendor_code.split('-')[1])
                    new_num = num + 1
                except (IndexError, ValueError):
                    new_num = 1
            else:
                new_num = 1
            self.vendor_code = f"VND-{new_num:06d}"
        super().save(*args, **kwargs)