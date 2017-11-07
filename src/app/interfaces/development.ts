export class Development {
  id: number;
  geometry: object;
  properties: DevelopmentGeoProperty;
  type: string;
}

export class DevelopmentGeoProperty {
  province: string;
  permits: number[];
  use: string;
  applicant: string;
  application_title: string;
  activity_description: string;
  authority: string;
  case_officer: string;
  date_issued: string;
  environmental_consultancy: string;
  environmental_assessment_practitioner: string;
  location_description: string;
  reference_no: string;  
  __str__: string;
  geo_info: object;
  unique_id: string;
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
