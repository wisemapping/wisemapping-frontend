/* eslint-disable max-classes-per-file */
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

import ActionDispatcher from './ActionDispatcher';
import Events from './Events';
import Topic from './Topic';

class EditorComponent extends Events {
  private _topic: Topic;

  private _containerElem: JQuery<HTMLElement>;

  constructor(topic: Topic) {
    super();
    this._topic = topic;

    // Create editor ui
    this._containerElem = EditorComponent._buildEditor();
    $('body').append(this._containerElem);
    this._registerEvents(this._containerElem);
  }

  private static _buildEditor() {
    const result = $('<div></div>').attr('id', 'textContainer').css({
      display: 'none',
      zIndex: '8',
      border: '0 none',
    });

    const textareaElem = $('<textarea tabindex="-1" value="" wrap="off" ></textarea>').css({
      border: '1px gray dashed',
      background: 'rgba(98, 135, 167, .4)',
      outline: '0 none',
      resize: 'none',
      overflow: 'hidden',
      padding: '2px 0px 2px 4px',
    });

    result.append(textareaElem);
    return result;
  }

  private _registerEvents(containerElem: JQuery): void {
    const textareaElem = this._getTextareaElem();
    textareaElem.on('keydown', (event) => {
      switch (event.code) {
        case 'Escape':
          this.close(false);
          break;
        case 'Enter': {
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
    const textElem = this._getTextareaElem();

    const lines = this._getTextAreaText().split('\n');
    let maxLineLength = 1;
    lines.forEach((line: string) => {
      maxLineLength = Math.max(line.length, maxLineLength);
    });

    textElem.attr('cols', maxLineLength);
    textElem.attr('rows', lines.length);

    this._containerElem.css({
      width: `${maxLineLength + 2}em`,
      height: textElem?.height() || 0,
    });
  }

  private _updateModel() {
    if (this._topic && this._topic.getText() !== this._getTextAreaText()) {
      const text = this._getTextAreaText();
      const topicId = this._topic.getId();

      const actionDispatcher = ActionDispatcher.getInstance();
      try {
        actionDispatcher.changeTextToTopic([topicId], text);
      } catch (e) {
        // Hack: For some reasom, editor seems to end up connexted to a deleted node.
        // More research required.
        console.error(`Text could not be update -> ${JSON.stringify(e)}`);
      }
    }
  }

  show(defaultText: string) {
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

    let { top, left } = textShape.getNativePosition();
    // Adjust padding top position ...
    top -= 4;
    left -= 4;
    this._containerElem.offset({ top, left });

    // Set editor's initial text ...
    const text = defaultText || topic.getText();
    this._setText(text);

    // Set the element focus and select the current text ...
    const inputElem = this._getTextareaElem();
    if (inputElem) {
      this._positionCursor(inputElem, !$defined(defaultText));
    }
  }

  private _setStyle(fontStyle: {
    fontFamily: string;
    style: string;
    weight: string;
    size: number;
    color: string;
  }) {
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
    const { length } = this._getTextAreaText();
    if (selectText) {
      // Mark text as selected ...
      textareaElem[0].setSelectionRange(0, length);
    } else {
      textareaElem[0].setSelectionRange(length, length);
    }
  }

  close(update: boolean): void {
    if (update) {
      this._updateModel();
    }
    // Remove it form the screen ...
    this._containerElem.remove();

    // Restore topoc share visibility ...
    this._topic.getTextShape().setVisibility(true);
  }
}

class MultitTextEditor {
  // eslint-disable-next-line no-use-before-define
  private static instance: MultitTextEditor = new MultitTextEditor();

  private component: EditorComponent | null;

  static getInstance(): MultitTextEditor {
    return MultitTextEditor.instance;
  }

  isActive(): boolean {
    return this.component !== null;
  }

  show(topic: Topic, defaultText: string): void {
    // Is it active ?
    if (this.component) {
      console.error('Editor was already displayed. Please, clouse it');
      this.component.close(false);
    }
    // Create a new instance
    this.component = new EditorComponent(topic);
    this.component.show(defaultText);
  }

  close(update: boolean): void {
    if (this.component) {
      this.component.close(update);
      this.component = null;
    }
  }
}
export default MultitTextEditor;
