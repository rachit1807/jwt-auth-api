<div align="center">
  <img src="public/favicon.svg" width="68" alt="Crimson Identity logo">
  <h1>Crimson Identity</h1>
  <p><strong>Secure access. Thoughtfully designed.</strong></p>
  <p>A complete JWT authentication workspace with a vivid red visual identity,<br>orbital particle motion, responsive layouts, and light & dark themes.</p>
  <p><a href="#getting-started">Get started</a> · <a href="#api-reference">API reference</a> · <a href="#security">Security</a></p>
  <p>
    <img src="https://skillicons.dev/icons?i=js,nodejs,express,postgres,html,css,git,github,vscode&theme=dark" alt="JavaScript, Node.js, Express, PostgreSQL, HTML, CSS, Git, GitHub, VS Code">
  </p>
</div>

## The experience

Crimson pairs an animated atomic identity field with a focused sign-in workspace. The interface adapts from a two-column desktop composition to a compact mobile layout. A protected account view makes session status and password security easy to understand.

- Register with validated details and bcrypt password hashing.
- Sign in with JWT-backed HttpOnly cookies.
- View your profile, active sessions, and a live session-expiry countdown.
- Sign out with server-side session revocation.
- Change your password and revoke all existing sessions.
- Switch between persistent light and dark themes.
- Reveal or hide passwords and see registration password guidance.
- Explore the built-in API reference and privacy information.
- Respect reduced-motion preferences with keyboard-accessible controls and status announcements.

## Technology

| Layer | Technology | Purpose |
| --- | --- | --- |
| Interface | HTML5, CSS3, JavaScript, Canvas | Responsive UI and particle motion |
| Server | Node.js 22+, Express 5 | Same-origin JSON API and static hosting |
| Identity | JSON Web Tokens, bcryptjs | Signed sessions and password hashing |
| Persistence | PostgreSQL; local JSON fallback | Durable hosted accounts; zero-setup local development |
| Protection | Helmet, express-rate-limit | Browser headers and authentication throttling |
| Testing | Node test runner, Supertest | Account lifecycle and security integration checks |

## Getting started

Requires Node.js 22+ and npm.

```sh
git clone https://github.com/rachit1807/jwt-auth-api.git
cd jwt-auth-api
npm ci
cp .env.example .env
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Paste the generated value into `JWT_SECRET` in `.env`, then run:

```sh
npm run dev
```

Open **http://localhost:3000**. Create your own account; no default account or shared credentials are included.

### Environment variables

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3000` | HTTP port; respects the hosting provider's port |
| `NODE_ENV` | development | Set to `production` for HTTPS-only cookies |
| `JWT_SECRET` | Required | Random secret, at least 32 characters |
| `JWT_EXPIRES_IN` | `15m` | JWT session duration |
| `DATABASE_URL` | Empty | PostgreSQL connection string |
| `DATA_DIR` | `.data` | Local fallback storage location |

Local development persists accounts in an ignored `.data/users.json`. Set `DATABASE_URL` when hosting on an ephemeral filesystem. The application creates its `users` table on startup; the database role needs permission to create this table. All database queries use parameters.

## API reference

All request bodies are JSON. Successful registration and login set the `session` HttpOnly cookie and return `{ user, expiresAt }`. They do not expose the JWT in the response body. Protected routes also accept `Authorization: Bearer <valid-jwt>` for clients that already hold a token. Browser clients should use cookies.

| Method | Route | Authentication | Behavior |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | Application health |
| `POST` | `/api/auth/register` | Public | Create account and session |
| `POST` | `/api/auth/login` | Public | Verify credentials and create session |
| `GET` | `/api/auth/me` | Required | Profile and unexpired sessions |
| `POST` | `/api/auth/logout` | Required | Revoke current session |
| `PATCH` | `/api/auth/password` | Required | Update password; revoke all sessions |

**Registration**

```json
{
  "name": "Alex Morgan",
  "email": "alex@example.com",
  "password": "ChooseYourOwn123!"
}
```

**Login:** send `email` and `password`. **Password change:** send `currentPassword` and `newPassword`.

Passwords require uppercase, lowercase, a number, and at least 10 characters, with a 72-byte maximum. Email addresses are normalized to lowercase. Registration returns `201`; successful reads and updates return `200`. Errors return `{ "message": "..." }` with `400` for invalid input, `401` for failed authentication, `403` for rejected origins, `409` for duplicate email, and `429` for throttling.

### Try with curl

```sh
curl -c cookies.txt -H 'Content-Type: application/json' \
  -d '{"name":"Alex Morgan","email":"alex@example.com","password":"ChooseYourOwn123!"}' \
  http://localhost:3000/api/auth/register
curl -b cookies.txt http://localhost:3000/api/auth/me
curl -b cookies.txt -X POST http://localhost:3000/api/auth/logout
```

Treat `cookies.txt` as a credential: keep it out of version control and remove it after testing. A Postman collection is included in `docs/`.

## Security

Passwords are hashed with bcrypt cost 12. JWT validation pins HS256, issuer, audience, signature, and expiration. Each token has a unique session identifier checked against the account record. Logout removes that identifier; password changes increment the account token version and remove all sessions. The newest ten sessions are retained per account.

Browser sessions use `HttpOnly`, `SameSite=Strict`, and production `Secure` cookies. Tokens are never stored in local storage. Mutating API calls reject a foreign `Origin`; the service does not enable cross-origin API access. Helmet supplies security headers and API responses use `Cache-Control: no-store`. Authentication endpoints are rate-limited to 20 attempts per IP per 15 minutes per process.

The app trusts one reverse proxy, matching its intended hosted topology. Review proxy settings for other infrastructures. The local JSON adapter is intended for one process; use PostgreSQL for hosted persistence. At larger scale, use a shared rate-limit store and transactional session updates. Email verification, password-reset email, MFA, and bot challenges are not implemented. This project does not claim a third-party security audit.

## Verification

```sh
npm test
npm audit --omit=dev
```

Integration tests cover invalid input, registration, duplicate email, protected profile access, incorrect login, logout revocation, password changes, password hashing, expired tokens, and cross-origin rejection. Tests use an isolated temporary data directory.

## Project structure

```text
controllers/authController.js   Registration, login, account and password handlers
middleware/authMiddleware.js    JWT and server-side session validation
models/User.js                  PostgreSQL and local persistence adapters
routes/authRoutes.js            Authentication endpoints and throttling
public/                         Responsive interface, themes, motion and favicon
tests/auth.test.js              Integration tests
docs/                           Postman collection
app.js                          Express application and security middleware
server.js                       Configuration, storage initialization and lifecycle
.env.example                    Documented environment template
```

## Deployment

Deploy this Node service with build command `npm ci` and start command `npm start`. Set a random `JWT_SECRET`, `NODE_ENV=production`, and a durable PostgreSQL `DATABASE_URL`. Use `/api/health` for health checks. Serve through HTTPS for production cookies. The same service hosts both the interface and API, so no separate frontend deployment or CORS configuration is needed.

## Author

[Rachit Tripathi](https://github.com/rachit1807)
