from rest_framework import permissions

# This permission protects every API call to use them only
# if the user is authenticated, except the creation of new users
class IsCreationOrIsAuthenticated(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            if view.action == 'create':
                return True
            else:
                return False
        else:
            return True