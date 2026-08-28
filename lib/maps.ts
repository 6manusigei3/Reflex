export type DeliveryCoordinates = {
  pickupLatitude?: number | null;
  pickupLongitude?: number | null;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
};

export function googleMapsDirectionsUrl(
  delivery: DeliveryCoordinates & { pickup: string; destination: string }
) {
  const origin = validPoint(delivery.pickupLatitude, delivery.pickupLongitude)
    ? `${delivery.pickupLatitude},${delivery.pickupLongitude}`
    : delivery.pickup;
  const destination = validPoint(
    delivery.destinationLatitude,
    delivery.destinationLongitude
  )
    ? `${delivery.destinationLatitude},${delivery.destinationLongitude}`
    : delivery.destination;
  const params = new URLSearchParams({ api: "1", origin, destination });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function validPoint(
  latitude: number | null | undefined,
  longitude: number | null | undefined
) {
  return (
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    typeof longitude === "number" &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180
  );
}
