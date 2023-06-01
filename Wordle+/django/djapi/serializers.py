from django.contrib.auth.models import Group
from .models import CustomUser, Player
from rest_framework import serializers
from django.contrib.auth.hashers import make_password


# Serializer related to the CustomUser model. It considers all the fields
class CustomUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    is_superuser = serializers.ReadOnlyField()

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data['password'] = make_password(password)  # Encrypt the password
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Delete the password field to avoid updating it
        validated_data.pop('password', None)
        return super().update(instance, validated_data)
    
    class Meta:
        model = CustomUser
        fields = '__all__'

class PlayerSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer()

    class Meta:
        model = Player
        fields = ('user', 'wins', 'wins_pvp', 'wins_tournament', 'xp')

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
    
class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ['url', 'name']