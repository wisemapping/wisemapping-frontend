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
import { $defined } from '@wisemapping/core-js';
import $ from 'jquery';

import initHotKeyPluggin from '../../../../libraries/jquery.hotkeys';
import Events from './Events';
import ActionDispatcher from './ActionDispatcher';
import Topic from './Topic';

initHotKeyPluggin($);

class MultilineTextEditor extends Events {
  private _topic: Topic;

  private _containerElem: JQuery;

  constructor() {
    super();
    this._topic = null;
  }

  private static _buildEditor() {
    const result = $('<div></div>')
      .attr('id', 'textContainer')
      .css({
        display: 'none',
        zIndex: '8',
        overflow: 'hidden',
        border: '0 none',
      });

    const textareaElem = $('<textarea tabindex="-1" value="" wrap="off" ></textarea>')
      .css({
        border: '1px gray dashed',
        background: 'rgba(98, 135, 167, .3)',
        outline: '0 none',
        resize: 'none',
        overflow: 'hidden',
      });

    result.append(textareaElem);
    return result;
  }

  private _registerEvents(containerElem: JQuery) {
    const textareaElem = this._getTextareaElem();
    textareaElem.on('keydown', (event) => {
      const j: any = $;
      switch (j.hotkeys.specialKeys[event.keyCode]) {
        case 'esc':
          this.close(false);
          break;
        case 'enter': {
          if (event.metaKey || event.ctrlKey) {
            // Add return ...
            const text = this._getTextAreaText();
            const cursorPosition = text.length;
            const head = text.substring(0, cursorPosition);
            let tail = '';
            if (cursorPosition < text.length) {
              tail = text.substring(cursorPosition, text.length);
            }
            textareaElem.val(`${head}\n${tail}`);

            textareaElem.focus();
            textareaElem[0].setSelectionRange(cursorPosition + 1, cursorPosition + 1);
          } else {
            this.close(true);
          }
          break;
        }
        default:
          // No actions...
          break;
      }
      event.stopPropagation();
    });

    textareaElem.on('keypress', (event) => {
      event.stopPropagation();
    });

    textareaElem.on('keyup', (event) => {
      const text = this._getTextareaElem().val();
      this.fireEvent('input', [event, text]);
      this._adjustEditorSize();
    });

    // If the user clicks on the input, all event must be ignored ...
    containerElem.on('click', (event) => {
      event.stopPropagation();
    });
    containerElem.on('dblclick', (event) => {
      event.stopPropagation();
    });
    containerElem.on('mousedown', (event) => {
      event.stopPropagation();
    });
  }

  private _adjustEditorSize() {
    if (this.isVisible()) {
      const textElem = this._getTextareaElem();

      const lines = this._getTextAreaText().split('\n');
      let maxLineLength = 1;
      lines.forEach((line) => {
        if (maxLineLength < line.length) {
          maxLineLength = line.length;
        }
      });

      textElem.attr('cols', maxLineLength);
      textElem.attr('rows', lines.length);

      this._containerElem.css({
        width: `${maxLineLength + 3}em`,
        height: textElem.height(),
      });
    }
  }

  isVisible(): boolean {
    return $defined(this._containerElem) && this._containerElem.css('display') === 'block';
  }

  private _updateModel() {
    if (this._topic.getText() !== this._getTextAreaText()) {
      const text = this._getTextAreaText();
      const topicId = this._topic.getId();

      const actionDispatcher = ActionDispatcher.getInstance();
      actionDispatcher.changeTextToTopic([topicId], text);
    }
  }

  show(topic: Topic, text: string): void {
    // Close a previous node editor if it's opened ...
    if (this._topic) {
      this.close(false);
    }

    this._topic = topic;
    if (!this.isVisible()) {
      // Create editor ui
      const containerElem = MultilineTextEditor._buildEditor();
      $('body').append(containerElem);

      this._containerElem = containerElem;
      this._registerEvents(containerElem);
      this._showEditor(text);
    }
  }

  private _showEditor(defaultText: string) {
    const topic = this._topic;

    // Hide topic text ...
    topic.getTextShape().setVisibility(false);

    // Set Editor Style
    const nodeText = topic.getTextShape();
    const fontStyle = nodeText.getFontStyle();
    fontStyle.size = nodeText.getHtmlFontSize();
    fontStyle.color = nodeText.getColor();
    this._setStyle(fontStyle);

    // Set editor's initial size
    // Position the editor and set the size...
    const textShape = topic.getTextShape();

    this._containerElem.css('display', 'block');

    const shapePosition = textShape.getNativePosition();
    this._containerElem.offset(shapePosition);

    // Set editor's initial text ...
    const text = $defined(defaultText) ? defaultText : topic.getText();
    this._setText(text);

    // Set the element focus and select the current text ...
    const inputElem = this._getTextareaElem();
    this._positionCursor(inputElem, !$defined(defaultText));
  }

  private _setStyle(fontStyle) {
    const inputField = this._getTextareaElem();
    // allowed param reassign to avoid risks of existing code relying in this side-effect
    /* eslint-disable no-param-reassign */
    if (!$defined(fontStyle.fontFamily)) {
      fontStyle.fontFamily = 'Arial';
    }
    if (!$defined(fontStyle.style)) {
      fontStyle.style = 'normal';
    }
    if (!$defined(fontStyle.weight)) {
      fontStyle.weight = 'normal';
    }
    if (!$defined(fontStyle.size)) {
      fontStyle.size = 12;
    }
    /* eslint-enable no-param-reassign */
    const style = {
      fontSize: `${fontStyle.size}px`,
      fontFamily: fontStyle.fontFamily,
      fontStyle: fontStyle.style,
      fontWeight: fontStyle.weight,
      color: fontStyle.color,
    };
    inputField.css(style);
    this._containerElem.css(style);
  }

  private _setText(text: string): void {
    const textareaElem = this._getTextareaElem();
    textareaElem.val(text);
    this._adjustEditorSize();
  }

  private _getTextAreaText(): string {
    return this._getTextareaElem().val() as string;
  }

  private _getTextareaElem(): JQuery<HTMLTextAreaElement> {
    return this._containerElem.find('textarea');
  }

  private _positionCursor(textareaElem: JQuery<HTMLTextAreaElement>, selectText: boolean) {
    textareaElem.focus();
    const lengh = this._getTextAreaText().length;
    if (selectText) {
      // Mark text as selected ...
      textareaElem[0].setSelectionRange(0, lengh);
    } else {
      textareaElem.focus();
    }
  }

  close(update: boolean): void {
    if (this.isVisible() && this._topic) {
      if (!$defined(update) || update) {
        this._updateModel();
      }

      // Let make the visible text in the node visible again ...
      this._topic.getTextShape().setVisibility(true);

      // Remove it form the screen ...
      this._containerElem.remove();
      this._containerElem = null;
    }
    this._topic = null;
  }
}

export default MultilineTextEditor;
