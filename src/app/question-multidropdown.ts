import { QuestionBase } from './question-base';

export class MultiDropdownQuestion extends QuestionBase<string> {
  controlType = 'multidropdown';
  choices: {key: string, value: string}[] = [];

  constructor(choices: {} = {}) {
    super(choices);
    this.choices = choices['choices'] || [];
  }
}