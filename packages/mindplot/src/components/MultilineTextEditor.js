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
import Events from './Events';
import ActionDispatcher from './ActionDispatcher';

const MultilineTextEditor = new Class({
  Extends: Events,
  initialize() {
    this._topic = null;
    this._timeoutId = -1;
  },

  _buildEditor() {
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
  },

  _registerEvents(containerElem) {
    const textareaElem = this._getTextareaElem();
    const me = this;
    textareaElem.on('keydown', function (event) {
      switch (jQuery.hotkeys.specialKeys[event.keyCode]) {
        case 'esc':
          me.close(false);
          break;
        case 'enter':
          if (event.metaKey || event.ctrlKey) {
            // Add return ...
            const text = textareaElem.val();
            let cursorPosition = text.length;
            if (textareaElem.selectionStart) {
              cursorPosition = textareaElem.selectionStart;
            }

            const head = text.substring(0, cursorPosition);
            let tail = '';
            if (cursorPosition < text.length) {
              tail = text.substring(cursorPosition, text.length);
            }
            textareaElem.val(`${head}\n${tail}`);

            // Position cursor ...
            if (textareaElem[0].setSelectionRange) {
              textareaElem.focus();
              textareaElem[0].setSelectionRange(cursorPosition + 1, cursorPosition + 1);
            } else if (textareaElem.createTextRange) {
              const range = textareaElem.createTextRange();
              range.moveStart('character', cursorPosition + 1);
              range.select();
            }
          } else {
            me.close(true);
          }
          break;
        case 'tab':
          event.preventDefault();
          var start = $(this).get(0).selectionStart;
          var end = $(this).get(0).selectionEnd;

          // set textarea value to: text before caret + tab + text after caret
          $(this).val(`${$(this).val().substring(0, start)}\t${$(this).val().substring(end)}`);

          // put caret at right position again
          $(this).get(0).selectionStart = $(this).get(0).selectionEnd = start + 1;
          break;
      }
      event.stopPropagation();
    });

    textareaElem.on('keypress', (event) => {
      event.stopPropagation();
    });

    textareaElem.on('keyup', (event) => {
      const text = me._getTextareaElem().val();
      me.fireEvent('input', [event, text]);
      me._adjustEditorSize();
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
  },

  _adjustEditorSize() {
    if (this.isVisible()) {
      const textElem = this._getTextareaElem();

      const lines = textElem.val().split('\n');
      let maxLineLength = 1;
      _.each(lines, (line) => {
        if (maxLineLength < line.length) maxLineLength = line.length;
      });

      textElem.attr('cols', maxLineLength);
      textElem.attr('rows', lines.length);

      this._containerElem.css({
        width: `${maxLineLength + 3}em`,
        height: textElem.height(),
      });
    }
  },

  isVisible() {
    return $defined(this._containerElem) && this._containerElem.css('display') == 'block';
  },

  _updateModel() {
    if (this._topic.getText() != this._getText()) {
      const text = this._getText();
      const topicId = this._topic.getId();

      const actionDispatcher = ActionDispatcher.getInstance();
      actionDispatcher.changeTextToTopic([topicId], text);
    }
  },

  show(topic, text) {
    // Close a previous node editor if it's opened ...
    if (this._topic) {
      this.close(false);
    }

    this._topic = topic;
    if (!this.isVisible()) {
      // Create editor ui
      const containerElem = this._buildEditor();
      $('body').append(containerElem);

      this._containerElem = containerElem;
      this._registerEvents(containerElem);
      this._showEditor(text);
    }
  },

  _showEditor(defaultText) {
    const topic = this._topic;

    // Hide topic text ...
    topic.getTextShape().setVisibility(false);

    // Set Editor Style
    const nodeText = topic.getTextShape();
    const font = nodeText.getFont();
    font.size = nodeText.getHtmlFontSize();
    font.color = nodeText.getColor();
    this._setStyle(font);
    const me = this;
    // Set editor's initial size
    const displayFunc = function () {
      // Position the editor and set the size...
      const textShape = topic.getTextShape();

      me._containerElem.css('display', 'block');

      // FIXME: Im not sure if this is best way...
      const shapePosition = textShape.getNativePosition();
      me._containerElem.offset(shapePosition);

      // Set editor's initial text ...
      const text = $defined(defaultText) ? defaultText : topic.getText();
      me._setText(text);

      // Set the element focus and select the current text ...
      const inputElem = me._getTextareaElem();
      me._positionCursor(inputElem, !$defined(defaultText));
    };

    this._timeoutId = displayFunc.delay(10);
  },

  _setStyle(fontStyle) {
    const inputField = this._getTextareaElem();
    if (!$defined(fontStyle.font)) {
      fontStyle.font = 'Arial';
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
    const style = {
      fontSize: `${fontStyle.size}px`,
      fontFamily: fontStyle.font,
      fontStyle: fontStyle.style,
      fontWeight: fontStyle.weight,
      color: fontStyle.color,
    };
    inputField.css(style);
    this._containerElem.css(style);
  },

  _setText(text) {
    const textareaElem = this._getTextareaElem();
    textareaElem.val(text);
    this._adjustEditorSize();
  },

  _getText() {
    return this._getTextareaElem().val();
  },

  _getTextareaElem() {
    return this._containerElem.find('textarea');
  },

  _positionCursor(textareaElem, selectText) {
    textareaElem.focus();
    const lengh = textareaElem.val().length;
    if (selectText) {
      // Mark text as selected ...
      if (textareaElem.createTextRange) {
        const rang = textareaElem.createTextRange();
        rang.select();
        rang.move('character', lengh);
      } else {
        textareaElem[0].setSelectionRange(0, lengh);
      }
    } else {
      // Move the cursor to the last character ..
      if (textareaElem.createTextRange) {
        const range = textareaElem.createTextRange();
        range.move('character', lengh);
      } else {
        if (Browser.ie11) {
          textareaElem[0].selectionStart = lengh;
          textareaElem[0].selectionEnd = lengh;
        } else {
          textareaElem.selectionStart = lengh;
          textareaElem.selectionEnd = lengh;
        }
        textareaElem.focus();
      }
    }
  },

  close(update) {
    if (this.isVisible() && this._topic) {
      // Update changes ...
      clearTimeout(this._timeoutId);

      if (!$defined(update) || update) {
        this._updateModel();
      }

      // Let make the visible text in the node visible again ...
      this._topic.getTextShape().setVisibility(true);

      // Remove it form the screen ...
      this._containerElem.remove();
      this._containerElem = null;
      this._timeoutId = -1;
    }
    this._topic = null;
  },
});

export default MultilineTextEditor;
