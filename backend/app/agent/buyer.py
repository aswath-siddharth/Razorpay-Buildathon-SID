from sqlalchemy.orm import Session

from ..models import Product, Merchant
from .intent import IntentMandate
from .scorer import (
    matches_hard_constraints,
    calculate_score,
)


def discover_products(
    db: Session,
    mandate: IntentMandate,
):

    products = (
        db.query(Product)
        .join(Merchant)
        .all()
    )

    candidates = []

    for product in products:

        merchant = product.merchant

        matches, explanation = matches_hard_constraints(
            product=product,
            budget_max=mandate.budget_max,
            size=mandate.size,
            delivery_by=mandate.delivery_by,
            category=mandate.category,
        )

        candidate = {
            "product_id": product.id,
            "title": product.title,
            "merchant": merchant.name,
            "price": product.price,
            "stock": product.stock,
            "delivery_eta": product.delivery_eta,
            "merchant_rating": merchant.rating,
            "image_url": product.image_url or (product.attributes.get("image_url") if isinstance(product.attributes, dict) else None),
            "attributes": product.attributes,
            "accepted": matches,
            "explanation": explanation,
            "score": None,
        }

        if matches:
            candidate["score"] = calculate_score(
                product=product,
                merchant_rating=merchant.rating,
                budget_max=mandate.budget_max,
                delivery_by=mandate.delivery_by,
            )

        candidates.append(candidate)

    accepted = [
        candidate
        for candidate in candidates
        if candidate["accepted"]
    ]

    accepted.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    return {
        "total_products_considered": len(candidates),
        "matching_products": len(accepted),
        "all_candidates": candidates,
        "ranked_candidates": accepted,
        "best_candidate": (
            accepted[0]
            if accepted
            else None
        ),
    }