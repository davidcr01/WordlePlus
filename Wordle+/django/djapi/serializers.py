from django.contrib.auth.models import Group
from .models import CustomUser, Player
from rest_framework import serializers
from django.contrib.auth.hashers import make_password


# Serializer related to the CustomUser model. It considers all the fields
class CustomUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data['password'] = make_password(password)  # Encrypt the password
        return super().create(validated_data)
    
    class Meta:
        model = CustomUser
        fields = '__all__'

# Serializer related to the Player model. It considers all the fields, but naming
# them specifically (other way)
class PlayerSerializer(serializers.ModelSerializer):
    # As a player is related to an user, it needs its seralizer
    user = CustomUserSerializer()

    class Meta:
        model = Player
        fields = ('user', 'wins', 'wins_pvp', 'wins_tournament', 'xp')

class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ['url', 'name']