export function translatePolygon(
  polygon: GeoJSON.Polygon,
  dLon: number,
  dLat: number
): GeoJSON.Polygon {
  return {
    type: "Polygon",
    coordinates: polygon.coordinates.map((ring) =>
      ring.map(([lon, lat]) => [lon + dLon, lat + dLat])
    ),
  };
}

export function translateLine(
  line: GeoJSON.LineString,
  dLon: number,
  dLat: number
): GeoJSON.LineString {
  return {
    type: "LineString",
    coordinates: line.coordinates.map(([lon, lat]) => [lon + dLon, lat + dLat]),
  };
}

export function translatePoint(
  point: { latitude: number; longitude: number },
  dLon: number,
  dLat: number
) {
  return { latitude: point.latitude + dLat, longitude: point.longitude + dLon };
}

export function haversineKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// Bounding box across an arbitrary set of [lon, lat] coordinates, for map fit.
export function boundsOf(coords: [number, number][]): [number, number, number, number] {
  let minLon = Infinity;
  let minLat = Infinity;
  let maxLon = -Infinity;
  let maxLat = -Infinity;
  for (const [lon, lat] of coords) {
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  return [minLon, minLat, maxLon, maxLat];
}
