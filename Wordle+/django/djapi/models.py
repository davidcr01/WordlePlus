from django.db import models
from django.contrib.auth.models import AbstractUser
from datetime import date

# Create your models here.

# Create the Task class to describe the model.
class CustomUser(AbstractUser):
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    last_login = models.DateTimeField(auto_now=True)
    date_joined = models.DateTimeField(auto_now_add=True)

class Player(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='player')
    wins = models.PositiveIntegerField(default=0)
    wins_pvp = models.PositiveIntegerField(default=0)
    wins_tournament = models.PositiveIntegerField(default=0)
    xp = models.PositiveIntegerField(default=0)