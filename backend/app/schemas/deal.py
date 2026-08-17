from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.models import DealStage


class DealBase(BaseModel):
    title: str
    value: Decimal | None = None
    stage: DealStage = DealStage.LEAD
    expected_close_date: date | None = None
    notes: str | None = None
    company_id: int | None = None
    contact_id: int | None = None


class DealCreate(DealBase):
    pass


class DealUpdate(BaseModel):
    title: str | None = None
    value: Decimal | None = None
    stage: DealStage | None = None
    expected_close_date: date | None = None
    notes: str | None = None
    company_id: int | None = None
    contact_id: int | None = None


class DealOut(DealBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
