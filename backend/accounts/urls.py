from django.urls import path

from .views import CurrentUserView, RegistrationView


urlpatterns = [
    path("auth/register/", RegistrationView.as_view(), name="register"),
    path("me/", CurrentUserView.as_view(), name="current_user"),
    path("protected/", CurrentUserView.as_view(), name="protected_data"),
]
