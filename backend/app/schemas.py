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
    image_url: str | None = None

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


class ProductStockUpdate(BaseModel):
    stock: int


class AuditEventResponse(BaseModel):
    id: int
    session_id: str
    timestamp: str
    actor: str
    action: str
    status: str
    mandate_ref: str | None = None
    reasoning: str
    input_data: dict | list | None = None
    output_data: dict | list | None = None

    class Config:
        from_attributes = True


class BuyerRunRequest(BaseModel):
    message: str
    simulate_failure: str | None = None
    max_retries: int | None = None


class BuyerRunResponse(BaseModel):
    session_id: str
    status: str
    message: str
    mandate: dict
    retries_used: int
    max_retries: int
    failure_handled: dict | None = None
    selected_product: dict | None = None
    payment_mandate: dict | None = None
    razorpay_order: dict | None = None
    payment_link: str | None = None
    audit_trail: list[dict] = []


class SimulateWebhookRequest(BaseModel):
    session_id: str | None = None
    razorpay_order_id: str | None = None
    mandate_id: int | None = None
    simulate_invalid_signature: bool = False