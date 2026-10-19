from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser
from documents.models import Document
from documents.api.serializers import DocumentSerializer

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all().order_by('-uploaded_at')
    serializer_class = DocumentSerializer
    parser_classes = (MultiPartParser, FormParser) # File upload ke liye zaroori hai

    def perform_create(self, serializer):
        # Agar user login hai to uploaded_by set karo
        if self.request.user.is_authenticated:
            serializer.save(uploaded_by=self.request.user)
        else:
            serializer.save()
            