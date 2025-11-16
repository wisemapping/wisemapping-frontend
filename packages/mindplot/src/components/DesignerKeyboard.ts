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
import { $assert } from './util/assert';
import EventManager from './util/EventManager';
import Keyboard from './Keyboard';
import { Designer } from '..';
import Topic from './Topic';

export type EventCallback = (event?: Event) => void;
class DesignerKeyboard extends Keyboard {
  private static _instance: DesignerKeyboard;

  private static _disabled: boolean;

  private static ALIGNMENT_TOLERANCE = 30;

  private static excludeFromEditor = [
    'Enter',
    'CapsLock',
    'Escape',
    'F1',
    'F3',
    'F4',
    'F5',
    'F6',
    'F7',
    'F8',
    'F9',
    'F10',
    'F11',
    'F12',
  ];

  constructor(designer: Designer) {
    super();
    $assert(designer, 'designer can not be null');
    this._registerEvents(designer);
  }

  addShortcut(shortcuts: string[] | string, callback: EventCallback): void {
    super.addShortcut(shortcuts, () => {
      if (DesignerKeyboard.isDisabled()) {
        return;
      }
      callback();
    });
  }

  private _registerEvents(designer: Designer) {
    // Try with the keyboard ..
    const model = designer.getModel();
    this.addShortcut(['backspace', 'del'], () => {
      designer.deleteSelectedEntities();
    });

    this.addShortcut('space', () => {
      designer.shrinkSelectedBranch();
    });

    this.addShortcut('f2', () => {
      const node = model.selectedTopic();
      if (node) {
        node.showTextEditor(node.getText());
      }
    });

    this.addShortcut(['insert', 'tab', 'meta+enter'], () => {
      designer.createChildForSelectedNode();
    });

    this.addShortcut('enter', () => {
      designer.createSiblingForSelectedNode();
    });

    this.addShortcut(['ctrl+z', 'meta+z'], () => {
      designer.undo();
    });

    this.addShortcut(['ctrl+shift+z', 'meta+shift+z'], () => {
      designer.redo();
    });

    this.addShortcut(['ctrl+c', 'meta+c'], () => {
      designer.copyToClipboard();
    });

    this.addShortcut(['ctrl+l', 'meta+l'], () => {
      designer.addLink();
    });

    this.addShortcut(['ctrl+k', 'meta+k'], () => {
      designer.addNote();
    });

    this.addShortcut(['ctrl+v', 'meta+v'], () => {
      designer.pasteClipboard();
    });

    this.addShortcut(['ctrl+a', 'meta+a'], () => {
      designer.selectAll();
    });

    this.addShortcut(['ctrl+b', 'meta+b'], () => {
      designer.changeFontWeight();
    });

    this.addShortcut(['ctrl+i', 'meta+i'], () => {
      designer.changeFontStyle();
    });

    this.addShortcut(['ctrl+shift+a', 'meta+shift+a'], () => {
      designer.deselectAll();
    });

    this.addShortcut(['meta+=', 'ctrl+='], () => {
      designer.zoomIn();
    });

    this.addShortcut(['meta+-', 'ctrl+-'], () => {
      designer.zoomOut();
    });

    const me = this;
    this.addShortcut('right', () => {
      me._moveSelection(designer, 'RIGHT');
    });

    this.addShortcut('left', () => {
      me._moveSelection(designer, 'LEFT');
    });

    this.addShortcut('up', () => {
      me._moveSelection(designer, 'UP');
    });
    this.addShortcut('down', () => {
      me._moveSelection(designer, 'DOWN');
    });

    designer.getContainer().addEventListener('mouseenter', () => {
      super.resume();
      DesignerKeyboard.resume();
    });

    designer.getContainer().addEventListener('mouseleave', () => {
      super.pause();
      DesignerKeyboard.pause();
    });

    EventManager.bind(document, 'keypress', (event: Event) => {
      // Needs to be ignored ?
      if (
        DesignerKeyboard.isDisabled() ||
        DesignerKeyboard.excludeFromEditor.includes((event as KeyboardEvent).code)
      ) {
        return;
      }

      // Is a modifier ?
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.ctrlKey || keyboardEvent.altKey || keyboardEvent.metaKey) {
        return;
      }

      // If a node is selected, open the editor ...
      const topic = designer.getModel().selectedTopic();
      if (topic) {
        event.stopPropagation();
        event.preventDefault();
        topic.showTextEditor(keyboardEvent.key);
      }
    });
  }

  private _moveSelection(designer: Designer, direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN'): void {
    const model = designer.getModel();
    const node = model.selectedTopic();
    if (!node) {
      const centralTopic = model.getCentralTopic();
      this._goToNode(designer, centralTopic);
      return;
    }

    const isVerticalLayout = node.getOrientation() === 'vertical';
    const handled = isVerticalLayout
      ? this._handleVerticalLayoutMove(designer, node, direction)
      : this._handleHorizontalLayoutMove(designer, node, direction);

    if (handled) {
      return;
    }

    const alignmentAxis = direction === 'LEFT' || direction === 'RIGHT' ? 'y' : 'x';
    const fallback = this._findClosestTopicByDirection(
      designer,
      node,
      direction,
      alignmentAxis,
      DesignerKeyboard.ALIGNMENT_TOLERANCE,
    );
    if (fallback) {
      this._ensureTopicVisible(designer, fallback);
      this._goToNode(designer, fallback);
    }
  }

  private _handleHorizontalLayoutMove(
    designer: Designer,
    node: Topic,
    direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN',
  ): boolean {
    switch (direction) {
      case 'LEFT':
        return this._handleHorizontalBranchMove(designer, node, 'LEFT');
      case 'RIGHT':
        return this._handleHorizontalBranchMove(designer, node, 'RIGHT');
      case 'UP':
        return (
          this._goToSibling(designer, node, 'y', 'UP', true) ||
          this._goToAlignedTopic(designer, node, 'y', 'UP', 'x')
        );
      case 'DOWN':
        return (
          this._goToSibling(designer, node, 'y', 'DOWN', true) ||
          this._goToAlignedTopic(designer, node, 'y', 'DOWN', 'x')
        );
      default:
        return false;
    }
  }

  private _handleVerticalLayoutMove(
    designer: Designer,
    node: Topic,
    direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN',
  ): boolean {
    switch (direction) {
      case 'UP':
        return (
          this._goToParent(designer, node) || this._goToAlignedTopic(designer, node, 'y', 'UP', 'x')
        );
      case 'DOWN':
        if (node.getChildren().length > 0) {
          if (!this._ensureChildrenExpanded(designer, node)) {
            return false;
          }
          return this._goToChild(designer, node);
        }
        return this._goToAlignedTopic(designer, node, 'y', 'DOWN', 'x');
      case 'LEFT':
        return (
          this._goToSibling(designer, node, 'x', 'LEFT', false) ||
          this._goToAlignedTopic(designer, node, 'x', 'LEFT', 'y')
        );
      case 'RIGHT':
        return (
          this._goToSibling(designer, node, 'x', 'RIGHT', false) ||
          this._goToAlignedTopic(designer, node, 'x', 'RIGHT', 'y')
        );
      default:
        return false;
    }
  }

  private _handleHorizontalBranchMove(
    designer: Designer,
    node: Topic,
    side: 'LEFT' | 'RIGHT',
  ): boolean {
    if (node.isCentralTopic()) {
      return this._goToSideChild(designer, node, side);
    }

    if (
      (side === 'LEFT' && node.getPosition().x > 0) ||
      (side === 'RIGHT' && node.getPosition().x < 0)
    ) {
      return this._goToParent(designer, node);
    }

    if (node.getChildren().length > 0) {
      if (!this._ensureChildrenExpanded(designer, node)) {
        return false;
      }
      return this._goToChild(designer, node, side);
    }

    return false;
  }

  private _goToSibling(
    designer: Designer,
    node: Topic,
    axis: 'x' | 'y',
    direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN',
    enforceSameSide: boolean,
  ): boolean {
    const parent = node.getParent();
    if (!parent) {
      return false;
    }
    const siblings = parent.getChildren();
    let target = node;
    let dist: number | null = null;
    const nodeValue = axis === 'x' ? node.getPosition().x : node.getPosition().y;

    siblings.forEach((brother) => {
      if (brother === node) {
        return;
      }
      if (enforceSameSide) {
        const sameSide = node.getPosition().x * brother.getPosition().x >= 0;
        if (!sameSide) {
          return;
        }
      }

      const value = axis === 'x' ? brother.getPosition().x : brother.getPosition().y;
      const delta = value - nodeValue;
      if ((direction === 'UP' || direction === 'LEFT') && delta >= 0) {
        return;
      }
      if ((direction === 'DOWN' || direction === 'RIGHT') && delta <= 0) {
        return;
      }

      const distance = Math.abs(delta);
      if (dist == null || distance < dist) {
        dist = distance;
        target = brother;
      }
    });

    if (target !== node) {
      this._ensureTopicVisible(designer, target);
      this._goToNode(designer, target);
      return true;
    }
    return false;
  }

  private _goToAlignedTopic(
    designer: Designer,
    node: Topic,
    directionAxis: 'x' | 'y',
    direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN',
    alignmentAxis: 'x' | 'y',
  ): boolean {
    const target = this._findClosestAlignedTopic(
      designer,
      node,
      directionAxis,
      direction,
      alignmentAxis,
    );
    if (target) {
      this._ensureTopicVisible(designer, target);
      this._goToNode(designer, target);
      return true;
    }
    return false;
  }

  private _goToSideChild(designer: Designer, node: Topic, side: 'LEFT' | 'RIGHT'): boolean {
    const children = node.getChildren();
    if (children.length === 0) {
      return false;
    }

    let target: Topic | null = null;
    const parentY = node.getPosition().y;
    let minDistance: number | null = null;
    children.forEach((child) => {
      if (
        (side === 'LEFT' && child.getPosition().x >= 0) ||
        (side === 'RIGHT' && child.getPosition().x <= 0)
      ) {
        return;
      }
      const distance = Math.abs(child.getPosition().y - parentY);
      if (minDistance == null || distance < minDistance) {
        minDistance = distance;
        target = child;
      }
    });

    if (!target) {
      [target] = children;
    }

    this._goToNode(designer, target);
    return true;
  }

  private _goToParent(designer: Designer, node: Topic): boolean {
    const parent = node.getParent();
    if (parent) {
      this._ensureTopicVisible(designer, parent);
      this._goToNode(designer, parent);
      return true;
    }
    return false;
  }

  private _goToChild(designer: Designer, node: Topic, preferredSide?: 'LEFT' | 'RIGHT'): boolean {
    const children = node.getChildren();
    if (children.length === 0) {
      return false;
    }

    let candidates = children;
    if (preferredSide) {
      candidates = children.filter((child) =>
        preferredSide === 'RIGHT' ? child.getPosition().x >= 0 : child.getPosition().x <= 0,
      );
      if (candidates.length === 0) {
        candidates = children;
      }
    }

    const orientation = node.getOrientation();
    const useHorizontalDistance = orientation === 'vertical';
    let target = candidates[0];
    let minDistance = Math.abs(
      (useHorizontalDistance ? target.getPosition().x : target.getPosition().y) -
        (useHorizontalDistance ? node.getPosition().x : node.getPosition().y),
    );

    candidates.forEach((child) => {
      const childCoord = useHorizontalDistance ? child.getPosition().x : child.getPosition().y;
      const nodeCoord = useHorizontalDistance ? node.getPosition().x : node.getPosition().y;
      const distance = Math.abs(childCoord - nodeCoord);
      if (distance < minDistance) {
        minDistance = distance;
        target = child;
      }
    });

    this._ensureTopicVisible(designer, target);
    this._goToNode(designer, target);
    return true;
  }

  private _ensureChildrenExpanded(designer: Designer, node: Topic): boolean {
    if (!node.areChildrenShrunken()) {
      return true;
    }
    if (node.getChildren().length === 0) {
      return false;
    }
    designer.getActionDispatcher().shrinkBranch([node.getId()], false);
    return true;
  }

  private _findClosestAlignedTopic(
    designer: Designer,
    node: Topic,
    directionAxis: 'x' | 'y',
    direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN',
    alignmentAxis: 'x' | 'y',
  ): Topic | null {
    const topics = designer.getModel().getTopics();
    const origin = node.getPosition();
    let closest: Topic | null = null;
    let minDirectionDistance: number | null = null;
    let minAlignmentDistance: number | null = null;

    topics.forEach((candidate) => {
      if (candidate === node) {
        return;
      }
      const targetPos = candidate.getPosition();
      const directionDelta =
        directionAxis === 'x' ? targetPos.x - origin.x : targetPos.y - origin.y;
      if ((direction === 'UP' || direction === 'LEFT') && directionDelta >= 0) {
        return;
      }
      if ((direction === 'DOWN' || direction === 'RIGHT') && directionDelta <= 0) {
        return;
      }

      const alignmentDelta =
        alignmentAxis === 'x' ? targetPos.x - origin.x : targetPos.y - origin.y;
      const alignmentDistance = Math.abs(alignmentDelta);
      if (alignmentDistance > DesignerKeyboard.ALIGNMENT_TOLERANCE) {
        return;
      }

      const directionDistance = Math.abs(directionDelta);
      if (
        minDirectionDistance == null ||
        directionDistance < minDirectionDistance ||
        (directionDistance === minDirectionDistance &&
          (minAlignmentDistance == null || alignmentDistance < minAlignmentDistance))
      ) {
        minDirectionDistance = directionDistance;
        minAlignmentDistance = alignmentDistance;
        closest = candidate;
      }
    });

    return closest;
  }

  private _findClosestTopicByDirection(
    designer: Designer,
    node: Topic,
    direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN',
    alignmentAxis?: 'x' | 'y',
    alignmentTolerance: number = Number.POSITIVE_INFINITY,
  ): Topic | null {
    const topics = designer.getModel().getTopics();
    const origin = node.getPosition();
    let closest: Topic | null = null;
    let minPrimary = Number.POSITIVE_INFINITY;
    let minSecondary = Number.POSITIVE_INFINITY;
    let minDistance = Number.POSITIVE_INFINITY;

    topics.forEach((candidate) => {
      if (candidate === node) {
        return;
      }

      const targetPos = candidate.getPosition();
      const deltaX = targetPos.x - origin.x;
      const deltaY = targetPos.y - origin.y;

      let primary = 0;
      let secondary = 0;
      let isValid = false;

      switch (direction) {
        case 'LEFT':
          if (deltaX < 0) {
            primary = Math.abs(deltaX);
            secondary = Math.abs(deltaY);
            isValid = true;
          }
          break;
        case 'RIGHT':
          if (deltaX > 0) {
            primary = Math.abs(deltaX);
            secondary = Math.abs(deltaY);
            isValid = true;
          }
          break;
        case 'UP':
          if (deltaY < 0) {
            primary = Math.abs(deltaY);
            secondary = Math.abs(deltaX);
            isValid = true;
          }
          break;
        case 'DOWN':
          if (deltaY > 0) {
            primary = Math.abs(deltaY);
            secondary = Math.abs(deltaX);
            isValid = true;
          }
          break;
        default:
          break;
      }

      if (!isValid) {
        return;
      }

      if (alignmentAxis) {
        const alignmentDelta = alignmentAxis === 'x' ? Math.abs(deltaX) : Math.abs(deltaY);
        if (alignmentDelta > alignmentTolerance) {
          return;
        }
      }

      const distance = Math.hypot(deltaX, deltaY);
      const isCloser =
        primary < minPrimary ||
        (primary === minPrimary && secondary < minSecondary) ||
        (primary === minPrimary && secondary === minSecondary && distance < minDistance);

      if (isCloser) {
        closest = candidate;
        minPrimary = primary;
        minSecondary = secondary;
        minDistance = distance;
      }
    });

    return closest;
  }

  private _ensureTopicVisible(designer: Designer, topic: Topic): void {
    const toExpand = new Set<number>();
    let current: Topic | null = topic.getParent();
    while (current) {
      if (current.areChildrenShrunken()) {
        toExpand.add(current.getId());
      }
      current = current.getParent();
    }

    if (toExpand.size > 0) {
      designer.getActionDispatcher().shrinkBranch(Array.from(toExpand), false);
    }
  }

  private _goToNode(designer: Designer, node: Topic): void {
    // First deselect all the nodes ...
    designer.deselectAll();

    // Give focus to the selected node....
    designer.goToNode(node);
  }

  static register(designer: Designer) {
    this._instance = new DesignerKeyboard(designer);
    this._disabled = false;
  }

  static pause() {
    this._disabled = true;
  }

  static resume() {
    this._disabled = false;
  }

  static isDisabled() {
    return this._disabled;
  }

  static getInstance() {
    return this._instance;
  }
}

export default DesignerKeyboard;
