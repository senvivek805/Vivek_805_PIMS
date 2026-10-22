from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser
from documents.models import Document
from documents.api.serializers import DocumentSerializer

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    parser_classes = (MultiPartParser, FormParser) # File upload ke liye zaroori hai

    def get_queryset(self):
        queryset = Document.objects.all().order_by('-uploaded_at')
        bill_id = self.request.query_params.get('bill')
        po_id = self.request.query_params.get('purchase_order')
        project_id = self.request.query_params.get('project')

        if bill_id:
            queryset = queryset.filter(bill_id=bill_id)
        if po_id:
            queryset = queryset.filter(purchase_order_id=po_id)
        if project_id:
            queryset = queryset.filter(project_id=project_id)
            
        return queryset

    def perform_create(self, serializer):
        # Agar user login hai to uploaded_by set karo
        if self.request.user.is_authenticated:
            serializer.save(uploaded_by=self.request.user)
        else:
            serializer.save()