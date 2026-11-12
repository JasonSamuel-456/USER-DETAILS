# User Details Management System

A production-ready full stack web application to manage and retrieve user details, built with **React**, **Python + FastAPI**, and **MySQL**.

---

## 🚀 Features

- **User Details Directory**: View comprehensive user profiles including full name, role, department, contact info (email & phone), physical address, country, status badge, join date, and custom bio.
- **Dual View Modes**: Switch seamlessly between interactive **Table View** and modern **Grid Card View**.
- **Search & Filters**: Instant full-text search across names, emails, roles, and cities, plus instant filtering by Department and Status (Active, Inactive, Pending).
- **Sorting & Pagination**: Sort by ID, Name, Email, or Department (ascending/descending) with configurable page sizes (5, 10, 20, 50).
- **Full CRUD Operations**:
  - **Create**: Add new user records with real-time field validation.
  - **Read**: View detailed user profile modal with system audit metadata.
  - **Update**: Edit existing user details with pre-populated form values.
  - **Delete**: Safely delete user records with confirmation modal.
- **Live Database Status Indicator**: Real-time health check indicating MySQL connectivity directly in the navigation bar.
- **Auto-Seeding**: Automatic initialization with sample user records if the table is empty, plus a manual "Seed Sample Data" button.

---

## 🛠 Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React 19 + Vite | Fast, responsive modern UI with Lucide icons |
| **Backend** | Python 3 + FastAPI | High-performance asynchronous REST API |
| **ORM / Driver** | SQLAlchemy 2.0 + PyMySQL + Cryptography | Secure SQL execution and connection pooling |
| **Database** | MySQL Server 8.0+ | Relational storage for user profiles |

---

## 📁 Project Structure

```text
User details/
├── backend/
│   ├── .env                 # Database credentials & configuration
│   ├── .env.example         # Example configuration template
│   ├── requirements.txt     # Python backend dependencies
│   ├── main.py              # FastAPI endpoints & CORS configuration
│   ├── database.py          # SQLAlchemy engine, session & auto-create database
│   ├── models.py            # SQLAlchemy database models (users table)
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── crud.py              # Database query logic
│   └── seed_data.py         # Sample user data seeder
├── frontend/
│   ├── package.json         # Node.js dependencies & scripts
│   ├── vite.config.js       # Vite build configuration
│   ├── index.html           # HTML5 entry template
│   └── src/
│       ├── main.jsx         # React application entry
│       ├── App.jsx          # Root application component
│       ├── index.css        # Clean responsive styling & design tokens
│       ├── api/
│       │   └── usersApi.js  # REST API fetch client
│       └── components/
│           ├── Navbar.jsx
│           ├── StatsCard.jsx
│           ├── SearchFilter.jsx
│           ├── UserList.jsx
│           ├── UserDetailModal.jsx
│           ├── UserFormModal.jsx
│           ├── DeleteConfirmModal.jsx
│           ├── Pagination.jsx
│           └── ConnectionBanner.jsx
├── database_schema.sql      # Raw SQL schema & sample data script
├── run_backend.bat          # 1-click script to run FastAPI server
├── run_frontend.bat         # 1-click script to run React frontend
├── start_project.bat        # 1-click launcher for both services
└── README.md
```

---

## ⚙️ Configuration & Setup

### 1. Database Configuration (`backend/.env`)

Open `backend/.env` and update with your MySQL credentials:

```env
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_HOST=localhost
DB_PORT=3306
DB_NAME=user_details_db
```

> **Note:** The backend automatically creates the `user_details_db` database and `users` table on startup if they do not already exist.

Alternatively, you can manually execute `database_schema.sql` in MySQL Workbench or mysql CLI:
```bash
mysql -u root -p < database_schema.sql
```

---

## 🏃 Running the Application

### Option A: One-Click Launch (Recommended)
Double-click `start_project.bat` from the project folder. This will automatically open both the FastAPI backend and React frontend in separate windows.

---

### Option B: Manual Command Line

#### 1. Start FastAPI Backend:
```powershell
cd backend
.\venv\Scripts\activate
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
- API Base URL: `http://localhost:8000`
- Interactive Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- Interactive ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

#### 2. Start React Frontend:
```powershell
cd frontend
npm run dev
```
- Open browser at: [http://localhost:5173](http://localhost:5173)

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API status and root summary |
| `GET` | `/api/health` | Live health check for API and MySQL |
| `GET` | `/api/stats` | Aggregate user statistics & departments |
| `GET` | `/api/users` | List users with pagination, search, filters & sort |
| `GET` | `/api/users/{id}` | Retrieve full details of a specific user |
| `POST` | `/api/users` | Create a new user with validation |
| `PUT` | `/api/users/{id}` | Update existing user details |
| `DELETE` | `/api/users/{id}` | Delete a user record permanently |
| `POST` | `/api/seed` | Seed default sample user dataset |

---

## 🗄️ Database Schema (`users` Table)

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INT` | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| `first_name` | `VARCHAR(100)` | NOT NULL | User first name |
| `last_name` | `VARCHAR(100)` | NOT NULL | User last name |
| `email` | `VARCHAR(150)` | NOT NULL, UNIQUE, INDEX | User email address |
| `phone` | `VARCHAR(30)` | NULL | Contact phone number |
| `role` | `VARCHAR(100)` | NOT NULL | Job title / Role |
| `department` | `VARCHAR(100)` | NOT NULL, INDEX | Department name |
| `address` | `VARCHAR(255)` | NULL | Street address |
| `city` | `VARCHAR(100)` | NULL | City |
| `country` | `VARCHAR(100)` | NULL | Country |
| `status` | `VARCHAR(50)` | NOT NULL, INDEX | `Active`, `Inactive`, `Pending` |
| `avatar_url` | `VARCHAR(500)` | NULL | Profile image link |
| `bio` | `TEXT` | NULL | Profile description |
| `created_at` | `DATETIME` | NOT NULL, DEFAULT NOW | Account creation timestamp |
| `updated_at` | `DATETIME` | NOT NULL, ON UPDATE NOW | Last profile update timestamp |
