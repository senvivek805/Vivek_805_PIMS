from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from decimal import Decimal

from django.db.models import Sum, Case, When, Value, DecimalField
from django.db.models.functions import Coalesce

from .models import LeavePolicy, LeaveBalance, Attendance, LeaveApplication
from employees.models import Employee


# Statuses that count toward attendance days
ATTENDANCE_STATUSES = ['present', 'wfh', 'half_day']


def _attendance_days(employee, start_date, end_date):
    """
    Return effective attendance days in [start_date, end_date].
      present  -> 1.0 day
      wfh      -> 1.0 day
      half_day -> 0.5 day
      others   -> 0
    """
    result = Attendance.objects.filter(
        employee=employee,
        date__range=[start_date, end_date],
        status__in=ATTENDANCE_STATUSES,
    ).aggregate(
        total=Coalesce(
            Sum(
                Case(
                    When(status='half_day', then=Value(Decimal('0.5'))),
                    default=Value(Decimal('1.0')),
                    output_field=DecimalField(max_digits=6, decimal_places=1),
                )
            ),
            Value(Decimal('0.0'), output_field=DecimalField(max_digits=6, decimal_places=1)),
        )
    )
    return result['total'] or Decimal('0.0')


def calculate_employee_leave_balances(employee_id):
    try:
        employee = Employee.objects.get(id=employee_id)
    except Employee.DoesNotExist:
        return

    join_date = employee.joining_date
    today = date.today()

    if not join_date or today < join_date:
        return

    # ---- 1. Leave year: anniversary-based (starts on joining date) ----
    delta = relativedelta(today, join_date)
    years_passed = delta.years
    year_start = join_date + relativedelta(years=years_passed)
    year_end = year_start + relativedelta(years=1) - timedelta(days=1)

    # ---- 2. Policies for this designation ----
    policies = LeavePolicy.objects.filter(
        designation=employee.designation,
        is_active=True,
    )

    for policy in policies:
        if policy.accrual_amount == 0:
            continue

        accrued = Decimal('0.0')

        # ---- 3a. Yearly accrual (e.g., CL = 8 per year) ----
        if policy.accrual_type == 'yearly':
            # Anniversary-based year is a full year, so full amount.
            accrued = policy.accrual_amount

        # ---- 3b. Monthly accrual (e.g., EL = 2.5/month, min 20 attendance) ----
        elif policy.accrual_type == 'monthly':
            cursor = year_start
            while cursor <= min(today, year_end):
                cal_start = cursor.replace(day=1)
                next_month = cal_start + relativedelta(months=1)
                cal_end = next_month - timedelta(days=1)

                # Credit EL only for COMPLETED calendar months.
                # Avoids partial-month inflation.
                if cal_end < today:
                    present_days = _attendance_days(employee, cal_start, cal_end)
                    if present_days >= policy.min_attendance_days:
                        accrued += policy.accrual_amount

                cursor = next_month

        # ---- 4. Used days (approved leaves inside this leave year) ----
        # Count overlap so boundary-crossing leaves aren't lost.
        used = Decimal('0.0')
        approved = LeaveApplication.objects.filter(
            employee=employee,
            leave_type=policy.leave_type,
            status='approved',
            from_date__lte=year_end,
            to_date__gte=year_start,
        )
        for leave in approved:
            eff_start = max(leave.from_date, year_start)
            eff_end = min(leave.to_date, year_end)
            if eff_end >= eff_start:
                used += Decimal(str((eff_end - eff_start).days + 1))

        # ---- 5. Upsert LeaveBalance ----
        LeaveBalance.objects.update_or_create(
            employee=employee,
            leave_type=policy.leave_type,
            year_start_date=year_start,
            defaults={
                'year_end_date': year_end,
                'total_accrued': accrued,
                'used_days': used,
            }
        )