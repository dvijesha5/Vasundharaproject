from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, LoginRecord

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'username', 'full_name', 'is_staff', 'is_superuser', 'date_joined')
    search_fields = ('email', 'username', 'full_name')
    ordering = ('email',)


@admin.register(LoginRecord)
class LoginRecordAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'email', 'user', 'status', 'ip_address', 'failure_reason')
    list_filter = ('status', 'timestamp')
    search_fields = ('email', 'ip_address', 'user__email', 'user__full_name')
    readonly_fields = ('timestamp', 'user', 'email', 'ip_address', 'user_agent', 'status', 'failure_reason')

    def has_add_permission(self, request):
        return False  # Audit records are system-generated only

    def has_change_permission(self, request, obj=None):
        return False  # Audit records are immutable

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser

    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.is_staff
