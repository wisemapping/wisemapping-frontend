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
import { $assert } from '../util/assert';
import { LineType } from '../ConnectionLine';
import PositionType from '../PositionType';
import { FontWeightType } from '../FontWeightType';
import { FontStyleType } from '../FontStyleType';
import FeatureModel from './FeatureModel';
import Mindmap from './Mindmap';
import SizeType from '../SizeType';
import ContentType from '../ContentType';

export type NodeModelType = 'CentralTopic' | 'MainTopic';

export const TOPIC_SHAPE_TYPES = [
  'rectangle',
  'rounded rectangle',
  'elipse',
  'line',
  'none',
  'image',
] as const;

export type TopicShapeType = (typeof TOPIC_SHAPE_TYPES)[number];

/** The properties a node model stores, with the type of each one. */
export interface NodeProps {
  id: number;
  type: NodeModelType;
  text?: string;
  contentType?: ContentType;
  position?: PositionType;
  imageSize?: SizeType;
  imageUrl?: string;
  imageEmojiChar?: string;
  imageGalleryIconName?: string;
  metadata?: string;
  shapeType?: TopicShapeType;
  order?: number;
  shrunken?: boolean;
  fontFamily?: string;
  fontSize?: number;
  fontColor?: string;
  fontWeight?: FontWeightType;
  fontStyle?: FontStyleType;
  borderColor?: string;
  borderStyle?: string;
  backgroundColor?: string;
  connectionStyle?: LineType;
  connectionColor?: string;
}

export type NodePropKey = keyof NodeProps;

const copyProperty = <K extends NodePropKey>(source: INodeModel, target: INodeModel, key: K) => {
  target.putProperty(key, source.getProperty(key));
};

abstract class INodeModel {
  static MAIN_TOPIC_TO_MAIN_TOPIC_DISTANCE = 220;

  private static _nextUuid = 0;

  private static _treeVersion = 0;

  /**
   * Notes that a node's id or the shape of a tree changed (a child appended or removed, a branch
   * added or removed). Mindmap.findNodeById rebuilds its id index when this has moved on.
   */
  static treeChanged(): void {
    INodeModel._treeVersion += 1;
  }

  static getTreeVersion(): number {
    return INodeModel._treeVersion;
  }

  protected _mindmap: Mindmap;

  constructor(mindmap: Mindmap) {
    $assert(mindmap && mindmap.getBranches, 'mindmap can not be null');
    this._mindmap = mindmap;
  }

  getId(): number {
    return this.getProperty('id');
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
    return this.getProperty('type');
  }

  setType(type: NodeModelType): void {
    this.putProperty('type', type);
  }

  setText(text: string | undefined): void {
    this.putProperty('text', text);
  }

  getText(): string | undefined {
    return this.getProperty('text');
  }

  setContentType(contentType: ContentType | undefined): void {
    this.putProperty('contentType', contentType);
  }

  getContentType(): ContentType {
    return this.getProperty('contentType') || ContentType.PLAIN;
  }

  getPlainText(): string {
    const text = this.getText();
    if (!text) return '';

    if (this.getContentType() === ContentType.HTML) {
      // Parse in an inert document so embedded markup (e.g. <img onerror>) never runs
      const parsed = new DOMParser().parseFromString(text, 'text/html');
      return parsed.body.textContent || '';
    }

    return text;
  }

