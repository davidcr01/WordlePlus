from django.contrib.auth.models import Group
from .models import CustomUser, Player
from rest_framework import serializers


# Serializer related to the CustomUser model. It considers all the fields
class CustomUserSerializer(serializers.ModelSerializer):
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