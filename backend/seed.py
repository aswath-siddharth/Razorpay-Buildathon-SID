from app.database import SessionLocal, engine, Base
from app.models import Merchant, Product


Base.metadata.create_all(bind=engine)


db = SessionLocal()


merchants = [
    Merchant(
        name="TechMart",
        rating=4.5
    ),
    Merchant(
        name="QuickBuy",
        rating=4.3
    ),
    Merchant(
        name="ShopSphere",
        rating=4.6
    ),
]


db.add_all(merchants)
db.commit()


for merchant in merchants:
    db.refresh(merchant)


products = [

    # TechMart
    Product(
        merchant_id=merchants[0].id,
        title="Nike Revolution 6",
        price=2799,
        stock=12,
        attributes={
            "category": "running_shoes",
            "brand": "Nike",
            "size": [8, 9, 10],
            "color": ["black", "blue"]
        },
        delivery_eta="2026-08-27"
    ),

    Product(
        merchant_id=merchants[0].id,
        title="Adidas Runfalcon 3",
        price=2899,
        stock=8,
        attributes={
            "category": "running_shoes",
            "brand": "Adidas",
            "size": [7, 8, 9],
            "color": ["black", "white"]
        },
        delivery_eta="2026-08-28"
    ),

    Product(
        merchant_id=merchants[0].id,
        title="Puma Flyer Runner",
        price=3199,
        stock=10,
        attributes={
            "category": "running_shoes",
            "brand": "Puma",
            "size": [8, 9, 10],
            "color": ["grey", "black"]
        },
        delivery_eta="2026-08-27"
    ),

    Product(
        merchant_id=merchants[0].id,
        title="ASICS Gel Contend",
        price=2999,
        stock=5,
        attributes={
            "category": "running_shoes",
            "brand": "ASICS",
            "size": [8, 9, 10],
            "color": ["blue"]
        },
        delivery_eta="2026-08-29"
    ),

    Product(
        merchant_id=merchants[0].id,
        title="Reebok Energen Lite",
        price=2499,
        stock=7,
        attributes={
            "category": "running_shoes",
            "brand": "Reebok",
            "size": [7, 8, 9],
            "color": ["black"]
        },
        delivery_eta="2026-08-30"
    ),

    # QuickBuy
    Product(
        merchant_id=merchants[1].id,
        title="Nike Downshifter 12",
        price=2699,
        stock=6,
        attributes={
            "category": "running_shoes",
            "brand": "Nike",
            "size": [8, 9],
            "color": ["black"]
        },
        delivery_eta="2026-08-27"
    ),

    Product(
        merchant_id=merchants[1].id,
        title="Adidas Galaxy 7",
        price=2599,
        stock=9,
        attributes={
            "category": "running_shoes",
            "brand": "Adidas",
            "size": [7, 8, 9, 10],
            "color": ["blue", "black"]
        },
        delivery_eta="2026-08-28"
    ),

    Product(
        merchant_id=merchants[1].id,
        title="Puma Softride Enzo",
        price=2999,
        stock=4,
        attributes={
            "category": "running_shoes",
            "brand": "Puma",
            "size": [9, 10],
            "color": ["grey"]
        },
        delivery_eta="2026-08-29"
    ),

    Product(
        merchant_id=merchants[1].id,
        title="Skechers Go Run",
        price=2799,
        stock=3,
        attributes={
            "category": "running_shoes",
            "brand": "Skechers",
            "size": [8, 9],
            "color": ["black", "grey"]
        },
        delivery_eta="2026-08-27"
    ),

    Product(
        merchant_id=merchants[1].id,
        title="New Balance Fresh Foam",
        price=3299,
        stock=5,
        attributes={
            "category": "running_shoes",
            "brand": "New Balance",
            "size": [9, 10],
            "color": ["blue"]
        },
        delivery_eta="2026-08-28"
    ),

    # ShopSphere
    Product(
        merchant_id=merchants[2].id,
        title="Nike Revolution 7",
        price=2899,
        stock=15,
        attributes={
            "category": "running_shoes",
            "brand": "Nike",
            "size": [8, 9, 10],
            "color": ["black", "white"]
        },
        delivery_eta="2026-08-27"
    ),

    Product(
        merchant_id=merchants[2].id,
        title="Adidas Duramo SL",
        price=2799,
        stock=11,
        attributes={
            "category": "running_shoes",
            "brand": "Adidas",
            "size": [8, 9],
            "color": ["black"]
        },
        delivery_eta="2026-08-28"
    ),

    Product(
        merchant_id=merchants[2].id,
        title="Puma Velocity Nitro",
        price=3499,
        stock=6,
        attributes={
            "category": "running_shoes",
            "brand": "Puma",
            "size": [9, 10],
            "color": ["orange", "black"]
        },
        delivery_eta="2026-08-27"
    ),

    Product(
        merchant_id=merchants[2].id,
        title="ASICS Gel Excite",
        price=2899,
        stock=9,
        attributes={
            "category": "running_shoes",
            "brand": "ASICS",
            "size": [8, 9, 10],
            "color": ["blue", "black"]
        },
        delivery_eta="2026-08-29"
    ),

    Product(
        merchant_id=merchants[2].id,
        title="Reebok Floatride",
        price=2699,
        stock=2,
        attributes={
            "category": "running_shoes",
            "brand": "Reebok",
            "size": [9],
            "color": ["black"]
        },
        delivery_eta="2026-08-27"
    ),
]


db.add_all(products)
db.commit()

print("Seed completed successfully.")

db.close()