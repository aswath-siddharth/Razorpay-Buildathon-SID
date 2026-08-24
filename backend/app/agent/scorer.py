from datetime import date, datetime

from ..models import Product


def parse_delivery_date(delivery_eta: str) -> date | None:
    """Convert YYYY-MM-DD into a date."""

    try:
        return datetime.strptime(
            delivery_eta,
            "%Y-%m-%d"
        ).date()

    except (ValueError, TypeError):
        return None


def matches_hard_constraints(
    product: Product,
    budget_max: float | None = None,
    size: str | None = None,
    delivery_by: date | None = None,
    category: str | None = None,
) -> tuple[bool, str]:

    # 1. Stock
    if product.stock <= 0:
        return False, "Rejected: product is out of stock"

    # 2. Category
    if category is not None:
        product_category = product.attributes.get("category")

        normalized_requested = category.lower().replace(" ", "_")
        normalized_product = str(product_category).lower()

        if normalized_requested != normalized_product:
            return (
                False,
                f"Rejected: category '{product_category}' "
                f"does not match '{category}'"
            )

    # 3. Budget
    if budget_max is not None and product.price > budget_max:
        return (
            False,
            f"Rejected: price ₹{product.price:.0f} exceeds "
            f"budget ₹{budget_max:.0f}"
        )

    # 4. Size
    if size is not None:
        available_sizes = product.attributes.get("size", [])

        available_sizes = [
            str(value)
            for value in available_sizes
        ]

        if str(size) not in available_sizes:
            return (
                False,
                f"Rejected: size {size} is not available"
            )

    # 5. Delivery deadline
    if delivery_by is not None:
        eta = parse_delivery_date(
            product.delivery_eta
        )

        if eta is None:
            return (
                False,
                "Rejected: delivery date could not be determined"
            )

        if eta > delivery_by:
            return (
                False,
                f"Rejected: delivery on "
                f"{product.delivery_eta} is after "
                f"deadline {delivery_by}"
            )

    return True, "Accepted: meets all hard constraints"


def calculate_score(
    product: Product,
    merchant_rating: float,
    budget_max: float | None = None,
    delivery_by: date | None = None,
) -> float:

    score = 0.0

    # Price: 50 points
    if budget_max is not None and budget_max > 0:

        price_score = max(
            0,
            1 - (product.price / budget_max)
        )

        score += price_score * 50

    # Merchant rating: 30 points
    rating_score = min(
        merchant_rating / 5,
        1
    )

    score += rating_score * 30

    # Delivery: 20 points
    if delivery_by is not None:

        eta = parse_delivery_date(
            product.delivery_eta
        )

        if eta is not None:

            days_early = (
                delivery_by - eta
            ).days

            delivery_score = min(
                max(days_early + 1, 0) / 7,
                1
            )

            score += delivery_score * 20

    return round(score, 2)

