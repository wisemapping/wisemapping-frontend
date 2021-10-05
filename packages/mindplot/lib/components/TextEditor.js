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
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
const web2D = require('@wismapping/web2d');

const web2d = web2D();

const ActionDispatcher = require('./ActionDispatcher').default;

// FIXME: Not used!
const TextEditor = new Class({
  initialize(topic) {
    this._topic = topic;
  },

  _buildEditor() {
    this._size = { width: 500, height: 100 };
    const result = new Element('div');
    result.setStyles({
      position: 'absolute',
      display: 'none',
      zIndex: '8',
      width: '500px',
      height: '100px',
    });

    const inputContainer = new Element('div');
    inputContainer.setStyles({
      border: 'none',
      overflow: 'auto',
    });
    inputContainer.inject(result);

    const inputText = new Element('input',
      {
        type: 'text',
        tabindex: '-1',
        value: '',
      });
    inputText.setStyles({
      border: 'none',
      background: 'transparent',
    });
    inputText.inject(inputContainer);

    const spanContainer = new Element('div');
    spanContainer.setStyle('visibility', 'hidden');
    spanContainer.inject(result);

    const spanElem = new Element('span', { tabindex: '-1' });
    spanElem.setStyle('white-space', 'nowrap');
    spanElem.setStyle('nowrap', 'nowrap');
    spanElem.inject(spanContainer);

    return result;
  },

  _registerEvents(divElem) {
    const inputElem = this._getTextareaElem();
    const spanElem = this._getSpanElem();
    const me = this;

    divElem.addEvent('keydown', (event) => {
      switch (event.key) {
        case 'esc':
          me.close(false);
          break;
        case 'enter':
          me.close(true);
          break;
        default:
          spanElem.innerHTML = inputElem.value;
          var size = inputElem.value.length + 1;
          inputElem.size = size;
          if (spanElem.offsetWidth > (parseInt(divElem.style.width) - 100)) {
            divElem.style.width = `${spanElem.offsetWidth + 100}px`;
          }
          break;
      }
      event.stopPropagation();
    });

    // If the user clicks on the input, all event must be ignored ...
    divElem.addEvent('click', (event) => {
      event.stopPropagation();
    });
    divElem.addEvent('dblclick', (event) => {
      event.stopPropagation();
    });
    divElem.addEvent('mousedown', (event) => {
      event.stopPropagation();
    });
  },

  isVisible() {
    return $defined(this._containerElem) && this._containerElem.getStyle('display') == 'block';
  },

  _updateModel() {
    if (this._topic.getText() != this._getText()) {
      const text = this._getText();
      const topicId = this._topic.getId();

      const actionDispatcher = ActionDispatcher.getInstance();
      actionDispatcher.changeTextToTopic([topicId], text);
    }
  },

  show(text) {
    if (!this.isVisible()) {
      // Create editor ui
      const editorElem = this._buildEditor();
      editorElem.inject($(document.body)[0]);

      this._containerElem = editorElem;
      this._registerEvents(editorElem);
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

    // Set editor's initial text
    const text = $defined(defaultText) ? defaultText : topic.getText();
    this._setText(text);

    const me = this;
    // Set editor's initial size
    const displayFunc = function () {
      // Position the editor and set the size...
      const textShape = me._topic.getTextShape();

      me._containerElem.css('display', 'block');

      me._containerElem.offset(textShape.getNativePosition());
      // Set size ...
      const elemSize = topic.getSize();
      me._setEditorSize(elemSize.width, elemSize.height);

      const textareaElem = me._getTextareaElem();
      textareaElem.focus();
      me._positionCursor(textareaElem, !$defined(defaultText));
    };

    displayFunc.delay(10);
  },

  _setStyle(fontStyle) {
    const inputField = this._getTextareaElem();
    const spanField = this._getSpanElem();
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
    inputField.style.fontSize = `${fontStyle.size}px`;
    inputField.style.fontFamily = fontStyle.font;
    inputField.style.fontStyle = fontStyle.style;
    inputField.style.fontWeight = fontStyle.weight;
    inputField.style.color = fontStyle.color;
    spanField.style.fontFamily = fontStyle.font;
    spanField.style.fontStyle = fontStyle.style;
    spanField.style.fontWeight = fontStyle.weight;
    spanField.style.fontSize = `${fontStyle.size}px`;
  },

  _setText(text) {
    const inputField = this._getTextareaElem();
    inputField.size = text.length + 1;
    this._containerElem.style.width = `${inputField.size * parseInt(inputField.style.fontSize) + 100}px`;
    const spanField = this._getSpanElem();
    spanField.innerHTML = text;
    inputField.value = text;
  },

  _getText() {
    return this._getTextareaElem().value;
  },

  _getTextareaElem() {
    return this._containerElem.getElement('input');
  },

  _getSpanElem() {
    return this._containerElem.getElement('span');
  },

  _setEditorSize(width, height) {
    const textShape = this._topic.getTextShape();
    const scale = web2d.utils.TransformUtil.workoutScale(textShape._peer);
    this._size = { width: width * scale.width, height: height * scale.height };
    this._containerElem.style.width = `${this._size.width * 2}px`;
    this._containerElem.style.height = `${this._size.height}px`;
  },

  _positionCursor(inputElem, selectText) {
    // Select text if it's required ...
    if (inputElem.createTextRange) // ie
    {
      const range = inputElem.createTextRange();
      const pos = inputElem.value.length;
      if (!selectText) {
        range.select();
        range.move('character', pos);
      } else {
        range.move('character', pos);
        range.select();
      }
    } else if (!selectText) {
      inputElem.setSelectionRange(0, inputElem.value.length);
    }
  },

  close(update) {
    if (this.isVisible()) {
      // Update changes ...
      if (!$defined(update) || update) {
        this._updateModel();
      }

      // Let make the visible text in the node visible again ...
      this._topic.getTextShape().setVisibility(true);

      // Remove it form the screen ...
      this._containerElem.dispose();
      this._containerElem = null;
    }
  },
});

export default TextEditor;
