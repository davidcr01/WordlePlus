from django.db import models
from django.contrib.auth.models import AbstractUser
from datetime import date

# Create your models here.

# Model of the User. It adds the avatar to the Django default user model
# and specifies that the last_login and date_joined will be automatically stored.
class CustomUser(AbstractUser):
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    last_login = models.DateTimeField(auto_now=True)
    date_joined = models.DateTimeField(auto_now_add=True)

# Model of the player. Every Player is related to its CustomUser information, and
# adds to it some new information.
class Player(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='player')
    wins = models.PositiveIntegerField(default=0)
    wins_pvp = models.PositiveIntegerField(default=0)
    wins_tournament = models.PositiveIntegerField(default=0)
    xp = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.user.username


# Model to store the staff codes given by the superuser. A code
# will be required if the user wants to be registered as an Event Manager
class StaffCode(models.Model):
    code = models.CharField(max_length=20)

    def __str__(self):
        return self.code