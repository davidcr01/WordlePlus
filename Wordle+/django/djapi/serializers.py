from django.contrib.auth.models import Group
from .models import CustomUser, Player
from rest_framework import serializers


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = '__all__'

class PlayerSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer()

    class Meta:
        model = Player
        fields = ('user', 'wins', 'wins_pvp', 'wins_tournament', 'xp')

class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ['url', 'name']