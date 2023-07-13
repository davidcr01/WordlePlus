from xml.dom import ValidationErr
from django.forms import Select
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.db import models
from django import forms
from django.core.validators import MaxValueValidator
import math

from .models import *

class CustomUserAdmin(UserAdmin):
    model = CustomUser

    #  Specifies the fields to be displayed in the list view of user records in the admin site.
    list_display = ('id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser',)
    
    # Specifies the fields to be used for filtering the user records.
    list_filter = ('username', 'email', 'is_staff', 'is_active',)

    # Groups the fields into sections for the user edit form in the admin site.
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (('Personal info'), {'fields': ('first_name', 'last_name', 'email', 'avatar')}),
        (('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'is_staff'),
        }),
    )

    readonly_fields = ('last_login', 'date_joined', 'is_superuser')

    # This function controls that the username field is read_only while editing
    # the information, but is necessary to edit it when creating a new user
    def get_readonly_fields(self, request, obj=None):
        if obj:  # Edition of an existing user
            return self.readonly_fields + ('username',)
        return self.readonly_fields  # Creation of a new user

    # Overwritten method. It makes the staff members not to be able to delete the
    # superuser account, but they can delete other staff accounts.
    def has_delete_permission(self, request, obj=None):
        if obj is not None and obj.is_superuser:
            if request.user.is_superuser:
                return True
            return False

        if not request.user.is_superuser and obj is not None and obj.is_staff:
            return True
        return super().has_delete_permission(request, obj)
    
    # Overwritten method. It makes the staff members not to be able to edit the
    # superuser account, but they can edit other staff accounts.
    def has_change_permission(self, request, obj=None):
        if obj is not None and obj.is_superuser and not request.user.is_superuser:
            return False
        return super().has_change_permission(request, obj)

class PlayerAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'wins', 'wins_pvp', 'wins_tournament', 'xp',)
    list_filter = ('user',)
    search_fields = ('user__username', 'user__email',)

    def get_readonly_fields(self, request, obj=None):
        if obj:  # Edition of an existing user
            return self.readonly_fields + ('user',)
        return self.readonly_fields  # Creation of a new user

class StaffCodeAdmin(admin.ModelAdmin):
    list_display = ('code', 'used')

    def has_change_permission(self, request, obj=None):
        # Only the superuser can change
        return request.user.is_superuser

    def has_delete_permission(self, request, obj=None):
        # Only the superuser can delete
        return request.user.is_superuser

    def has_add_permission(self, request):
        # Only the superuser can create
        return request.user.is_superuser
    
class ClassicWordleAdmin(admin.ModelAdmin):
    list_display = ['id', 'player', 'word', 'date_played']

class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'player', 'text', 'link', 'timestamp')

class TournamentsForm(forms.ModelForm):
    word_length = forms.ChoiceField(choices=[ # Dropdown tab
        (4, '4'),
        (5, '5'),
        (6, '6'),
        (7, '7'),
        (8, '8'),
    ])

    max_players = forms.ChoiceField(choices=[ # Dropdown tab
        (2, '2'), 
        (4, '4'),
        (8, '8'),
        (16, '16'),
    ])

    class Meta:
        model = Tournament
        fields = '__all__'

class TournamentAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'num_players', 'max_players', 'word_length', 'is_closed')
    form = TournamentsForm

class ParticipationAdmin(admin.ModelAdmin):
    model = Participation

    list_display = ('id', 'tournament', 'player',)
    list_filter = ('tournament',)

    # Checks if a new participation can be added
    def save_model(self, request, obj, form, change):
        tournament = obj.tournament
        if (tournament.num_players >= tournament.max_players):
            raise forms.ValidationError("The max number of participations for this tournament has been reached.")
            
        tournament.num_players += 1
        super().save_model(request, obj, form, change)

        # If the tournament is full, create the rounds and the games of the first round
        if (tournament.num_players >= tournament.max_players):
            tournament.is_closed = True
            rounds = int(math.log2(tournament.max_players))
            for round_number in range(1, rounds+1):
                round = Round.objects.create(tournament=tournament, number=round_number)
                if round_number == 1:
                    participants = Participation.objects.filter(tournament=tournament)
                    participants_count = participants.count()
                    for i in range(0, participants_count, 2):
                        player1 = participants[i].player
                        player2 = participants[i + 1].player
                        new_game = Game.objects.create(player1=player1, player2=player2, is_tournament_game=True)
                        RoundGame.objects.create(round=round, game=new_game)

        tournament.save()

        player = obj.player
        message = f"You were assigned in {tournament.name}. Good luck!"
        link = "http://localhost:8100/tabs/tournaments"
        notification = Notification.objects.create(player=player, text=message, link=link)
        notification.save()

    # Decreases the number of the players of the tournament
    def delete_model(self, request, obj):
        tournament = obj.tournament
        tournament.num_players -= 1

        if tournament.num_players < tournament.max_players:
            tournament.is_closed = False

        tournament.save()
        super().delete_model(request, obj)
    
    # Updates the number of players when using the multi-selection 
    def delete_queryset(self, request, queryset):
        tournaments = set()
        for participation in queryset:
            tournaments.add(participation.tournament)

        super().delete_queryset(request, queryset)

        for tournament in tournaments:
            num_participations = Participation.objects.filter(tournament=tournament).count()
            tournament.num_players = num_participations

            if num_participations >= tournament.max_players:
                tournament.is_closed = True
            else:
                tournament.is_closed = False

            tournament.save()

class FriendListAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender', 'receiver',)

class FriendRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender', 'receiver',)

class GameAdmin(admin.ModelAdmin):
    list_display = ('id', 'player1', 'player2', 'winner', 'word',)

class RoundAdmin(admin.ModelAdmin):
    list_display = ('id', 'tournament', 'number',)

class RoundGameAdmin(admin.ModelAdmin):
    list_display = ('id', 'round', 'game',)

# Register all the models
admin.site.register(RoundGame, RoundGameAdmin)
admin.site.register(Round, RoundAdmin)
admin.site.register(Game, GameAdmin)
admin.site.register(FriendRequest, FriendRequestAdmin)
admin.site.register(FriendList, FriendListAdmin)
admin.site.register(Participation, ParticipationAdmin)
admin.site.register(Tournament, TournamentAdmin)
admin.site.register(Notification, NotificationAdmin)
admin.site.register(ClassicWordle, ClassicWordleAdmin)
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Player, PlayerAdmin)
admin.site.register(StaffCode, StaffCodeAdmin)