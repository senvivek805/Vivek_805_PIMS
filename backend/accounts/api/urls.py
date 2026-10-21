from django.urls import path

from . import views

app_name = 'accounts_api'

urlpatterns = [
    path('auth/login/', views.login_view, name='login'),
    path('auth/csrf/', views.csrf_view, name='csrf'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/me/', views.me_view, name='me'),
    path('auth/check/', views.check_auth_view, name='check-auth'),
    path('users/', views.user_list_create, name='user-list-create'),
    path('users/<int:pk>/', views.user_detail, name='user-detail'),
    path('roles/', views.role_list, name='role-list'),
]