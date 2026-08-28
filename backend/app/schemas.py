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


class PaymentMandateCreate(BaseModel):
    product_id: int
    budget_max: float


class PaymentMandateResponse(BaseModel):
    id: int
    amount: float
    merchant_id: int
    order_ref: str
    expires_at: str
    single_use: bool
    used: bool
    status: str

    class Config:
        from_attributes = True

class RazorpayOrderCreate(BaseModel):
    mandate_id: int


class RazorpayOrderResponse(BaseModel):
    mandate_id: int
    razorpay_order_id: str
    amount: float
    currency: str
    status: str
    
class PaymentLinkCreate(BaseModel):
    mandate_id: int


class PaymentLinkResponse(BaseModel):
    mandate_id: int
    razorpay_order_id: str
    payment_link_id: str
    payment_link: str
    amount: float
    currency: str
    status: str