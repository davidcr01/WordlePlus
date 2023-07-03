"""djangoproject URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import include, path
from django.contrib import admin
from rest_framework import routers
from djapi import views
from djapi.views import CustomObtainAuthToken, CheckTokenExpirationView, AvatarView, UserInfoAPIView
from django.conf import settings
from django.conf.urls.static import static

router = routers.DefaultRouter()
router.register(r'api/users', views.CustomUserViewSet)
router.register(r'api/players', views.PlayerViewSet)
router.register(r'api/groups', views.GroupViewSet)
router.register(r'api/classicwordles', views.ClassicWordleViewSet)
router.register(r'api/notifications', views.NotificationsViewSet)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('admin/', admin.site.urls),
    path('api-token-auth/', CustomObtainAuthToken.as_view()),
    path('check-token-expiration/', CheckTokenExpirationView.as_view(), name='check-token-expiration'),
    path('api/avatar/<int:user_id>/', AvatarView.as_view(), name='avatar'),
    path('api/users-info/', UserInfoAPIView.as_view(), name='user-detail'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)