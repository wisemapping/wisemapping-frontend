export default class Cloud {
  protected COLOR: string;

  getColor(): string {
    return this.COLOR;
  }

  setColor(value: string): void {
    this.COLOR = value;
  }

  toXml(document: Document): HTMLElement {
    // Set node attributes
    const cloudElem = document.createElement('cloud');

    cloudElem.setAttribute('COLOR', this.COLOR);

    return cloudElem;
  }
}
