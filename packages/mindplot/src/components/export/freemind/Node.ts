/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import Arrowlink from './Arrowlink';
import Cloud from './Cloud';
import Edge from './Edge';
import Font from './Font';
import Hook from './Hook';
import Icon from './Icon';
import Richcontent from './Richcontent';

class Node {
  protected arrowlinkOrCloudOrEdge:
    | Array<Arrowlink | Cloud | Edge | Font | Hook | Icon | Richcontent | this>
    | undefined;

  protected BACKGROUND_COLOR: string | undefined;

  protected COLOR: string | undefined;

  protected FOLDED: string | undefined;

  protected ID: string | undefined;

  protected LINK: string | undefined;

  protected POSITION: string | undefined;

  protected STYLE: string | undefined;

  protected TEXT: string | undefined;

  protected CREATED: string | undefined;

  protected MODIFIED: string | undefined;

  protected HGAP: string | undefined;

  protected VGAP: string | undefined;

  protected WCOORDS: string | undefined;

  protected WORDER: string | undefined;

  protected VSHIFT: string | undefined;

  protected ENCRYPTED_CONTENT: string | undefined;

  private centralTopic = false;

  getArrowlinkOrCloudOrEdge(): Array<
    /* eslint-disable */
    Arrowlink | Cloud | Edge | Font | Hook | Icon | Richcontent | Node
  > {
    if (!this.arrowlinkOrCloudOrEdge) {
      this.arrowlinkOrCloudOrEdge = new Array<
        Arrowlink | Cloud | Edge | Font | Hook | Icon | Richcontent | this
      >();
    }
    return this.arrowlinkOrCloudOrEdge;
  }

  getBackgroundColor(): string | undefined {
    return this.BACKGROUND_COLOR;
  }

  getColor(): string | undefined {
    return this.COLOR;
  }

  getFolded(): string | undefined {
    return this.FOLDED;
  }

  getId(): string | undefined {
    return this.ID;
  }

  getLink(): string | undefined {
    return this.LINK;
  }

  getPosition(): string | undefined {
    return this.POSITION;
  }

  getStyle(): string | undefined {
    return this.STYLE;
  }

  getText(): string | undefined {
    return this.TEXT;
  }

  getCreated(): string | undefined {
    return this.CREATED;
  }

  getModified(): string | undefined {
    return this.MODIFIED;
  }

  getHgap(): string | undefined {
    return this.HGAP;
  }

  getVgap(): string | undefined {
    return this.VGAP;
  }

  getWcoords(): string | undefined {
    return this.WCOORDS;
  }

  getWorder(): string | undefined {
    return this.WORDER;
  }

  getVshift(): string | undefined {
    return this.VSHIFT;
  }

  getEncryptedContent(): string | undefined {
    return this.ENCRYPTED_CONTENT;
  }

  getCentralTopic(): boolean {
    return this.centralTopic;
  }

  setArrowlinkOrCloudOrEdge(
    value: Arrowlink | Cloud | Edge | Font | Hook | Icon | Richcontent | this,
  ): void {
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

  setLink(value: string): void {
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

  setCentralTopic(value: boolean): void {
    this.centralTopic = value;
  }

  toXml(document: Document): HTMLElement {
    // Set node attributes
    const nodeElem = document.createElement('node');

    if (this.centralTopic) {
      if (this.ID) nodeElem.setAttribute('ID', this.ID);
      if (this.TEXT) nodeElem.setAttribute('TEXT', this.TEXT);
      if (this.BACKGROUND_COLOR) nodeElem.setAttribute('BACKGROUND_COLOR', this.BACKGROUND_COLOR);
      if (this.COLOR) nodeElem.setAttribute('COLOR', this.COLOR);
      if (this.TEXT) {
        nodeElem.setAttribute('TEXT', this.TEXT);
      } else {
        nodeElem.setAttribute('TEXT', '');
      }
      return nodeElem;
    }

    if (this.ID) nodeElem.setAttribute('ID', this.ID);
    if (this.POSITION) nodeElem.setAttribute('POSITION', this.POSITION);
    if (this.STYLE) nodeElem.setAttribute('STYLE', this.STYLE);
    if (this.BACKGROUND_COLOR) nodeElem.setAttribute('BACKGROUND_COLOR', this.BACKGROUND_COLOR);
    if (this.COLOR) nodeElem.setAttribute('COLOR', this.COLOR);
    if (this.TEXT) nodeElem.setAttribute('TEXT', this.TEXT);
    if (this.LINK) nodeElem.setAttribute('LINK', this.LINK);
    if (this.FOLDED) nodeElem.setAttribute('FOLDED', this.FOLDED);
    if (this.CREATED) nodeElem.setAttribute('CREATED', this.CREATED);
    if (this.MODIFIED) nodeElem.setAttribute('MODIFIED', this.MODIFIED);
    if (this.HGAP) nodeElem.setAttribute('HGAP', this.HGAP);
    if (this.VGAP) nodeElem.setAttribute('VGAP', this.VGAP);
    if (this.WCOORDS) nodeElem.setAttribute('WCOORDS', this.WCOORDS);
    if (this.WORDER) nodeElem.setAttribute('WORDER', this.WORDER);
    if (this.VSHIFT) nodeElem.setAttribute('VSHIFT', this.VSHIFT);
    if (this.ENCRYPTED_CONTENT) nodeElem.setAttribute('ENCRYPTED_CONTENT', this.ENCRYPTED_CONTENT);

    return nodeElem;
  }

  loadFromElement(element: Element): Node {
    const node = new Node();

    const nodeId = element.getAttribute('ID');
    const nodePosition = element.getAttribute('POSITION');
    const nodeStyle = element.getAttribute('STYLE');
    const nodeBGColor = element.getAttribute('BACKGROUND_COLOR');
    const nodeColor = element.getAttribute('COLOR');
    const nodeText = element.getAttribute('TEXT');
    const nodeLink = element.getAttribute('LINK');
    const nodeFolded = element.getAttribute('FOLDED');
    const nodeCreated = element.getAttribute('CREATED');
    const nodeModified = element.getAttribute('MODIFIED');
    const nodeHgap = element.getAttribute('HGAP');
    const nodeVgap = element.getAttribute('VGAP');
    const nodeWcoords = element.getAttribute('WCOORDS');
    const nodeWorder = element.getAttribute('WORDER');
    const nodeVshift = element.getAttribute('VSHIFT');
    const nodeEncryptedContent = element.getAttribute('ENCRYPTED_CONTENT');

    if (nodeId) node.setId(nodeId);
    if (nodePosition) node.setPosition(nodePosition);
    if (nodeStyle) node.setStyle(nodeStyle);
    if (nodeBGColor) node.setBackgorundColor(nodeBGColor);
    if (nodeColor) node.setColor(nodeColor);
    if (nodeText) node.setText(nodeText);
    if (nodeLink) node.setLink(nodeLink);
    if (nodeFolded) node.setFolded(nodeFolded);
    if (nodeCreated) node.setCreated(nodeCreated);
    if (nodeModified) node.setModified(nodeModified);
    if (nodeHgap) node.setHgap(nodeHgap);
    if (nodeVgap) node.setVgap(nodeVgap);
    if (nodeWcoords) node.setWcoords(nodeWcoords);
    if (nodeWorder) node.setWorder(nodeWorder);
    if (nodeVshift) node.setVshift(nodeVshift);
    if (nodeEncryptedContent) node.setEncryptedContent(nodeEncryptedContent);

    return node;
  }
}

export type Choise = Arrowlink | Cloud | Edge | Font | Hook | Icon | Richcontent | Node;

export default Node;
