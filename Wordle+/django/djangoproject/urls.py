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
from djapi.views import *
from django.conf import settings
from django.conf.urls.static import static

router = routers.DefaultRouter()
router.register(r'api/users', views.CustomUserViewSet)
router.register(r'api/players', views.PlayerViewSet)
router.register(r'api/groups', views.GroupViewSet)
router.register(r'api/classicwordles', views.ClassicWordleViewSet)
router.register(r'api/notifications', views.NotificationsViewSet)
router.register(r'api/games', views.GameViewSet)
router.register(r'api/tournaments', views.TournamentViewSet)
router.register('api/friendlist', FriendListViewSet, basename='friendlist')
router.register('api/friendrequest', FriendRequestViewSet, basename='friendrequest')

# Wire up our API using automatic URL routing.
urlpatterns = [
    path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('admin/', admin.site.urls),
    path('api-token-auth/', CustomObtainAuthToken.as_view()),
    path('check-token-expiration/', CheckTokenExpirationView.as_view(), name='check-token-expiration'),
    
    path('api/avatar/<int:user_id>/', AvatarView.as_view(), name='avatar'),
    path('api/users-info/', UserInfoAPIView.as_view(), name='user-detail'),
    path('api/participations/', ParticipationViewSet.as_view({'get': 'list', 'post': 'create'}), name='participations'),
    path('api/list-players/', PlayerListAPIView.as_view(), name='player-list'),
    path('api/games/<int:pk>/tournament/', views.GameViewSet.as_view({'patch': 'tournament'}), name='game-partial-update-tournament'),


    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)