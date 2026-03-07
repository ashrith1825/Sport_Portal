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

The application follows a modern full-stack architecture with a **Spring Boot** backend providing RESTful APIs secured with JWT authentication, and a **React** frontend delivering a responsive single-page application experience.

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
| **Java 17** | Primary programming language |
| **Spring Boot 3.3.6** | Web framework and application server |
| **Spring Security** | Authentication and authorization |
| **Spring Data JPA** | Database ORM with Hibernate |
| **MySQL** | Relational database (Aiven Cloud hosted) |
| **JWT (JJWT 0.12.5)** | Token-based authentication |
| **BCrypt** | Password hashing |
| **Lombok** | Boilerplate code reduction |
| **Maven** | Build and dependency management |

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
│  │                   Spring Boot Application                │    │
│  │                                                          │    │
│  │  ┌──────────────┐     ┌──────────────┐                  │    │
│  │  │  Controllers │ ◄── │   Security   │                  │    │
│  │  │  (REST API)  │     │  (JWT Auth)  │                  │    │
│  │  └──────┬───────┘     └──────────────┘                  │    │
│  │         │                                                │    │
│  │         ▼                                                │    │
│  │  ┌──────────────┐                                        │    │
│  │  │   Services   │  (Business Logic)                      │    │
│  │  └──────┬───────┘                                        │    │
│  │         │                                                │    │
│  │         ▼                                                │    │
│  │  ┌──────────────┐                                        │    │
│  │  │ Repositories │  (Data Access Layer)                   │    │
│  │  └──────┬───────┘                                        │    │
│  │         │                                                │    │
│  │         ▼                                                │    │
│  │  ┌──────────────┐                                        │    │
│  │  │   Entities   │  (JPA Models)                          │    │
│  │  └──────────────┘                                        │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE                                  │
│                   MySQL (Aiven Cloud)                           │
│    ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐      │
│    │ Users  │ │ Clubs  │ │ Teams  │ │ Events │ │Journals│      │
│    └────────┘ └────────┘ └────────┘ └────────┘ └────────┘      │
│                     ┌────────────┐                              │
│                     │Friendships │                              │
│                     └────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

### Backend Layer Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Controller Layer                      │
│         (REST Endpoints - Request/Response)             │
│   AuthController | ClubController | EventController     │
│   TeamController | FriendshipController | JournalController │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     Service Layer                        │
│              (Business Logic & Validation)              │
│    AuthService | ClubService | EventService | etc.      │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   Repository Layer                       │
│            (Data Access - Spring Data JPA)              │
│   UserRepository | ClubRepository | EventRepository     │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     Entity Layer                         │
│               (Database Models - Hibernate)             │
│     User | Club | Team | Event | Journal | Friendship   │
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

### User Registration & Authentication Flow
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   User      │     │   Frontend   │     │   Backend   │
└──────┬──────┘     └──────┬───────┘     └──────┬──────┘
       │                   │                    │
       │  Fill Register    │                    │
       │  Form             │                    │
       ├──────────────────►│                    │
       │                   │  POST /auth/register
       │                   ├───────────────────►│
       │                   │                    │ Validate Input
       │                   │                    │ Hash Password
       │                   │                    │ Generate FriendCode
       │                   │                    │ Save User
       │                   │    Success Response│
       │                   │◄───────────────────┤
       │   Redirect to     │                    │
       │   Login           │                    │
       │◄──────────────────┤                    │
       │                   │                    │
       │  Enter Credentials│                    │
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
| `/dashboard` | Dashboard.jsx | Home with stats & quick actions | Yes |
| `/events` | Events.jsx | Browse, create, manage events with map | Yes |
| `/clubs` | Clubs.jsx | Browse, create, manage clubs | Yes |
| `/teams` | Teams.jsx | View and manage team rosters | Yes |
| `/journals` | Journals.jsx | Create and browse journals | Yes |
| `/friends` | Friends.jsx | Manage friendships & requests | Yes |
| `/profile` | Profile.jsx | User profile settings | Yes |

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
- Java 17 or higher
- Node.js 18 or higher
- Maven 3.8+
- MySQL database (local or cloud)

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
mvn clean install

# Run the application
mvn spring-boot:run
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

---

## ⚙️ Configuration

### Backend Configuration (application.properties)
```properties
# Server
server.port=8080

# Database
spring.datasource.url=jdbc:mysql://<host>:<port>/<database>
spring.datasource.username=<username>
spring.datasource.password=<password>

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT
jwt.secret=<32-character-hex-secret>
jwt.expiration=86400000

# CORS
cors.allowed-origins=http://localhost:3000,http://localhost:5173
```

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
├── backend/                     # Spring Boot backend
│   ├── pom.xml                  # Maven dependencies
│   └── src/main/java/com/sportportal/
│       ├── SportPortalApplication.java
│       ├── config/              # Security & data config
│       ├── controller/          # REST endpoints
│       ├── dto/                 # Data transfer objects
│       ├── entity/              # JPA entities
│       ├── exception/           # Custom exceptions
│       ├── repository/          # Data access layer
│       ├── security/            # JWT & auth
│       └── service/             # Business logic
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
