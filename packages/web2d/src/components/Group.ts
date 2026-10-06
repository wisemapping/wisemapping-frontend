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

import WorkspaceElement from './WorkspaceElement';
import { type CustomEventMap } from './peer/svg/ElementPeer';
import type ElementPeer from './peer/svg/ElementPeer';
import GroupPeer from './peer/svg/GroupPeer';
import type SizeType from './SizeType';
import {
  pointArguments,
  sizeArguments,
  type AttributeArguments,
  type AttributeSetter,
  type GroupAttributes,
} from './StyleAttributes';
import type PositionType from './PositionType';
import type { ElementType, StrokeStyle } from './types';

/**
 * A group object can be used to collect shapes. `M` types its custom events (see CustomEventMap).
 */
class Group<M extends CustomEventMap = CustomEventMap> extends WorkspaceElement<GroupPeer, M> {
  constructor(attributes?: GroupAttributes) {
    const peer = new GroupPeer();
    const defaultAttributes: GroupAttributes = {
      width: 50,
      height: 50,
      x: 0,
      y: 0,
      coordOriginX: 0,
      coordOriginY: 0,
      coordSizeWidth: 50,
      coordSizeHeight: 50,
    };

    const mergedAttr = { ...defaultAttributes, ...attributes };
    super(peer, mergedAttr);
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

  /**
   * Appends an element as a child to the object.
   */
  append(element: WorkspaceElement<ElementPeer>): void {
    if (!element) {
      throw Error('Child element can not be null');
    }

    if (element === this) {
      throw new Error("It's not posible to add the group as a child of itself");
    }

    const elementType = element.getType();
    if (elementType == null) {
      throw new Error(`It seems not to be an element ->${element}`);
    }

    if (elementType === 'Workspace') {
      throw new Error('A group can not have a workspace as a child');
    }

    this.peer.append(element.peer);
  }

  /** Applies the position and coordinate attributes too. */
  protected override applyAttribute(setter: AttributeSetter, args: AttributeArguments): void {
    switch (setter) {
      case 'position':
        this.setPosition(...pointArguments(args, this.getPosition()));
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

  /** Whether the element was appended to this group (and not removed since). */
  contains(element: WorkspaceElement<ElementPeer>): boolean {
    return this.peer.getChildren().includes(element.peer);
  }

  /** Whether the element is the last child of this group, drawn in front of the others. */
  isLastChild(element: WorkspaceElement<ElementPeer>): boolean {
    const children = this.peer.getChildren();
    return (
      children[children.length - 1] === element.peer &&
      this.peer._native.lastChild === element.peer._native
    );
  }

  getType(): ElementType {
    return 'Group';
  }

  /**
   * Removes every listener added with addEvent() to this element and to every element in it,
   * for example when a map is torn down. The elements stay usable.
   */
  override dispose(): void {
    this.peer.disposeTree();
  }

  /**
   * The size of the group's own coordinate system: its children are laid out in these units,
   * which are scaled to the group size (an SVG translate + scale transform).
   */
  setCoordSize(width: number, height: number): void {
    this.peer.setCoordSize(width, height);
  }

  setCoordOrigin(x: number, y: number): void {
    this.peer.setCoordOrigin(x, y);
  }

  getCoordOrigin(): PositionType {
    return this.peer.getCoordOrigin();
  }

  getSize(): SizeType {
    return this.peer.getSize();
  }

  /** A group has no fill of its own: this is a no-op (fill its children instead). */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override setFill(_color?: string, _opacity?: number): void {
    // No-op.
  }

  /** A group has no stroke of its own: this is a no-op (stroke its children instead). */
  /* eslint-disable @typescript-eslint/no-unused-vars */
  override setStroke(
    _width?: number | null,
    _style?: StrokeStyle | null,
    _color?: string,
    _opacity?: number,
  ): void {
    /* eslint-enable @typescript-eslint/no-unused-vars */
    // No-op.
  }

  getCoordSize(): SizeType {
    return this.peer.getCoordSize();
  }

  appendDomChild(DomElement: Element | Node): void {
    if (DomElement == null) {
      throw new Error('Child element can not be null');
    }

    // Type guard to prevent adding itself
    // Note: DomElement is a DOM Node/Element, while this is a Group instance
    this.peer._native.append(DomElement);
  }

  getPosition(): PositionType {
    return this.peer.getPosition();
  }

  setPosition(x: number, y: number): void {
    this.peer.setPosition(x, y);
  }
}
export default Group;
