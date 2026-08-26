export function getConfirmationCode(
  deliveryId: string
) {
  const digits = deliveryId.replace(/\D/g, "");

  return digits
    .padStart(6, "0")
    .slice(-6);
}

export function isValidConfirmationCode(
  deliveryId: string,
  code: string
) {
  return (
    getConfirmationCode(deliveryId) === code
  );
}