  setPosition(x: number, y: number): void {
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      console.warn(`Ignoring invalid position (${x},${y}) for topic ${this.getId()}`);
      return;
    }
    this.putProperty('position', { x, y });
  }

  /**
   * Returns undefined when the topic has no position, or a corrupted one. Prefer hasPosition and
   * getPositionOrThrow, which make that explicit.
   */
  getPosition(): PositionType | undefined {
    // setPosition only stores finite values: the check guards a value put directly. A copy is
    // returned, so callers can not change the model, or the copies sharing it (deepCopy).
    const value = this.getProperty('position');
    return value && Number.isFinite(value.x) && Number.isFinite(value.y)
      ? { x: value.x, y: value.y }
      : undefined;
  }

  /** @return true if the topic has a valid position */
  hasPosition(): boolean {
    return this.getPosition() !== undefined;
  }

  /**
   * @return the position of the topic
   * @throws will throw an error if the topic has no position, or a corrupted one
   */
  getPositionOrThrow(): PositionType {
    const result = this.getPosition();
    if (result === undefined) {
      throw new Error(`Topic ${this.getId()} has no position`);
    }
    return result;
  }

  setImageSize(width: number, height: number): void {
    if (!Number.isFinite(width) || !Number.isFinite(height)) {
      console.warn(`Ignoring invalid image size (${width},${height}) for topic ${this.getId()}`);
      return;
    }
    this.putProperty('imageSize', { width, height });
  }

  getImageSize(): SizeType | undefined {
    const value = this.getProperty('imageSize');
    return value && Number.isFinite(value.width) && Number.isFinite(value.height)
      ? { width: value.width, height: value.height }
      : undefined;
  }

  setImageUrl(url: string) {
    this.putProperty('imageUrl', url);
  }

  getMetadata(): string | undefined {
    return this.getProperty('metadata');
  }

  setMetadata(json: string): void {
    this.putProperty('metadata', json);
  }

  getImageUrl(): string | undefined {
    return this.getProperty('imageUrl');
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
    const result = this.getProperty('shapeType');
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
    return this.getProperty('order');
  }

  setFontFamily(fontFamily: string | undefined): void {
    this.putProperty('fontFamily', fontFamily);
  }

  getFontFamily(): string | undefined {
    return this.getProperty('fontFamily');
  }

  setFontStyle(fontStyle: FontStyleType | undefined) {
    this.putProperty('fontStyle', fontStyle);
  }

  getFontStyle(): FontStyleType | undefined {
    return this.getProperty('fontStyle');
  }

  setFontWeight(weight: FontWeightType | undefined): void {
    this.putProperty('fontWeight', weight);
  }

  getFontWeight(): FontWeightType | undefined {
    return this.getProperty('fontWeight');
  }

  setFontColor(color: string | undefined): void {
    this.putProperty('fontColor', color);
  }

  getFontColor(): string | undefined {
    return this.getProperty('fontColor');
  }

  setFontSize(size: number | undefined): void {
    this.putProperty('fontSize', size);
  }

  getFontSize(): number | undefined {
    return this.getProperty('fontSize');
  }

  getBorderColor(): string | undefined {
    return this.getProperty('borderColor');
  }

  setBorderColor(color: string | undefined): void {
    this.putProperty('borderColor', color);
  }

  getBorderStyle(): string | undefined {
    return this.getProperty('borderStyle');
  }

  setBorderStyle(style: string | undefined): void {
    this.putProperty('borderStyle', style);
  }

  getBackgroundColor(): string | undefined {
    return this.getProperty('backgroundColor');
  }

  setBackgroundColor(color: string | undefined): void {
    this.putProperty('backgroundColor', color);
  }

  areChildrenShrunken(): boolean {
    const result = this.getProperty('shrunken');
    return result ?? false;
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
    return this.getProperty('connectionStyle');
  }

  setConnectionColor(value: string | undefined): void {
    this.putProperty('connectionColor', value);
  }

  getConnectionColor(): string | undefined {
    return this.getProperty('connectionColor');
  }

  setImageEmojiChar(imageEmojiChar: string | undefined) {
    this.putProperty('imageEmojiChar', imageEmojiChar);
  }

  getImageEmojiChar(): string | undefined {
    return this.getProperty('imageEmojiChar');
  }

  setImageGalleryIconName(imageGalleryIconName: string | undefined) {
    this.putProperty('imageGalleryIconName', imageGalleryIconName);
  }

  getImageGalleryIconName(): string | undefined {
    return this.getProperty('imageGalleryIconName');
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
    source.getPropertiesKeys().forEach((key) => copyProperty(source, target, key));

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

  abstract getPropertiesKeys(): NodePropKey[];

  abstract getProperty<K extends NodePropKey>(key: K): NodeProps[K];

  abstract putProperty<K extends NodePropKey>(key: K, value: NodeProps[K]): void;

  abstract setParent(parent: INodeModel): void;

  abstract getChildren(): INodeModel[];

  abstract getParent(): INodeModel | null;

  abstract clone(): INodeModel;

  isChildNode(node: INodeModel): boolean {
    let result = false;
    if (node === this) {
      result = true;
    } else {
      result = this.getChildren().some((child) => child.isChildNode(node));
    }
    return result;
  }

  /** The node with the given id in this subtree (this node included), undefined if none. */
  abstract findNodeById(id: number): INodeModel | undefined;

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
          const text = typeof value === 'object' ? JSON.stringify(value) : value;
          result = `${result + key}:${text},`;
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
