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
import { FontStyleType } from './FontStyleType';
import { FontWeightType } from './FontWeightType';
import Topic from './Topic';

class EditorComponent extends Events {
  private _topic: Topic;

  private _containerElem: JQuery<HTMLElement>;

  constructor(topic: Topic) {
    super();
    this._topic = topic;

    // Create editor ui
    this._containerElem = EditorComponent.buildEditor();
    $('body').append(this._containerElem);
    this.registerEvents(this._containerElem);
  }

  private static buildEditor(): JQuery<HTMLElement> {
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

  private registerEvents(containerElem: JQuery): void {
    const textareaElem = this.getTextareaElem();
    textareaElem.on('keydown', (event) => {
      switch (event.code) {
        case 'Escape':
          this.close(false);
          break;
        case 'Enter': {
          if (event.metaKey || event.ctrlKey) {
            // Add return ...
            const text = this.getTextAreaText();
            const cursorPosition = text.length;
            const head = text.substring(0, cursorPosition);
            let tail = '';
            if (cursorPosition < text.length) {
              tail = text.substring(cursorPosition, text.length);
            }
            textareaElem.val(`${head}\n${tail}`);

            textareaElem.trigger('focus');
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
      const text = this.getTextareaElem().val();
      this.fireEvent('input', [event, text]);
      this.adjustEditorSize();
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

  private adjustEditorSize() {
    const textElem = this.getTextareaElem();

    const lines = this.getTextAreaText().split('\n');
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

  private updateModel() {
    if (this._topic && this._topic.getText() !== this.getTextAreaText()) {
      const text = this.getTextAreaText();
      const topicId = this._topic.getId();

      const actionDispatcher = ActionDispatcher.getInstance();
      try {
        actionDispatcher.changeTextToTopic([topicId], text);
      } catch (e) {
        // Hack: For some reasom, editor seems to end up connected to a deleted node.
        // More research required.
        console.error(`Text could not be update -> ${JSON.stringify(e)}`);
      }
    }
  }

  show(textOverwrite?: string): void {
    const topic = this._topic;

    // Hide topic text ...
    topic.getOrBuildTextShape().setVisibility(false);

    // Set Editor Style
    const nodeText = topic.getOrBuildTextShape();
    const fontStyle = nodeText.getFontStyle();
    fontStyle.size = nodeText.getHtmlFontSize();
    fontStyle.color = nodeText.getColor();
    this.setStyle(fontStyle);

    // Set editor's initial size
    // Position the editor and set the size...
    const textShape = topic.getOrBuildTextShape();
    this._containerElem.css('display', 'block');

    let { top, left } = textShape.getNativePosition();
    // Adjust padding top position ...
    top -= 4;
    left -= 4;
    this._containerElem.offset({ top, left });

    // Set editor's initial text. If the text has not been specifed, it will be empty
    const modelText = topic.getModel().getText();
    const text = textOverwrite || modelText || '';
    this.setText(text);

    // Set the element focus and select the current text ...
    const textAreaElem = this.getTextareaElem();
    if (textAreaElem) {
      this.positionCursor(textAreaElem, textOverwrite === undefined);
    }
    textAreaElem.trigger('focus');
  }

  private setStyle(fontStyle: {
    fontFamily: string;
    style: FontStyleType;
    weight: FontWeightType;
    size: number;
    color: string;
  }) {
    const inputField = this.getTextareaElem();
    // allowed param reassign to avoid risks of existing code relying in this side-effect
    if (!fontStyle.fontFamily) {
      fontStyle.fontFamily = 'Arial';
    }
    if (!fontStyle.style) {
      fontStyle.style = 'normal';
    }
    if (!fontStyle.weight) {
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

  private setText(text: string): void {
    const textareaElem = this.getTextareaElem();
    textareaElem.val(text);
    this.adjustEditorSize();
  }

  private getTextAreaText(): string {
    return this.getTextareaElem().val() as string;
  }

  private getTextareaElem(): JQuery<HTMLTextAreaElement> {
    return this._containerElem.find('textarea');
  }

  private positionCursor(textareaElem: JQuery<HTMLTextAreaElement>, selectText: boolean) {
    const { length } = this.getTextAreaText();
    const start = selectText ? 0 : length;
    textareaElem.trigger('focus');
    textareaElem[0].setSelectionRange(start, length);
  }

  close(update: boolean): void {
    if (update) {
      this.updateModel();
    }
    // Remove it form the screen ...
    this._containerElem.remove();

    // Restore topoc share visibility ...
    this._topic.getOrBuildTextShape().setVisibility(true);
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

  show(topic: Topic, textOverwrite?: string): void {
    // Is it active ?
    if (this.component) {
      console.error('Editor was already displayed. Please, clouse it');
      this.component.close(false);
    }
    // Create a new instance
    this.component = new EditorComponent(topic);
    this.component.show(textOverwrite);
  }

  close(update: boolean): void {
    if (this.component) {
      this.component.close(update);
      this.component = null;
    }
  }
}
export default MultitTextEditor;
