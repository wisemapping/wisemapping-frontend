import Arrowlink from './Arrowlink';
import Cloud from './Cloud';
import Edge from './Edge';
import Font from './Font';
import Hook from './Hook';
import Icon from './Icon';
import Richcontent from './Richcontent';

class Node {
  protected arrowlinkOrCloudOrEdge: Array<Arrowlink | Cloud | Edge | Font | Hook | Icon | Richcontent | this>;

  protected BACKGROUND_COLOR: string;

  protected COLOR: string;

  protected FOLDED: string;

  protected ID: string;

  protected LINK: string;

  protected POSITION: string;

  protected STYLE: string;

  protected TEXT: string;

  protected CREATED: string;

  protected MODIFIED: string;

  protected HGAP: string;

  protected VGAP: string;

  protected WCOORDS: string;

  protected WORDER: string;

  protected VSHIFT: string;

  protected ENCRYPTED_CONTENT: string;

  getArrowlinkOrCloudOrEdge(): Array<Arrowlink | Cloud | Edge | Font | Hook | Icon | Richcontent | Node> {
    if (!this.arrowlinkOrCloudOrEdge) {
      this.arrowlinkOrCloudOrEdge = new Array<Arrowlink | Cloud | Edge | Font | Hook | Icon | Richcontent | this>();
    }
    return this.arrowlinkOrCloudOrEdge;
  }

  getBackgorundColor(): string {
    return this.BACKGROUND_COLOR;
  }

  getColor(): string {
    return this.COLOR;
  }

  getFolded(): string {
    return this.FOLDED;
  }

  getId(): string {
    return this.ID;
  }

  getLink(): string {
    return this.LINK;
  }

  getPosition(): string {
    return this.POSITION;
  }

  getStyle(): string {
    return this.STYLE;
  }

  getText(): string {
    return this.TEXT;
  }

  getCreated(): string {
    return this.CREATED;
  }

  getModified(): string {
    return this.MODIFIED;
  }

  getHgap(): string {
    return this.HGAP;
  }

  getVgap(): string {
    return this.VGAP;
  }

  getWcoords(): string {
    return this.WCOORDS;
  }

  getWorder(): string {
    return this.WORDER;
  }

  getVshift(): string {
    return this.VSHIFT;
  }

  getEncryptedContent(): string {
    return this.ENCRYPTED_CONTENT;
  }

  setArrowlinkOrCloudOrEdge(value: Arrowlink | Cloud | Edge | Font | Hook | Icon | Richcontent | this): void {
    this.getArrowlinkOrCloudOrEdge().push(value);
  }

  setBackgorundColor(value: string): void {
    this.BACKGROUND_COLOR = value;
  }

  setColor(value: string): void {
    this.COLOR = value;
  }

  setFolded(value: string): void {
    this.FOLDED = value;
  }

  setId(value: string): void {
    this.ID = value;
  }

  setLink(value): void {
    this.LINK = value;
  }

  setPosition(value: string): void {
    this.POSITION = value;
  }

  setStyle(value: string): void {
    this.STYLE = value;
  }

  setText(value: string): void {
    this.TEXT = value;
  }

  setCreated(value: string): void {
    this.CREATED = value;
  }

  setModified(value: string): void {
    this.MODIFIED = value;
  }

  setHgap(value: string): void {
    this.HGAP = value;
  }

  setVgap(value: string): void {
    this.VGAP = value;
  }

  setWcoords(value: string): void {
    this.WCOORDS = value;
  }

  setWorder(value: string): void {
    this.WORDER = value;
  }

  setVshift(value: string): void {
    this.VSHIFT = value;
  }

  setEncryptedContent(value: string): void {
    this.ENCRYPTED_CONTENT = value;
  }

  toXml(document: Document): HTMLElement {
    // Set node attributes
    const nodeElem = document.createElement('node');

    if (this.ID) nodeElem.setAttribute('ID', this.ID);
    if (this.POSITION) nodeElem.setAttribute('POSITION', this.POSITION);
    if (this.STYLE) nodeElem.setAttribute('STYLE', this.STYLE);
    if (this.BACKGROUND_COLOR) nodeElem.setAttribute('BACKGROUND_COLOR', this.BACKGROUND_COLOR);
    if (this.COLOR) nodeElem.setAttribute('COLOR', this.COLOR);
    if (this.TEXT) nodeElem.setAttribute('TEXT', this.TEXT);

    return nodeElem;
  }
}

export type Choise = Arrowlink | Cloud | Edge | Font | Hook | Icon | Richcontent | Node

export default Node;
