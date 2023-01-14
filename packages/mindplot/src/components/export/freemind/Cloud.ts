export default class Cloud {
  protected COLOR: string | undefined;

  getColor(): string | undefined {
    return this.COLOR;
  }

  setColor(value: string): void {
    this.COLOR = value;
  }

  toXml(document: Document): HTMLElement {
    // Set node attributes
    const cloudElem = document.createElement('cloud');
    if (this.COLOR) {
      cloudElem.setAttribute('COLOR', this.COLOR);
    }

    return cloudElem;
  }
}
