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
import { $defined } from '@wisemapping/core-js';
import BootstrapDialog from '../libraries/bootstrap/BootstrapDialog';
import IMenu from './IMenu';
import FontFamilyPanel from './FontFamilyPanel';
import FontSizePanel from './FontSizePanel';
import TopicShapePanel from './TopicShapePanel';
import IconPanel from './IconPanel';
import ColorPalettePanel from './ColorPalettePanel';
import ToolbarItem from './ToolbarItem';
import KeyboardShortcutTooltip from './KeyboardShortcutTooltip';

const Menu = new Class({
  Extends: IMenu,

  initialize(designer, containerId, mapId, readOnly, baseUrl) {
    this.parent(designer, containerId, mapId);

    baseUrl = !$defined(baseUrl) ? '' : baseUrl;
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
            if (result != null && result != fontFamily) {
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
      this._registerTooltip('fontFamily', $msg('FONT_FAMILY'));
    }

    const fontSizeBtn = $('#fontSize');
    if (fontSizeBtn) {
      const fontSizeModel = {
        getValue() {
          const nodes = designerModel.filterSelectedTopics();
          let result = null;
          for (let i = 0; i < nodes.length; i++) {
            const fontSize = nodes[i].getFontSize();
            if (result != null && result != fontSize) {
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
      this._registerTooltip('fontSize', $msg('FONT_SIZE'));
    }

    const topicShapeBtn = $('#topicShape');
    if (topicShapeBtn) {
      const topicShapeModel = {
        getValue() {
          const nodes = designerModel.filterSelectedTopics();
          let result = null;
          for (let i = 0; i < nodes.length; i++) {
            const shapeType = nodes[i].getShapeType();
            if (result != null && result != shapeType) {
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
      this._registerTooltip('topicShape', $msg('TOPIC_SHAPE'));
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
      this._registerTooltip('topicIcon', $msg('TOPIC_ICON'));
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
            if (result != null && result != color) {
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
      this._registerTooltip('topicColor', $msg('TOPIC_COLOR'));
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
            if (result != null && result != color) {
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
      this._registerTooltip('topicBorder', $msg('TOPIC_BORDER_COLOR'));
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
            if (result != null && result != color) {
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
      this._registerTooltip('fontColor', $msg('FONT_COLOR'));
    }

    this._addButton('export', false, false, () => {
      BootstrapDialog.Request.active = new BootstrapDialog.Request(`c/maps/${mapId}/exportf`, $msg('EXPORT'), {
        cancelButton: true,
        closeButton: true,
      });
    });
    this._registerTooltip('export', $msg('EXPORT'));

    const me = this;

    this._addButton('print', false, false, () => {
      me.save(saveElem, designer, false);
      const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('c/maps/'));
      window.open(`${baseUrl}c/maps/${mapId}/print`);
    });

    this._registerTooltip('print', $msg('PRINT'));

    this._addButton('zoomIn', false, false, () => {
      designer.zoomIn();
    });
    this._registerTooltip('zoomIn', $msg('ZOOM_IN'));

    this._addButton('zoomOut', false, false, () => {
      designer.zoomOut();
    });
    this._registerTooltip('zoomOut', $msg('ZOOM_OUT'));

    const undoButton = this._addButton('undoEdition', false, false, () => {
      designer.undo();
    });
    if (undoButton) {
      undoButton.disable();
    }
    this._registerTooltip('undoEdition', $msg('UNDO'), 'meta+Z');

    const redoButton = this._addButton('redoEdition', false, false, () => {
      designer.redo();
    });
    if (redoButton) {
      redoButton.disable();
    }
    this._registerTooltip('redoEdition', $msg('REDO'), 'meta+shift+Z');

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
    this._registerTooltip('addTopic', $msg('ADD_TOPIC'), 'Enter');

    this._addButton('deleteTopic', true, true, () => {
      designer.deleteSelectedEntities();
    });
    this._registerTooltip('deleteTopic', $msg('TOPIC_DELETE'), 'Delete');

    this._addButton('topicLink', true, false, () => {
      designer.addLink();
    });
    this._registerTooltip('topicLink', $msg('TOPIC_LINK'));

    this._addButton('topicRelation', true, false, (event) => {
      designer.showRelPivot(event);
    });
    this._registerTooltip('topicRelation', $msg('TOPIC_RELATIONSHIP'));

    this._addButton('topicNote', true, false, () => {
      designer.addNote();
    });
    this._registerTooltip('topicNote', $msg('TOPIC_NOTE'));

    this._addButton('fontBold', true, false, () => {
      designer.changeFontWeight();
    });
    this._registerTooltip('fontBold', $msg('FONT_BOLD'), 'meta+B');

    this._addButton('fontItalic', true, false, () => {
      designer.changeFontStyle();
    });
    this._registerTooltip('fontItalic', $msg('FONT_ITALIC'), 'meta+I');

    var saveElem = $('#save');
    if (saveElem) {
      this._addButton('save', false, false,
        () => {
          me.save(saveElem, designer, true);
        });
      this._registerTooltip('save', $msg('SAVE'), 'meta+S');

      if (!readOnly) {
        // To prevent the user from leaving the page with changes ...
        //                Element.NativeEvents.unload = 1;
        $(window).bind('unload', () => {
          if (me.isSaveRequired()) {
            me.save(saveElem, designer, false, true);
          }
          me.unlockMap(designer);
        });

        // Autosave on a fixed period of time ...
        setInterval(
          () => {
            if (me.isSaveRequired()) {
              me.save(saveElem, designer, false);
            }
          }, 30000,
        );
      }
    }

    const discardElem = $('#discard');
    if (discardElem) {
      this._addButton('discard', false, false, () => {
        me.discardChanges(designer);
      });
      this._registerTooltip('discard', $msg('DISCARD_CHANGES'));
    }

    const shareElem = $('#shareIt');
    if (shareElem) {
      this._addButton('shareIt', false, false, () => {
        BootstrapDialog.Request.active = new BootstrapDialog.Request(`c/maps/${mapId}/sharef`, $msg('COLLABORATE'), {
          closeButton: true,
          cancelButton: true,
        });
        designer.onObjectFocusEvent();
      });
      this._registerTooltip('shareIt', $msg('COLLABORATE'));
    }

    const publishElem = $('#publishIt');
    if (publishElem) {
      this._addButton('publishIt', false, false, () => {
        BootstrapDialog.Request.active = new BootstrapDialog.Request(`c/maps/${mapId}/publishf`, $msg('PUBLISH'), {
          closeButton: true,
          cancelButton: true,
        });
        designer.onObjectFocusEvent();
      });
      this._registerTooltip('publishIt', $msg('PUBLISH'));
    }

    const historyElem = $('#history');
    if (historyElem) {
      this._addButton('history', false, false, () => {
        BootstrapDialog.Request.active = new BootstrapDialog.Request(`c/maps/${mapId}/historyf`, $msg('HISTORY'), {
          closeButton: true,
          cancelButton: true,
        });
        designer.onObjectFocusEvent();
      });
      this._registerTooltip('history', $msg('HISTORY'));
    }

    this._registerEvents(designer);

    // Keyboard Shortcuts Action ...
    const keyboardShortcut = $('#keyboardShortcuts');
    if (keyboardShortcut) {
      keyboardShortcut.bind('click', (event) => {
        BootstrapDialog.Request.active = new BootstrapDialog.Request('c/keyboard', $msg('SHORTCUTS'), {
          closeButton: true,
          cancelButton: true,
        });
        designer.onObjectFocusEvent();
        event.preventDefault();
      });
    }

    const videoElem = $('#tutorialVideo');
    if (videoElem) {
      const width = 900;
      const height = 500;
      const left = (screen.width / 2) - (width / 2);
      const top = (screen.height / 2) - (height / 2);

      videoElem.bind('click', (event) => {
        window.open('https://www.youtube.com/tv?vq=medium#/watch?v=rKxZwNKs9cE', '_blank', `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=yes, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`);
        event.preventDefault();
      });
    }
  },

  _registerEvents(designer) {
    const me = this;
    // Register on close events ...
    _.each(this._toolbarElems, (elem) => {
      elem.addEvent('show', () => {
        me.clear();
      });
    });

    designer.addEvent('onblur', () => {
      const topics = designer.getModel().filterSelectedTopics();
      const rels = designer.getModel().filterSelectedRelationships();

      _.each(me._toolbarElems, (button) => {
        const isTopicAction = button.isTopicAction();
        const isRelAction = button.isRelAction();

        if (isTopicAction || isRelAction) {
          if ((isTopicAction && topics.length != 0) || (isRelAction && rels.length != 0)) {
            button.enable();
          } else {
            button.disable();
          }
        }
      });
    });

    designer.addEvent('onfocus', () => {
      const topics = designer.getModel().filterSelectedTopics();
      const rels = designer.getModel().filterSelectedRelationships();

      _.each(me._toolbarElems, (button) => {
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
  },

  _addButton(buttonId, topic, rel, fn) {
    const me = this;
    // Register Events ...
    let result = null;
    if ($(`#${buttonId}`)) {
      const button = new ToolbarItem(buttonId, ((event) => {
        fn(event);
        me.clear();
      }), { topicAction: topic, relAction: rel });

      this._toolbarElems.push(button);
      result = button;
    }
    return result;
  },

  _registerTooltip(buttonId, text, shortcut) {
    if ($(`#${buttonId}`)) {
      let tooltip = text;
      if (shortcut) {
        shortcut = navigator.appVersion.indexOf('Mac') != -1 ? shortcut.replace('meta+', '⌘') : shortcut.replace('meta+', 'ctrl+');
        tooltip = `${tooltip} (${shortcut})`;
      }
      new KeyboardShortcutTooltip($(`#${buttonId}`), tooltip);
    }
  },
});

export default Menu;
