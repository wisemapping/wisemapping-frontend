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
import { $defined } from './peer/utils/assert';
import WorkspaceElement from './WorkspaceElement';
import type ElementPeer from './peer/svg/ElementPeer';
import WorkspacePeer from './peer/svg/WorkspacePeer';
import type PositionType from './PositionType';
import {
  pointArguments,
  sizeArguments,
  toLength,
  toNumber,
  toText,
  type AttributeArguments,
  type AttributeSetter,
  type WorkspaceAttributes,
} from './StyleAttributes';
import { isStrokeStyle, type ElementType, type StrokeStyle } from './types';

class Workspace extends WorkspaceElement<WorkspacePeer> {
  private readonly _htmlContainer: HTMLElement;

  constructor(attributes?: WorkspaceAttributes) {
    const htmlContainer = Workspace._createDivContainer();
    const peer = new WorkspacePeer();
    const defaultAttributes: WorkspaceAttributes = {
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

  /**
   * Applies the coordinate attributes too. The size and the stroke width keep CSS lengths
   * ('400px', '1px') as they are.
   */
  protected override applyAttribute(setter: AttributeSetter, args: AttributeArguments): void {
    switch (setter) {
      case 'size':
        this.setSize(toLength(args[0]), toLength(args[1]));
        break;
      case 'stroke':
        this.setStroke(
          toLength(args[0]) ?? null,
          toText(args[1]),
          toText(args[2]),
          toNumber(args[3]),
        );
        break;
      case 'coordSize':
        this.setCoordSize(...sizeArguments(args, this.getCoordSize()));
        break;
      case 'coordOrigin':
        this.setCoordOrigin(...pointArguments(args, this.getCoordOrigin()));
        break;
      default:
        super.applyAttribute(setter, args);
    }
  }

  getType(): ElementType {
    return 'Workspace';
  }

  /**
   * Removes every listener added with addEvent() to this element and to every element in it,
   * for example when a map is torn down. The elements stay usable.
   */
  override dispose(): void {
    this.peer.disposeTree();
  }

  /**
   * Appends an element as a child to the object.
   */
  append(element: WorkspaceElement<ElementPeer>) {
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

  addItAsChildTo(element: HTMLDivElement) {
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
  override setSize(width?: string | number | null, height?: string | number | null): void {
    // HTML container must have the size of the group element.
    if (width) {
      this._htmlContainer.style.width = String(width);
    }

    if (height) {
      this._htmlContainer.style.height = String(height);
    }
    // A missing width or height keeps the current one.
    this.peer.setSize(Workspace.toPixels(width), Workspace.toPixels(height));
  }

  /** The pixels of a size given in pixels or as a CSS length ('400px'). */
  private static toPixels(value?: string | number | null): number | undefined {
    return value == null ? undefined : Number.parseInt(String(value), 10);
  }

  /**
   * The size of the workspace coordinate system, in user units: the SVG viewBox width and height,
   * stretched to the workspace size.
   */
  setCoordSize(width: number | string, height: number | string): void {
    this.peer.setCoordSize(Number.parseFloat(String(width)), Number.parseFloat(String(height)));
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

  /** Sets the container background. The opacity is not supported and is ignored. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override setFill(color: string, _opacity?: number): void {
    if (color) {
      this._htmlContainer.style.backgroundColor = color;
    }
  }

  getSize() {
    const { width, height } = this._htmlContainer.style;
    return { width, height };
  }

  /**
   * Sets the container border. A number width is in pixels; a missing style is solid. The dash
   * styles map to the closest CSS border style, and the opacity is not supported and is ignored.
   */
  /* eslint-disable @typescript-eslint/no-unused-vars */
  override setStroke(
    width: number | string | null,
    style?: string,
    color?: string,
    _opacity?: number,
  ): void {
    /* eslint-enable @typescript-eslint/no-unused-vars */
    const borderWidth = typeof width === 'number' ? `${width}px` : width;
    const strokeStyle = style || 'solid';
    if (!isStrokeStyle(strokeStyle)) {
      throw new Error(`Unsupported stroke style: '${style}'`);
    }
    const borderStyle = Workspace._BORDER_STYLES[strokeStyle];
    const border = [borderWidth, borderStyle, color].filter((part) => part).join(' ');
    this._htmlContainer.style.border = border;
  }

  private static _BORDER_STYLES: Readonly<Record<StrokeStyle, string>> = {
    solid: 'solid',
    dash: 'dashed',
    longdash: 'dashed',
    dashdot: 'dashed',
    dot: 'dotted',
  };

  getCoordSize(): { width: number; height: number } {
    return this.peer.getCoordSize();
  }

  /**
   * Remove an element as a child to the object.
   */
  removeChild(element: WorkspaceElement<ElementPeer>): void {
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

  /** The root <svg> node, the only child of the HTML container. */
  getSVGElement(): SVGSVGElement {
    return this.peer._native;
  }
}

export default Workspace;
