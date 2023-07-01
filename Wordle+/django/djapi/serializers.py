from django.contrib.auth.models import Group
from .models import CustomUser, Player, StaffCode, ClassicWordle, Notifications
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

class UserInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'last_login', 'date_joined')

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

class NotificationsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notifications
        fields = ['text', 'link']

class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ['url', 'name']