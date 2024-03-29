import math
from django.contrib.auth.models import Group
from djapi.models import *
from rest_framework import viewsets, permissions, status, generics
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
    queryset = Player.objects.all()
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
    
    # Method to get the ranking players
    @action(detail=False, methods=['get'])
    def ranking(self, request):
        filter_param = request.GET.get('filter')
        limit = 15
        queryset = Player.objects.all()

        if filter_param:
            queryset = queryset.order_by('-'+filter_param)[:limit]

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class PlayerListAPIView(generics.ListAPIView):
    queryset = Player.objects.all()
    serializer_class = PlayerListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Player.objects.exclude(user=self.request.user)
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        usernames = serializer.data
        return Response(usernames)

class GroupViewSet(viewsets.ModelViewSet):
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
    permission_classes = [permissions.IsAuthenticated]
    queryset = ClassicWordle.objects.all()
    serializer_class = ClassicWordleSerializer

    # Gets limited number of classic worldes from most recent to oldest
    def list(self, request):
        player = getattr(request.user, 'player', None)
        if not player:
            return Response({'error': 'Player not found'}, status=404)

        limit = 15
        queryset = ClassicWordle.objects.filter(player=player).order_by('-date_played')[:limit]
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

    # Gets the avatar image. Only returned if the requesting player is the owner.
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

    # Save the player avatar. If there is an existing one, is removed.
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
    
    # Gets limited number of notifications from the most recent to the oldest.
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

    # Get a list of all the tournaments filtered by its word length.
    def get_queryset(self):
        queryset = super().get_queryset()

        # Obtain the word_lenght parameter
        word_length = self.request.query_params.get('word_length')

        if word_length:
            # Filter tournaments by length
            queryset = queryset.filter(word_length=word_length)

        return queryset
    
    # Gets the information of a specific tournament
    @action(detail=True, methods=['get'])
    def tournament_info(self, request, pk=None):
        tournament = Tournament.objects.get(pk=pk)
        player = getattr(request.user, 'player', None)

        participations = Participation.objects.filter(tournament=tournament, player=player)
        if not participations.exists():
            return Response({'error': 'You are not a participant of this tournament.'}, status=403)

        serializer = TournamentSerializer(tournament)
        return Response(serializer.data)

    # Gets the tournament that the player is joined in.
    @action(detail=False, methods=['get'])
    def player_tournaments(self, request):
        player = getattr(request.user, 'player', None)
        if not player:
            return Response({'error': 'Player not found'}, status=404)

        tournaments = Tournament.objects.filter(participation__player=player).order_by('-is_closed')
        serializer = TournamentSerializer(tournaments, many=True)
        return Response(serializer.data)
    
    # Gets the rounds of a specific tournament.
    @action(detail=True, methods=['get'])
    def tournament_rounds(self, request, pk=None):
        tournament = self.get_object()
        player = getattr(request.user, 'player', None)

        participations = Participation.objects.filter(tournament=tournament, player=player)

        if not participations.exists():
            return Response({'error': 'You are not a participant of this tournament.'}, status=403)

        rounds = Round.objects.filter(tournament=tournament)
        serializer = RoundSerializer(rounds, many=True)
        if not serializer.data:
            return Response({'error': 'No rounds found for this tournament.'}, status=404)
        return Response(serializer.data)

    # Gets the games of a specific round of a specific tournament.
    @action(detail=True, methods=['get'], url_path='round_games/(?P<round_number>\d+)')
    def round_games(self, request, pk=None, round_number=None):
        player = getattr(request.user, 'player', None)

        try:
            tournament = Tournament.objects.get(pk=pk)
            round = Round.objects.get(tournament=tournament, number=round_number)
        except Tournament.DoesNotExist:
            return Response({'error': 'Tournament not found.'}, status=404)
        except Round.DoesNotExist:
            return Response({'error': 'Round not found for this tournament.'}, status=404)

        participations = Participation.objects.filter(tournament=tournament, player=player)

        if not participations.exists():
            return Response({'error': 'You are not a participant of this tournament.'}, status=403)

        round_games = RoundGame.objects.filter(round=round)
        game_ids = round_games.values_list('game__id', flat=True)
        games = Game.objects.filter(id__in=game_ids)

        serializer = GameDetailSerializer(games, many=True)
        return Response(serializer.data)


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

            rounds = int(math.log2(tournament.max_players))
            for round_number in range(1, rounds+1):
                round = Round.objects.create(tournament=tournament, number=round_number)
                if round_number == 1:
                    # Assign games to the first round
                    participants = Participation.objects.filter(tournament=tournament)
                    participants_count = participants.count()
                    for i in range(0, participants_count, 2):
                        player1 = participants[i].player
                        player2 = participants[i + 1].player
                        new_game = Game.objects.create(player1=player1, player2=player2, is_tournament_game=True)
                        RoundGame.objects.create(round=round, game=new_game)
                
        tournament.save()

        # Create the related notification to the player
        message = f"You were assigned in {tournament.name}. Good luck!"
        link = "http://localhost/tabs/tournaments"
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
    
    # Deletes a friend.
    def destroy(self, request, *args, **kwargs):
        player = getattr(request.user, 'player', None)
        friend_id = kwargs.get('pk')

        if not player:
            return Response({'error': 'Player not found'}, status=404)

        try:
            friend = Player.objects.get(id=friend_id)
        except Player.DoesNotExist:
            return Response({'error': 'Friend not found'}, status=404)

        if not FriendList.objects.filter(Q(sender=player, receiver=friend) | Q(sender=friend, receiver=player)).exists():
            return Response({'error': 'Player is not friends with this user'}, status=403)

        # Delete the friend relationship
        FriendList.objects.filter(Q(sender=player, receiver=friend) | Q(sender=friend, receiver=player)).delete()

        return Response({'message': 'Friend relationship deleted successfully'}, status=204)
    
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

    # Creates a new friend request. It checks if the players exist and if there
    # is an existing friend request between them.
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
        existing_request1= FriendRequest.objects.filter(sender=sender, receiver=receiver)
        existing_request2 = FriendRequest.objects.filter(sender=receiver, receiver=sender)
        if existing_request1.exists() or existing_request2.exists():
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
            link='http://localhost/friendlist'
        )

        serializer = FriendRequestSerializer(friend_request)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # Accepts a friend request. The friend relationship is created.
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
            link='http://localhost/friendlist'
        )
        Notification.objects.create(
            player=receiver,
            text=f"You are now friends with {instance.sender.user.username}.",
            link='http://localhost/friendlist'
        )

        instance.delete()
        return Response({'message': 'Friend request accepted'}, status=200)
    
    # Rejects a friend request. It is deleted.
    @action(detail=True, methods=['post'])
    def reject(self, request, *args, **kwargs):
        instance = self.get_object()
        receiver = request.user.player

        if instance.receiver != receiver:
            return Response({'error': 'Permission denied'}, status=403)

        instance.delete()
        return Response({'message': 'Friend request rejected'}, status=200)

