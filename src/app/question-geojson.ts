import { QuestionBase } from './question-base';

export class GeoJsonQuestion extends QuestionBase<string> {
  controlType = 'geojson';
  type: string;

  constructor(options: {} = {}) {
    super(options);
    this.type = options['type'] || '';
  }
}