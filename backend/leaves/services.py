from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from decimal import Decimal
from .models import LeavePolicy, LeaveBalance, Attendance, LeaveApplication
from employees.models import Employee

def calculate_employee_leave_balances(employee_id):
    try:
        employee = Employee.objects.get(id=employee_id)
    except Employee.DoesNotExist:
        return

    join_date = employee.joining_date
    today = date.today()

    if today < join_date:
        return # Abhi join nahi kiya

    # 1. Calculate Leave Year (Based on Joining Date)
    # Example: Joined 15 Aug 2023 -> Year 1: 15 Aug 2023 to 14 Aug 2024
    delta = relativedelta(today, join_date)
    years_passed = delta.years
    year_start = join_date + relativedelta(years=years_passed)
    year_end = year_start + relativedelta(years=1) - timedelta(days=1)

    # 2. Get Policies for this designation
    policies = LeavePolicy.objects.filter(designation=employee.designation, is_active=True)

    for policy in policies:
        # Skip if NA (0 amount)
        if policy.accrual_amount == 0:
            continue

        # Total accrued for this year
        accrued = Decimal('0.00')

        if policy.accrual_type == 'yearly':
            # CL (8 per year) -> Pro-rata calculation if it's the first year
            # For simplicity, we give full amount if year is active
            # But to handle pro-rata based on joining date in the middle of a standard year:
            # (As user mentioned, year starts from joining date, so it's already 1 full year)
            accrued = policy.accrual_amount

        elif policy.accrual_type == 'monthly':
            # EL (2.5 per month with 20 days attendance condition)
            # Count months completed in this leave year up to today
            current_month_date = year_start
            while current_month_date <= today and current_month_date <= year_end:
                # Check attendance for this month (current_month_date to end of month)
                month_start = current_month_date
                month_end = month_start + relativedelta(months=1) - timedelta(days=1)
                if month_end > today:
                    month_end = today # Current month, only check up to today

                # Count present days
                present_days = Attendance.objects.filter(
                    employee=employee, 
                    date__range=[month_start, month_end], 
                    status__in=['present', 'wfh', 'half_day'] # Assuming these count as present
                ).count()

                # Condition: Min 20 days attendance
                if present_days >= policy.min_attendance_days:
                    accrued += policy.accrual_amount

                current_month_date += relativedelta(months=1)

        # 3. Calculate Used Days (Approved leaves only)
        used = LeaveApplication.objects.filter(
            employee=employee,
            leave_type=policy.leave_type,
            status='approved',
            from_date__gte=year_start,
            to_date__lte=year_end
        ).aggregate(total=models.Sum('total_days'))['total'] or Decimal('0.00')

        # 4. Update or Create LeaveBalance
        LeaveBalance.objects.update_or_create(
            employee=employee,
            leave_type=policy.leave_type,
            year_start_date=year_start,
            defaults={
                'year_end_date': year_end,
                'total_accrued': accrued,
                'used_days': used
            }
        )