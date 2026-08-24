from fastapi import FastAPI

from .database import Base, engine
from .routes import merchants, products


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="AI Buyer API",
    description="Agent-readable merchant catalog for AI Buyer",
    version="0.1.0"
)


app.include_router(merchants.router)
app.include_router(products.router)


@app.get("/")
def root():
    return {
        "name": "AI Buyer API",
        "status": "running"
    }