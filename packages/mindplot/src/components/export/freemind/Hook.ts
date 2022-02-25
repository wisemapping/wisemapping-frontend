import Parameters from './Parameters';

export default class Hook {
  protected PARAMETERS: Parameters;

  protected TEXT: string;

  protected NAME: string;

  getParameters(): Parameters {
    return this.PARAMETERS;
  }

  getText(): string {
    return this.TEXT;
  }

  getName(): string {
    return this.NAME;
  }

  setParameters(value: Parameters): void {
    this.PARAMETERS = value;
  }

  setText(value: string): void {
    this.TEXT = value;
  }

  setName(value: string): void {
    this.NAME = value;
  }
}
