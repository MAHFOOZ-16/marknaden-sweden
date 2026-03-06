# Marknaden - Sweden's Next-Gen Marketplace

Marknaden is a state-of-the-art, high-performance web application designed to be the next generation of online marketplaces. It boasts a premium "Apple-like" cinematic user interface, lightning-fast search and filtering, and real-time chat between buyers and sellers.

---

## 🏗️ Architecture & Tech Stack

This project is built using a modern decoupled architecture, where the **Frontend** talks strictly to the **Backend** via REST APIs, and authentication is handled by a third-party identity provider (**Auth0**).

### 🖥️ Frontend Stack (Client-Side)
*   **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
*   **Language:** TypeScript (`.ts`, `.tsx`)
*   **Styling:** Tailwind CSS (with highly customized utility classes)
*   **Animations:** Framer Motion (used for cinematic page loading and 3D effects)
*   **State Management:** React Context (`FavoritesContext`, `AuthTokenProvider`) + URL Query Parameters for routing state.

#### Key Frontend Directories:
*   `frontend/app/`: The core Next.js routing directory. Every folder here corresponds to a web page route (e.g. `frontend/app/sell` renders `http://localhost:3000/sell`).
*   `frontend/components/`: Reusable React UI components (like `Navbar`, `ListingCard`, `Footer`).
*   `frontend/lib/`: Core utilities and types. The `api.ts` file lives here, containing all the functions that allow the frontend to talk to the backend.

---

### ⚙️ Backend Stack (Server-Side)
*   **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (High-performance Python web framework)
*   **Language:** Python 3.12
*   **ORM:** SQLAlchemy (Async)
*   **Migrations:** Alembic
*   **Validation:** Pydantic (ensures data coming from the frontend is strictly typed and secure).

#### Key Backend Directories:
*   `backend/app/api/routes/`: The actual API endpoints (e.g., `/api/v1/listings`, `/api/v1/chat`). This is where the business logic lives.
*   `backend/app/models/`: SQLAlchemy database schema definitions (User, Listing, Message, etc.).
*   `backend/app/schemas/`: Pydantic models for request/response bodies.
*   `backend/app/core/`: Security (`auth.py`), Database connection strings (`database.py`), and settings (`config.py`).

---

## 💾 Data Storage

All data is stored persistently in **PostgreSQL**, an enterprise-grade relational database.

### How it runs:
*   The project uses **Docker Compose** (`docker-compose.yml` in the root) to automatically spin up a local PostgreSQL database container named `db`.
*   The backend connects to it over `asyncpg` (an asynchronous Postgres driver) to ensure it can handle thousands of simultaneous users querying listings without blocking the server.
*   **Database Tables:** We have distinct tables for `users`, `categories`, `listings`, `favorites`, `conversations`, and `messages`.
*   **Media:** Currently, images uploaded during the listing creation process are serialized as Base64 strings directly in the database logic. *(In a production environment, this would be swapped out for AWS S3).*

---

## 🔐 Authentication Flow

We use **Auth0** for extremely secure, industry-standard identity management. Here is how the flow works when a user wants to log in or post an ad:

1.  **Frontend Login Trigger:** The user clicks "Sign In" on the `Navbar.tsx`.
2.  **Auth0 Hosted Page:** Next.js redirects the user to the `dev-nc7m1b5u53tsisac.eu.auth0.com` secure login page. The user signs in via Google or Email/Password.
3.  **Token Issuance:** Auth0 redirects the user back to the frontend (`/api/auth/callback`) and issues a highly secure JWT (JSON Web Token).
4.  **Frontend Interceptor:** Our `AuthTokenProvider` component extracts this JWT and attaches it to the `api.ts` client.
5.  **Backend Verification:** When the frontend tries to save a new listing or send a chat message, it includes this JWT in the HTTP headers (`Authorization: Bearer <token>`).
6.  **`core/auth.py`:** The FastAPI backend takes this token, connects directly to Auth0 using our API configuration, verifies that the token wasn't tampered with, and automatically extracts the user's AuthID. If they don't exist in our PostgreSQL database yet, it auto-creates a User record for them!

---

## 🗺️ Routing Overview

Because we are fully decoupled, there are two distinct sets of routes:

### End-User Routes (Next.js - What the user sees in the browser)
*   `/` : The cinematic landing page showcasing popular categories and new items.
*   `/listings` : The browse/search engine page to filter items by price and category.
*   `/listings/[id]` : The detailed view of a specific item to see photos and contact the seller.
*   `/sell` : The multi-step wizard to post a new ad.
*   `/profile` : The dashboard containing your active listings and your mock account balance.
*   `/chat` : The real-time messaging interface containing your open conversations.
*   `/admin` : A role-protected dashboard for site executives to manage stats and ban users.

### Server Routes (FastAPI - What the browser requests behind the scenes)
*   `GET /api/v1/listings` : Fetches paginated items.
*   `POST /api/v1/listings` : Saves a newly created ad from the `/sell` page wizard.
*   `GET /api/v1/users/me` : Auto-identifies the logged-in user and returns their database profile.
*   `POST /api/v1/chat/conversations` : Generates a chat channel between a buyer and a seller.

---

## 🚀 Running the Project Locally

**1. Start the Database**
```bash
docker-compose up -d
```

**2. Start the Backend API (Terminal 1)**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```
*API Docs available at: http://localhost:8000/docs*

**3. Start the Frontend App (Terminal 2)**
```bash
cd frontend
npm run dev
```
*App available at: http://localhost:3000*
