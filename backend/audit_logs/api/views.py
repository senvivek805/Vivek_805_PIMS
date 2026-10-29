from rest_framework import generics
from audit_logs.models import AuditLog
from .serializers import AuditLogSerializer
from .permissions import IsAdminOrManager


class AuditLogListView(generics.ListAPIView):
    """
    GET /api/audit-logs/
    Sirf Admin + Manager dekh sakte hain.
    """
    queryset = AuditLog.objects.all().order_by('-timestamp')
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminOrManager]