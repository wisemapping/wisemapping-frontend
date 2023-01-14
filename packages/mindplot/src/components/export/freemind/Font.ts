export default class Font {
  protected BOLD: string | undefined;

  protected ITALIC: string | undefined;

  protected NAME: string | undefined;

  protected SIZE: string | undefined;

  getBold(): string | undefined {
    return this.BOLD;
  }

  getItalic(): string | undefined {
    return this.ITALIC;
  }

  getName(): string | undefined {
    return this.NAME;
  }

  getSize(): string | undefined {
    return this.SIZE;
  }

  setBold(value: string): void {
    this.BOLD = value;
  }

  setItalic(value: string): void {
    this.ITALIC = value;
  }

  setName(value: string): void {
    this.NAME = value;
  }

  setSize(value: string): void {
    this.SIZE = value;
  }

  toXml(document: Document): HTMLElement {
    const fontElem = document.createElement('font');

    if (this.SIZE) {
      fontElem.setAttribute('SIZE', this.SIZE);
    } else {
      fontElem.setAttribute('SIZE', '12');
    }
    if (this.BOLD) fontElem.setAttribute('BOLD', this.BOLD);
    if (this.ITALIC) fontElem.setAttribute('ITALIC', this.ITALIC);
    if (this.NAME) fontElem.setAttribute('NAME', this.NAME);

    return fontElem;
  }
}
