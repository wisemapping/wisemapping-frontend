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
import { $assert, $defined } from '../util/assert';
import { LineType } from '../ConnectionLine';
import PositionType from '../PositionType';
import { FontWeightType } from '../FontWeightType';
import { FontStyleType } from '../FontStyleType';
import FeatureModel from './FeatureModel';
import Mindmap from './Mindmap';
import SizeType from '../SizeType';
import ContentType from '../ContentType';

export type NodeModelType = 'CentralTopic' | 'MainTopic';

export type TopicShapeType =
  | 'rectangle'
  | 'rounded rectangle'
  | 'elipse'
  | 'line'
  | 'none'
  | 'image';

// regex taken from https://stackoverflow.com/a/34763398/58128
const parseJsObject = (str: string) =>
  JSON.parse(str.replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2": '));

abstract class INodeModel {
  static MAIN_TOPIC_TO_MAIN_TOPIC_DISTANCE = 220;

  private static _nextUuid = 0;

  protected _mindmap: Mindmap;

  constructor(mindmap: Mindmap) {
    $assert(mindmap && mindmap.getBranches, 'mindmap can not be null');
    this._mindmap = mindmap;
  }

  getId(): number {
    return this.getProperty('id') as number;
  }

  abstract getFeatures(): FeatureModel[];

  setId(id?: number): void {
    if (id === null || id === undefined) {
      // Assign a new one ...
      const newId = INodeModel._nextUUID();
      this.putProperty('id', newId);
    } else {
      if (id > INodeModel._nextUuid) {
        $assert(Number.isFinite(id), `value is not a number ${id}`);
        INodeModel._nextUuid = id;
      }
      this.putProperty('id', id);
    }
  }

  getType(): NodeModelType {
    return this.getProperty('type') as NodeModelType;
  }

  setType(type: NodeModelType): void {
    this.putProperty('type', type);
  }

  setText(text: string | undefined): void {
    this.putProperty('text', text);
  }

  getText(): string | null {
    return this.getProperty('text') as string;
  }

  setContentType(contentType: ContentType | undefined): void {
    this.putProperty('contentType', contentType);
  }

  getContentType(): ContentType {
    return (this.getProperty('contentType') as ContentType) || ContentType.PLAIN;
  }

  getPlainText(): string {
    const text = this.getText();
    if (!text) return '';

    if (this.getContentType() === ContentType.HTML) {
      // Create a temporary DOM element to strip HTML tags
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = text;
      return tempDiv.textContent || tempDiv.innerText || '';
    }

    return text;
  }

  setPosition(x: number, y: number): void {
    this.putProperty('position', `{x:${x},y:${y}}`);
  }

  getPosition(): PositionType {
    const value = this.getProperty('position') as string;
    let result;
    if (value != null) {
      result = parseJsObject(value);
    }
    return result;
  }

  setImageSize(width: number, height: number): void {
    this.putProperty('imageSize', `{width:${width},height:${height}}`);
  }

  getImageSize(): SizeType | undefined {
    const value = this.getProperty('imageSize') as string;
    let result: SizeType | undefined;
    if (value) {
      result = parseJsObject(value);
    }
    return result;
  }

  setImageUrl(url: string) {
    this.putProperty('imageUrl', url);
  }

  getMetadata(): string {
    return this.getProperty('metadata') as string;
  }

  setMetadata(json: string): void {
    this.putProperty('metadata', json);
  }

  getImageUrl(): string {
    return this.getProperty('imageUrl') as string;
  }

  getMindmap(): Mindmap {
    return this._mindmap;
  }

  /**
   * lets the mindmap handle the disconnect node operation
   * @see mindplot.model.IMindmap.disconnect
   */
  disconnect(): void {
    const mindmap = this.getMindmap();
    mindmap.disconnect(this);
  }

  getShapeType(): TopicShapeType | undefined {
    const result = this.getProperty('shapeType') as TopicShapeType | undefined;
    return result;
  }

  setShapeType(type: TopicShapeType | undefined) {
    this.putProperty('shapeType', type);
  }

  /**
   * Set the order of this node among its siblings.
   * Pass a number for nodes with siblings, or undefined for nodes without siblings (central/isolated).
   * @param value - The order value (finite number or undefined)
   */
  setOrder(value: number | undefined): void {
    $assert(
      value === undefined || (typeof value === 'number' && Number.isFinite(value)),
      `Order must be a finite number or undefined. Received: ${value} (${typeof value})`,
    );
    this.putProperty('order', value);
  }

  /**
   * Get the order of this node among its siblings.
   * Returns undefined for nodes without siblings (central node, isolated nodes).
   * @returns The order value, or undefined if node has no siblings
   */
  getOrder(): number | undefined {
    return this.getProperty('order') as number | undefined;
  }

  setFontFamily(fontFamily: string | undefined): void {
    this.putProperty('fontFamily', fontFamily);
  }

  getFontFamily(): string | undefined {
    return this.getProperty('fontFamily') as string;
  }

  setFontStyle(fontStyle: FontStyleType | undefined) {
    this.putProperty('fontStyle', fontStyle);
  }

  getFontStyle(): FontStyleType | undefined {
    return this.getProperty('fontStyle') as FontStyleType;
  }

  setFontWeight(weight: FontWeightType): void {
    this.putProperty('fontWeight', weight);
  }

  getFontWeight(): FontWeightType | undefined {
    return this.getProperty('fontWeight') as FontWeightType;
  }

  setFontColor(color: string | undefined): void {
    this.putProperty('fontColor', color);
  }

  getFontColor(): string | undefined {
    return this.getProperty('fontColor') as string;
  }

  setFontSize(size: number | undefined): void {
    this.putProperty('fontSize', size);
  }

  getFontSize(): number | undefined {
    return this.getProperty('fontSize') as number;
  }

  getBorderColor(): string | undefined {
    return this.getProperty('borderColor') as string;
  }

  setBorderColor(color: string | undefined): void {
    this.putProperty('borderColor', color);
  }

  getBorderStyle(): string | undefined {
    return this.getProperty('borderStyle') as string;
  }

  setBorderStyle(style: string | undefined): void {
    this.putProperty('borderStyle', style);
  }

  getBackgroundColor(): string | undefined {
    return this.getProperty('backgroundColor') as string;
  }

  setBackgroundColor(color: string | undefined): void {
    this.putProperty('backgroundColor', color);
  }

  areChildrenShrunken(): boolean {
    const result = this.getProperty('shrunken') as boolean;
    return $defined(result) ? result : false;
  }

  /**
   * @return {Boolean} true if the children nodes are hidden by the shrink option
   */
  setChildrenShrunken(value: boolean): void {
    this.putProperty('shrunken', value);
  }

  setConnectionStyle(type: LineType | undefined): void {
    this.putProperty('connectionStyle', type);
  }

  getConnectionStyle(): LineType | undefined {
    return this.getProperty('connectionStyle') as LineType | undefined;
  }

  setConnectionColor(value: string | undefined): void {
    this.putProperty('connectionColor', value);
  }

  getConnectionColor(): string | undefined {
    return this.getProperty('connectionColor') as string;
  }

  setImageEmojiChar(imageEmojiChar: string | undefined) {
    this.putProperty('imageEmojiChar', imageEmojiChar);
  }

  getImageEmojiChar(): string | undefined {
    return this.getProperty('imageEmojiChar') as string | undefined;
  }

  setImageGalleryIconName(imageGalleryIconName: string | undefined) {
    this.putProperty('imageGalleryIconName', imageGalleryIconName);
  }

  getImageGalleryIconName(): string | undefined {
    return this.getProperty('imageGalleryIconName') as string | undefined;
  }

  isNodeModel(): boolean {
    return true;
  }

  /**
   * @return {Boolean} true if the node model has a parent assigned to it
   */
  isConnected(): boolean {
    return this.getParent() != null;
  }

  abstract append(node: INodeModel): void;

  /**
   * lets the mindmap handle the connect node operation
   * @throws will throw an error if parent is null or undefined
   * @see mindplot.model.IMindmap.connect
   */
  connectTo(parent: INodeModel) {
    $assert(parent, 'parent can not be null');
    const mindmap = this.getMindmap();
    mindmap.connect(parent, this);
  }

  /**
   * @param target
   * @return target
   */
  copyTo(target: INodeModel): INodeModel {
    const source = this;
    // Copy properties ...
    const keys = source.getPropertiesKeys();
    keys.forEach((key) => {
      const value = source.getProperty(key);
      target.putProperty(key, value);
    });

    // Copy children ...
    const children = this.getChildren();
    const tmindmap = target.getMindmap();

    children.forEach((snode) => {
      const tnode: INodeModel = tmindmap.createNode(snode.getType(), snode.getId());
      snode.copyTo(tnode);
      target.append(tnode);
    });

    return target;
  }

  /**
   * lets parent handle the delete node operation, or, if none defined, calls the mindmap to
   * remove the respective branch
   */
  deleteNode(): void {
    const mindmap = this.getMindmap();

    const parent = this.getParent();
    if (parent) {
      parent.removeChild(this);
    } else {
      // If it has not parent, it must be an isolate topic ...
      mindmap.removeBranch(this);
    }
  }

  abstract getPropertiesKeys(): string[];

  abstract getProperty(key: string): number | string | boolean | undefined;

  abstract putProperty(key: string, value: number | string | boolean | undefined): void;

  abstract setParent(parent: INodeModel): void;

  abstract getChildren(): INodeModel[];

  abstract getParent(): INodeModel | null;

  abstract clone(): INodeModel;

  isChildNode(node: INodeModel): boolean {
    let result = false;
    if (node === this) {
      result = true;
    } else {
      const children = this.getChildren();
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        result = child.isChildNode(node);
        if (result) {
          break;
        }
      }
    }
    return result;
  }

  findNodeById(id: number): INodeModel | undefined {
    let result: INodeModel | undefined;
    if (this.getId() === id) {
      result = this;
    } else {
      const children = this.getChildren();
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        result = child.findNodeById(id);
        if (result) {
          break;
        }
      }
    }
    return result;
  }

  inspect() {
    let result = `{ type: ${this.getType()} , id: ${this.getId()} , text: ${this.getText()}`;

    const children = this.getChildren();
    if (children.length > 0) {
      result = `${result}, children: {(size:${children.length}`;
      children.forEach((node) => {
        result = `${result}=> (`;
        const keys = node.getPropertiesKeys();
        keys.forEach((key) => {
          const value = node.getProperty(key);
          result = `${result + key}:${value},`;
        });
        result = `${result}}`;
      });
    }

    result = `${result} }`;
    return result;
  }

  abstract removeChild(child: INodeModel): void;

  static _nextUUID(): number {
    INodeModel._nextUuid += 1;
    return INodeModel._nextUuid;
  }
}
export default INodeModel;
