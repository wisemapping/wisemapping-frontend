export default class Icon {
  protected BUILTIN: string;

  getBuiltin(): string {
    return this.BUILTIN;
  }

  setBuiltin(value: string): void {
    this.BUILTIN = value;
  }

  toXml(document: Document): HTMLElement {
    // Set node attributes
    const iconElem = document.createElement('icon');

    iconElem.setAttribute('BUILTIN', this.BUILTIN);

    return iconElem;
  }
}
