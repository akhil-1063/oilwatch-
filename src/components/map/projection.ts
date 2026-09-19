export interface LonLatBounds {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}

export interface Projector {
  project: (lon: number, lat: number) => [number, number];
  viewWidth: number;
  viewHeight: number;
}

export function createProjector(bounds: LonLatBounds, viewWidth: number, viewHeight: number, paddingRatio = 0.16): Projector {
  const lonSpan = Math.max(bounds.maxLon - bounds.minLon, 0.001);
  const latSpan = Math.max(bounds.maxLat - bounds.minLat, 0.001);

  const padX = viewWidth * paddingRatio;
  const padY = viewHeight * paddingRatio;
  const usableW = viewWidth - padX * 2;
  const usableH = viewHeight - padY * 2;

  const scaleX = usableW / lonSpan;
  const scaleY = usableH / latSpan;
  const scale = Math.min(scaleX, scaleY);

  const drawnW = lonSpan * scale;
  const drawnH = latSpan * scale;
  const offsetX = padX + (usableW - drawnW) / 2;
  const offsetY = padY + (usableH - drawnH) / 2;

  return {
    project: (lon: number, lat: number) => {
      const x = offsetX + (lon - bounds.minLon) * scale;
      const y = offsetY + (bounds.maxLat - lat) * scale; // invert y (north up)
      return [x, y];
    },
    viewWidth,
    viewHeight,
  };
}

export function pathFromLineString(coords: [number, number][], project: Projector["project"]): string {
  return coords
    .map(([lon, lat], i) => {
      const [x, y] = project(lon, lat);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function pathFromPolygon(rings: [number, number][][], project: Projector["project"]): string {
  return rings
    .map((ring) => pathFromLineString(ring, project) + " Z")
    .join(" ");
}
