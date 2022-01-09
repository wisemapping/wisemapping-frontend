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
import { $msg } from '../Messages';
import BootstrapDialogRequest from '../libraries/bootstrap/BootstrapDialogRequest';
import IMenu from './IMenu';
import FontFamilyPanel from './FontFamilyPanel';
import FontSizePanel from './FontSizePanel';
import TopicShapePanel from './TopicShapePanel';
import IconPanel from './IconPanel';
import ColorPalettePanel from './ColorPalettePanel';
import ToolbarItem from './ToolbarItem';
import KeyboardShortcutTooltip from './KeyboardShortcutTooltip';
import KeyboardShortcutDialog from './KeyboardShortcutDialog';
import AccountSettingsPanel from './AccountSettingsPanel';
import Designer from '../Designer';

class Menu extends IMenu {
  constructor(designer: Designer, containerId: string, mapId: string, readOnly: boolean = false, baseUrl = '') {
    super(designer, containerId, mapId);
    const saveElem = $('#save');

    const widgetsBaseUrl = `${baseUrl}css/widget`;

    // Stop event propagation ...
    $(`#${this._containerId}`).bind('click', (event) => {
      event.stopPropagation();
      return false;
    });

    $(`#${this._containerId}`).bind('dblclick', (event) => {
      event.stopPropagation();
      return false;
    });

    // Create panels ...
    const designerModel = designer.getModel();

    const fontFamilyBtn = $('#fontFamily');
    if (fontFamilyBtn) {
      const fontFamilyModel = {
        getValue() {
          const nodes = designerModel.filterSelectedTopics();
          let result = null;
          for (let i = 0; i < nodes.length; i++) {
            const fontFamily = nodes[i].getFontFamily();
            if (result != null && result !== fontFamily) {
              result = null;
              break;
            }
            result = fontFamily;
          }
          return result;
        },

        setValue(value) {
          designer.changeFontFamily(value);
        },
      };
      this._toolbarElems.push(new FontFamilyPanel('fontFamily', fontFamilyModel));
      Menu._registerTooltip('fontFamily', $msg('FONT_FAMILY'));
    }

    const fontSizeBtn = $('#fontSize');
    if (fontSizeBtn) {
      const fontSizeModel = {
        getValue() {
          const nodes = designerModel.filterSelectedTopics();

          let result = null;
          for (let i = 0; i < nodes.length; i++) {
            const fontSize = nodes[i].getFontSize();
            if (result != null && result !== fontSize) {
              result = null;
              break;
            }
            result = fontSize;
          }
          return result;
        },
        setValue(value) {
          designer.changeFontSize(value);
        },
      };
      this._toolbarElems.push(new FontSizePanel('fontSize', fontSizeModel));
      Menu._registerTooltip('fontSize', $msg('FONT_SIZE'));
    }

    const topicShapeBtn = $('#topicShape');
    if (topicShapeBtn) {
      const topicShapeModel = {
        getValue() {
          const nodes = designerModel.filterSelectedTopics();
          let result = null;
          for (let i = 0; i < nodes.length; i++) {
            const shapeType = nodes[i].getShapeType();
            if (result != null && result !== shapeType) {
              result = null;
              break;
            }
            result = shapeType;
          }
          return result;
        },
        setValue(value) {
          designer.changeTopicShape(value);
        },
      };
      this._toolbarElems.push(new TopicShapePanel('topicShape', topicShapeModel));
      Menu._registerTooltip('topicShape', $msg('TOPIC_SHAPE'));
    }

    const topicIconBtn = $('#topicIcon');
    if (topicIconBtn) {
      // Create icon panel dialog ...
      const topicIconModel = {
        getValue() {
          return null;
        },
        setValue(value) {
          designer.addIconType(value);
        },
      };
      this._toolbarElems.push(new IconPanel('topicIcon', topicIconModel));
      Menu._registerTooltip('topicIcon', $msg('TOPIC_ICON'));
    }

    // Topic color item ...
    const topicColorBtn = $('#topicColor');
    if (topicColorBtn) {
      const topicColorModel = {
        getValue() {
          const nodes = designerModel.filterSelectedTopics();
          let result = null;
          for (let i = 0; i < nodes.length; i++) {
            const color = nodes[i].getBackgroundColor();
            if (result != null && result !== color) {
              result = null;
              break;
            }
            result = color;
          }
          return result;
        },
        setValue(hex) {
          designer.changeBackgroundColor(hex);
        },
      };
      this._toolbarElems.push(new ColorPalettePanel('topicColor', topicColorModel, widgetsBaseUrl));
      Menu._registerTooltip('topicColor', $msg('TOPIC_COLOR'));
    }

    // Border color item ...
    const topicBorderBtn = $('#topicBorder');
    if (topicBorderBtn) {
      const borderColorModel = {
        getValue() {
          const nodes = designerModel.filterSelectedTopics();
          let result = null;
          for (let i = 0; i < nodes.length; i++) {
            const color = nodes[i].getBorderColor();
            if (result != null && result !== color) {
              result = null;
              break;
            }
            result = color;
          }
          return result;
        },
        setValue(hex) {
          designer.changeBorderColor(hex);
        },
      };
      this._toolbarElems.push(new ColorPalettePanel('topicBorder', borderColorModel, widgetsBaseUrl));
      Menu._registerTooltip('topicBorder', $msg('TOPIC_BORDER_COLOR'));
    }

    // Font color item ...
    const fontColorBtn = $('#fontColor');
    if (fontColorBtn) {
      const fontColorModel = {
        getValue() {
          let result = null;
          const nodes = designerModel.filterSelectedTopics();
          for (let i = 0; i < nodes.length; i++) {
            const color = nodes[i].getFontColor();
            if (result != null && result !== color) {
              result = null;
              break;
            }
            result = color;
          }
          return result;
        },
        setValue(hex) {
          designer.changeFontColor(hex);
        },
      };
      this._toolbarElems.push(new ColorPalettePanel('fontColor', fontColorModel, baseUrl));
      Menu._registerTooltip('fontColor', $msg('FONT_COLOR'));
    }

    this._addButton('export', false, false, () => {
      // @Todo: this must be configured in the dialog...
      const formatExtension = 'jpg';

      designer.export(formatExtension)
        .then((url: string) => {
          // Create hidden anchor to force download ...
          const anchor: HTMLAnchorElement = document.createElement('a');
          anchor.style.display = 'none';
          anchor.download = `${mapId}.${formatExtension}`;
          anchor.href = url;
          document.body.appendChild(anchor);

          // Trigger click ...
          anchor.click();

          // Clean up ...
          URL.revokeObjectURL(url);
          document.body.removeChild(anchor);
        });

      // Create anchor element ...
    });

    Menu._registerTooltip('export', $msg('EXPORT'));

    this._addButton('print', false, false, () => {
      this.save(saveElem, designer, false);
      const urlPrefix = window.location.href.substring(0, window.location.href.lastIndexOf('c/maps/'));
      window.open(`${urlPrefix}c/maps/${mapId}/print`);
    });

    Menu._registerTooltip('print', $msg('PRINT'));

    this._addButton('zoom-plus', false, false, () => {
      designer.zoomIn();
    });
    Menu._registerTooltip('zoom-plus', $msg('ZOOM_IN'));

    this._addButton('zoom-minus', false, false, () => {
      designer.zoomOut();
    });
    Menu._registerTooltip('zoom-minus', $msg('ZOOM_OUT'));

    const undoButton = this._addButton('undoEdition', false, false, () => {
      designer.undo();
    });
    if (undoButton) {
      undoButton.disable();
    }
    Menu._registerTooltip('undoEdition', $msg('UNDO'), 'meta+Z');

    const redoButton = this._addButton('redoEdition', false, false, () => {
      designer.redo();
    });
    if (redoButton) {
      redoButton.disable();
    }
    Menu._registerTooltip('redoEdition', $msg('REDO'), 'meta+shift+Z');

    if (redoButton && undoButton) {
      designer.addEvent('modelUpdate', (event) => {
        if (event.undoSteps > 0) {
          undoButton.enable();
        } else {
          undoButton.disable();
        }
        if (event.redoSteps > 0) {
          redoButton.enable();
        } else {
          redoButton.disable();
        }
      });
    }

    this._addButton('addTopic', true, false, () => {
      designer.createSiblingForSelectedNode();
    });
    Menu._registerTooltip('addTopic', $msg('ADD_TOPIC'), 'Enter');

    this._addButton('deleteTopic', true, true, () => {
      designer.deleteSelectedEntities();
    });
    Menu._registerTooltip('deleteTopic', $msg('TOPIC_DELETE'), 'Delete');

    this._addButton('topicLink', true, false, () => {
      designer.addLink();
    });
    Menu._registerTooltip('topicLink', $msg('TOPIC_LINK'));

    this._addButton('topicRelation', true, false, (event) => {
      designer.showRelPivot(event);
    });
    Menu._registerTooltip('topicRelation', $msg('TOPIC_RELATIONSHIP'));

    this._addButton('topicNote', true, false, () => {
      designer.addNote();
    });
    Menu._registerTooltip('topicNote', $msg('TOPIC_NOTE'));

    this._addButton('fontBold', true, false, () => {
      designer.changeFontWeight();
    });
    Menu._registerTooltip('fontBold', $msg('FONT_BOLD'), 'meta+B');

    this._addButton('fontItalic', true, false, () => {
      designer.changeFontStyle();
    });
    Menu._registerTooltip('fontItalic', $msg('FONT_ITALIC'), 'meta+I');

    if (saveElem) {
      this._addButton('save', false, false,
        () => {
          this.save(saveElem, designer, true);
        });
      Menu._registerTooltip('save', $msg('SAVE'), 'meta+S');

      if (!readOnly) {
        // To prevent the user from leaving the page with changes ...
        //                Element.NativeEvents.unload = 1;
        $(window).bind('unload', () => {
          if (this.isSaveRequired()) {
            this.save(saveElem, designer, false, true);
          }
          this.unlockMap(designer);
        });

        // Autosave on a fixed period of time ...
        setInterval(
          () => {
            if (this.isSaveRequired()) {
              this.save(saveElem, designer, false);
            }
          }, 30000,
        );
      }
    }

    const discardElem = $('#discard');
    if (discardElem) {
      this._addButton('discard', false, false, () => {
        this.discardChanges(designer);
      });
      Menu._registerTooltip('discard', $msg('DISCARD_CHANGES'));
    }

    const shareElem = $('#shareIt');
    if (shareElem) {
      this._addButton('shareIt', false, false, () => {
        const dialog = new BootstrapDialogRequest(`c/maps/${mapId}/sharef`, $msg('COLLABORATE'), {
          closeButton: true,
          cancelButton: true,
        });
        designer.onObjectFocusEvent();
      });
      Menu._registerTooltip('shareIt', $msg('COLLABORATE'));
    }

    const publishElem = $('#publishIt');
    if (publishElem) {
      this._addButton('publishIt', false, false, () => {
        const dialog = new BootstrapDialogRequest(`c/maps/${mapId}/publishf`, $msg('PUBLISH'), {
          closeButton: true,
          cancelButton: true,
        });
        designer.onObjectFocusEvent();
      });
      Menu._registerTooltip('publishIt', $msg('PUBLISH'));
    }

    const historyElem = $('#history');
    if (historyElem) {
      this._addButton('history', false, false, () => {
        const dialog = new BootstrapDialogRequest(`c/maps/${mapId}/historyf`, $msg('HISTORY'), {
          closeButton: true,
          cancelButton: true,
        });
        designer.onObjectFocusEvent();
      });
      Menu._registerTooltip('history', $msg('HISTORY'));
    }
    // Keyboard Shortcuts Action ...
    const keyboardShortcut = $('#keyboardShortcuts');
    if (keyboardShortcut) {
      keyboardShortcut.bind('click', (event) => {
        const dialog = new KeyboardShortcutDialog();
        designer.onObjectFocusEvent();
        event.preventDefault();
      });
      Menu._registerTooltip('keyboardShortcuts', $msg('KEYBOARD_SHOTCUTS'));
    }

    const backTolist = $('#backToList');
    if (backTolist) {
      backTolist.bind('click', (event) => {
        event.stopPropagation();
        window.location.href = '/c/maps/';
        return false;
      });
      Menu._registerTooltip('backToList', $msg('BACK_TO_MAP_LIST'));
    }

    // Account dialog ...
    const accountSettings = $('#account');
    if (accountSettings) {
      accountSettings.bind('click', (event) => {
        event.preventDefault();
      });
      this._toolbarElems.push(new AccountSettingsPanel('account'));
      Menu._registerTooltip('account', `${global.accountEmail}`);
    }

    this._registerEvents(designer);
  }

