from django.dispatch import receiver
from django.db.models.signals import post_save
from .models import Game, RoundGame, Round
import math

# Singal executed every time a tournament game is completed
@receiver(post_save, sender=Game)
def game_completed(sender, instance, created, **kwargs):
    if instance.is_tournament_game and instance.winner:
        round = Round.objects.filter(roundgame__game=instance).last()
        if round:
            round_games = RoundGame.objects.filter(round=round)
            if all(game.game.winner for game in round_games):
                tournament = round.tournament
                # Get current round
                current_round_number = tournament.current_round
                num_rounds = int(math.log2(tournament.max_players))

                # Get winners of current round
                winners = [game.game.winner for game in round_games]

                # If its the last round, games are not created (tournament end)
                if current_round_number == num_rounds:
                    winner = instance.winner
                    winner.wins_tournament += 1
                    winner.xp += 1000
                    winner.save()
                else:
                    # Get next round
                    next_round_number = current_round_number + 1
                    next_round = Round.objects.get(tournament=tournament, number=next_round_number)
                    tournament.current_round = next_round_number
                    tournament.save()

                    # Create games and assign them to the round
                    for i in range(0, len(winners), 2):
                        player1 = winners[i]
                        player2 = winners[i + 1]
                        new_game = Game.objects.create(player1=player1, player2=player2, is_tournament_game=True)
                        RoundGame.objects.create(round=next_round, game=new_game)
