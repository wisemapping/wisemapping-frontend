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
import KeyboardManager from './util/KeyboardManager';
import { sideOf } from './util/side';
import getCollapsedAncestorIds from './util/topicVisibility';
import Keyboard from './Keyboard';
import { Designer } from '..';
import Topic from './Topic';
import { TopicMove } from './util/topicReorder';
import { $msg } from './Messages';
import { $notify } from './model/ToolbarNotifier';

export type EventCallback = (event?: Event) => void;
class DesignerKeyboard extends Keyboard {
  // The keyboards of the live designers: one per designer, several maps can share a page ...
  private static _live: Set<DesignerKeyboard> = new Set();

  // Pauses held by the editor (pause()/resume()), e.g. while a dialog is open. A count,
  // not a flag: pauses nest (a text field inside a pane), and the inner resume must not
  // bring the shortcuts back while the outer pause is still held ...
  private static _pauseCount = 0;

  // Pauses still held when the last live keyboard was disposed. They belong to the UI of
  // the disposed designer: the resumes that come after the dispose lift them first, and the
  // next register() drops the rest, which were never going to be resumed ...
  private static _stalePauseCount = 0;

  // Paused because the pointer left the canvas. Kept apart from _pauseCount, so
  // hovering the canvas does not bring the shortcuts back behind a dialog ...
  private static _outsideCanvas = false;

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

  // Listeners bound to the document and the canvas container, removed by dispose() ...
  private _container: HTMLElement | null = null;

  private _keypressListener: EventListener | null = null;

  private _mouseEnterListener: EventListener | null = null;

  private _mouseLeaveListener: EventListener | null = null;

  private _pointerDownListener: EventListener | null = null;

  private _disposed = false;

  constructor(designer: Designer) {
    super();
    $assert(designer, 'designer can not be null');
    this._registerEvents(designer);
  }

  addShortcut(shortcuts: string[] | string, callback: EventCallback): void {
    super.addShortcut(shortcuts, () => {
      // The shortcuts live in a page-wide registry: a disposed keyboard must not drive its designer.
      if (this._disposed || DesignerKeyboard.isDisabled()) {
        return;
      }
      callback();
    });
  }

  /**
   * Removes the listeners this keyboard bound on the document and the canvas, and drops its
   * shortcuts. The other designers keep theirs.
   */
  dispose(): void {
    if (this._disposed) {
      return;
    }
    this._disposed = true;

    if (this._keypressListener) {
      EventManager.unbind(document, 'keypress', this._keypressListener);
      this._keypressListener = null;
    }
    if (this._container) {
      if (this._mouseEnterListener) {
        this._container.removeEventListener('mouseenter', this._mouseEnterListener);
      }
      if (this._mouseLeaveListener) {
        this._container.removeEventListener('mouseleave', this._mouseLeaveListener);
      }
      if (this._pointerDownListener) {
        this._container.removeEventListener('pointerdown', this._pointerDownListener);
      }
    }
    this._container = null;
    this._mouseEnterListener = null;
    this._mouseLeaveListener = null;
    this._pointerDownListener = null;

    KeyboardManager.removeOwner(this);
    DesignerKeyboard._live.delete(this);
    if (DesignerKeyboard._live.size === 0) {
      DesignerKeyboard._stalePauseCount = DesignerKeyboard._pauseCount;
    }
  }

