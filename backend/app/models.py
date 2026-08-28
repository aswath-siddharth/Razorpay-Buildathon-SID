from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    ForeignKey,
    JSON
)

from sqlalchemy.orm import relationship

from .database import Base


class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    rating = Column(Float, nullable=False)

    products = relationship(
        "Product",
        back_populates="merchant"
    )


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)

    merchant_id = Column(
        Integer,
        ForeignKey("merchants.id"),
        nullable=False
    )

    title = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    stock = Column(Integer, nullable=False)

    attributes = Column(JSON, nullable=False)

    delivery_eta = Column(String, nullable=False)

    merchant = relationship(
        "Merchant",
        back_populates="products"
    )


class PaymentMandate(Base):
    __tablename__ = "payment_mandates"

    id = Column(Integer, primary_key=True, index=True)

    amount = Column(Float, nullable=False)

    merchant_id = Column(
        Integer,
        ForeignKey("merchants.id"),
        nullable=False
    )

    order_ref = Column(String, nullable=False, unique=True)

    razorpay_order_id = Column(
        String,
        nullable=True,
        unique=True
    )

    expires_at = Column(String, nullable=False)

    single_use = Column(Boolean, nullable=False, default=True)

    used = Column(Boolean, nullable=False, default=False)

    status = Column(
        String,
        nullable=False,
        default="active"
    )