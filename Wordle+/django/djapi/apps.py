from django.apps import AppConfig


class DjapiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'djapi'

    def ready(self):
        import djapi.signals
