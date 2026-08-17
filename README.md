# CRM App

A basic CRM built to demonstrate a full-stack setup: **React (Vite) + FastAPI + PostgreSQL**.

Entities: **Companies**, **Contacts**, **Deals**, **Tasks/Activities** — each with full CRUD, and relationships between them (a contact belongs to a company, a deal is linked to a company/contact, a task can be linked to a contact/deal).

This is intentionally minimal — no auth, no Claude Code configuration/skills/hooks/MCP/CI-CD yet. Those will be layered in later.

## Stack

- **Frontend**: React 19 + Vite + TypeScript + React Router + Axios
- **Backend**: FastAPI + SQLAlchemy 2.0 + Alembic (migrations) + Pydantic
- **Database**: PostgreSQL (local install)

## Project layout

```
crm-app/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app + CORS + routers
│   │   ├── config.py        # env-based settings
│   │   ├── database.py      # SQLAlchemy engine/session
│   │   ├── models.py        # Company, Contact, Deal, Task models
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   └── routers/         # CRUD endpoints per entity
│   ├── alembic/              # DB migrations
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/              # axios client + typed resource calls
    │   ├── pages/            # Dashboard, Companies, Contacts, Deals, Tasks
    │   ├── components/       # Layout/nav
    │   └── types.ts
    └── .env.example
```

## Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL 14+ running locally

## 1. Database setup

Create a database and a user (adjust as you like):

```bash
sudo -u postgres psql -c "CREATE ROLE crm_user LOGIN PASSWORD 'crm_password';"
sudo -u postgres psql -c "CREATE DATABASE crm_db OWNER crm_user;"
```

## 2. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # on Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env            # edit DATABASE_URL if needed
alembic upgrade head            # creates tables

uvicorn app.main:app --reload --port 8000
```

API will be available at `http://localhost:8000`, interactive docs at `http://localhost:8000/docs`.

### Making model changes later

```bash
alembic revision --autogenerate -m "describe your change"
alembic upgrade head
```

## 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env            # edit VITE_API_URL if the API isn't on localhost:8000
npm run dev
```

App will be available at `http://localhost:5173`.

## API overview

All endpoints are prefixed with `/api` and return/accept JSON.

| Resource   | Endpoints |
|------------|-----------|
| Companies  | `GET/POST /api/companies`, `GET/PUT/DELETE /api/companies/{id}` |
| Contacts   | `GET/POST /api/contacts`, `GET/PUT/DELETE /api/contacts/{id}` |
| Deals      | `GET/POST /api/deals`, `GET/PUT/DELETE /api/deals/{id}` |
| Tasks      | `GET/POST /api/tasks`, `GET/PUT/DELETE /api/tasks/{id}` |
| Health     | `GET /api/health` |

## Notes

- No authentication/authorization is implemented — anyone with network access to the API can read/write data. Do not deploy this as-is.
- CORS is restricted to `CORS_ORIGINS` in the backend `.env` (defaults to the Vite dev server origin).
- This is the base app only. Claude Code features (configuration, skills, hooks, MCP servers, CI/CD) will be added in a follow-up pass.
