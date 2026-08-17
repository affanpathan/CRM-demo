from datetime import date, datetime

from pydantic import BaseModel, ConfigDict

from app.models import TaskStatus


class TaskBase(BaseModel):
    title: str
    description: str | None = None
    status: TaskStatus = TaskStatus.OPEN
    due_date: date | None = None
    contact_id: int | None = None
    deal_id: int | None = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: TaskStatus | None = None
    due_date: date | None = None
    contact_id: int | None = None
    deal_id: int | None = None


class TaskOut(TaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
