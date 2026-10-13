from rest_framework import serializers
from django.db.models import Sum

from funds.models import (
    FundReceipt,
    BudgetCategory,
    BudgetHead,
    FundBreakup,
)
from projects.models import Project


# ============================================
# SIMPLE PROJECT (for nesting)
# ============================================

class SimpleProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'project_code', 'project_name', 'pi_name']


# ============================================
# BUDGET CATEGORY
# ============================================

class BudgetCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetCategory
        fields = ['id', 'name', 'code', 'description', 'order']


# ============================================
# BUDGET HEAD
# ============================================

class BudgetHeadSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_code = serializers.CharField(source='category.code', read_only=True)

    class Meta:
        model = BudgetHead
        fields = [
            'id', 'name', 'code', 'category',
            'category_name', 'category_code',
            'description', 'order', 'is_active',
        ]


# ============================================
# FUND BREAKUP — LIST
# ============================================

class FundBreakupListSerializer(serializers.ModelSerializer):
    budget_head_name = serializers.CharField(
        source='budget_head.name', read_only=True
    )
    budget_head_code = serializers.CharField(
        source='budget_head.code', read_only=True
    )
    category_name = serializers.CharField(
        source='category.name', read_only=True
    )
    category_code = serializers.CharField(
        source='category.code', read_only=True
    )
    balance = serializers.SerializerMethodField()
    utilization_percentage = serializers.SerializerMethodField()

    class Meta:
        model = FundBreakup
        fields = [
            'id',
            'fund_receipt',
            'category',
            'category_name',
            'category_code',
            'budget_head',
            'budget_head_name',
            'budget_head_code',
            'amount',
            'spent_amount',
            'balance',
            'utilization_percentage',
            'remarks',
            'created_at',
            'updated_at',
        ]

    def get_balance(self, obj):
        """Amount - Spent."""
        return float(obj.balance)

    def get_utilization_percentage(self, obj):
        """Kitna % utilize hua."""
        return round(float(obj.utilization_percentage), 2)


# ============================================
# FUND BREAKUP — CREATE / UPDATE
# ============================================

class FundBreakupCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FundBreakup
        fields = [
            'fund_receipt',
            'budget_head',
            'amount',
            'remarks',
        ]

    def validate_amount(self, value):
        if value is None or value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0.")
        return value

    def validate(self, attrs):
        """
        Check karo ki breakup ka total receipt amount se zyada na ho.
        """
        fund_receipt = attrs.get('fund_receipt')
        new_amount = attrs.get('amount', 0)

        if fund_receipt:
            existing = fund_receipt.breakups.filter(is_deleted=False)
            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)

            existing_total = existing.aggregate(
                total=Sum('amount')
            )['total'] or 0

            total_after = float(existing_total) + float(new_amount)

            if total_after > float(fund_receipt.amount_received):
                remaining = float(fund_receipt.amount_received) - float(existing_total)
                raise serializers.ValidationError({
                    'amount': f'Total breakup exceeds receipt amount. '
                              f'Remaining: ₹{remaining:,.2f}'
                })

        return attrs


# ============================================
# FUND RECEIPT — LIST
# ============================================

class FundReceiptListSerializer(serializers.ModelSerializer):
    project_code = serializers.CharField(
        source='project.project_code', read_only=True
    )
    project_name = serializers.CharField(
        source='project.project_name', read_only=True
    )
    fund_type_display = serializers.CharField(
        source='get_fund_type_display', read_only=True
    )

    class Meta:
        model = FundReceipt
        fields = [
            'id', 'project', 'project_code', 'project_name',
            'financial_year', 'receipt_date', 'receipt_reference_no',
            'fund_type', 'fund_type_display',
            'amount_received', 'remarks',
            'created_at', 'updated_at',
        ]


# ============================================
# FUND RECEIPT — DETAIL (with breakups + summary)
# ============================================

class FundReceiptDetailSerializer(serializers.ModelSerializer):
    project_detail = SimpleProjectSerializer(source='project', read_only=True)
    project_code = serializers.CharField(
        source='project.project_code', read_only=True
    )
    project_name = serializers.CharField(
        source='project.project_name', read_only=True
    )
    fund_type_display = serializers.CharField(
        source='get_fund_type_display', read_only=True
    )

    # Breakups
    breakups = serializers.SerializerMethodField()

    # Summary
    total_breakup = serializers.SerializerMethodField()
    remaining = serializers.SerializerMethodField()
    breakup_percentage = serializers.SerializerMethodField()
    is_fully_allocated = serializers.SerializerMethodField()

    # NEW — Spent & Balance summary
    total_spent = serializers.SerializerMethodField()
    total_balance = serializers.SerializerMethodField()

    class Meta:
        model = FundReceipt
        fields = '__all__'
        read_only_fields = [
            'created_at', 'updated_at', 'created_by', 'updated_by',
            'is_deleted', 'deleted_at',
        ]
    def get_breakups(self, obj):
        """Sirf active breakups."""
        active = obj.breakups.filter(is_deleted=False)
        return FundBreakupListSerializer(active, many=True).data

    def get_total_breakup(self, obj):
        """Kitna allocate hua."""
        total = obj.breakups.filter(is_deleted=False).aggregate(
            total=Sum('amount')
        )['total'] or 0
        return float(total)

    def get_remaining(self, obj):
        """Kitna allocate karna baaki hai."""
        total = obj.breakups.filter(is_deleted=False).aggregate(
            total=Sum('amount')
        )['total'] or 0
        return float(obj.amount_received or 0) - float(total)

    def get_breakup_percentage(self, obj):
        """Kitna % allocate hua."""
        if not obj.amount_received:
            return 0
        total = obj.breakups.filter(is_deleted=False).aggregate(
            total=Sum('amount')
        )['total'] or 0
        return round(float(total) / float(obj.amount_received) * 100, 2)

    def get_is_fully_allocated(self, obj):
        """Kya 100% allocate hua."""
        total = obj.breakups.filter(is_deleted=False).aggregate(
            total=Sum('amount')
        )['total'] or 0
        return float(total) == float(obj.amount_received or 0)

    def get_total_spent(self, obj):
        """Kitna kharch ho gaya (Form 5 se)."""
        total = obj.breakups.filter(is_deleted=False).aggregate(
            total=Sum('spent_amount')
        )['total'] or 0
        return float(total)

    def get_total_balance(self, obj):
        """Allocated - Spent."""
        allocated = obj.breakups.filter(is_deleted=False).aggregate(
            total=Sum('amount')
        )['total'] or 0
        spent = obj.breakups.filter(is_deleted=False).aggregate(
            total=Sum('spent_amount')
        )['total'] or 0
        return float(allocated) - float(spent)


# ============================================
# FUND RECEIPT — CREATE / UPDATE
# ============================================

class FundReceiptCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FundReceipt
        fields = [
            'project',
            'financial_year',
            'receipt_date',
            'receipt_reference_no',
            'fund_type',
            'amount_received',
            'remarks',
        ]

    def validate_amount_received(self, value):
        if value is None or value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0.")
        return value

    def validate_financial_year(self, value):
        if not value:
            raise serializers.ValidationError("Financial Year is required.")
        value = value.strip()
        import re
        if not re.match(r'^\d{4}-\d{2}$', value):
            raise serializers.ValidationError(
                "Financial Year format: 2024-25 (YYYY-YY)"
            )
        return value