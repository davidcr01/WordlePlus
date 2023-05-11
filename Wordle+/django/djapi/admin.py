from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import CustomUser, Player

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active',)
    list_filter = ('username', 'email', 'is_staff', 'is_active',)
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (('Personal info'), {'fields': ('first_name', 'last_name', 'email', 'avatar')}),
        (('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2'),
        }),
    )

    readonly_fields = ('last_login', 'date_joined', 'username', 'is_superuser')

class PlayerAdmin(admin.ModelAdmin):
    list_display = ('user', 'wins', 'wins_pvp', 'wins_tournament', 'xp',)
    list_filter = ('user',)
    search_fields = ('user__username', 'user__email',)


admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Player, PlayerAdmin)
