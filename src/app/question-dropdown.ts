import { QuestionBase } from './question-base';

export class DropdownQuestion extends QuestionBase<string> {
  controlType = 'dropdown';
  choices: {key: string, value: string}[] = [];

  constructor(choices: {} = {}) {
    super(choices);
    this.choices = choices['choices'] || [];
  }
}