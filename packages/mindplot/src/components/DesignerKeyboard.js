/*
 *    Copyright [2015] [wisemapping]
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

class DesignerKeyboard extends Keyboard {
  constructor(designer) {
    super(designer);
    $assert(designer, 'designer can not be null');
    this._registerEvents(designer);
  }

  _registerEvents(designer) {
    // Try with the keyboard ..
    const model = designer.getModel();
    this.addShortcut(
      ['backspace'], (event) => {
        event.preventDefault();
        event.stopPropagation();
        designer.deleteSelectedEntities();
      },
    );
    this.addShortcut(
      ['space'], () => {
        designer.shrinkSelectedBranch();
      },
    );
    this.addShortcut(
      ['f2'], (event) => {
        event.stopPropagation();
        event.preventDefault();
        const node = model.selectedTopic();
        if (node) {
          node.showTextEditor();
        }
      },
    );
    this.addShortcut(
      ['del'], (event) => {
        designer.deleteSelectedEntities();
        event.preventDefault();
        event.stopPropagation();
      },
    );
    this.addShortcut(
      ['enter'], () => {
        designer.createSiblingForSelectedNode();
      },
    );
    this.addShortcut(
      ['insert'], (event) => {
        designer.createChildForSelectedNode();
        event.preventDefault();
        event.stopPropagation();
      },
    );
    this.addShortcut(
      ['tab'], (event) => {
        designer.createChildForSelectedNode();
        event.preventDefault();
        event.stopPropagation();
      },
    );
    this.addShortcut(
      ['meta+enter'], (event) => {
        event.preventDefault();
        event.stopPropagation();
        designer.createChildForSelectedNode();
      },
    );
    this.addShortcut(
      ['ctrl+z', 'meta+z'], (event) => {
        event.preventDefault(event);
        event.stopPropagation();
        designer.undo();
      },
    );
    this.addShortcut(
      ['ctrl+c', 'meta+c'], (event) => {
        event.preventDefault(event);
        event.stopPropagation();
        designer.copyToClipboard();
      },
    );
    this.addShortcut(
      ['ctrl+v', 'meta+v'], (event) => {
        event.preventDefault(event);
        event.stopPropagation();
        designer.pasteClipboard();
      },
    );
    this.addShortcut(
      ['ctrl+shift+z', 'meta+shift+z', 'ctrl+y', 'meta+y'], (event) => {
        event.preventDefault();
        event.stopPropagation();
        designer.redo();
      },
    );
    this.addShortcut(
      ['ctrl+a', 'meta+a'], (event) => {
        event.preventDefault();
        event.stopPropagation();
        designer.selectAll();
      },
    );
    this.addShortcut(
      ['ctrl+b', 'meta+b'], (event) => {
        event.preventDefault();
        event.stopPropagation();

        designer.changeFontWeight();
      },
    );
    this.addShortcut(
      ['ctrl+s', 'meta+s'], (event) => {
        event.preventDefault();
        event.stopPropagation();
        $(document).find('#save').trigger('click');
      },
    );
    this.addShortcut(
      ['ctrl+i', 'meta+i'], (event) => {
        event.preventDefault();
        event.stopPropagation();

        designer.changeFontStyle();
      },
    );
    this.addShortcut(
      ['ctrl+shift+a', 'meta+shift+a'], (event) => {
        event.preventDefault();
        event.stopPropagation();

        designer.deselectAll();
      },
    );
    this.addShortcut(
      ['meta+=', 'ctrl+='], (event) => {
        event.preventDefault();
        event.stopPropagation();

        designer.zoomIn();
      },
    );
    this.addShortcut(
      ['meta+-', 'ctrl+-'], (event) => {
        event.preventDefault();
        event.stopPropagation();

        designer.zoomOut();
      },
    );
    const me = this;
    this.addShortcut(
      'right', (event) => {
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
        event.preventDefault();
        event.stopPropagation();
      },
    );
    this.addShortcut(
      'left', (event) => {
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
        event.preventDefault();
        event.stopPropagation();
      },
    );
    this.addShortcut(
      'up', (event) => {
        const node = model.selectedTopic();
        if (node) {
          if (!node.isCentralTopic()) {
            me._goToBrother(designer, node, 'UP');
          }
        } else {
          const centralTopic = model.getCentralTopic();
          me._goToNode(designer, centralTopic);
        }
        event.preventDefault();
        event.stopPropagation();
      },
    );
    this.addShortcut(
      'down', (event) => {
        const node = model.selectedTopic();
        if (node) {
          if (!node.isCentralTopic()) {
            me._goToBrother(designer, node, 'DOWN');
          }
        } else {
          const centralTopic = model.getCentralTopic();
          me._goToNode(designer, centralTopic);
        }
        event.preventDefault();
        event.stopPropagation();
      },
    );
    const excludes = ['esc', 'escape', 'f1', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12'];

    $(document).on('keypress', (event) => {
      let keyCode;
      // Firefox doesn't skip special keys for keypress event...
      if (event.key && excludes.includes(event.key.toLowerCase())) {
        return;
      }
      // Sometimes Firefox doesn't contain keyCode value
      if (event.key && event.keyCode === 0) {
        keyCode = event.charCode;
      } else {
        keyCode = event.keyCode;
      }

      const specialKey = $.hotkeys.specialKeys[keyCode];
      if (['enter', 'capslock'].indexOf(specialKey) === -1 && !$.hotkeys.shiftNums[keyCode]) {
        const nodes = designer.getModel().filterSelectedTopics();
        if (nodes.length > 0) {
          // If a modifier is press, the key selected must be ignored.
          const pressKey = String.fromCharCode(keyCode);
          if (event.ctrlKey || event.altKey || event.metaKey) {
            return;
          }
          nodes[0].showTextEditor(pressKey);
          event.stopPropagation();
        }
      }
    });
  }

  _goToBrother(designer, node, direction) {
    const parent = node.getParent();
    if (parent) {
      const brothers = parent.getChildren();

      let target = node;
      const { y } = node.getPosition();
      const { x } = node.getPosition();
      let dist = null;
      for (let i = 0; i < brothers.length; i++) {
        const sameSide = (x * brothers[i].getPosition().x) >= 0;
        if (brothers[i] !== node && sameSide) {
          const brother = brothers[i];
          const brotherY = brother.getPosition().y;
          if (direction === 'DOWN' && brotherY > y) {
            let distancia = y - brotherY;
            if (distancia < 0) {
              distancia *= (-1);
            }
            if (dist == null || dist > distancia) {
              dist = distancia;
              target = brothers[i];
            }
          } else if (direction === 'UP' && brotherY < y) {
            let distance = y - brotherY;
            if (distance < 0) {
              distance *= (-1);
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

  _goToSideChild(designer, node, side) {
    const children = node.getChildren();
    if (children.length > 0) {
      let target = children[0];
      let top = null;
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

  _goToParent(designer, node) {
    const parent = node.getParent();
    if (parent) {
      this._goToNode(designer, parent);
    }
  }

  _goToChild(designer, node) {
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

  _goToNode(designer, node) {
    // First deselect all the nodes ...
    designer.deselectAll();

    // Give focus to the selected node....
    node.setOnFocus(true);
  }
}

DesignerKeyboard.specialKeys = {
  8: 'backspace',
  9: 'tab',
  10: 'return',
  13: 'enter',
  16: 'shift',
  17: 'ctrl',
  18: 'alt',
  19: 'pause',
  20: 'capslock',
  27: 'esc',
  32: 'space',
  33: 'pageup',
  34: 'pagedown',
  35: 'end',
  36: 'home',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  45: 'insert',
  46: 'del',
  96: '0',
  97: '1',
  98: '2',
  99: '3',
  100: '4',
  101: '5',
  102: '6',
  103: '7',
  104: '8',
  105: '9',
  106: '*',
  107: '+',
  109: '-',
  110: '.',
  111: '/',
  112: 'f1',
  113: 'f2',
  114: 'f3',
  115: 'f4',
  116: 'f5',
  117: 'f6',
  118: 'f7',
  119: 'f8',
  120: 'f9',
  121: 'f10',
  122: 'f11',
  123: 'f12',
  144: 'numlock',
  145: 'scroll',
  186: ';',
  191: '/',
  220: '\\',
  222: "'",
  224: 'meta',
};

DesignerKeyboard.register = function register(designer) {
  this._instance = new DesignerKeyboard(designer);
};

DesignerKeyboard.getInstance = function getInstance() {
  return this._instance;
};

export default DesignerKeyboard;
