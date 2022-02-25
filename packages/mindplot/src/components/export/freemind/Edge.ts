export default class Edge {
  protected COLOR: string;

  protected STYLE: string;

  protected WIDTH: string;

  getColor(): string {
    return this.COLOR;
  }

  getStyle(): string {
    return this.STYLE;
  }

  getWidth(): string {
    return this.WIDTH;
  }

  setColor(value: string): void {
    this.COLOR = value;
  }

  setStyle(value: string): void {
    this.STYLE = value;
  }

  setWidth(value: string): void {
    this.WIDTH = value;
  }

  toXml(document: Document): HTMLElement {
    // Set node attributes
    const edgeElem = document.createElement('edge');

    edgeElem.setAttribute('COLOR', this.COLOR);
    if (this.STYLE) edgeElem.setAttribute('STYLE', this.STYLE);
    if (this.WIDTH) edgeElem.setAttribute('WIDTH', this.WIDTH);

    return edgeElem;
  }
}
