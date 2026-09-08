from rest_framework import status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from .models import LoginRecord
from .serializers import UserSerializer, RegisterSerializer, LoginRecordSerializer

User = get_user_model()

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip()
        password = request.data.get('password')
        ip_addr = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')

        if not email or not password:
            LoginRecord.objects.create(
                user=None,
                email=email,
                ip_address=ip_addr,
                user_agent=user_agent,
                status='FAILED',
                failure_reason='Missing email or password'
            )
            return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user_obj = None
        try:
            user_obj = User.objects.get(email=email)
            username = user_obj.username
        except User.DoesNotExist:
            LoginRecord.objects.create(
                user=None,
                email=email,
                ip_address=ip_addr,
                user_agent=user_agent,
                status='FAILED',
                failure_reason='Account does not exist'
            )
            return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

        user = authenticate(username=email, password=password)
        if not user and user_obj and user_obj.check_password(password):
            user = user_obj

        if user:
            LoginRecord.objects.create(
                user=user,
                email=email,
                ip_address=ip_addr,
                user_agent=user_agent,
                status='SUCCESS'
            )

            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_200_OK)

        LoginRecord.objects.create(
            user=user_obj,
            email=email,
            ip_address=ip_addr,
            user_agent=user_agent,
            status='FAILED',
            failure_reason='Incorrect password'
        )
        return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

class UserMeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class LoginHistoryView(generics.ListAPIView):
    """
    Audit log view - strictly restricted to Admins / Superusers.
    Regular users get 403 Forbidden.
    """
    serializer_class = LoginRecordSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return LoginRecord.objects.all().select_related('user')

