/* eslint-disable max-classes-per-file */
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
import { FontStyle } from '@wisemapping/web2d/src/components/peer/svg/FontPeer';

import DOMUtils from './util/DOMUtils';
import EventManager from './util/EventManager';
import ActionDispatcher from './ActionDispatcher';
import EventDispatcher from './EventDispatcher';
import LayoutEventBus from './layout/LayoutEventBus';
import Topic from './Topic';

type EditorEventType = 'input';

class EditorComponent extends EventDispatcher<EditorEventType> {
  private _topic: Topic;

  private _oldText: string | undefined;

  private _containerElem: HTMLElement;

  private _onClose: () => void;

  constructor(topic: Topic, onClose: () => void) {
    super();
    this._topic = topic;

    // Create editor ui
    this._containerElem = EditorComponent.buildEditor();
    const mindmapComp = document.getElementById('mindmap-comp');
    if (mindmapComp && mindmapComp.parentElement) {
      mindmapComp.parentElement.appendChild(this._containerElem);
    }
    this.registerEvents(this._containerElem);
    this._oldText = topic.getText();
    this._onClose = onClose;
  }

  getTopic(): Topic {
    return this._topic;
  }

  private static buildEditor(): HTMLElement {
    const result = DOMUtils.createElement('div');
    DOMUtils.attr(result, 'id', 'textContainer');
    DOMUtils.css(result, 'display', 'none');
    DOMUtils.css(result, 'zIndex', '8');
    DOMUtils.css(result, 'border', '0 none');

    const textareaElem = DOMUtils.createElement('textarea');
    DOMUtils.attr(textareaElem, 'tabindex', '-1');
    DOMUtils.attr(textareaElem, 'value', '');
    DOMUtils.attr(textareaElem, 'wrap', 'off');
    // Prevent browser extensions from interfering with this textarea
    DOMUtils.attr(textareaElem, 'autocomplete', 'off');
    DOMUtils.attr(textareaElem, 'data-lpignore', 'true'); // LastPass ignore
    DOMUtils.attr(textareaElem, 'data-form-type', 'other'); // 1Password ignore
    DOMUtils.attr(textareaElem, 'data-1p-ignore', 'true'); // 1Password ignore
    DOMUtils.css(textareaElem, 'border', '0px');
    DOMUtils.css(textareaElem, 'background', 'rgba(0, 0, 0, 0)');
    DOMUtils.css(textareaElem, 'outline', '0 none');
    DOMUtils.css(textareaElem, 'resize', 'none');
    DOMUtils.css(textareaElem, 'overflow', 'hidden');
    DOMUtils.css(textareaElem, 'padding', '0px 0px 0px 0px');
    DOMUtils.css(textareaElem, 'lineHeight', '100%');
    DOMUtils.css(textareaElem, 'width', '100%');

    DOMUtils.append(result, textareaElem);
    return result;
  }

  private registerEvents(containerElem: HTMLElement): void {
    const textareaElem = this.getTextareaElem();
    EventManager.bind(textareaElem, 'keydown', (event: Event) => {
      switch ((event as KeyboardEvent).code) {
        case 'Escape':
          // Revert to previous text ...
          this.close(false);
          break;
        case 'Enter': {
          const keyboardEvent = event as KeyboardEvent;
          if (keyboardEvent.metaKey || keyboardEvent.ctrlKey) {
            keyboardEvent.preventDefault();

            const text = this.getTextAreaText();
            const selectionStart = textareaElem.selectionStart ?? text.length;
            const selectionEnd = textareaElem.selectionEnd ?? selectionStart;
            const head = text.substring(0, selectionStart);
            const tail = text.substring(selectionEnd);
            const newText = `${head}\n${tail}`;

            this.setText(newText);
            this.fireEvent('input', [event, newText]);

            textareaElem.focus();
            const newCursorPosition = selectionStart + 1;
            textareaElem.setSelectionRange(newCursorPosition, newCursorPosition);
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

    EventManager.bind(textareaElem, 'keypress', (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      const c = keyboardEvent.key;

      // Skip special keys that shouldn't be added to text
      if (
        c.length === 1 &&
        !keyboardEvent.ctrlKey &&
        !keyboardEvent.metaKey &&
        !keyboardEvent.altKey
      ) {
        const text = DOMUtils.val(this.getTextareaElem()) + c;
        this._topic.setText(text);
        this.resize(text);

        this.fireEvent('input', [event, text]);
      }
      event.stopPropagation();
    });

    // If the user clicks on the input, all event must be ignored ...
    EventManager.bind(containerElem, 'click', (event: Event) => {
      event.stopPropagation();
    });
    EventManager.bind(containerElem, 'dblclick', (event: Event) => {
      event.stopPropagation();
    });
    EventManager.bind(containerElem, 'mousedown', (event: Event) => {
      event.stopPropagation();
    });
  }

  private resize(text?: string): void {
    // Force relayout ...
    LayoutEventBus.fireEvent('forceLayout');

    // Adjust position ...
    const textShape = this._topic.getOrBuildTextShape();
    const { top, left } = textShape.getNativePosition();
    this._containerElem.style.position = 'absolute';
    this._containerElem.style.top = `${top}px`;
    this._containerElem.style.left = `${left}px`;

    const mindmapCompData = document.getElementById('mindmap-comp')?.getBoundingClientRect();
    const maxWidth = mindmapCompData ? mindmapCompData.width - left : 0;

    const textValue = text || this.getTextAreaText();
    const textElem = this.getTextareaElem();

    const rows = [...textValue].filter((x) => x === '\n').length + 1;
    const maxLineLength = Math.max(...textValue.split('\n').map((l) => l.length));

    DOMUtils.attr(textElem, 'cols', maxLineLength.toString());
    DOMUtils.attr(textElem, 'rows', rows.toString());

    DOMUtils.css(this._containerElem, 'maxWidth', `${maxWidth}px`);
    DOMUtils.css(this._containerElem, 'width', `${maxLineLength + 2}em`);
    DOMUtils.css(this._containerElem, 'height', '0');
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
    DOMUtils.css(this._containerElem, 'display', 'block');

    // Set editor's initial text. If the text has not been specifed, it will be empty
    const modelText = topic.getModel().getText();
    const text = textOverwrite || modelText || '';
    this.setText(text);

    // Set the element focus and select the current text ...
    const textAreaElem = this.getTextareaElem();
    if (textAreaElem) {
      this.positionCursor(textAreaElem, textOverwrite === undefined);
    }
    textAreaElem.focus();
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
    } else if (fontStyle.weight !== 'normal' && fontStyle.weight !== 'bold') {
      // Keep semantic weights; rendering layer will map if needed
      // No need to assign to itself, just keep the existing value
    }

    const cssStyle = {
      'font-size': `${fontStyle.size}px`,
      'font-family': fontStyle.fontFamily,
      'font-style': fontStyle.style,
      'font-weight': fontStyle.weight,
      color: fontStyle.color!,
    };
    Object.keys(cssStyle).forEach((prop) => {
      DOMUtils.css(inputField, prop, cssStyle[prop]);
      DOMUtils.css(this._containerElem, prop, cssStyle[prop]);
    });
  }

  private setText(text: string): void {
    const textareaElem = this.getTextareaElem();
    DOMUtils.val(textareaElem, text);

    this._topic.setText(text);

    this.resize(text);
  }

  private getTextAreaText(): string {
    return DOMUtils.val(this.getTextareaElem()) as string;
  }

  private getTextareaElem(): HTMLTextAreaElement {
    return DOMUtils.find(this._containerElem, 'textarea')[0] as HTMLTextAreaElement;
  }

  private positionCursor(textareaElem: HTMLTextAreaElement, selectText: boolean) {
    const { length } = this.getTextAreaText();
    const start = selectText ? 0 : length;
    textareaElem.focus();
    textareaElem.setSelectionRange(start, length);
  }

  close(update: boolean): void {
    // Revert to all text ...
    this._topic.setText(this._oldText);

    if (update) {
      this.updateModel();
    }
    // Remove it form the screen ...
    DOMUtils.remove(this._containerElem);

    // Restore topoc share visibility ...
    this._topic.getOrBuildTextShape().setVisibility(true);

    this.resize();

    // Purge ...
    this._onClose();
  }
}

class MultitTextEditor {
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

  getActiveTopic(): Topic | null {
    return this._component ? this._component.getTopic() : null;
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
