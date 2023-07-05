from django.contrib.auth.models import Group
from djapi.models import *
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
from django.core.files.base import ContentFile
from django.http import JsonResponse
from django.db.models import Q
from rest_framework.decorators import action



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
            return [IsOwnerOrAdminPermission()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Edition and destruction available only for the Event Managers. Needed for the Event Managers
            # to edit the personal info of the players.
            return [IsOwnerOrAdminPermission()]
        else:
            # Authentication is needed for the rest of the operations.
            return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        queryset = CustomUser.objects.all()
        if self.action == 'retrieve':
            # Return only the authenticated user's data if the action is 'retrieve'
            queryset = queryset.filter(id=self.request.user.id)
        return queryset

class UserInfoAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserInfoPartialSerializer(user)
        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        serializer = UserInfoPartialSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

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
            # The token has expired
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
    """
    API endpoint that allows getting and saving the players' avatars.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        try:
            user = get_object_or_404(CustomUser, id=user_id)
            if request.user == user:
                if user.avatar:
                    avatar_data = user.avatar.read()
                    return JsonResponse({'avatar': avatar_data.decode('utf-8')}, status=200, safe=False)
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
                avatar_data = request.data.get('avatar')
                if avatar_data:
                     # Delete the existing avatar if it exists
                    if user.avatar:
                        user.avatar.delete()

                    # Save the avatar image without encoding or decoding
                    filename = f'{user_id}_avatar.png'
                    user.avatar.save(filename, ContentFile(avatar_data.encode('utf-8')))
                    return Response({'detail': 'Avatar uploaded correctly.'}, status=200)
                else:
                    return Response({'detail': 'No avatar image attached.'}, status=400)
            else:
                return Response({'detail': 'You do not have permission to upload an avatar.'}, status=403)
        except CustomUser.DoesNotExist:
            return Response({'detail': 'The specified user does not exist.'}, status=404)   

class NotificationsViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows list and create notifications of the players.
    """
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
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

class TournamentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tournament.objects.order_by('max_players')
    serializer_class = TournamentSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Obtain the word_lenght parameter
        word_length = self.request.query_params.get('word_length')

        if word_length:
            # Filter tournaments by length
            queryset = queryset.filter(word_length=word_length)

        return queryset

class ParticipationViewSet(viewsets.ModelViewSet):
    queryset = Participation.objects.all()
    serializer_class = ParticipationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        tournament_id = request.query_params.get('tournament_id')
        if not tournament_id:
            return Response({'error': 'tournament_id parameter is required.'}, status=status.HTTP_400_BAD_REQUEST)

        queryset = self.get_queryset().filter(tournament_id=tournament_id)
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        tournament_id = request.data.get('tournament_id')
        player = request.user.player

        # Request tournament_id field
        if not tournament_id:
            return Response({'error': 'tournament_id field is required.'}, status=404)
        # Check if the user is a player
        if not player:
            return Response({'error': 'Player not found'}, status=404)

        # Case of non existing tournament
        try:
            tournament = Tournament.objects.get(id=tournament_id)
        except Tournament.DoesNotExist:
            return Response({'error': 'Invalid tournament ID'}, status=400)
        
        # Case of existing participation
        if Participation.objects.filter(tournament_id=tournament_id, player=player).exists():
            return Response({'error': 'You are participating in this tournament.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Case of the tournament is closed
        if tournament.is_closed:
            return Response({'error': 'Tournament is closed for participation'}, status=400)

        # Close the tournament if is full
        if tournament.num_players >= tournament.max_players:
            tournament.is_closed = True
            tournament.save()
            return Response({'error': 'Tournament is already full'}, status=400)

        participation = Participation.objects.create(tournament=tournament, player=player)
        tournament.num_players += 1
        # Close the tournament if is full
        if tournament.num_players >= tournament.max_players:
            tournament.is_closed = True
            
        tournament.save()

        # Create the related notification to the player
        message = f"You were assigned in {tournament.name}. Good luck!"
        link = "http://localhost:8100/tabs/tournaments"
        notification = Notification.objects.create(player=player, text=message, link=link)
        notification.save()

        serializer = self.get_serializer(participation)
        return Response(serializer.data, status=201)

class FriendListViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = FriendListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs):
        player = getattr(request.user, 'player', None)
        if not player:
            return Response({'error': 'Player not found'}, status=404)

        queryset = FriendList.objects.filter(Q(sender=player) | Q(receiver=player))
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
class FriendRequestViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FriendRequest.objects.all()
    serializer_class = FriendRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs):
        player = getattr(request.user, 'player', None)
        if not player:
            return Response({'error': 'Player not found'}, status=404)

        queryset = FriendRequest.objects.filter(receiver=player).order_by('timestamp')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        sender = getattr(request.user, 'player', None)
        if not sender:
            return Response({'error': 'Player not found'}, status=404)
        receiver_id = request.data.get('receiver_id')
        if not receiver_id:
            return Response({'error': 'receiver_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            receiver = Player.objects.get(id=receiver_id)
        except Player.DoesNotExist:
            return Response({'error': 'Receiver not found'}, status=status.HTTP_404_NOT_FOUND)

        if sender == receiver:
            return Response({'error': 'Cannot send friend request to yourself'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if there is an existing request
        existing_request = FriendRequest.objects.filter(sender=sender, receiver=receiver)
        if existing_request.exists():
            return Response({'error': 'Friend request already sent'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if there is an existing friendship
        existing_friendship1 = FriendList.objects.filter(sender=sender, receiver=receiver)
        existing_friendship2 = FriendList.objects.filter(sender=receiver, receiver=sender)
        if existing_friendship1.exists() or existing_friendship2.exists():
            return Response({'error': 'Friendship already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create the request and notify it
        friend_request = FriendRequest.objects.create(sender=sender, receiver=receiver)
        Notification.objects.create(
            player=receiver,
            text='You have a new friend request!',
            link='http://localhost:8100/friendlist'
        )

        serializer = FriendRequestSerializer(friend_request)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def accept(self, request, *args, **kwargs):
        instance = self.get_object()
        receiver = getattr(request.user, 'player', None)
        if not receiver:
            return Response({'error': 'Player not found'}, status=404)

        if instance.receiver != receiver:
            return Response({'error': 'Permission denied'}, status=403)

        # Create the friendship
        FriendList.objects.create(sender=instance.sender, receiver=receiver)

        # Create notification for both players
        Notification.objects.create(
            player=instance.sender,
            text=f"You are now friends with {receiver.user.username}.",
            link='http://localhost:8100/friendlist'
        )
        Notification.objects.create(
            player=receiver,
            text=f"You are now friends with {instance.sender.user.username}.",
            link='http://localhost:8100/friendlist'
        )

        instance.delete()
        return Response({'message': 'Friend request accepted'}, status=200)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, *args, **kwargs):
        instance = self.get_object()
        receiver = request.user.player

        if instance.receiver != receiver:
            return Response({'error': 'Permission denied'}, status=403)

        instance.delete()
        return Response({'message': 'Friend request rejected'}, status=200)