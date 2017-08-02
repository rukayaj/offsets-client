export class Development {
  id: number;
  type: string;
  geometry: object;
  properties: GeoProperty;
}

export class GeoProperty {
  id: number;
  year: number;
  permits: number[];
}