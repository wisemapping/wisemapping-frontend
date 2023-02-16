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
import { FontStyle } from '@wisemapping/web2d/src/components/peer/svg/FontPeer';
import $ from 'jquery';

import ActionDispatcher from './ActionDispatcher';
import Events from './Events';
import EventBus from './layout/EventBus';
import Topic from './Topic';

class EditorComponent extends Events {
  private _topic: Topic;

  private _oldText: string | undefined;

  private _containerElem: JQuery<HTMLElement>;

  private _onClose: () => void;

  constructor(topic: Topic, onClose: () => void) {
    super();
    this._topic = topic;

    // Create editor ui
    this._containerElem = EditorComponent.buildEditor();
    $('body').append(this._containerElem);
    this.registerEvents(this._containerElem);
    this._oldText = topic.getText();
    this._onClose = onClose;
  }

  private static buildEditor(): JQuery<HTMLElement> {
    const result = $('<div></div>').attr('id', 'textContainer').css({
      display: 'none',
      zIndex: '8',
      border: '0 none',
    });

    const textareaElem = $('<textarea tabindex="-1" value="" wrap="off" ></textarea>').css({
      border: '0px',
      background: 'rgba(0, 0, 0, 0)',
      outline: '0 none',
      resize: 'none',
      overflow: 'hidden',
      padding: '0px 0px 0px 0px',
      lineHeight: '100%',
    });

    result.append(textareaElem);
    return result;
  }

  private registerEvents(containerElem: JQuery): void {
    const textareaElem = this.getTextareaElem();
    textareaElem.on('keydown', (event: JQuery.KeyDownEvent) => {
      switch (event.code) {
        case 'Escape':
          // Revert to previous text ...
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

    textareaElem.on('keypress', (event: JQuery.KeyPressEvent) => {
      const c = String.fromCharCode(event.which!);
      const text = this.getTextareaElem().val() + c;
      this._topic.setText(text);
      this.resize(text);

      this.fireEvent('input', [event, text]);
      event.stopPropagation();
    });

    // If the user clicks on the input, all event must be ignored ...
    containerElem.on('click', (event: JQuery.Event) => {
      event.stopPropagation();
    });
    containerElem.on('dblclick', (event: JQuery.Event) => {
      event.stopPropagation();
    });
    containerElem.on('mousedown', (event: JQuery.Event) => {
      event.stopPropagation();
    });
  }

  private resize(text?: string): void {
    // Force relayout ...
    EventBus.instance.fireEvent('forceLayout');

    // Adjust position ...
    const textShape = this._topic.getOrBuildTextShape();
    const { top, left } = textShape.getNativePosition();
    this._containerElem.offset({ top, left });

    const textValue = text || this.getTextAreaText();
    const textElem = this.getTextareaElem();

    const rows = [...textValue].filter((x) => x === '\n').length + 1;
    const maxLineLength = Math.max(...textValue.split('\n').map((l) => l.length));

    textElem.attr('cols', maxLineLength);
    textElem.attr('rows', rows);

    this._containerElem.css({
      width: `${maxLineLength + 2}em`,
      height: textElem?.height() || 0,
    });
  }

  private updateModel() {
    const text = this.getTextAreaText();
    const topicId = this._topic.getId();

    const actionDispatcher = ActionDispatcher.getInstance();
    try {
      actionDispatcher.changeTextToTopic([topicId], text);
    } catch (e) {
      // Hack: For some reasom, editor seems to end up connected to a deleted node.
      // More research required.
      console.error(e);
      console.error(`Text could not be update -> ${JSON.stringify(e)}`);
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
    this._containerElem.css('display', 'block');

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

  private setStyle(fontStyle: FontStyle) {
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

    /* eslint-enable no-param-reassign */
    const cssStyle = {
      'font-size': `${fontStyle.size}px`,
      'font-family': fontStyle.fontFamily,
      'font-style': fontStyle.style,
      'font-weight': fontStyle.weight,
      color: fontStyle.color!,
    };
    inputField.css(cssStyle);
    this._containerElem.css(cssStyle);
  }

  private setText(text: string): void {
    const textareaElem = this.getTextareaElem();
    textareaElem.val(text);

    this._topic.setText(text);

    this.resize(text);
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
    // Revert to all text ...
    this._topic.setText(this._oldText);

    if (update) {
      this.updateModel();
    }
    // Remove it form the screen ...
    this._containerElem.remove();

    // Restore topoc share visibility ...
    this._topic.getOrBuildTextShape().setVisibility(true);

    this.resize();

    // Purge ...
    this._onClose();
  }
}

class MultitTextEditor {
  // eslint-disable-next-line no-use-before-define
  private static instance: MultitTextEditor = new MultitTextEditor();

  private _component: EditorComponent | null;

  constructor() {
    this._component = null;
  }

  static getInstance(): MultitTextEditor {
    return MultitTextEditor.instance;
  }

  isActive(): boolean {
    return this._component !== null;
  }

  show(topic: Topic, textOverwrite?: string): void {
    // Is it active ?
    if (this._component) {
      console.error('Editor was already displayed. Please, close it');
      this._component.close(false);
    }
    // Create a new instance
    this._component = new EditorComponent(topic, () => {
      this._component = null;
    });
    this._component.show(textOverwrite);
  }

  close(update: boolean): void {
    if (this._component) {
      this._component.close(update);
      this._component = null;
    }
  }
}
export default MultitTextEditor;
