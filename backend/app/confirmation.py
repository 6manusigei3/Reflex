def get_confirmation_code(
    delivery_id: str,
) -> str:
    """
    Generate the same temporary demo confirmation
    code currently used by the Reflex frontend.

    Example:
        RFX-1008 -> 001008

    This will later be replaced by a secure,
    single-use database token.
    """

    digits = "".join(
        character
        for character in delivery_id
        if character.isdigit()
    )

    return digits.zfill(6)[-6:]


def is_valid_confirmation_code(
    delivery_id: str,
    code: str,
) -> bool:
    return (
        get_confirmation_code(delivery_id)
        == code
    )
