from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def hello_pims(request):
    return Response({
        'message': 'Hello PIMS! 🚀',
        'status': 'success',
        'project': 'Project Information Management System',
        'version': '0.1.0',
    })