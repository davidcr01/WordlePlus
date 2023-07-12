from django.contrib.auth.models import Group
from .models import CustomUser, Player, StaffCode, ClassicWordle, Notification, Tournament, Participation, FriendList, FriendRequest, Game, Round
from rest_framework import serializers
from django.contrib.auth.hashers import make_password


# Serializer related to the CustomUser model. It considers all the fields
class CustomUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    is_superuser = serializers.ReadOnlyField()
    staff_code = serializers.CharField(write_only=True, required=False)

    def validate_staff_code(self, value):
        if value and not StaffCode.objects.filter(code=value, used=False).exists():
            raise serializers.ValidationError('Invalid staff code.')
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        staff_code = validated_data.pop('staff_code', None)

        validated_data['password'] = make_password(password)  # Encrypt the password

        # These fields are ignored of the body
        validated_data.pop('is_staff', None)
        validated_data.pop('is_superuser', None)

        is_staff = False
        if staff_code:
            try:
                staff_code_obj = StaffCode.objects.get(code=staff_code, used=False)
                staff_code_obj.used = True
                staff_code_obj.save()
                is_staff = True
            except StaffCode.DoesNotExist:
                raise serializers.ValidationError('Invalid staff code')


        user = CustomUser.objects.create(is_staff=is_staff, **validated_data)
        
        return user

    def update(self, instance, validated_data):
        # Delete the password, is_staff and is_superuser field to avoid updating it
        validated_data.pop('password', None)
        validated_data.pop('is_staff', None)
        validated_data.pop('is_superuser', None)
        return super().update(instance, validated_data)
    
    class Meta:
        model = CustomUser
        fields = '__all__'

class PlayerSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer()

    class Meta:
        model = Player
        fields = ('user', 'id', 'wins', 'wins_pvp', 'wins_tournament', 'xp')

    def create(self, validated_data):
        user_data = validated_data.pop('user', None)
        user = None

        if user_data:
            # Create the user only if user_data is provided
            user = CustomUser.objects.create_user(**user_data)

        player = Player.objects.create(user=user, **validated_data)
        return player

class PlayerListSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Player
        fields = ['username', 'id']

class UserInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'last_login', 'date_joined')


# Used to update and get the user information partially
class UserInfoPartialSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['email', 'first_name', 'last_name']


# Serializer related to the Player model. It considers all the fields, but naming
# them specifically (other way)
class PlayerInfoSerializer(serializers.ModelSerializer):
    # As a player is related to an user, it needs its seralizer
    user = serializers.SerializerMethodField()

    class Meta:
        model = Player
        fields = ('id', 'user', 'wins', 'wins_pvp', 'wins_tournament', 'xp')
        
    def get_user(self, obj):
        if self.context['request'].method == 'GET' and 'pk' not in self.context['view'].kwargs:
            # If we are getting all the players, it returns only the ID and username
             return {'id': obj.user.id, 'username': obj.user.username}
        else:
            # If we are getting only a player, it returns the UserInfoSerializer data
            user_serializer = UserInfoSerializer(obj.user)
            return user_serializer.data

class ClassicWordleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassicWordle
        fields = ['word', 'time_consumed', 'attempts', 'xp_gained', 'date_played', 'win']
    
    def create(self, validated_data):
        player = validated_data['player']
        is_winner = validated_data['win']
        xp = validated_data['xp_gained']

        # Increment the number of victories and add the xp_gained
        if is_winner:
            player.wins += 1
        player.xp += xp
        player.save()

        return ClassicWordle.objects.create(**validated_data)

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['text', 'link']

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = ['id', 'name', 'description', 'max_players', 'num_players', 'word_length', 'is_closed', 'current_round']

class ParticipationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participation
        fields = '__all__'

class FriendListSerializer(serializers.ModelSerializer):
    friend = serializers.SerializerMethodField()

    class Meta:
        model = FriendList
        fields = ['friend']

    def get_friend(self, obj):
        request = self.context.get('request')
        player = request.user.player
        if obj.sender == player:
            friend = obj.receiver
        else:
            friend = obj.sender
        return {'username': friend.user.username, 'id_player': friend.user.player.id}

class FriendRequestSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()

    class Meta:
        model = FriendRequest
        fields = ['id', 'sender']

    def get_sender(self, obj):
        return {'username': obj.sender.user.username, 'id_player': obj.sender.user.player.id}

class GameDetailSerializer(serializers.ModelSerializer):
    player1 = serializers.SerializerMethodField()
    player2 = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = ['id', 'player1', 'player2', 'player1_time', 'player2_time', 'player1_xp',
                  'player2_xp', 'timestamp', 'word', 'player1_attempts', 'player2_attempts',
                  'winner']

    def get_player1(self, obj):
        return obj.player1.user.username

    def get_player2(self, obj):
        return obj.player2.user.username


class GameCreateSerializer(serializers.ModelSerializer):
    player2 = serializers.SerializerMethodField()
    class Meta:
        model = Game
        fields = ['id', 'player2', 'player1_time', 'player2_time', 'player1_xp',
                  'player2_xp', 'timestamp', 'word', 'player1_attempts', 'player2_attempts',
                  'winner']
        
    def get_player2(self, obj):
        return obj.player2.user.username

class RoundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Round
        fields = '__all__'

class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ['url', 'name']