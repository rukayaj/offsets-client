export class Development {
  id: number;
  geometry: object;
  properties: GeoProperty;
  type: string;
}

export class GeoProperty {
  year: number;
  province: string;
  permits: number[];
  type: string;
}