# Audio Hub

[![PyPI - Version](https://img.shields.io/pypi/v/app.svg)](https://pypi.org/project/app)
[![PyPI - Python Version](https://img.shields.io/pypi/pyversions/app.svg)](https://pypi.org/project/app)

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Installation & Setup](#installation--setup)
  - [Backend (FastAPI)](#backend-fastapi)
  - [Frontend (Next.js)](#frontend-nextjs)
  - [Database (PostgreSQL)](#database-postgresql)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Middleware](#middleware)
- [Testing](#testing)
- [License](#license)

---

## Project Overview

Audio Hub is a full-stack audio management web app built with FastAPI and Next.js. Users can register, upload audio files, manage account settings, and stream or play audio both from the database and local storage. Backend storage is powered by PostgreSQL.

---

## Features

- Upload audio files from your device to PostgreSQL
- Dashboard to view and play uploaded audio
- Page for playing local audio not in database
- JWT authentication and token-based login
- Email verification via SendGrid
- Forgot password and reset via email code
- Secure account info editing (username, password, email)
- Audio playback and streaming from backend
- PostgreSQL 

---

## Installation & Setup

### Backend (FastAPI)

1. **Clone the repository**
   ```bash
   git clone https://github.com/SDSU-CompE-561-Spring-2025/nba-sports-tracker
   cd nba-sports-tracker/PSQL_Backend
   ```

2. **Install Hatch and create environment**
   ```bash
   pip install hatch
   hatch env create
   hatch shell
   ```

3. **Install `uvicorn` if not already present**
   ```bash
   pip install "uvicorn[standard]"
   ```

4. **Set up `.env` file**
   ```
   DATABASE_URL=postgresql+asyncpg://Audio:Audio@2025@localhost/mydb
   SECRET_KEY=your_secret_key
   SENDGRID_API_KEY=your_sendgrid_api_key
   ```

5. **Run the backend**
   ```bash
   hatch run dev
   ```

---

### Frontend (Next.js)

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the frontend server**
   ```bash
   npm run dev
   ```

---

### Database (PostgreSQL)

1. **Install pgAdmin 4**  
   Go to: https://www.postgresql.org/ftp/pgadmin/pgadmin4/v9.3/windows/  
   Download: `pgadmin4-9.x` for your OS

2. **Install PostgreSQL**  
   Go to: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads  
   Download: PostgreSQL 17.4 for your OS

3. **Add PostgreSQL to system PATH**  
   Ask ChatGPT or Google: “How to add PostgreSQL psql to PATH on Windows”

4. **Configure in pgAdmin**:
   - Right click "Servers" → Register → Name: `backend`
   - Hostname: `localhost`, Port: `5432`
   - Connect now → Save

5. **Create Role and DB**:
   - Right-click `Login/Group Roles` → Create → Name: `Audio`
     - Definition: Password = `Audio@2025`
     - Privileges: Check `Can Login`
   - Right-click `Databases` → Create → Name: `mydb`
     - Go to `Security`, add role `Audio` with all privileges

---

## Running the Application

1. Start PostgreSQL
2. Run backend with `hatch run dev`
3. Start frontend with `npm run dev`
4. Access:
   - Frontend: `http://localhost:3000`
   - Backend Docs: `http://127.0.0.1:8000/docs`

---

## Project Structure

```
nba-sports-tracker/
├── PSQL_Backend/
│   ├── main.py
│   ├── models/
│   ├── schemas/
│   ├── routes/
│   ├── core/
├── frontend/
│   ├── pages/
│   ├── components/
├── tests/
├── .env
└── README.md
```

---

## API Endpoints

### Auth/User
- `POST /make_user`
- `POST /token`
- `GET /user`
- `PUT /user/update`
- `PUT /user/update/username`
- `PUT /user/update/password`
- `PUT /user/update/email`
- `DELETE /user/delete`
- `POST /forgot-password`
- `POST /reset-password`
- `PUT /user/verify`
- `PUT /user/verify/newcoderequest`
- `POST /user/confirm`
- `GET /user/exists`

### Audio
- `POST /audio/create`
- `GET /audio/get_audios`
- `PUT /audio/update/{audio_id}`
- `DELETE /audio/delete/{audio_id}`
- `POST /upload-audio-db/`
- `GET /download-audio/{track_id}`

---

## Middleware

### CORS
- Full HTTP method/header support
- Wildcard origin in dev

### Logging
- Logs method, URL, status code

---

## Testing

- Import Postman collections from `tests/`
- Run automated unit tests via:
  ```bash
  pytest
  ```

---

## License

Distributed under the [MIT License](https://spdx.org/licenses/MIT.html)