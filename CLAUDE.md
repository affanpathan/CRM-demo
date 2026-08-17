# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A basic CRM demonstrating a full-stack setup: React (Vite) + FastAPI + PostgreSQL. Entities are **Companies**, **Contacts**, **Deals**, **Tasks** — each with full CRUD and relationships (a contact belongs to a company, a deal links to a company/contact, a task can link to a contact/deal).

This app is intentionally minimal — **no authentication/authorization** is implemented. Do not treat missing auth as a bug to fix unless asked; it's a stated scope decision (see root `README.md`).

## Commands

### Backend (`backend/`)

```bash
# Setup (Windows)
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # edit DATABASE_URL if needed

# Run
alembic upgrade head             # apply migrations before first run
uvicorn app.main:app --reload --port 8000

# After changing models.py
alembic revision --autogenerate -m "describe your change"
alembic upgrade head
```

API: `http://localhost:8000`, interactive docs: `http://localhost:8000/docs`.

There is no test suite or linter configured for the backend yet.

### Frontend (`frontend/`)

```bash
npm install
cp .env.example .env            # edit VITE_API_URL if API isn't on localhost:8000
npm run dev                      # dev server at http://localhost:5173
npm run build                    # tsc -b && vite build
npm run lint                     # oxlint
```

There is no test suite configured for the frontend yet.

## Architecture

### Backend: FastAPI + SQLAlchemy 2.0 + Alembic

Each entity (Company, Contact, Deal, Task) follows the same three-file pattern, and adding a new entity means replicating it:

- `app/models.py` — all SQLAlchemy ORM models live in this single file, including the `DealStage` and `TaskStatus` enums. Relationships use `back_populates` and cascade rules are declared per-FK (e.g. deleting a Company cascades to its Contacts/Deals; deleting a Deal cascades to its Tasks; deleting a Contact only nulls out `deal.contact_id`).
- `app/schemas/<entity>.py` — Pydantic `*Create`, `*Update`, `*Out` schemas per entity.
- `app/routers/<entity>.py` — one `APIRouter` per entity at prefix `/api/<entities>`, registered in `app/main.py`. Every router repeats the same CRUD shape: `GET ""` (list), `POST ""` (create, 201), `GET /{id}`, `PUT /{id}` (partial update via `exclude_unset=True`), `DELETE /{id}` (204). 404s are raised inline with `HTTPException` — there's no shared "get or 404" helper, so follow the existing per-router pattern.

Cross-cutting:
- `app/config.py` — `pydantic-settings` `Settings` loaded from `backend/.env` (`DATABASE_URL`, `CORS_ORIGINS` as a comma-separated string exposed via `cors_origins_list`).
- `app/database.py` — engine/session setup and the `get_db` FastAPI dependency. `Base` (DeclarativeBase) is defined here, not in `models.py`.
- `alembic/env.py` pulls `DATABASE_URL` from `app.config.settings` (not from `alembic.ini`) and imports `app.models` so `Base.metadata` sees all tables for autogenerate — new models must be added to `app/models.py` to be picked up.

### Frontend: React 19 + Vite + TypeScript + React Router + Axios

- `src/api/client.ts` — single Axios instance, base URL from `VITE_API_URL` env var.
- `src/api/resources.ts` — `makeResource<T, TCreate>(path)` factory generates `list/create/update/remove` for each entity against its REST path. Adding a new entity's API surface means one `makeResource` call, not a new file.
- `src/types.ts` — shared TS types mirroring the backend Pydantic schemas.
- `src/pages/*Page.tsx` — one page per entity (Dashboard, Companies, Contacts, Deals, Tasks), each doing its own data fetching/state via the corresponding `resources.ts` export.
- `src/components/Layout.tsx` + `App.tsx` — route shell; routes are flat, all nested under `Layout` via `react-router-dom`.

### Contract between frontend and backend

`Omit<T, "id" | "created_at">` in `resources.ts` is the frontend's implicit mirror of each backend `*Create` schema. When changing a Pydantic schema's required/optional fields, update the matching type in `src/types.ts` to keep them in sync — there is no shared/generated type layer.
