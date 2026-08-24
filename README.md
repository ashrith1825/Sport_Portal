# Sport Portal

A modern sports community web app to discover clubs and events, build teams, connect with people, and share stories. This README is focused and practical — written for maintainers and contributors and updated to reflect recent feature requests: club chat, friend messaging, journal detail pages, a homepage data-fix, unified UI, and a theme toggle.

Summary of requested improvements
- Persistent, text-only chat for clubs (admins/owners have moderation controls)
- Direct text messaging between friends (text only, no attachments)
- Fix homepage so clubs, events, and journals load on first visit
- Journals open into a detailed read view (not just excerpts)
- Unified component system and a light/dark theme toggle

Quick start

Backend
```powershell
cd backend
npm install
# copy .env from backend/.env.example and set values
npm run dev
```

Frontend
```bash
cd frontend
npm install
# set VITE_API_BASE_URL in .env if needed
npm run dev
```

What's in the repo (high level)
- `backend/` — Node + Express API, Mongoose models, controllers, routes
- `frontend/` — React + Vite app, Axios services, components, pages, contexts

Key features (current + planned)
- Authentication: JWT-based login and registration
- Users: profiles, friend codes, discovery, friend requests
- Clubs: create, join/leave, owner controls, members, club chat (planned)
- Teams: team creation and roster management inside clubs
- Events: create events with geolocation, join/leave, map view
- Journals: write and publish stories; planned detail pages for full reading
- Messaging (planned): club chat and direct friend messages (text only)

Developer notes — prioritized implementation plan

1) Fix homepage data loading (high priority)
- Symptom: homepage remains empty or stale until entity pages are visited.
- Cause (likely): `Home` does not call the same API services as the entity pages, or initial data load is gated behind navigation.
- Fix: call shared API service functions from `frontend/src/pages/Home.jsx` (or expose `loadInitialData()` in `frontend/src/api/services.js`) inside a `useEffect(() => { loadInitialData(); }, [])`. If the project uses a context/provider for data, call the loader from `App.jsx` after auth resolves.

2) Add chat (club + direct messages)
- Backend: add Mongoose models (`ClubMessage`, `DirectMessage`) and routes:
  - `GET /clubs/:id/messages` — list messages (paginated)
  - `POST /clubs/:id/messages` — create message (club member only)
  - `GET /messages/direct/:friendId` — conversation with a friend
  - `POST /messages/direct/:friendId` — send direct message
- Frontend: add a collapsible chat panel in the club detail page and a friend chat drawer. Start with polling every 2–3s; optionally upgrade to WebSockets later.

3) Journals detail view
- Ensure `JournalCard` links to `/journals/:id` and implement `JournalDetail.jsx` to call `GET /journals/:id` and render the full article with author meta and related content.

4) Theme & UI unification
- Add `ThemeContext` with CSS variable tokens (dark-first palette + light variant) and a navbar toggle.
- Centralize spacing/type/color tokens in `frontend/src/styles/vars.css` and have core components (`ClubCard`, `EventCard`, `JournalCard`) consume the same tokens.

Security and moderation
- Sanitize all message text server-side (no HTML allowed).
- Enforce authorization: only club members may post to club chat; only accepted friends may DM.
- Add basic rate-limiting on message endpoints to reduce spam (1 msg/sec user rate limit recommended).

API reference (essential)
- Base: `http://localhost:8080/api`
- Auth: `POST /auth/register`, `POST /auth/login`
- Users: `GET /users/me`, `GET /users`, `GET /users/code/:friendCode`
- Clubs: `GET /clubs`, `GET /clubs/:id`, `POST /clubs`, `POST /clubs/:id/join`
- Events: `GET /events`, `GET /events/upcoming`, `GET /events/:id`
- Journals: `GET /journals`, `GET /journals/:id`, `POST /journals`
- Messages (planned): `GET /clubs/:id/messages`, `POST /clubs/:id/messages`, `GET /messages/direct/:friendId`, `POST /messages/direct/:friendId`

Next steps I can take now (pick one)
- Fix homepage data load (small, fast frontend change) — recommended first.
- Scaffold backend message models and routes (DB + API changes).
- Add frontend club chat UI and friend chat drawer (requires backend endpoints).
- Implement theme toggle and migrate core tokens.

If you want me to start now, tell me which task to begin with (I recommend: homepage fix → club chat → friend chat → theme). I will implement, test locally, and provide diffs.

Author
- Ashrith Reddy

Made with ❤️ for sports communities.
