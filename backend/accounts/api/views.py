from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .serializers import UserSerializer, LoginSerializer
from accounts.models import Role

User = get_user_model()

# Helper function: Sirf Admin check karne ke liye
def is_admin(user):
    if user.is_superuser:
        return True
    return hasattr(user, 'role') and user.role and user.role.code == 'admin'


# ============================================
# LOGIN
# ============================================

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    username = serializer.validated_data['username']
    password = serializer.validated_data['password']

    user = authenticate(request, username=username, password=password)

    if user is None and '@' in username:
        try:
            u = User.objects.get(email__iexact=username)
            user = authenticate(request, username=u.username, password=password)
        except User.DoesNotExist:
            pass

    if user is None:
        return Response({"detail": "Invalid username or password."}, status=status.HTTP_401_UNAUTHORIZED)

    if not user.is_active:
        return Response({"detail": "Account is disabled."}, status=status.HTTP_403_FORBIDDEN)

    login(request, user)

    return Response({
        "message": "Login successful! 🎉",
        "user": UserSerializer(user).data,
    })


# ============================================
# LOGOUT
# ============================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({"message": "Logged out successfully."})


# ============================================
# CURRENT USER & AUTH CHECK
# ============================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    return Response(UserSerializer(request.user).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def check_auth_view(request):
    if request.user.is_authenticated:
        return Response({
            "authenticated": True,
            "user": UserSerializer(request.user).data,
        })
    return Response({"authenticated": False}, status=status.HTTP_200_OK)


# ============================================
# CSRF TOKEN ENDPOINT
# ============================================

from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie

@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def csrf_view(request):
    token = get_token(request)
    return Response({"csrfToken": token})


# ============================================
# USER MANAGEMENT (Only Admin)
# ============================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def user_list_create(request):
    if not is_admin(request.user):
        return Response({"detail": "Only Admin can manage users."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        users = User.objects.all().order_by('-date_joined')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        data = request.data
        if User.objects.filter(username=data.get('username')).exists():
            return Response({"username": ["Username already exists."]}, status=status.HTTP_400_BAD_REQUEST)
        
        if not data.get('password'):
             return Response({"password": ["Password is required."]}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=data.get('username'),
            email=data.get('email', ''),
            password=data.get('password'),
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            role_id=data.get('role') if data.get('role') else None,
            phone=data.get('phone', ''),
            designation=data.get('designation', ''),
            department=data.get('department', '')
        )
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def user_detail(request, pk):
    if not is_admin(request.user):
        return Response({"detail": "Only Admin can manage users."}, status=status.HTTP_403_FORBIDDEN)

    user = get_object_or_404(User, pk=pk)

    if request.method == 'GET':
        return Response(UserSerializer(user).data)

    elif request.method in ['PUT', 'PATCH']:
        data = request.data
        user.username = data.get('username', user.username)
        user.email = data.get('email', user.email)
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.phone = data.get('phone', user.phone)
        user.designation = data.get('designation', user.designation)
        user.department = data.get('department', user.department)
        
        if 'is_active' in data:
            user.is_active = data['is_active']
            
        if data.get('role'):
            user.role_id = data.get('role')
            
        if data.get('password'):
            user.set_password(data.get('password'))
            
        user.save()
        return Response(UserSerializer(user).data)

    elif request.method == 'DELETE':
        # Prevent deleting yourself
        if user.id == request.user.id:
            return Response({"detail": "You cannot delete your own account."}, status=status.HTTP_400_BAD_REQUEST)
        
        user.is_active = False # Soft delete
        user.save()
        return Response({"message": "User deactivated successfully."})


# ============================================
# ROLES DROPDOWN (For User Form)
# ============================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def role_list(request):
    roles = Role.objects.all().order_by('name')
    data = [{'id': r.id, 'name': r.name, 'code': r.code} for r in roles]
    return Response(data)