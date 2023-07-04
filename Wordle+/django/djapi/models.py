from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.db.models.signals import post_save
from django.dispatch import receiver
from datetime import date
from django.utils import timezone

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
    used = models.BooleanField(default=False)

    def __str__(self):
        return self.code

# Model to store the single games of the players. It represents the classic wordle
# games.
class ClassicWordle(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='classic_wordle_games')
    word = models.CharField(max_length=255)
    time_consumed = models.PositiveIntegerField()
    attempts = models.PositiveIntegerField()
    xp_gained = models.PositiveIntegerField()
    date_played = models.DateTimeField(default=timezone.now)
    win = models.BooleanField(default=False)

class Notifications(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='notifications')
    text = models.CharField(max_length=200)
    link = models.URLField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

# Method to add the 'Staff' group automatically when creating an administrator
@receiver(post_save, sender=CustomUser)
def assign_permissions(sender, instance, created, **kwargs):
    if created and instance.is_staff:
        staff_group, created = Group.objects.get_or_create(name='Staff')

        if created:
            # Obtain the necessary permissions to manage CustomUser and Player
            customuser_content_type = ContentType.objects.get(app_label='djapi', model='customuser')
            player_content_type = ContentType.objects.get(app_label='djapi', model='player')

            customuser_permissions = Permission.objects.filter(content_type=customuser_content_type)
            player_permissions = Permission.objects.filter(content_type=player_content_type)

            # Assign the permissions to the "Staff" group
            staff_group.permissions.set(customuser_permissions | player_permissions)

        # Assign the user to the "Staff" group
        staff_group.user_set.add(instance)