from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken


User = get_user_model()


class AuthenticationApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="demo",
            email="demo@example.com",
            password="Correct-Horse-Battery-42!",
        )

    def test_login_returns_access_and_refresh_tokens(self):
        response = self.client.post(
            "/api/auth/token/",
            {"username": "demo", "password": "Correct-Horse-Battery-42!"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_invalid_credentials_are_rejected(self):
        response = self.client.post(
            "/api/auth/token/",
            {"username": "demo", "password": "wrong-password"},
            format="json",
        )

        self.assertEqual(response.status_code, 401)

    def test_protected_endpoint_requires_valid_access_token(self):
        response = self.client.get("/api/me/")
        self.assertEqual(response.status_code, 401)

        access_token = str(RefreshToken.for_user(self.user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        response = self.client.get("/api/me/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["username"], "demo")

    def test_refresh_endpoint_returns_new_access_token(self):
        refresh_token = str(RefreshToken.for_user(self.user))
        response = self.client.post(
            "/api/auth/token/refresh/",
            {"refresh": refresh_token},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
