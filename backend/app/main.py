from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import companies, contacts, deals, tasks

app = FastAPI(title="CRM API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(companies.router)
app.include_router(contacts.router)
app.include_router(deals.router)
app.include_router(tasks.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