  _registerEvents(designer) {
    // Register on close events ...
    this._toolbarElems.forEach((panel) => {
      panel.addEvent('show', () => {
        this.clear();
      });
    });

    designer.addEvent('onblur', () => {
      const topics = designer.getModel().filterSelectedTopics();
      const rels = designer.getModel().filterSelectedRelationships();

      this._toolbarElems.forEach((panel) => {
        const isTopicAction = panel.isTopicAction();
        const isRelAction = panel.isRelAction();

        if (isTopicAction || isRelAction) {
          if ((isTopicAction && topics.length !== 0) || (isRelAction && rels.length !== 0)) {
            panel.enable();
          } else {
            panel.disable();
          }
        }
      });
    });

    designer.addEvent('onfocus', () => {
      const topics = designer.getModel().filterSelectedTopics();
      const rels = designer.getModel().filterSelectedRelationships();

      this._toolbarElems.forEach((button) => {
        const isTopicAction = button.isTopicAction();
        const isRelAction = button.isRelAction();

        if (isTopicAction || isRelAction) {
          if (isTopicAction && topics.length > 0) {
            button.enable();
          }

          if (isRelAction && rels.length > 0) {
            button.enable();
          }
        }
      });
    });
  }

  _addButton(buttonId, topic, rel, fn) {
    // Register Events ...
    let result = null;
    if ($(`#${buttonId}`)) {
      const button = new ToolbarItem(buttonId, ((event) => {
        fn(event);
        this.clear();
      }), { topicAction: topic, relAction: rel });

      this._toolbarElems.push(button);
      result = button;
    }
    return result;
  }

  static _registerTooltip(buttonId: string, text: string, shortcut: string = null) {
    if ($(`#${buttonId}`)) {
      let tooltip = text;
      if (shortcut) {
        const platformedShortcut = navigator.appVersion.indexOf('Mac') !== -1
          ? shortcut.replace('meta+', '⌘')
          : shortcut.replace('meta+', 'ctrl+');
        tooltip = `${tooltip} (${platformedShortcut})`;
      }
      return new KeyboardShortcutTooltip($(`#${buttonId}`), tooltip);
    }
    return undefined;
  }
}

export default Menu;
