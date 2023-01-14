import Parameters from './Parameters';

export default class Hook {
  protected PARAMETERS: Parameters | undefined;

  protected TEXT: string | undefined;

  protected NAME: string | undefined;

  getParameters(): Parameters | undefined {
    return this.PARAMETERS;
  }

  getText(): string | undefined {
    return this.TEXT;
  }

  getName(): string | undefined {
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
