import base64
from django.contrib.auth.models import Group
from .models import CustomUser, Player, ClassicWordle
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from djapi.serializers import *
from djapi.permissions import IsOwnerOrAdminPermission, IsOwnerPermission
from rest_framework.permissions import IsAdminUser
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from django.shortcuts import get_object_or_404


class CustomUserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = CustomUser.objects.all().order_by('-date_joined')
    serializer_class = CustomUserSerializer

    def get_permissions(self):
        """
        Overwrites the get_permissions method to include the validation of the is_staff field
        """
        if self.action == 'create':
            # User creation is available to every user
            return []
        elif self.action in ['list',]:
            # List available only for the Event Managers.
            return [IsAdminUser()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Edition and destruction available only for the Event Managers. Needed for the Event Managers
            # to edit the personal info of the players.
            return [IsOwnerOrAdminPermission()]
        else:
            # Authentication is needed for the rest of the operations.
            return [permissions.IsAuthenticated()]


class PlayerViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows players to be viewed or edited.
    """
    queryset = Player.objects.all().order_by('wins')
    serializer_class = PlayerSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            # Use PlayerSerializer for creating a player
            return PlayerSerializer
        else:
            # Use PlayerInfoSerializer for other actions
            return PlayerInfoSerializer

    def get_permissions(self):
        """
        Overwrites the get_permissions method to include the validation of the is_staff field
        """
        if self.action == 'create':
            # Player creation is available to every user
            return []
        elif self.action in ['update', 'partial_update']:
            # Edition only for the owner or event managers.
            return [IsAdminUser()]
        elif self.action == 'destroy':
            # Destruction available for Admins and the owner
            return [IsOwnerOrAdminPermission()]
        else:
            # Authentication is needed for the rest of the operations.
            return [permissions.IsAuthenticated()]
    
    # It is necessary to override the destroy method to destroy the related user
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # Delete the related user
        user = instance.user
        user.delete()

        # Delete the player
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]

class CustomObtainAuthToken(ObtainAuthToken):
    """
    API endpoint that creates token with expiration date.
    """
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)

        if not created and token.created < timezone.now() - timedelta(seconds=settings.TOKEN_EXPIRED_AFTER_SECONDS):
            # Token expired, generate a new one
            token.delete()
            token = Token.objects.create(user=user)

        # Serialize the token along with any other data you want to include in the response
        response_data = {
            'token': token.key,
            'user_id': user.id,
            'username': user.username,
            'player_id': user.player.id if hasattr(user, 'player') else None,  # Include the player ID if it exists
            'wins': user.player.wins if hasattr(user, 'player') else None,  # Include wins if player exists
            'wins_pvp': user.player.wins_pvp if hasattr(user, 'player') else None,  # Include wins_pvp if player exists
            'wins_tournament': user.player.wins_tournament if hasattr(user, 'player') else None,  # Include wins_tournament if player exists
            'xp': user.player.xp if hasattr(user, 'player') else None  # Include xp if player exists
        }

        return Response(response_data, status=status.HTTP_200_OK)
    
class CheckTokenExpirationView(APIView):
    def get(self, request):
        token = request.user.auth_token

        if token.created < timezone.now() - timedelta(seconds=settings.TOKEN_EXPIRED_AFTER_SECONDS):
            # El token ha expirado
            token.delete()
            return Response({'message': 'Token has expired.'}, status=status.HTTP_401_UNAUTHORIZED)

        return Response({'message': 'Token is valid.'}, status=status.HTTP_200_OK)
   
class ClassicWordleViewSet(viewsets.GenericViewSet):
    """
    API endpoint that allows list, retrieve, and create operations for classic wordle games of players.
    """
    permission_classes = [IsOwnerOrAdminPermission]
    queryset = ClassicWordle.objects.all()
    serializer_class = ClassicWordleSerializer

    def list(self, request):
        player = getattr(request.user, 'player', None)
        if not player:
            return Response({'error': 'Player not found'}, status=404)
       
        queryset = ClassicWordle.objects.filter(player=player).order_by('-date_played')
        serializer = ClassicWordleSerializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        player = getattr(request.user, 'player', None)

        if not player:
            return Response({'error': 'Player not found'}, status=404)

        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(player=player)
        return Response(serializer.data, status=201)



class AvatarView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        try:
            user = get_object_or_404(CustomUser, id=user_id)
            if request.user == user:
                if user.avatar:
                    with open(user.avatar.path, 'rb') as f:
                        image_data = f.read()
                        base64_image = base64.b64encode(image_data).decode('utf-8')
                        return Response({'avatar': base64_image}, status=200)
                else:
                    return Response({'detail': 'Avatar not available.'}, status=404)
            else:
                return Response({'detail': 'You do not have permission to get the avatar.'}, status=403)
        except CustomUser.DoesNotExist:
            return Response({'detail': 'The specified user does not exist.'}, status=404)
        
    def post(self, request, user_id):
        try:
            user = get_object_or_404(CustomUser, id=user_id)
            if request.user == user: 
                avatar = request.FILES.get('avatar')
                if avatar:
                    user.avatar = avatar
                    user.save()
                    return Response({'detail': 'Avatar uploaded correctly.'}, status=200)
                else:
                    return Response({'detail': 'No avatar image attached.'}, status=400)
            else:
                return Response({'detail': 'You do not have permission to upload an avatar.'}, status=403)
        except CustomUser.DoesNotExist:
            return Response({'detail': 'The specified user does not exist.'}, status=404)
        
class NotificationsViewSet(viewsets.ModelViewSet):
    queryset = Notifications.objects.all()
    serializer_class = NotificationsSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerPermission]
    
    def list(self, request):
        limit = int(request.query_params.get('limit', 10))
        player = getattr(request.user, 'player', None)

        if not player:
            return Response({'error': 'Player not found'}, status=404)

        notifications = self.queryset.filter(player=player).order_by('-timestamp')[:limit]
        serializer = self.serializer_class(notifications, many=True)

        return Response(serializer.data)

    def create(self, request):
        player = getattr(request.user, 'player', None)

        if not player:
            return Response({'error': 'Player not found'}, status=404)

        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(player=player)
        return Response(serializer.data, status=201)
