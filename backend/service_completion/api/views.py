from rest_framework import viewsets
from service_completion.models import ServiceCompletion
from service_completion.api.serializers import ServiceCompletionSerializer

class ServiceCompletionViewSet(viewsets.ModelViewSet):
    queryset = ServiceCompletion.objects.all().order_by('-completion_date')
    serializer_class = ServiceCompletionSerializer

    def perform_create(self, serializer):
        # Agar user login hai to created_by set karo
        if self.request.user.is_authenticated:
            serializer.save(created_by=self.request.user)
        else:
            serializer.save() 