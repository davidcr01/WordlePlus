from rest_framework.authtoken.models import Token
from datetime import timedelta
from rest_framework import status
from django.utils import timezone
from rest_framework.authtoken.models import Token
from django.http import JsonResponse
from django.conf import settings

# Middleware to check if the token has expired. The middleware
# is executed everytime an API endpoint is used.
class TokenExpirationMiddleware(object):
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if auth_header:
            _, token_key = auth_header.split()
            token = Token.objects.filter(key=token_key).first()
            if token and token.created < timezone.now() - timedelta(seconds=settings.TOKEN_EXPIRED_AFTER_SECONDS):
                token.delete()

                response_data = {
                    'message': 'Token has expired.'
                }
                response = JsonResponse(response_data, status=status.HTTP_401_UNAUTHORIZED)
                return response

        response = self.get_response(request)
        return response