class GameViewSet(viewsets.ModelViewSet):
    queryset = Game.objects.all()
    serializer_class = GameCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'patch']

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve', 'completed_games', 'pending_games']:
            return GameDetailSerializer
        elif self.action in ['create', 'partial_update']:
            return GameCreateSerializer
        return super().get_serializer_class()

    # Completed games are those which the winner is not null
    @action(detail=False, methods=['get'])
    def completed_games(self, request):
        limit = 15
        player = getattr(request.user, 'player', None)
        if not player:
            return Response({'error': 'Player not found'}, status=404)
        
        queryset = Game.objects.filter(Q(player1=player) | Q(player2=player), ~Q(winner=None)).order_by('-timestamp')[:limit]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    # Pending games are those which the winner is null and the player is the receiver (player2)
    @action(detail=False, methods=['get'])
    def pending_games(self, request):
        limit = 15
        player = getattr(request.user, 'player', None)
        if not player:
            return Response({'error': 'Player not found'}, status=404)
        queryset = Game.objects.filter(player2=player, winner=None, is_tournament_game=False).order_by('timestamp')[:limit]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        player = getattr(request.user, 'player', None)
        if not player:
            return Response({'error': 'Player not found'}, status=404)

        if player not in [instance.player1, instance.player2]:
            return Response({'error': 'You can not access to this game.'}, status=403)
        if instance.winner is not None:
            return Response({'error': 'This game is already completed and cannot be modified.'}, status=403)
        
        serializer = self.get_serializer(instance)
        data = serializer.data

        return Response(data)

    def create(self, request, *args, **kwargs):
        player1 = getattr(request.user, 'player', None)
        if not player1:
            return Response({'error': 'Player1 not found'}, status=404)
        player2_id = request.data.get('player2')

        if not player2_id:
            return Response({'error': 'player2 parameter is required'}, status=400)

        try:
            player2 = Player.objects.get(id=player2_id)
        except Player.DoesNotExist:
            return Response({'error': 'Player2 not found'}, status=status.HTTP_404_NOT_FOUND)

        allowed_fields = ['player2', 'player1_xp', 'player1_time', 'player1_attempts', 'word']
        data = {key: request.data.get(key) for key in allowed_fields}

        if 'winner' in data:
            return Response({'error': 'The "winner" field cannot be modified.'}, status=400)
        
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        # Increment player XP
        player1.xp += serializer.validated_data['player1_xp']
        player1.save()

        serializer.save(player1=player1, player2=player2)

        # Create notification to the guest player
        Notification.objects.create(
            player=player2,
            text=f"You have been challenged by {player1.user.username}. Let's play!",
            link=''
        )

        return Response(serializer.data, status=201)

    # Patch method to update the tournament game. Executed only by the second player
    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        player = getattr(request.user, 'player', None)
        if not player:
            return Response({'error': 'Player not found'}, status=404)

        if instance.player2 != player:
            return Response({'error': 'You do not have permission to update this game.'}, status=403)
        if instance.winner is not None:
            return Response({'error': 'This game is already completed and cannot be modified.'}, status=400)
    
        allowed_fields = ['player2_xp', 'player2_time', 'player2_attempts']
        data = {key: request.data.get(key) for key in allowed_fields}

        if 'winner' in data:
            return Response({'error': 'The "winner" field cannot be modified.'}, status=400)

        player2_xp = request.data.get('player2_xp')
        player1_xp = instance.player1_xp
        player2_time = request.data.get('player2_time')
        player1_time = instance.player1_time

        # Determine the winner if all data is available.
        if player2_xp is not None:
            player1_xp = instance.player1_xp
            if player2_xp > player1_xp:
                instance.winner = instance.player2
                instance.winner.wins_pvp += 1
                instance.winner.save()
            elif player2_xp < player1_xp:
                instance.winner = instance.player1
                instance.winner.wins_pvp += 1
                instance.winner.save()
            else:
                if player2_time <= player1_time:
                    instance.winner = instance.player2
                    instance.winner.wins_pvp += 1
                    instance.winner.save()
                else:
                    instance.winner = instance.player1
                    instance.winner.wins_pvp += 1
                    instance.winner.save()

        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        player.xp += serializer.validated_data['player2_xp']
        player.save()

        return Response({'winner': instance.winner.user.username})
    
    # Patch method to update the tournament game. Executed by both players
    def tournament(self, request, *args, **kwargs):
        instance = self.get_object()
        player = getattr(request.user, 'player', None)
        if not player:
            return Response({'error': 'Player not found'}, status=404)

        if player == instance.player1:
            if instance.player1_xp != 0 or instance.player1_time != 0:
                return Response({'error': 'You have already updated your information for this game.'}, status=400)
            opponent = instance.player2
            opponent_xp = instance.player2_xp
            opponent_time = instance.player2_time
        elif player == instance.player2:
            if instance.player2_xp != 0 or instance.player2_time != 0:
                return Response({'error': 'You have already updated your information for this game.'}, status=400)
            opponent = instance.player1
            opponent_xp = instance.player1_xp
            opponent_time = instance.player1_time
        else:
            return Response({'error': 'You do not have permission to update this game.'}, status=403)

        # Data requested change depending on the player who is executing the method
        if instance.player1 == player:
            allowed_fields = ['player1_xp', 'player1_time', 'player1_attempts', 'word']
        elif instance.player2 == player:
            allowed_fields = ['player2_xp', 'player2_time', 'player2_attempts', 'word']
        else:
            return Response({'error': 'You do not have permission to update this game.'}, status=403)

        data = {key: request.data.get(key) for key in allowed_fields}
        if 'winner' in data:
            return Response({'error': 'The "winner" field cannot be modified.'}, status=400)

        if instance.word != '':
            data.pop('word')

        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        player_xp = serializer.validated_data.get('player1_xp' if player == instance.player1 else 'player2_xp', 0)
        player_time = serializer.validated_data.get('player1_time' if player == instance.player1 else 'player2_time', 0)

        # Winner is calculated when all data is available
        if (player_xp != 0 and player_time != 0 and opponent_xp != 0 and opponent_time != 0):
            if player_xp > opponent_xp:
                instance.winner = player
                instance.winner.wins_pvp += 1
                instance.winner.save()
                instance.save()
            elif player_xp < opponent_xp:
                instance.winner = opponent
                opponent.wins_pvp += 1
                instance.winner.save()
                instance.save()
            else:
                if player_time <= opponent_time:
                    instance.winner = player
                    instance.winner.wins_pvp += 1
                    instance.winner.save()
                    instance.save()
                else:
                    instance.winner = opponent
                    opponent.wins_pvp += 1
                    instance.winner.save()
                    instance.save()

        if instance.winner is not None:
            return Response({'winner': instance.winner.user.username})
        else:
            return Response({'message': 'Game updated successfully.'})
