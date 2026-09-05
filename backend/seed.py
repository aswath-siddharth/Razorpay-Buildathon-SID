import sys
import os

# Ensure backend directory is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app.models import Merchant, Product, PaymentMandate, AuditEvent


def seed_database(force_reseed=False):
    if force_reseed:
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        if force_reseed:
            print("Force reseed requested. Clearing existing products and merchants...")
            db.query(AuditEvent).delete()
            db.query(PaymentMandate).delete()
            db.query(Product).delete()
            db.query(Merchant).delete()
            db.commit()
        else:
            existing_product = db.query(Product).first()
            if existing_product:
                print("Database already seeded. Refreshing images and products...")
                # We can update images if any are missing
                db.query(AuditEvent).delete()
                db.query(PaymentMandate).delete()
                db.query(Product).delete()
                db.query(Merchant).delete()
                db.commit()

        merchants = [
            Merchant(name="TechMart", rating=4.8),
            Merchant(name="QuickBuy", rating=4.6),
            Merchant(name="ShopSphere", rating=4.7),
            Merchant(name="PulseGadgets", rating=4.9),
            Merchant(name="VoltAthletics", rating=4.8),
        ]

        db.add_all(merchants)
        db.commit()

        for merchant in merchants:
            db.refresh(merchant)

        m_tech = merchants[0]
        m_quick = merchants[1]
        m_shop = merchants[2]
        m_pulse = merchants[3]
        m_volt = merchants[4]

        products = [
            # -------------------------------------------------------------
            # RUNNING SHOES & FOOTWEAR (TechMart)
            # -------------------------------------------------------------
            Product(
                merchant_id=m_tech.id,
                title="Nike Revolution 6",
                price=2799,
                stock=12,
                image_url="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80",
                attributes={
                    "category": "running_shoes",
                    "brand": "Nike",
                    "size": [8, 9, 10],
                    "color": ["Crimson Red", "Black", "Blue"],
                    "rating": 4.6,
                    "review_count": 842,
                    "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80"
                },
                delivery_eta="2026-08-27"
            ),

            Product(
                merchant_id=m_tech.id,
                title="Adidas Runfalcon 3",
                price=2899,
                stock=8,
                image_url="https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=700&q=80",
                attributes={
                    "category": "running_shoes",
                    "brand": "Adidas",
                    "size": [7, 8, 9],
                    "color": ["Core Black", "Cloud White"],
                    "rating": 4.5,
                    "review_count": 612,
                    "image_url": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=700&q=80"
                },
                delivery_eta="2026-08-28"
            ),

            Product(
                merchant_id=m_tech.id,
                title="Puma Flyer Runner",
                price=3199,
                stock=10,
                image_url="https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=700&q=80",
                attributes={
                    "category": "running_shoes",
                    "brand": "Puma",
                    "size": [8, 9, 10],
                    "color": ["Shadow Grey", "Puma Black"],
                    "rating": 4.4,
                    "review_count": 420,
                    "image_url": "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=700&q=80"
                },
                delivery_eta="2026-08-27"
            ),

            Product(
                merchant_id=m_tech.id,
                title="ASICS Gel Contend",
                price=2999,
                stock=5,
                image_url="https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=700&q=80",
                attributes={
                    "category": "running_shoes",
                    "brand": "ASICS",
                    "size": [8, 9, 10],
                    "color": ["Electric Blue", "French Blue"],
                    "rating": 4.7,
                    "review_count": 389,
                    "image_url": "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=700&q=80"
                },
                delivery_eta="2026-08-29"
            ),

            Product(
                merchant_id=m_tech.id,
                title="Reebok Energen Lite",
                price=2499,
                stock=7,
                image_url="https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=700&q=80",
                attributes={
                    "category": "running_shoes",
                    "brand": "Reebok",
                    "size": [7, 8, 9],
                    "color": ["Vector Navy", "Core Black"],
                    "rating": 4.3,
                    "review_count": 274,
                    "image_url": "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=700&q=80"
                },
                delivery_eta="2026-08-30"
            ),

            # -------------------------------------------------------------
            # RUNNING SHOES & FOOTWEAR (QuickBuy)
            # -------------------------------------------------------------
            Product(
                merchant_id=m_quick.id,
                title="Nike Downshifter 12",
                price=2699,
                stock=6,
                image_url="https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=700&q=80",
                attributes={
                    "category": "running_shoes",
                    "brand": "Nike",
                    "size": [8, 9],
                    "color": ["Anthracite Black", "Volt"],
                    "rating": 4.5,
                    "review_count": 519,
                    "image_url": "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=700&q=80"
                },
                delivery_eta="2026-08-27"
            ),

            Product(
                merchant_id=m_quick.id,
                title="Adidas Galaxy 7",
                price=2599,
                stock=9,
                image_url="https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=700&q=80",
                attributes={
                    "category": "running_shoes",
                    "brand": "Adidas",
                    "size": [7, 8, 9, 10],
                    "color": ["Royal Blue", "Carbon Black"],
                    "rating": 4.4,
                    "review_count": 341,
                    "image_url": "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=700&q=80"
                },
                delivery_eta="2026-08-28"
            ),

            Product(
                merchant_id=m_quick.id,
                title="Puma Softride Enzo",
                price=2999,
                stock=4,
                image_url="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=700&q=80",
                attributes={
                    "category": "running_shoes",
                    "brand": "Puma",
                    "size": [9, 10],
                    "color": ["High Rise Grey", "Neon Lime"],
                    "rating": 4.6,
                    "review_count": 482,
                    "image_url": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=700&q=80"
                },
                delivery_eta="2026-08-29"
            ),

            Product(
                merchant_id=m_quick.id,
                title="Skechers Go Run",
                price=2799,
                stock=3,
                image_url="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=700&q=80",
                attributes={
                    "category": "running_shoes",
                    "brand": "Skechers",
                    "size": [8, 9],
                    "color": ["Charcoal Black", "Cyan Glow"],
                    "rating": 4.5,
                    "review_count": 290,
                    "image_url": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=700&q=80"
                },
                delivery_eta="2026-08-27"
            ),

            Product(
                merchant_id=m_quick.id,
                title="New Balance Fresh Foam",
                price=3299,
                stock=5,
                image_url="https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=700&q=80",
                attributes={
                    "category": "running_shoes",
                    "brand": "New Balance",
                    "size": [9, 10],
                    "color": ["Eclipse Blue", "Silver"],
                    "rating": 4.7,
                    "review_count": 520,
                    "image_url": "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=700&q=80"
                },
                delivery_eta="2026-08-28"
            ),

            # -------------------------------------------------------------
            # RUNNING SHOES & FOOTWEAR (ShopSphere)
            # -------------------------------------------------------------
            Product(
                merchant_id=m_shop.id,
                title="Nike Revolution 7",
                price=2899,
                stock=15,
                image_url="https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=700&q=80",
                attributes={
                    "category": "running_shoes",
                    "brand": "Nike",
                    "size": [8, 9, 10],
                    "color": ["Triple White", "Black Gold"],
                    "rating": 4.8,
                    "review_count": 910,
                    "image_url": "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=700&q=80"
                },
                delivery_eta="2026-08-27"
            ),

            Product(
                merchant_id=m_shop.id,
                title="Adidas Duramo SL",
                price=2799,
                stock=11,
                image_url="https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&w=700&q=80",
                attributes={
                    "category": "running_shoes",
                    "brand": "Adidas",
                    "size": [8, 9],
                    "color": ["Core Black", "Silver Metallic"],
                    "rating": 4.6,
                    "review_count": 480,
                    "image_url": "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&w=700&q=80"
                },
                delivery_eta="2026-08-28"
            ),

            Product(
                merchant_id=m_shop.id,
                title="Puma Velocity Nitro",
                price=3499,
                stock=6,
                image_url="https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=700&q=80",
                attributes={
                    "category": "running_shoes",
                    "brand": "Puma",
                    "size": [9, 10],
                    "color": ["Neon Orange", "Puma Black"],
                    "rating": 4.8,
                    "review_count": 630,
                    "image_url": "https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=700&q=80"
                },
                delivery_eta="2026-08-27"
            ),

            Product(
                merchant_id=m_shop.id,
                title="ASICS Gel Excite",
                price=2899,
                stock=9,
                image_url="https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=700&q=80",
                attributes={
                    "category": "running_shoes",
                    "brand": "ASICS",
                    "size": [8, 9, 10],
                    "color": ["Island Blue", "Gunmetal"],
                    "rating": 4.6,
                    "review_count": 395,
                    "image_url": "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=700&q=80"
                },
                delivery_eta="2026-08-29"
            ),

            Product(
                merchant_id=m_shop.id,
                title="Reebok Floatride",
                price=2699,
                stock=2,
                image_url="https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?auto=format&fit=crop&w=700&q=80",
                attributes={
                    "category": "running_shoes",
                    "brand": "Reebok",
                    "size": [9],
                    "color": ["Black Cyan", "Pure Grey"],
                    "rating": 4.5,
                    "review_count": 215,
                    "image_url": "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?auto=format&fit=crop&w=700&q=80"
                },
                delivery_eta="2026-08-27"
            ),

            # -------------------------------------------------------------
            # EXPANDED E-COMMERCE PRODUCTS (PulseGadgets & VoltAthletics)
            # -------------------------------------------------------------
            Product(
                merchant_id=m_volt.id,
                title="Nike Air Zoom Pegasus 40",
                price=3899,
                stock=14,
                image_url="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=700&q=80",
                attributes={
                    "category": "running_shoes",
                    "brand": "Nike",
                    "size": [8, 9, 10, 11],
                    "color": ["Laser Blue", "Obsidian"],
                    "rating": 4.9,
                    "review_count": 1250,
                    "image_url": "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=700&q=80"
                },
                delivery_eta="2026-08-27"
            ),

            Product(
                merchant_id=m_volt.id,
                title="Under Armour HOVR Sonic 6",
                price=3299,
                stock=8,
                image_url="https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?auto=format&fit=crop&w=700&q=80",
                attributes={
                    "category": "running_shoes",
                    "brand": "Under Armour",
                    "size": [8, 9, 10],
                    "color": ["Jet Black", "Pitch Grey"],
                    "rating": 4.7,
                    "review_count": 410,
                    "image_url": "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?auto=format&fit=crop&w=700&q=80"
                },
                delivery_eta="2026-08-28"
            ),

            Product(
                merchant_id=m_pulse.id,
                title="Sony WH-CH520 Wireless Bluetooth Headphones",
                price=2999,
                stock=18,
                image_url="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80",
                attributes={
                    "category": "headphones",
                    "brand": "Sony",
                    "size": ["Standard"],
                    "color": ["Matte Black", "Cream Beige"],
                    "rating": 4.8,
                    "review_count": 2100,
                    "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80"
                },
                delivery_eta="2026-08-27"
            ),

            Product(
                merchant_id=m_pulse.id,
                title="boAt Airdopes 141 ANC True Wireless",
                price=1699,
                stock=25,
                image_url="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=700&q=80",
                attributes={
                    "category": "headphones",
                    "brand": "boAt",
                    "size": ["Universal"],
                    "color": ["Space Black", "Emerald Green"],
                    "rating": 4.5,
                    "review_count": 3400,
                    "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=700&q=80"
                },
                delivery_eta="2026-08-27"
            ),

            Product(
                merchant_id=m_pulse.id,
                title="JBL Tune 510BT Pure Bass On-Ear",
                price=2499,
                stock=12,
                image_url="https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=700&q=80",
                attributes={
                    "category": "headphones",
                    "brand": "JBL",
                    "size": ["Standard"],
                    "color": ["Deep Blue", "Pure Black"],
                    "rating": 4.6,
                    "review_count": 1820,
                    "image_url": "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=700&q=80"
                },
                delivery_eta="2026-08-28"
            ),

            Product(
                merchant_id=m_pulse.id,
                title="Noise ColorFit Pro 5 AMOLED Smartwatch",
                price=2999,
                stock=16,
                image_url="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80",
                attributes={
                    "category": "smartwatch",
                    "brand": "Noise",
                    "size": ["45mm"],
                    "color": ["Jet Black", "Silver Mesh"],
                    "rating": 4.7,
                    "review_count": 1490,
                    "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80"
                },
                delivery_eta="2026-08-27"
            ),

            Product(
                merchant_id=m_pulse.id,
                title="Fire-Boltt Gladiator Bluetooth Calling Watch",
                price=2199,
                stock=20,
                image_url="https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=700&q=80",
                attributes={
                    "category": "smartwatch",
                    "brand": "Fire-Boltt",
                    "size": ["1.96 Inch"],
                    "color": ["Dark Chrome", "Steel Grey"],
                    "rating": 4.4,
                    "review_count": 980,
                    "image_url": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=700&q=80"
                },
                delivery_eta="2026-08-28"
            ),

            Product(
                merchant_id=m_pulse.id,
                title="Amazfit Bip 5 Ultra Smartwatch",
                price=3499,
                stock=7,
                image_url="https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=700&q=80",
                attributes={
                    "category": "smartwatch",
                    "brand": "Amazfit",
                    "size": ["1.91 Inch"],
                    "color": ["Soft Black", "Cream White"],
                    "rating": 4.7,
                    "review_count": 720,
                    "image_url": "https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=700&q=80"
                },
                delivery_eta="2026-08-29"
            ),
        ]

        db.add_all(products)
        db.commit()

        print(f"Seed completed successfully. {len(merchants)} merchants and {len(products)} products with rich images seeded.")

    finally:
        db.close()


if __name__ == "__main__":
    force = "--force" in sys.argv or "-f" in sys.argv
    seed_database(force_reseed=True)