from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Merchant
from ..schemas import MerchantResponse


router = APIRouter(
    prefix="/merchants",
    tags=["Merchants"]
)


@router.get("/", response_model=list[MerchantResponse])
def get_merchants(
    db: Session = Depends(get_db)
):
    return db.query(Merchant).all()