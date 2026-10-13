from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .serializers import UserSerializer, LoginSerializer

User = get_user_model()


# ============================================
# LOGIN
# ============================================

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    POST /api/auth/login/
    Body: {"username": "...", "password": "..."}
    """
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    username = serializer.validated_data['username']
    password = serializer.validated_data['password']

    # Try username or email
    user = authenticate(request, username=username, password=password)

    # If failed, try with email
    if user is None and '@' in username:
        try:
            u = User.objects.get(email__iexact=username)
            user = authenticate(request, username=u.username, password=password)
        except User.DoesNotExist:
            pass

    if user is None:
        return Response(
            {"detail": "Invalid username or password."},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not user.is_active:
        return Response(
            {"detail": "Account is disabled."},
            status=status.HTTP_403_FORBIDDEN
        )

    # Create session
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
    """POST /api/auth/logout/"""
    logout(request)
    return Response({"message": "Logged out successfully."})


# ============================================
# CURRENT USER
# ============================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    """GET /api/auth/me/ — Current logged-in user."""
    return Response(UserSerializer(request.user).data)


# ============================================
# CHECK AUTH (for frontend)
# ============================================

@api_view(['GET'])
@permission_classes([AllowAny])
def check_auth_view(request):
    """GET /api/auth/check/ — Returns whether user is logged in."""
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
    """GET /api/auth/csrf/ — CSRF token return karo."""
    token = get_token(request)
    return Response({"csrfToken": token})