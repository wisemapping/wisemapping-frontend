export default class Icon {
  protected BUILTIN: string | undefined;

  getBuiltin(): string | undefined {
    return this.BUILTIN;
  }

  setBuiltin(value: string): void {
    this.BUILTIN = value;
  }

  toXml(document: Document): HTMLElement {
    // Set node attributes
    const iconElem = document.createElement('icon');
    if (this.BUILTIN) {
      iconElem.setAttribute('BUILTIN', this.BUILTIN);
    }

    return iconElem;
  }
}
