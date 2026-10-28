from django.apps import AppConfig


class AuditLogsConfig(AppConfig):
    name = 'audit_logs'
    def ready(self):
        import audit_logs.signals