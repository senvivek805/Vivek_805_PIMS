from django.urls import path

from . import views

app_name = 'projects_api'

urlpatterns = [
    # Agency
    path('agencies/', views.agency_list, name='agency-list'),

    # Department
    path('departments/', views.department_list, name='department-list'),

    # Project
    path('projects/', views.project_list_create, name='project-list-create'),
    path('projects/stats/', views.project_stats, name='project-stats'),
    path('projects/<int:pk>/', views.project_detail, name='project-detail'),

    # Budget Summary (project-wise)
    path('projects/<int:pk>/budget-summary/', views.project_budget_summary, name='project-budget-summary'),

    # Global Budget Overview (project-wise) — renamed
    path('budget/projects-overview/', views.budget_overview, name='budget-overview'),
]