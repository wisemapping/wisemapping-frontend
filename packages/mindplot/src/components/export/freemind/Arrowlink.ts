export default class Arrowlink {
  protected COLOR: string | undefined;

  protected DESTINATION: string | undefined;

  protected ENDARROW: string | undefined;

  protected ENDINCLINATION: string | undefined;

  protected ID: string | undefined;

  protected STARTARROW: string | undefined;

  protected STARTINCLINATION: string | undefined;

  getColor(): string | undefined {
    return this.COLOR;
  }

  getDestination(): string | undefined {
    return this.DESTINATION;
  }

  getEndarrow(): string | undefined {
    return this.ENDARROW;
  }

  getEndInclination(): string | undefined {
    return this.ENDINCLINATION;
  }

  getId(): string | undefined {
    return this.ID;
  }

  getStartarrow(): string | undefined {
    return this.STARTARROW;
  }

  getStartinclination(): string | undefined {
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

    if (this.DESTINATION) {
      arrowlinkElem.setAttribute('DESTINATION', this.DESTINATION);
    }
    if (this.STARTARROW) {
      arrowlinkElem.setAttribute('STARTARROW', this.STARTARROW);
    }

    if (this.COLOR) {
      arrowlinkElem.setAttribute('COLOR', this.COLOR);
    }
    if (this.ENDINCLINATION) {
      arrowlinkElem.setAttribute('ENDINCLINATION', this.ENDINCLINATION);
    }
    if (this.ENDARROW) {
      arrowlinkElem.setAttribute('ENDARROW', this.ENDARROW);
    }
    if (this.ID) {
      arrowlinkElem.setAttribute('ID', this.ID);
    }
    if (this.STARTINCLINATION) {
      arrowlinkElem.setAttribute('STARTINCLINATION', this.STARTINCLINATION);
    }

    return arrowlinkElem;
  }
}
