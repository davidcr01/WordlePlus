from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import CustomUser, Player

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
            'fields': ('username', 'email', 'password1', 'password2'),
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


admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Player, PlayerAdmin)
