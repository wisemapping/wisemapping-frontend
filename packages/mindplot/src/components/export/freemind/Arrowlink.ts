export default class Arrowlink {
  protected COLOR: string;

  protected DESTINATION: string;

  protected ENDARROW: string;

  protected ENDINCLINATION: string;

  protected ID: string;

  protected STARTARROW: string;

  protected STARTINCLINATION: string;

  getColor(): string {
    return this.COLOR;
  }

  getDestination(): string {
    return this.DESTINATION;
  }

  getEndarrow(): string {
    return this.ENDARROW;
  }

  getEndInclination(): string {
    return this.ENDINCLINATION;
  }

  getId(): string {
    return this.ID;
  }

  getStartarrow(): string {
    return this.STARTARROW;
  }

  getStartinclination(): string {
    return this.STARTINCLINATION;
  }

  setColor(value: string): void {
    this.COLOR = value;
  }

  setDestination(value: string): void {
    this.DESTINATION = value;
  }

  setEndarrow(value: string): void {
    this.ENDARROW = value;
  }

  setEndinclination(value: string): void {
    this.ENDINCLINATION = value;
  }

  setId(value: string): void {
    this.ID = value;
  }

  setStartarrow(value: string): void {
    this.STARTARROW = value;
  }

  setStartinclination(value: string): void {
    this.STARTINCLINATION = value;
  }

  toXml(document: Document): HTMLElement {
    const arrowlinkElem = document.createElement('arrowlink');

    arrowlinkElem.setAttribute('DESTINATION', this.DESTINATION);
    arrowlinkElem.setAttribute('STARTARROW', this.STARTARROW);

    if (this.COLOR) arrowlinkElem.setAttribute('COLOR', this.COLOR);
    if (this.ENDINCLINATION) arrowlinkElem.setAttribute('ENDINCLINATION', this.ENDINCLINATION);
    if (this.ENDARROW) arrowlinkElem.setAttribute('ENDARROW', this.ENDARROW);
    if (this.ID) arrowlinkElem.setAttribute('ID', this.ID);
    if (this.STARTINCLINATION) arrowlinkElem.setAttribute('STARTINCLINATION', this.STARTINCLINATION);

    return arrowlinkElem;
  }
}
