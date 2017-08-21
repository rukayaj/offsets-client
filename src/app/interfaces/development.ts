export class Development {
  id: number;
  geometry: object;
  properties: DevelopmentGeoProperty;
  type: string;
}

export class DevelopmentGeoProperty {
  year: number;
  province: string;
  permits: number[];
  type: string;
  info: object;
}

export class Area {
  id: number;
  name: string;
  type: string;
  polygon: object;
}

export class Offset {
  id: number;
  geometry: object;
  properties: OffsetGeoProperty;
  type: string;
}

export class OffsetGeoProperty {
  year: number;
  province: string;
  type: string;
  duration: string;
}
