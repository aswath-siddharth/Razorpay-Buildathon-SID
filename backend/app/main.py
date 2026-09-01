from fastapi import FastAPI

from .database import Base, engine
from .routes import merchants, products, buyer, payments

from seed import seed_database
Base.metadata.create_all(bind=engine)

seed_database()
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI Buyer API",
    description="Agent-readable merchant catalog for AI Buyer",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(merchants.router)
app.include_router(products.router)
app.include_router(buyer.router)
app.include_router(payments.router)

@app.get("/")
def root():
    return {
        "name": "AI Buyer API",
        "status": "running"
    }