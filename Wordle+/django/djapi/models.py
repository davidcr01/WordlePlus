from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.db.models.signals import post_save
from django.core.exceptions import ValidationError
from django.dispatch import receiver
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

# Model to store the notifications of the players.
class Notification(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='notifications')
    text = models.CharField(max_length=200)
    link = models.URLField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

# Model to store the tournaments information.
class Tournament(models.Model):
    name = models.CharField(max_length=20)
    description = models.TextField(blank=True)
    num_players = models.PositiveIntegerField(default=0)
    max_players = models.PositiveIntegerField()
    word_length = models.PositiveIntegerField()
    is_closed = models.BooleanField(default=False)
    current_round = models.PositiveIntegerField(default=1)

    def __str__(self):
        return self.name
    
# Model to store the participations of the tournaments.
class Participation(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['tournament', 'player'],
                name='unique_participation'
            )
        ]

    def __str__(self):
        return f"{self.player.user.username} - {self.tournament.name}"

# Model to store the friend list of the players.
class FriendList(models.Model):
    sender = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='friend_requests_sent')
    receiver = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='friend_requests_received')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['sender', 'receiver'], name='unique_friendship')        ]

    def clean(self):
        if self.sender == self.receiver:
            raise ValidationError('You can not be friend of yourself.')
        if FriendList.objects.filter(sender=self.receiver, receiver=self.sender).exists():
            raise ValidationError('This friend relation already exists.')
        
    def __str__(self):
        return f"{self.sender.user.username} - {self.receiver.user.username}"
    
class FriendRequest(models.Model):
    sender = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='requests_sent')
    receiver = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='requests_received')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['sender', 'receiver'], name='unique_friendrequest')        ]

    def clean(self):
        if self.sender == self.receiver:
            raise ValidationError('You can not be send a request to yourself.')
        if FriendRequest.objects.filter(sender=self.receiver, receiver=self.sender).exists():
            raise ValidationError('This friend request already exists.')
        
    def __str__(self):
        return f"{self.sender.user.username} - {self.receiver.user.username}"

class Game(models.Model):
    player1 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player1_wordle')
    player2 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player2_wordle')
    word = models.CharField(max_length=255, blank=True)
    player1_time = models.PositiveIntegerField(default=0)
    player1_attempts = models.PositiveIntegerField(default=0)
    player1_xp = models.PositiveIntegerField(default=0)
    player2_time = models.PositiveIntegerField(default=0)
    player2_attempts = models.PositiveIntegerField(default=0)
    player2_xp = models.PositiveIntegerField(default=0)
    winner = models.ForeignKey(Player, on_delete=models.SET_NULL, null=True, blank=True, related_name='winner')
    timestamp = models.DateTimeField(auto_now_add=True)
    is_tournament_game = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.player1.user.username} - {self.player2.user.username}"

class Round(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    number = models.PositiveIntegerField()

    def __str__(self):
        return f"Tournament: {self.tournament.name}, Round: {self.number}"

class RoundGame(models.Model):
    round = models.ForeignKey(Round, on_delete=models.CASCADE)
    game = models.ForeignKey(Game, on_delete=models.CASCADE)

    def __str__(self):
        return f"Round: {self.round.number}, Game: {self.game}"

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