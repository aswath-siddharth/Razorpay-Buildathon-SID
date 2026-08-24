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