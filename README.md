## Wellness Hub – Image Wellness Marketplace

Full‑stack skeleton for a wellness marketplace with separate dashboards for **patient**, **practitioner**, and **admin**, plus **landing**, **login**, and **registration** pages.

- **Frontend**: React + Vite + TypeScript + Tailwind CSS (`frontend/`)
- **Backend**: Spring Boot (Java 17) + JWT auth + WebSocket STOMP (`backend/`)
- **Database**: MySQL

### Frontend

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

Key routes:

- `/` – marketing landing page (matches provided design)
- `/login` – login (role selector)
- `/register` – registration (role + location stub)
- `/dashboard/user` – patient dashboard
- `/dashboard/practitioner` – practitioner dashboard
- `/dashboard/admin` – admin dashboard

### Backend

Prerequisite: Java 17+, Maven installed, and a running MySQL instance.

1. Update DB credentials and JWT secret in `backend/src/main/resources/application.properties`.
2. From `backend/`:

```bash
mvn clean package
mvn spring-boot:run
```

Main pieces:

- `WellnessBackendApplication` – Spring Boot entry point
- `user` package – `UserEntity`, `UserRole`, `UserRepository`
- `auth` package – `AuthController`, DTOs, register/login returning **access + refresh JWT tokens**
- `security` package – `JwtService`, `JwtAuthenticationFilter`, `SecurityConfig` (stateless, CORS for `http://localhost:5173`)
- `realtime` package – `WebSocketConfig` exposes STOMP endpoint at `/ws` with `/app` prefix and `/topic` broker

### Maps & Location (frontend hooks)

- `RegisterPage` includes a **“Use current location”** button – wire it to `navigator.geolocation.getCurrentPosition`.
- For Google Maps, include the JS API (with your key) in `index.html` and render a map component where desired (e.g., in dashboards).

### Real‑time Messaging

- Backend exposes a STOMP/WebSocket endpoint at `/ws` (`WebSocketConfig`).
- On the frontend, add `@stomp/stompjs` or a similar client and connect to `ws://localhost:8080/ws` to build real‑time patient–practitioner chat or admin support.

