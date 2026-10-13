from django.urls import path

from . import views

app_name = 'employees_api'

urlpatterns = [
    # List + Create
    path('employees/', views.employee_list_create, name='list-create'),

    # Stats
    path('employees/stats/', views.employee_stats, name='stats'),

    # Detail + Update + Delete
    path('employees/<int:pk>/', views.employee_detail, name='detail'),
]