  /** Whether key presses go to this keyboard's designer: the one last hovered or touched. */
  isActive(): boolean {
    return KeyboardManager.isActive(this);
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

    // Paste as a child of the selection. Deliberately a separate binding: plain
    // Ctrl/Cmd+V keeps pasting loose on the canvas, selection or not.
    this.addShortcut(['ctrl+shift+v', 'meta+shift+v'], () => {
      const selected = designer.getModel().selectedTopic();
      if (selected) {
        designer.pasteClipboardAsChild(selected.getId());
      }
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

    // Zoom lives here, and only here. The editor's visualization toolbar used to
    // register ctrl/meta +/- on `document` as well, so a single keypress took
    // two zoom steps; it also bypassed the pause() that suppresses map
    // shortcuts while a dialog is open.
    this.addShortcut(['meta+=', 'ctrl+=', 'meta+plus', 'ctrl+plus'], () => {
      designer.zoomIn();
    });

    this.addShortcut(['meta+-', 'ctrl+-'], () => {
      designer.zoomOut();
    });

    this.addShortcut(['meta+0', 'ctrl+0'], () => {
      designer.zoomToFit();
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

    // Structural moves, on the Word / Google Docs outline bindings:
    // alt+shift+up/down reorder among siblings, alt+shift+left/right
    // outdent/indent. Plain arrows are taken by selection navigation, and the
    // remaining modifier+arrow combinations all collide with something outside
    // the app -- alt+left/right is browser Back/Forward, ctrl+left/right
    // collapses onto cmd+left/right which is Safari Back/Forward, and
    // ctrl+up/down collapses onto the macOS Mission Control keys, which the OS
    // takes before the page sees them.
    this.addShortcut(['alt+shift+up'], () => {
      me._moveTopic(designer, 'up');
    });

    this.addShortcut(['alt+shift+down'], () => {
      me._moveTopic(designer, 'down');
    });

    this.addShortcut(['alt+shift+left'], () => {
      me._moveTopic(designer, 'outdent');
    });

    this.addShortcut(['alt+shift+right'], () => {
      me._moveTopic(designer, 'indent');
    });

    this._container = designer.getContainer();
    this._mouseEnterListener = () => {
      super.resume();
      DesignerKeyboard._outsideCanvas = false;
      KeyboardManager.activate(this);
    };
    this._container.addEventListener('mouseenter', this._mouseEnterListener);

    // A touch (no hover) or a click makes this designer the one the keys go to as well ...
    this._pointerDownListener = () => {
      KeyboardManager.activate(this);
    };
    this._container.addEventListener('pointerdown', this._pointerDownListener);

    this._mouseLeaveListener = () => {
      super.pause();
      DesignerKeyboard._outsideCanvas = true;
    };
    this._container.addEventListener('mouseleave', this._mouseLeaveListener);

    this._keypressListener = (event: Event) => {
      // Needs to be ignored ?
      if (
        !this.isActive() ||
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
    };
    EventManager.bind(document, 'keypress', this._keypressListener);
  }

  /**
   * Applies a structural move to the selected topic.
   *
   * Note this moves the topic, where `_moveSelection` moves the *selection* --
   * the two read similarly but do opposite things.
   */
  private _moveTopic(designer: Designer, move: TopicMove): void {
    const topic = designer.getModel().selectedTopic();
    if (!topic) {
      $notify($msg('ONE_TOPIC_MUST_BE_SELECTED'));
      return;
    }
    designer.moveTopicInTree(topic, move);
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
      designer.revealNode(fallback);
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

    // Which arrow points back towards the root depends on the half of the map
    // the node sits on. `isOnRightHalf` counts x === 0 as the right half rather
    // than as neither: tested as `x > 0` and `x < 0`, a node at exactly zero
    // matched no case, fell through to the go-to-child branch below, and -- as a
    // leaf -- left its parent unreachable by either arrow.
    const isOnRightHalf = node.getPosition().x >= 0;
    if ((side === 'LEFT' && isOnRightHalf) || (side === 'RIGHT' && !isOnRightHalf)) {
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
        // Compared as a product `>= 0`, a sibling at x === 0 read as same-side as
        // both halves, so a left-hand node's Up/Down could land on it. Compare
        // the halves instead, with zero on the right as above.
        const sameSide = node.getPosition().x >= 0 === brother.getPosition().x >= 0;
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
      designer.revealNode(target);
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
      designer.revealNode(target);
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
    // A child at the root's x is on the right, the side the layout fills first. Tested as
    // `x >= 0` for LEFT and `x <= 0` for RIGHT, it was on neither side.
    const wanted = side === 'RIGHT' ? 1 : -1;
    children.forEach((child) => {
      if (sideOf(child.getPosition().x, node.getPosition().x) !== wanted) {
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
      designer.revealNode(parent);
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
      // x === 0 is the right half, as in _handleHorizontalBranchMove; it used to count on both.
      const wanted = preferredSide === 'RIGHT' ? 1 : -1;
      candidates = children.filter((child) => sideOf(child.getPosition().x) === wanted);
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

    designer.revealNode(target);
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
      // A topic inside a collapsed branch is not on screen: the arrows do not go there.
      if (candidate === node || getCollapsedAncestorIds(candidate).length > 0) {
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
      // A topic inside a collapsed branch is not on screen: the arrows do not go there.
      if (candidate === node || getCollapsedAncestorIds(candidate).length > 0) {
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

  private _goToNode(designer: Designer, node: Topic): void {
    // First deselect all the nodes ...
    designer.deselectAll();

    // Give focus to the selected node....
    designer.goToNode(node);
  }

  /**
   * Builds the keyboard of a designer, which the keys go to until another designer is hovered
   * or touched. A pause() requested before, e.g. by the editor while its keyboard events are
   * disabled, is kept: only resume() lifts it. A pause leaked by the previous designer (held
   * when it was disposed, never resumed) is dropped.
   */
  static register(designer: Designer): DesignerKeyboard {
    if (this._stalePauseCount > 0) {
      console.warn(
        `DesignerKeyboard: dropping ${this._stalePauseCount} pause() call(s) never resumed by the previous designer. Every pause() needs a matching resume().`,
      );
      this._pauseCount -= this._stalePauseCount;
      this._stalePauseCount = 0;
    }
    const keyboard = new DesignerKeyboard(designer);
    this._live.add(keyboard);
    KeyboardManager.activate(keyboard);
    this._outsideCanvas = false;
    return keyboard;
  }

  /**
   * Pauses the shortcuts until the matching resume(). Pauses nest: each one must be resumed.
   */
  static pause() {
    this._pauseCount += 1;
  }

  /**
   * Lifts one pause. When the last one is lifted, as it always did, it lifts the hover pause
   * too, so the shortcuts work right after a dialog closes, before the pointer moves. An extra
   * resume() is ignored.
   */
  static resume() {
    this._pauseCount = Math.max(0, this._pauseCount - 1);
    this._stalePauseCount = Math.max(0, this._stalePauseCount - 1);
    if (this._pauseCount === 0) {
      this._outsideCanvas = false;
    }
  }

  static isDisabled() {
    return this._pauseCount > 0 || this._outsideCanvas;
  }
}

export default DesignerKeyboard;
