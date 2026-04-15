export const getBoundaries = (countryCode: string) => {
    switch (countryCode) {
      case "ARG":
      case "AR":
        return { minLat: -55, maxLat: -21, minLng: -73, maxLng: -53 };
      case "BR":
      case "BRA":
        return { minLat: -33, maxLat: 5, minLng: -74, maxLng: -34 };
      case "PY":
      case "PRY":
        return { minLat: -28, maxLat: -19, minLng: -62, maxLng: -54 };
      default:
        return { minLat: -90, maxLat: 90, minLng: -180, maxLng: 180 };
    }
  };