# 🏆 Sport Portal

A comprehensive sports community platform designed to connect sports enthusiasts, manage clubs and teams, organize events, and build meaningful connections through shared sporting interests.

---

## 📋 Table of Contents

- [Abstract](#abstract)
- [Problem Statement](#problem-statement)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Application Workflow](#application-workflow)
- [Frontend Pages](#frontend-pages)
- [Security Implementation](#security-implementation)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)

---

## 📖 Abstract

**Sport Portal** is a full-stack web application that serves as a one-stop platform for sports enthusiasts to discover sporting opportunities, create and manage sports clubs, organize events with geolocation support, build teams, connect with fellow sports lovers, and document their sports journey through journals.

The platform bridges the gap between fragmented sports communities by providing a centralized hub where users can:
- Discover and join local sports clubs organized by sport type
- Create and participate in sports events with location mapping
- Build teams within clubs and manage team rosters
- Connect with friends using unique friend codes
- Share sports experiences through journal entries

The application follows a modern full-stack architecture with a **Node.js + Express** backend providing RESTful APIs secured with JWT authentication, and a **React** frontend delivering a responsive single-page application experience.

---

## 🎯 Problem Statement

The sports community faces several challenges that Sport Portal aims to solve:

| Problem | Solution |
|---------|----------|
| **Fragmented Community Management** | Centralized platform for clubs, teams, and events |
| **Difficulty Finding Local Events** | Event discovery with geolocation and sport filtering |
| **Challenge Organizing Activities** | Easy event creation with participant management |
| **No Sports-Specific Social Platform** | Friend system with unique codes and journal sharing |
| **Scattered Team Management** | Hierarchical club → team → member structure |

---

## ✨ Features

### 🔐 Authentication & User Management
- **User Registration** with validation (username, email, password)
- **Secure Login** with JWT token generation (24-hour expiration)
- **Profile Management** - Update name, phone, avatar, bio
- **Friend Codes** - 8-character unique codes for easy user discovery
- **User Discovery** - Browse users and search by friend code

### 🏟️ Clubs Module
- **Create Clubs** - Establish sports clubs with description and logo
- **Browse & Filter** - View all clubs or filter by sport type
- **Search** - Keyword-based club search
- **Membership** - Join/leave clubs as a member
- **Owner Management** - Club owners can update/delete their clubs
- **Member Tracking** - View club member lists

### 👥 Teams Module
- **Create Teams** - Establish teams within clubs
- **Captain System** - Designate team captains for leadership
- **Member Management** - Add/remove team members
- **Club Association** - Teams belong to specific clubs

### 📅 Events Module
- **Event Creation** - Organize events with date, location, and participant limits
- **Geolocation Support** - Events include latitude/longitude for map display
- **Event Discovery** - Filter by sport type and search by keywords
- **Participation** - Join/leave events with real-time participant tracking
- **Status Tracking** - UPCOMING, ONGOING, COMPLETED, CANCELLED states
- **My Events** - View personally created and joined events

### 🤝 Friendships Module
- **Friend Requests** - Send requests by User ID or Friend Code
- **Request Management** - Accept/reject incoming requests
- **Friend List** - View all accepted friendships
- **Pending Requests** - Track incoming friend requests
- **Unfriend** - Remove friends from your list

### 📝 Journals Module
- **Create Journals** - Write sports experience posts with images
- **Browse & Filter** - View all journals or filter by sport
- **Search** - Keyword-based journal search
- **Author Management** - Update/delete your own journals
- **Rich Content** - Support for title, content, sport type, and images

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js 20** | Runtime for the backend API |
| **Express 5** | Web framework and application server |
| **MongoDB Atlas** | Cloud document database |
| **JWT (jsonwebtoken)** | Token-based authentication |
| **bcryptjs** | Password hashing |
| **Mongoose** | MongoDB models and queries |
| **dotenv** | Environment variable management |
| **Nodemon** | Developer hot-reload workflow |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI library |
| **Vite** | Build tool and dev server |
| **React Router v7** | Client-side routing |
| **Axios** | HTTP client for API calls |
| **Leaflet + React Leaflet** | Maps and geolocation |
| **React Hot Toast** | Toast notifications |
| **React Icons** | Icon library |
| **CSS3** | Styling |
| **Context API** | Global state management |

---

## 🏗️ System Architecture

### Overall Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    React Application                     │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────┐ │    │
│  │  │ Pages   │  │Context  │  │Components│  │  Services   │ │    │
│  │  │(Routes) │  │(Auth)   │  │(UI)      │  │  (API)      │ │    │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────────┘ │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼ HTTP/REST (Axios)                │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Node / Express API                    │    │
│  │                                                          │    │
│  │  ┌──────────────┐     ┌──────────────┐                  │    │
│  │  │  Routes      │ ◄── │   JWT Auth   │                  │    │
│  │  │  (REST API)  │     │  Middleware  │                  │    │
│  │  └──────┬───────┘     └──────────────┘                  │    │
│  │         │                                                │    │
│  │         ▼                                                │    │
│  │  ┌──────────────┐                                        │    │
│  │  │ Controllers  │  (Request Handlers)                    │    │
│  │  └──────┬───────┘                                        │    │
│  │         │                                                │    │
│  │         ▼                                                │    │
│  │  ┌──────────────┐                                        │    │
│  │  │  Mongoose    │  (Model Layer)                         │    │
│  │  └──────┬───────┘                                        │    │
│  │         │                                                │    │
│  │         ▼                                                │    │
│  │  ┌──────────────┐                                        │    │
│  │  │ Collections  │  (Document Data)                      │    │
│  │  └──────────────┘                                        │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE                                  │
│                  MongoDB Atlas                                   │
│    ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐      │
│    │ users  │ │ clubs  │ │ teams  │ │ events │ │journals│      │
│    └────────┘ └────────┘ └────────┘ └────────┘ └────────┘      │
│                     ┌────────────┐                              │
│                     │friendships │                              │
│                     └────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

### Backend Layer Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Controller Layer                      │
│         (REST Endpoints - Request/Response)             │
│   auth.js | users.js | clubs.js | events.js             │
│   teams.js | friends.js | journals.js                   │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     Service Layer                        │
│              (Business Logic & Validation)              │
│    controllers + shared validation helpers              │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   Repository Layer                       │
│            (Data Access - Mongoose models)              │
│   model.find(...), populate(...), transactions         │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     Entity Layer                         │
│               (MongoDB collections and API DTOs)        │
│     users | clubs | teams | events | journals          │
│     friendships                                         │
└─────────────────────────────────────────────────────────┘
```

### Frontend Architecture
```
┌─────────────────────────────────────────────────────────┐
│                      App.jsx                            │
│                 (Router Configuration)                  │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    AuthContext                          │
│             (Global Authentication State)               │
│         user | token | login() | logout()               │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  ProtectedRoute                         │
│          (Guards Authenticated-Only Pages)              │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                      Layout                             │
│              (Navbar + Main Content Area)               │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                       Pages                             │
│  Dashboard | Events | Clubs | Teams | Friends | etc.   │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     Services                            │
│               (API Client Functions)                    │
│            axios.js + services.js                       │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│     USER     │       │     CLUB     │       │     TEAM     │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ username     │◄──────│ owner_id(FK) │       │ name         │
│ email        │       │ name         │◄──────│ club_id (FK) │
│ password     │       │ description  │       │ captain_id   │
│ friendCode   │       │ sportType    │       └──────┬───────┘
│ firstName    │       │ logoUrl      │              │
│ lastName     │       └──────┬───────┘              │
│ phone        │              │                      │
│ avatarUrl    │              │                      │
│ bio          │       ┌──────┴───────┐       ┌──────┴───────┐
│ role         │       │ CLUB_MEMBERS │       │ TEAM_MEMBERS │
│ active       │       │  (Join Table)│       │  (Join Table)│
└──────┬───────┘       └──────────────┘       └──────────────┘
       │
       │       ┌──────────────┐       ┌──────────────┐
       │       │    EVENT     │       │   JOURNAL    │
       │       ├──────────────┤       ├──────────────┤
       ├──────►│ id (PK)      │       │ id (PK)      │
       │       │ title        │       │ title        │
       │       │ description  │       │ content      │
       │       │ sportType    │       │ sportType    │
       │       │ location     │       │ imageUrl     │
       │       │ latitude     │◄──────│ author_id(FK)│
       │       │ longitude    │       └──────────────┘
       │       │ eventDate    │
       │       │ endDate      │
       │       │ maxParticipants│
       │       │ status       │
       │       │ organizer_id │
       │       └──────┬───────┘
       │              │
       │       ┌──────┴────────┐
       │       │EVENT_PARTICIPANTS│
       │       │   (Join Table)   │
       │       └──────────────────┘
       │
       │       ┌──────────────┐
       └──────►│  FRIENDSHIP  │
               ├──────────────┤
               │ id (PK)      │
               │ user_id (FK) │
               │ friend_id(FK)│
               │ status       │
               └──────────────┘
```

### Entity Details

| Entity | Fields | Description |
|--------|--------|-------------|
| **User** | id, username, email, password, friendCode, firstName, lastName, phone, avatarUrl, bio, role, active | Core user entity with unique username, email, and 8-char friend code |
| **Club** | id, name, description, sportType, logoUrl, owner_id | Sports club with owner and members |
| **Team** | id, name, club_id, captain_id | Team within a club with captain |
| **Event** | id, title, description, sportType, location, latitude, longitude, eventDate, endDate, maxParticipants, status, organizer_id | Sports event with geolocation |
| **Journal** | id, title, content, sportType, imageUrl, author_id | Sports experience journal entry |
| **Friendship** | id, user_id, friend_id, status | Friend connection (PENDING/ACCEPTED) |

### Enumerations
- **Role**: `ROLE_USER`, `ROLE_ADMIN`
- **EventStatus**: `UPCOMING`, `ONGOING`, `COMPLETED`, `CANCELLED`
- **FriendshipStatus**: `PENDING`, `ACCEPTED`

---

## 📡 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login & get JWT token | No |

### User Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users/me` | Get current user profile | Yes |
| PUT | `/users/me` | Update profile | Yes |
| GET | `/users/{id}` | Get user by ID | Yes |
| GET | `/users` | Get all users | Yes |
| GET | `/users/code/{friendCode}` | Get user by friend code | Yes |

### Club Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/clubs` | Get all clubs | No |
| GET | `/clubs/{id}` | Get club details | No |
| GET | `/clubs/sport/{sportType}` | Filter by sport | No |
| GET | `/clubs/search?keyword=` | Search clubs | No |
| GET | `/clubs/my` | Get my clubs | Yes |
| POST | `/clubs` | Create club | Yes |
| PUT | `/clubs/{id}` | Update club (owner only) | Yes |
| DELETE | `/clubs/{id}` | Delete club (owner only) | Yes |
| POST | `/clubs/{id}/join` | Join club | Yes |
| POST | `/clubs/{id}/leave` | Leave club | Yes |

### Team Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/teams/club/{clubId}` | Get teams in club | No |
| GET | `/teams/{id}` | Get team details | No |
| POST | `/teams` | Create team | Yes |
| POST | `/teams/{teamId}/members/{userId}` | Add member | Yes |
| DELETE | `/teams/{teamId}/members/{userId}` | Remove member | Yes |
| DELETE | `/teams/{id}` | Delete team | Yes |

### Event Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/events` | Get all events | No |
| GET | `/events/upcoming` | Get upcoming events | No |
| GET | `/events/{id}` | Get event details | No |
| GET | `/events/sport/{sportType}` | Filter by sport | No |
| GET | `/events/search?keyword=` | Search events | No |
| GET | `/events/my` | Get my events | Yes |
| POST | `/events` | Create event | Yes |
| PUT | `/events/{id}` | Update event (organizer only) | Yes |
| DELETE | `/events/{id}` | Delete event (organizer only) | Yes |
| POST | `/events/{id}/join` | Join event | Yes |
| POST | `/events/{id}/leave` | Leave event | Yes |

### Friendship Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/friends/request/{friendId}` | Send request by ID | Yes |
| POST | `/friends/request/code/{friendCode}` | Send request by code | Yes |
| PUT | `/friends/accept/{friendshipId}` | Accept request | Yes |
| PUT | `/friends/reject/{friendshipId}` | Reject request | Yes |

---

## 🚀 Deployment

Quick notes to deploy the app (frontend: Vercel, backend: Render) and run locally.

- **Env examples**: See `backend/.env.example` and `frontend/.env.example` for required environment variables.

- **Important backend vars**:
        - `MONGODB_URI` (full connection string)
        - `MONGODB_DB` (database name)
        - `JWT_SECRET`
        - `ALLOWED_ORIGINS` (comma-separated frontend origins)
        - `PORT` (optional; Render sets this automatically)

- **Frontend (Vercel)**:
        - Set `VITE_API_BASE_URL` to your backend URL (e.g. `https://your-backend.onrender.com/api`)
        - Build command: `npm run build`
        - Output directory: `dist`

- **Backend (Render.com)**:
        - Environment: Node 20
        - Build & start: use the provided `package.json` scripts (start uses `node src/server.js`)
        - Set environment variables listed above in the service settings

- **Local development**
        - Backend:
                ```powershell
                cd backend
                npm install
                # create .env from backend/.env.example and set values
                npm run dev
                ```
        - Frontend:
                ```bash
                cd frontend
                npm install
                # create .env from frontend/.env.example (optional)
                npm run dev
                ```

If you'd like, I can add step-by-step Render and Vercel screenshots or create CI config files next.

---

## 🧭 Deploy Guide (detailed)

Backend (Render.com)

1. Create a new Web Service on Render and connect your GitHub repo.
2. Select the `main` branch and import. If using `render.yaml`, Render can auto-create the service using that manifest.
3. Set these environment variables in Render (do NOT commit secrets):
        - `MONGODB_URI` — Atlas connection string
        - `MONGODB_DB` — database name
        - `JWT_SECRET` — random secret for JWT signing
        - `ALLOWED_ORIGINS` — e.g. `https://your-frontend.vercel.app`

   > IMPORTANT: MongoDB Atlas also blocks physical connections unless Atlas Network Access allows your deployment host. For Render, either allow Render IPs or temporarily add `0.0.0.0/0`.
4. Build Command: leave blank (Render runs install automatically) or `npm install`.
5. Start Command: `npm start` (server entry is `src/server.js`).
6. After deploy, note the service URL and set `VITE_API_BASE_URL` in your frontend project to `https://<your-backend>/api`.

Frontend (Vercel)

1. In Vercel, create a new project and import this repository. Select the `frontend` folder as the project root.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Set Environment Variable: `VITE_API_BASE_URL` to your backend API URL (e.g. `https://your-backend.onrender.com/api`).
5. Deploy — Vercel will build and publish the frontend.

Notes
- The repo includes `render.yaml` (optional) and `frontend/vercel.json` to simplify platform-specific setup.
- Make sure `ALLOWED_ORIGINS` includes your Vercel domain to allow CORS.
- For automated production deployments, consider adding GitHub Actions or Render auto-deploy settings.
| GET | `/friends` | Get my friends | Yes |
| GET | `/friends/pending` | Get pending requests | Yes |
| DELETE | `/friends/{friendshipId}` | Remove friend | Yes |

### Journal Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/journals` | Get all journals | No |
| GET | `/journals/{id}` | Get journal details | No |
| GET | `/journals/sport/{sportType}` | Filter by sport | No |
| GET | `/journals/search?keyword=` | Search journals | No |
| GET | `/journals/my` | Get my journals | Yes |
| POST | `/journals` | Create journal | Yes |
| PUT | `/journals/{id}` | Update journal (author only) | Yes |
| DELETE | `/journals/{id}` | Delete journal (author only) | Yes |

---

## 🔄 Application Workflow

### Public First Flow
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   User      │     │   Frontend   │     │   Backend   │
└──────┬──────┘     └──────┬───────┘     └──────┬──────┘
       │                   │                    │
        │  Open Home Page   │                    │
        │                   │  Public browse     │
        ├──────────────────►│                    │
        │                   │  GET /clubs        │
       │                   ├───────────────────►│
        │                   │                    │ Return featured data
        │                   │    Browse Response  │
        │                   │◄───────────────────┤
        │                   │                    │
        │  Sign in only     │                    │
        │  when creating    │                    │
        ├──────────────────►│                    │
        │                   │  POST /auth/login  │
       │                   ├───────────────────►│
       │                   │                    │ Validate Credentials
       │                   │                    │ Generate JWT Token
       │                   │   JWT Token        │
       │                   │◄───────────────────┤
        │                   │ Store in localStorage
        │   Redirect to     │                    │
        │   Dashboard       │                    │
        │◄──────────────────┤                    │
```

### Club Management Flow
```
┌─────────────────────────────────────────────────────────┐
│                    CLUB LIFECYCLE                        │
└─────────────────────────────────────────────────────────┘

    ┌─────────────┐
    │  User Login │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │ View Clubs  │◄────────────────────────────┐
    │  (Browse)   │                             │
    └──────┬──────┘                             │
           │                                    │
     ┌─────┴─────┐                              │
     ▼           ▼                              │
┌─────────┐ ┌─────────┐                         │
│ Create  │ │  Join   │                         │
│  Club   │ │  Club   │                         │
└────┬────┘ └────┬────┘                         │
     │           │                              │
     ▼           ▼                              │
┌─────────┐ ┌─────────┐                         │
│ Becomes │ │ Becomes │                         │
│  Owner  │ │ Member  │                         │
└────┬────┘ └────┬────┘                         │
     │           │                              │
     ▼           ▼                              │
┌─────────────────────┐                         │
│   Can Manage Club   │                         │
│  - Create Teams     │                         │
│  - View Members     │                         │
│  - Leave Club       │─────────────────────────┘
│  (Owner: Edit/Delete)│
└─────────────────────┘
```

### Event Participation Flow
```
┌─────────────────────────────────────────────────────────┐
│                   EVENT WORKFLOW                         │
└─────────────────────────────────────────────────────────┘

       ┌───────────────┐
       │ Create Event  │
       │  (Organizer)  │
       └───────┬───────┘
               │
               ▼
       ┌───────────────┐
       │    UPCOMING   │
       │    Status     │
       └───────┬───────┘
               │
       ┌───────┴───────┐
       ▼               ▼
┌─────────────┐ ┌─────────────┐
│ Users Join  │ │ Organizer   │
│   Event     │ │ Can Edit    │
└─────────────┘ └─────────────┘
               │
               ▼
       ┌───────────────┐
       │   ONGOING     │◄──── Event Date Reached
       │    Status     │
       └───────┬───────┘
               │
               ▼
       ┌───────────────┐
       │  COMPLETED    │◄──── Event Ended
       │    Status     │
       └───────────────┘
               │
               ▼
       ┌───────────────┐
       │  (Optional)   │
       │  CANCELLED    │◄──── Organizer Cancels
       └───────────────┘
```

### Friendship Flow
```
┌─────────────────────────────────────────────────────────┐
│                 FRIENDSHIP WORKFLOW                      │
└─────────────────────────────────────────────────────────┘

  User A                                        User B
    │                                              │
    │  Send Friend Request                         │
    │  (by ID or Friend Code)                      │
    ├─────────────────────────────────────────────►│
    │                                              │
    │              Status: PENDING                 │
    │                                              │
    │                    ┌─────────────────┐       │
    │                    │  User B Decides │       │
    │                    └────────┬────────┘       │
    │                             │                │
    │              ┌──────────────┴──────────────┐ │
    │              ▼                             ▼ │
    │       ┌──────────┐                 ┌──────────┐
    │       │  ACCEPT  │                 │  REJECT  │
    │       └────┬─────┘                 └────┬─────┘
    │            │                            │
    │            ▼                            ▼
    │   Status: ACCEPTED              Request Deleted
    │                                              │
    │◄─── Both users can see                       │
    │     each other as friends                    │
    │                                              │
    │     Can unfriend anytime ───────────────────►│
```

---

## 📱 Frontend Pages

| Route | Component | Description | Protected |
|-------|-----------|-------------|-----------|
| `/login` | Login.jsx | User authentication form | No |
| `/register` | Register.jsx | New user registration | No |
| `/` | Home.jsx | Public landing page with featured clubs, journals, and events | No |
| `/dashboard` | Dashboard.jsx | Home with stats & quick actions | Yes |
| `/events` | Events.jsx | Browse public events and manage your own | No for browse, Yes for write actions |
| `/clubs` | Clubs.jsx | Browse public clubs and manage your own | No for browse, Yes for write actions |
| `/teams` | Teams.jsx | View public teams and manage your own | No for browse, Yes for write actions |
| `/journals` | Journals.jsx | Browse public journals and manage your own | No for browse, Yes for write actions |
| `/friends` | Friends.jsx | Manage friendships & requests | Yes |
| `/profile` | Profile.jsx | User profile settings | Yes |

---

---

## 🔒 Security Implementation

### Authentication Flow
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Request    │     │ JWT Filter   │     │  Controller  │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       │  API Request       │                    │
       ├───────────────────►│                    │
       │                    │                    │
       │                    │ Extract JWT Token  │
       │                    │ from Authorization │
       │                    │ Header             │
       │                    │                    │
       │                    │ Validate Token     │
       │                    │ Load UserDetails   │
       │                    │                    │
       │                    │ Set Security       │
       │                    │ Context            │
       │                    │                    │
       │                    │ Forward Request    │
       │                    ├───────────────────►│
       │                    │                    │
       │                    │                    │ Process
       │                    │                    │ Request
       │                    │                    │
       │                    │    Response        │
       │◄───────────────────┼────────────────────┤
```

### Security Measures
1. **JWT Authentication** - Stateless token-based auth (24-hour expiration)
2. **BCrypt Password Hashing** - Secure password storage
3. **CORS Configuration** - Restricted to authorized origins (localhost:3000, localhost:5173)
4. **CSRF Disabled** - Safe with stateless JWT approach
5. **Method-Level Security** - Authorization annotations on endpoints
6. **Input Validation** - Jakarta Bean Validation on DTOs
7. **Unique Constraints** - Prevents duplicate usernames, emails, friend codes

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18 or higher
- MongoDB Atlas cluster or compatible MongoDB instance

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run the application
npm start
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080/api
- **Demo login**: `sportdemo` / `Demo@12345`

---

## ⚙️ Configuration

### Backend Configuration (.env)
```bash
PORT=8080
JWT_SECRET=<long-random-secret>
MONGODB_URI=<mongodb-atlas-uri>
MONGODB_DB=sport_portal
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

The backend connects to MongoDB Atlas at startup and seeds demo clubs, events, teams, and journals when the users collection is empty.

### Demo Account
- Username: `sportdemo`
- Email: `demo@sportportal.local`
- Password: `Demo@12345`

### Public Demo Flow
- The landing page is public and focused on browsing first.
- Guests can explore clubs, events, teams, and journals before signing in.
- Create, join, update, and delete actions remain protected.

### Frontend Configuration
```javascript
// src/api/axios.js
const API_BASE_URL = 'http://localhost:8080/api';
```

---

## 📁 Project Structure

```
Sport_Portal/
├── README.md                    # Project documentation
├── backend/                     # Node.js + Express backend
│   ├── package.json             # Node dependencies and scripts
│   └── src/
│       ├── app.js               # Express app setup
│       ├── server.js            # Server entry point
│       ├── config/              # Database and schema bootstrap
│       ├── controllers/         # Request handlers and DTO mappers
│       ├── middleware/          # JWT auth and error handling
│       └── routes/              # REST endpoints
│
└── frontend/                    # React frontend
    ├── package.json             # NPM dependencies
    ├── vite.config.js           # Vite configuration
    └── src/
        ├── App.jsx              # Router configuration
        ├── main.jsx             # Entry point
        ├── api/                 # Axios & services
        ├── components/          # Reusable UI components
        ├── context/             # Auth context
        ├── pages/               # Page components
        └── styles/              # CSS styles
```

---

## 👤 Author

**Ashrith Reddy**

---

## 📄 License

This project is for educational purposes.

---

<p align="center">
  Made with ❤️ for Sports Enthusiasts
</p>
