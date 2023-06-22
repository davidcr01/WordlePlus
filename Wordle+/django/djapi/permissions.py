from rest_framework import permissions

# Important: the superuser has all the permissions, so it is not necessary
# to explicitly check if the user is a superuser

"""
Permission that verifies if the user is a player (is_staff is False)
"""
class IsPlayerPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return not request.user.is_staff

"""
Permission that allows access if the user is the owner of the object or is an admin (staff).
"""
class IsOwnerPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):

        # Allows if the owner of the object is the user
        if hasattr(obj, 'user'):
            return obj.user == request.user

"""
Permission that allows access if the user is the owner of the account or is an admin.
"""
class IsOwnerOrAdminPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Case of comparing an user
        if obj == request.user:
            return True
        # Case of comparing a player, the user information is inside `obj`
        if hasattr(obj, 'user') and obj.user == request.user:
            return True
        
        if request.user.is_staff and not obj.is_superuser:
            return True
        
        return False
    
"""
This permission protects every API call to use them only
if the user is authenticated, except the creation of new users
"""
class IsCreationOrIsAuthenticated(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            if view.action == 'create':
                return True
            else:
                return False
        else:
            return True