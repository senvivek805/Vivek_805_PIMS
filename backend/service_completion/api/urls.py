from django.urls import path, include
from rest_framework.routers import DefaultRouter
from service_completion.api.views import ServiceCompletionViewSet

router = DefaultRouter()
router.register(r'service-completions', ServiceCompletionViewSet, basename='service-completion')

urlpatterns = [
    path('', include(router.urls)),
]