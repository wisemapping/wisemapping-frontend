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
import $ from 'jquery';
import { $assert } from '@wisemapping/core-js';
import Keyboard from './Keyboard';
import { Designer } from '..';
import Topic from './Topic';

import initHotKeyPluggin from '../../libraries/jquery.hotkeys';

// Provides dispatcher of keyevents by key...
initHotKeyPluggin($);

export type EventCallback = (event?: Event) => void;
class DesignerKeyboard extends Keyboard {
  // eslint-disable-next-line no-use-before-define
  private static _instance: DesignerKeyboard;

  private static _disabled: boolean;

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
      const node = model.selectedTopic();
      if (node) {
        if (node.isCentralTopic()) {
          me._goToSideChild(designer, node, 'RIGHT');
        } else if (node.getPosition().x < 0) {
          me._goToParent(designer, node);
        } else if (!node.areChildrenShrunken()) {
          me._goToChild(designer, node);
        }
      } else {
        const centralTopic = model.getCentralTopic();
        me._goToNode(designer, centralTopic);
      }
    });

    this.addShortcut('left', () => {
      const node = model.selectedTopic();
      if (node) {
        if (node.isCentralTopic()) {
          me._goToSideChild(designer, node, 'LEFT');
        } else if (node.getPosition().x > 0) {
          me._goToParent(designer, node);
        } else if (!node.areChildrenShrunken()) {
          me._goToChild(designer, node);
        }
      } else {
        const centralTopic = model.getCentralTopic();
        me._goToNode(designer, centralTopic);
      }
    });

    this.addShortcut('up', () => {
      const node = model.selectedTopic();
      if (node) {
        if (!node.isCentralTopic()) {
          me._goToBrother(designer, node, 'UP');
        }
      } else {
        const centralTopic = model.getCentralTopic();
        me._goToNode(designer, centralTopic);
      }
    });
    this.addShortcut('down', () => {
      const node = model.selectedTopic();
      if (node) {
        if (!node.isCentralTopic()) {
          me._goToBrother(designer, node, 'DOWN');
        }
      } else {
        const centralTopic = model.getCentralTopic();
        me._goToNode(designer, centralTopic);
      }
    });

    $(document).on('keypress', (event) => {
      // Needs to be ignored ?
      if (
        DesignerKeyboard.isDisabled() ||
        DesignerKeyboard.excludeFromEditor.includes(event.code)
      ) {
        return;
      }

      // Is a modifier ?
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }

      // If a node is selected, open the editor ...
      const topic = designer.getModel().selectedTopic();
      if (topic) {
        event.stopPropagation();
        event.preventDefault();
        topic.showTextEditor(event.key);
      }
    });
  }

  private _goToBrother(designer: Designer, node: Topic, direction: 'UP' | 'DOWN') {
    const parent = node.getParent();
    if (parent) {
      const brothers = parent.getChildren();

      let target = node;
      const { y } = node.getPosition();
      const { x } = node.getPosition();
      let dist: number | null = null;
      for (let i = 0; i < brothers.length; i++) {
        const sameSide = x * brothers[i].getPosition().x >= 0;
        if (brothers[i] !== node && sameSide) {
          const brother = brothers[i];
          const brotherY = brother.getPosition().y;
          if (direction === 'DOWN' && brotherY > y) {
            let distance = y - brotherY;
            if (distance < 0) {
              distance *= -1;
            }
            if (dist == null || dist > distance) {
              dist = distance;
              target = brothers[i];
            }
          } else if (direction === 'UP' && brotherY < y) {
            let distance = y - brotherY;
            if (distance < 0) {
              distance *= -1;
            }
            if (dist == null || dist > distance) {
              dist = distance;
              target = brothers[i];
            }
          }
        }
      }
      this._goToNode(designer, target);
    }
  }

  private _goToSideChild(designer: Designer, node: Topic, side: 'LEFT' | 'RIGHT'): void {
    const children = node.getChildren();
    if (children.length > 0) {
      let target = children[0];
      let top: number | null = null;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const childY = child.getPosition().y;
        if (side === 'LEFT' && child.getPosition().x < 0) {
          if (top == null || childY < top) {
            target = child;
            top = childY;
          }
        }
        if (side === 'RIGHT' && child.getPosition().x > 0) {
          if (top == null || childY < top) {
            target = child;
            top = childY;
          }
        }
      }

      this._goToNode(designer, target);
    }
  }

  private _goToParent(designer: Designer, node: Topic): void {
    const parent = node.getParent();
    if (parent) {
      this._goToNode(designer, parent);
    }
  }

  private _goToChild(designer: Designer, node: Topic): void {
    const children = node.getChildren();
    if (children.length > 0) {
      let target = children[0];
      let top = target.getPosition().y;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.getPosition().y < top) {
          top = child.getPosition().y;
          target = child;
        }
      }
      this._goToNode(designer, target);
    }
  }

  private _goToNode(designer: Designer, node: Topic): void {
    // First deselect all the nodes ...
    designer.deselectAll();

    // Give focus to the selected node....
    node.setOnFocus(true);
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
