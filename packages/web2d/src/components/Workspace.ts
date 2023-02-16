/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import { $defined } from '@wisemapping/core-js';
import WorkspaceElement from './WorkspaceElement';
import WorkspacePeer from './peer/svg/WorkspacePeer';
import PositionType from './PositionType';
import StyleAttributes from './StyleAttributes';
import Toolkit from './Toolkit';

class Workspace extends WorkspaceElement<WorkspacePeer> {
  private _htmlContainer: HTMLElement;

  constructor(attributes?: StyleAttributes) {
    const htmlContainer = Workspace._createDivContainer();
    const peer = Toolkit.createWorkspace(htmlContainer);
    const defaultAttributes: StyleAttributes = {
      width: '400px',
      height: '400px',
      stroke: '1px solid #edf1be',
      fillColor: 'white',
      coordOriginX: 0,
      coordOriginY: 0,
      coordSizeWidth: 200,
      coordSizeHeight: 200,
    };

    const mergedAttr = { ...defaultAttributes, ...attributes };
    super(peer, mergedAttr, true);

    this._htmlContainer = htmlContainer;
    this._initialize(mergedAttr);
    htmlContainer.append(this.peer._native);
  }

  getType(): string {
    return 'Workspace';
  }

  /**
   * Appends an element as a child to the object.
   */
  append(element: WorkspaceElement<any>) {
    if (!element) {
      throw new Error('Child element can not be null');
    }
    const elementType = element.getType();
    if (!elementType) {
      throw new Error(`It seems not to be an element ->${element}`);
    }

    if (elementType === 'Workspace') {
      throw new Error('A workspace can not have a workspace as a child');
    }

    this.peer.append(element.peer);
  }

  addItAsChildTo(element: JQuery<HTMLDivElement>) {
    if (!$defined(element)) {
      throw new Error('Workspace div container can not be null');
    }
    element.append(this._htmlContainer);
  }

  /**
   * Create a new div element that will be responsible for containing the workspace elements.
   */
  static _createDivContainer(): HTMLElement {
    const container = window.document.createElement('div');
    container.style.position = 'relative';
    container.style.top = '0px';
    container.style.left = '0px';
    container.style.height = '688px';
    container.style.border = '1px solid red';

    return container;
  }

  /**
   *  Set the workspace area size. It can be defined using different units:
   * in (inches; 1in=2.54cm)
   * cm (centimeters; 1cm=10mm)
   * mm (millimeters)
   * pt (points; 1pt=1/72in)
   * pc (picas; 1pc=12pt)
   */
  setSize(width: string | number, height: string | number) {
    // HTML container must have the size of the group element.
    if (width) {
      this._htmlContainer.style.width = String(width);
    }

    if (height) {
      this._htmlContainer.style.height = String(height);
    }
    this.peer.setSize(Number.parseInt(String(width)), Number.parseInt(String(height)));
  }

  /**
   * The workspace element is a containing blocks for this content
   * - they define a CSS2 "block level box".
   * Inside the containing block a local coordinate system is
   * defined for any sub-elements using the coordsize and coordorigin attributes.
   * All CSS2 positioning information is expressed in terms of this local coordinate space.
   * Consequently CSS2 position attributes (left, top, width, height
   * and so on) have no unit specifier -
   * they are simple numbers, not CSS length quantities.
   */
  setCoordSize(width: number | string, height: number | string): void {
    this.peer.setCoordSize(Number.parseInt(String(width), 10), Number.parseInt(String(height), 10));
  }

  setCoordOrigin(x: number, y: number): void {
    this.peer.setCoordOrigin(x, y);
  }

  /**
   * @Todo: Complete Doc
   */
  getCoordOrigin(): PositionType {
    return this.peer.getCoordOrigin();
  }

  // Private method declaration area
  /**
   * All the SVG elements will be children of this HTML element.
   */
  _getHtmlContainer() {
    return this._htmlContainer;
  }

  setFill(color: string, opacity: number) {
    this._htmlContainer.style.backgroundColor = color;
    if (opacity || opacity === 0) {
      throw new Error('Unsupported operation. Opacity not supported.');
    }
  }

  getSize() {
    const { width, height } = this._htmlContainer.style;
    return { width, height };
  }

  setStroke(width: number, style: string, color: string, opacity: number) {
    if (style !== 'solid') {
      throw new Error(`Not supported style stroke style:${style}`);
    }
    this._htmlContainer.style.border = `${width} ${style} ${color}`;

    if (opacity || opacity === 0) {
      throw new Error('Unsupported operation. Opacity not supported.');
    }
  }

  getCoordSize(): { width: number; height: number } {
    return this.peer.getCoordSize();
  }

  /**
   * Remove an element as a child to the object.
   */
  removeChild(element: WorkspaceElement<any>): void {
    if (!element) {
      throw new Error('Child element can not be null');
    }

    if (element === this) {
      throw new Error("It's not possible to add the group as a child of itself");
    }

    const elementType = element.getType();
    if (elementType == null) {
      throw new Error(`It seems not to be an element ->${element}`);
    }

    this.peer.removeChild(element.peer);
  }

  getSVGElement(): Element {
    return this._htmlContainer.firstChild as Element;
  }
}

export default Workspace;
