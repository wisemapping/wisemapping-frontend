export default class Richcontent {
  protected html: string;

  protected type: string;

  getHtml(): string {
    return this.html;
  }

  getType(): string {
    return this.type;
  }

  setHtml(value: string): void {
    this.html = value;
  }

  setType(value: string): void {
    this.type = value;
  }

  toXml(document: Document): HTMLElement {
    // Set node attributes
    const richcontentElem = document.createElement('richcontent');

    richcontentElem.setAttribute('TYPE', this.type);

    if (this.html) {
      const htmlElement: DocumentFragment = document.createRange().createContextualFragment(this.html);
      richcontentElem.appendChild(htmlElement);
    }

    return richcontentElem;
  }
}
