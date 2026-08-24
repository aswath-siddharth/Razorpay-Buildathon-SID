from typing import List

from pydantic import BaseModel


class MerchantResponse(BaseModel):
    id: int
    name: str
    rating: float

    class Config:
        from_attributes = True


class ProductResponse(BaseModel):
    id: int
    merchant_id: int
    title: str
    price: float
    stock: int
    attributes: dict
    delivery_eta: str

    class Config:
        from_attributes = True