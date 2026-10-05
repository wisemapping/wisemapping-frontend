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
import { Group, Rect } from '@wisemapping/web2d';
import type { ElementEventListener } from '@wisemapping/web2d';
import { $assert } from './util/assert';
import NodeModel from './model/NodeModel';
import Canvas from './Canvas';
import DragTopic from './DragTopic';
import LayoutManager from './layout/LayoutManager';
import SizeType from './SizeType';
import PositionType from './PositionType';
import CanvasElement from './CanvasElement';
import type TopicEventDispatcher from './TopicEventDispatcher';
import type Designer from './Designer';
import type Topic from './Topic';

/**
 * The custom events of a topic's group: a topic fires them, with itself as the detail, when it
 * gains or loses the focus.
 */
export type TopicEventMap = { ontfocus: Topic; ontblur: Topic };

export type NodeOption = {
  readOnly: boolean;
  topicEventDispatcher?: TopicEventDispatcher;
  // The designer the node belongs to. Undefined for nodes built without one (e.g. in tests).
  designer?: Designer;
};

abstract class NodeGraph implements CanvasElement {
  private _mouseEvents: boolean;

  private _options: NodeOption;

  protected _onFocus: boolean;

  private _size: SizeType;

  private _model: NodeModel;

  private _elem2d: Group | undefined;

  constructor(nodeModel: NodeModel, options: NodeOption) {
    $assert(nodeModel, 'model can not be null');

    this._options = options;
    this._mouseEvents = true;
    this._model = nodeModel;
    this._onFocus = false;
    this._size = { width: 50, height: 20 };
  }

  abstract addToWorkspace(workspace: Canvas): void;

  abstract removeFromWorkspace(workspace: Canvas): void;

  isReadOnly(): boolean {
    return this._options.readOnly;
  }

  getDesigner(): Designer | undefined {
    return this._options.designer;
  }

  getType(): string {
    const model = this.getModel();
    return model.getType();
  }

  setId(id: number) {
    $assert(typeof id === 'number', `id is not a number:${id}`);
    const previousId = this.getId();
    this.getModel().setId(id);
    // The designer finds topics by id ...
    this.getDesigner()
      ?.getModel()
      .reindexTopic(this as unknown as Topic, previousId);
  }

  protected _set2DElement(elem2d: Group) {
    this._elem2d = elem2d;
  }

  get2DElement(): Group {
    if (!this._elem2d) {
      throw new Error('Eleemnt has not been initialized.');
    }
    return this._elem2d;
  }

  abstract setPosition(point: PositionType, fireEvent?: boolean): void;

  /**
   * Listeners receive the DOM event (a MouseEvent for 'click') or, for the events of
   * TopicEventMap, a CustomEvent whose detail is the topic.
   */
  addEvent<K extends string>(type: K, listener: ElementEventListener<TopicEventMap, K>) {
    this._eventTarget().addEvent(type, listener);
  }

  /** */
  removeEvent<K extends string>(type: K, listener: ElementEventListener<TopicEventMap, K>) {
    this._eventTarget().removeEvent(type, listener);
  }

  /** Fires one of the topic's own events, with the topic as detail. */
  fireEvent<K extends keyof TopicEventMap>(type: K, detail: TopicEventMap[K]) {
    this._eventTarget().trigger(type, detail);
  }

  /**
   * The group, seen with the topic's event map. web2d's Group is invariant in its map, so a
   * Group<TopicEventMap> could not be handed on as the plain container the features and shapes
   * add themselves to: the group stays a Group, and only its events are typed.
   */
  private _eventTarget(): Group<TopicEventMap> {
    return this.get2DElement() as unknown as Group<TopicEventMap>;
  }

  /** */
  setMouseEventsEnabled(isEnabled: boolean) {
    this._mouseEvents = isEnabled;
  }

  /** */
  isMouseEventsEnabled() {
    return this._mouseEvents;
  }

  getSize(): SizeType {
    return this._size;
  }

  setSize(size: SizeType) {
    this._size.width = size.width;
    this._size.height = size.height;
  }

  getModel(): NodeModel {
    $assert(this._model, 'Model has not been initialized yet');
    return this._model;
  }

  setModel(model: NodeModel): void {
    $assert(model, 'Model can not be null');
    this._model = model;
  }

  getId(): number {
    return this._model.getId();
  }

  abstract setOnFocus(focus: boolean): void;

  abstract closeEditors(): void;

  abstract setCursor(type: string): void;

  abstract getOuterShape(): Rect;

  isOnFocus(): boolean {
    return this._onFocus;
  }

  dispose(workspace: Canvas) {
    this.setOnFocus(false);
    workspace.removeChild(this);
  }

  createDragNode(layoutManager: LayoutManager): DragTopic {
    // CentralTopic has no drag shape: the Designer never registers it for dragging.
    const dragShape = this.buildDragShape();
    if (!dragShape) {
      throw new Error(`${this.getType()} has no drag shape: it can not be dragged`);
    }

    return new DragTopic(dragShape, this, layoutManager);
  }

  abstract buildDragShape(): Group | undefined;

  /**
   * A model may have no position yet: a topic gets its own on the first layout. Until then, fall
   * back as the layout does (EventBusDispatcher._initialPosition): the closest ancestor position,
   * or the origin.
   */
  getPosition(): PositionType {
    let model: NodeModel | null = this.getModel();
    while (model) {
      const position = model.getPosition();
      if (position) {
        return position;
      }
      model = model.getParent();
    }
    return { x: 0, y: 0 };
  }

  isCentralTopic(): boolean {
    return this.getModel().getType() === 'CentralTopic';
  }
}

export default NodeGraph;
