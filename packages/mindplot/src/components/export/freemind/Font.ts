export default class Font {
  protected BOLD?: string;

  protected ITALIC?: string;

  protected NAME?: string;

  protected SIZE: string;

  getBold(): string {
    return this.BOLD;
  }

  getItalic(): string {
    return this.ITALIC;
  }

  getName(): string {
    return this.NAME;
  }

  getSize(): string {
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

    fontElem.setAttribute('SIZE', this.SIZE);

    if (this.BOLD) fontElem.setAttribute('BOLD', this.BOLD);
    if (this.ITALIC) fontElem.setAttribute('ITALIC', this.ITALIC);
    if (this.NAME) fontElem.setAttribute('NAME', this.NAME);

    return fontElem;
  }
}
