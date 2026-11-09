# Task Manager JWT Authentication

A small Django REST Framework API and React sign-in page demonstrating JWT authentication with Simple JWT.

## Requirements

- Python 3.10+
- Node.js 18+

## Run the backend

In PowerShell:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The API listens on `http://127.0.0.1:8000`.

## Run the frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL (normally `http://localhost:5173`) and sign in with the Django user created above.

## API

- `POST /api/auth/token/` — obtain `access` and `refresh` tokens (`username`, `password`)
- `POST /api/auth/token/refresh/` — exchange a refresh token for a new access token
- `POST /api/auth/register/` — create an account (`username`, `email`, `password`)
- `GET /api/me/` — return the authenticated user; requires `Authorization: Bearer <access>`
- `GET /api/protected/` — example protected data endpoint

Access tokens expire after five minutes; refresh tokens expire after one day. The React API helper retries a protected request once after refreshing an expired access token. Refresh-token rotation is enabled and the client stores the rotated token when returned.

## Tests

```powershell
cd backend
python manage.py test
```

## Production notes

This is a local learning example. Before production, set a strong `DJANGO_SECRET_KEY`, configure `DJANGO_DEBUG=false`, set `DJANGO_ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` to the deployment hosts, and serve over HTTPS. The demo keeps tokens in `localStorage`; a production architecture should consider HttpOnly, Secure, SameSite cookies and its corresponding CSRF protections.
