from datetime import datetime, timedelta, timezone
from uuid import uuid4
import os

import razorpay
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import PaymentMandate, Product
from ..schemas import (
    PaymentMandateCreate,
    PaymentMandateResponse,
    RazorpayOrderCreate,
    RazorpayOrderResponse,
    PaymentLinkCreate,
    PaymentLinkResponse,
)


router = APIRouter(
    prefix="/payments",
    tags=["payments"]
)


# ---------------------------------------------------------
# Razorpay configuration
# ---------------------------------------------------------

load_dotenv()

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
    raise RuntimeError("Razorpay credentials are not configured")

razorpay_client = razorpay.Client(
    auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
)


# ---------------------------------------------------------
# Create Payment Mandate
# ---------------------------------------------------------

@router.post(
    "/mandates",
    response_model=PaymentMandateResponse
)
def create_payment_mandate(
    request: PaymentMandateCreate,
    db: Session = Depends(get_db)
):
    # Find selected product
    product = (
        db.query(Product)
        .filter(Product.id == request.product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    # Product must be in stock
    if product.stock <= 0:
        raise HTTPException(
            status_code=400,
            detail="Product is out of stock"
        )

    # Backend determines the amount.
    # Never trust a payment amount supplied by the client.
    amount = product.price

    # Hard budget boundary
    if amount > request.budget_max:
        raise HTTPException(
            status_code=400,
            detail="Product price exceeds authorized budget"
        )

    # Mandate expires after 10 minutes
    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(minutes=10)
    )

    # Unique reference for this purchase
    order_ref = f"order_{uuid4().hex}"

    mandate = PaymentMandate(
        amount=amount,
        merchant_id=product.merchant_id,
        order_ref=order_ref,
        expires_at=expires_at.isoformat(),
        single_use=True,
        used=False,
        status="active"
    )

    db.add(mandate)
    db.commit()
    db.refresh(mandate)

    return mandate


# ---------------------------------------------------------
# Validate Payment Mandate
# ---------------------------------------------------------

@router.post(
    "/mandates/{mandate_id}/validate"
)
def validate_payment_mandate(
    mandate_id: int,
    db: Session = Depends(get_db)
):
    mandate = (
        db.query(PaymentMandate)
        .filter(PaymentMandate.id == mandate_id)
        .first()
    )

    if not mandate:
        raise HTTPException(
            status_code=404,
            detail="Payment mandate not found"
        )

    # Single-use enforcement
    if mandate.used:
        raise HTTPException(
            status_code=400,
            detail="Payment mandate has already been used"
        )

    # Status enforcement
    if mandate.status != "active":
        raise HTTPException(
            status_code=400,
            detail=f"Payment mandate is {mandate.status}"
        )

    # Expiry enforcement
    expires_at = datetime.fromisoformat(
        mandate.expires_at
    )

    if expires_at <= datetime.now(timezone.utc):
        mandate.status = "expired"

        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Payment mandate has expired"
        )

    return {
        "valid": True,
        "mandate_id": mandate.id,
        "amount": mandate.amount,
        "merchant_id": mandate.merchant_id,
        "order_ref": mandate.order_ref,
        "expires_at": mandate.expires_at,
        "single_use": mandate.single_use
    }


# ---------------------------------------------------------
# Create Razorpay Order
# ---------------------------------------------------------

@router.post(
    "/orders",
    response_model=RazorpayOrderResponse
)
def create_razorpay_order(
    request: RazorpayOrderCreate,
    db: Session = Depends(get_db)
):
    # Load mandate
    mandate = (
        db.query(PaymentMandate)
        .filter(PaymentMandate.id == request.mandate_id)
        .first()
    )

    if not mandate:
        raise HTTPException(
            status_code=404,
            detail="Payment mandate not found"
        )

    # Single-use enforcement
    if mandate.used:
        raise HTTPException(
            status_code=400,
            detail="Payment mandate has already been used"
        )

    # Status enforcement
    if mandate.status != "active":
        raise HTTPException(
            status_code=400,
            detail=f"Payment mandate is {mandate.status}"
        )

    # Expiry enforcement
    expires_at = datetime.fromisoformat(
        mandate.expires_at
    )

    if expires_at <= datetime.now(timezone.utc):
        mandate.status = "expired"

        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Payment mandate has expired"
        )

    # Amount comes ONLY from the stored mandate
    amount_paise = int(
        round(mandate.amount * 100)
    )

    if amount_paise <= 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid mandate amount"
        )

    # Create Razorpay order
    try:
        razorpay_order = razorpay_client.order.create(
            data={
                "amount": amount_paise,
                "currency": "INR",
                "receipt": mandate.order_ref,
            }
        )

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Razorpay order creation failed: {str(exc)}"
        )

    # Store Razorpay order ID
    mandate.razorpay_order_id = razorpay_order["id"]

    db.commit()
    db.refresh(mandate)

    return {
        "mandate_id": mandate.id,
        "razorpay_order_id": razorpay_order["id"],
        "amount": mandate.amount,
        "currency": "INR",
        "status": razorpay_order["status"],
    }


# ---------------------------------------------------------
# Create Razorpay Payment Link
# ---------------------------------------------------------

@router.post(
    "/links",
    response_model=PaymentLinkResponse
)
def create_payment_link(
    request: PaymentLinkCreate,
    db: Session = Depends(get_db)
):
    # Load mandate
    mandate = (
        db.query(PaymentMandate)
        .filter(PaymentMandate.id == request.mandate_id)
        .first()
    )

    if not mandate:
        raise HTTPException(
            status_code=404,
            detail="Payment mandate not found"
        )

    # Single-use enforcement
    if mandate.used:
        raise HTTPException(
            status_code=400,
            detail="Payment mandate has already been used"
        )

    # Status enforcement
    if mandate.status != "active":
        raise HTTPException(
            status_code=400,
            detail=f"Payment mandate is {mandate.status}"
        )

    # Expiry enforcement
    expires_at = datetime.fromisoformat(
        mandate.expires_at
    )

    if expires_at <= datetime.now(timezone.utc):
        mandate.status = "expired"

        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Payment mandate has expired"
        )

    # Razorpay Order must already exist
    if not mandate.razorpay_order_id:
        raise HTTPException(
            status_code=400,
            detail="Razorpay order has not been created for this mandate"
        )

    # Amount comes ONLY from the mandate
    amount_paise = int(
        round(mandate.amount * 100)
    )

    if amount_paise <= 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid mandate amount"
        )

    # Razorpay Payment Links require expiry
    # to be at least 15 minutes in the future.
    #
    # The 10-minute PaymentMandate remains
    # the actual authorization boundary.
    razorpay_expiry = (
    datetime.now(timezone.utc)
    + timedelta(minutes=20)
)

    # Create Razorpay Payment Link
    try:
        payment_link = razorpay_client.payment_link.create(
            data={
                "amount": amount_paise,
                "currency": "INR",
                "accept_partial": False,
                "reference_id": mandate.order_ref,
                "description": (
                    f"AI Buyer order {mandate.order_ref}"
                ),
                "expire_by": int(
                    razorpay_expiry.timestamp()
                )
            }
        )

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=(
                "Razorpay payment link creation failed: "
                f"{str(exc)}"
            )
        )

    return {
        "mandate_id": mandate.id,
        "razorpay_order_id": mandate.razorpay_order_id,
        "payment_link_id": payment_link["id"],
        "payment_link": payment_link["short_url"],
        "amount": mandate.amount,
        "currency": "INR",
        "status": payment_link["status"]
    }