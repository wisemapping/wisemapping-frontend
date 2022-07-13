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

class Grid {
  constructor(parent, colums, rows) {
    const cellSize = '10px';
    this._parent = parent;
    this._container = Grid._createContainer();
    const tbody = $(this._container.firstChild.firstChild);
    for (let i = 0; i < rows; i++) {
      const trElement = $('<tr></tr>');
      for (let j = 0; j < colums; j++) {
        const tdElement = $('<td></td>');
        tdElement.css({
          width: cellSize,
          height: cellSize,
          borderWidth: '1px',
          borderStyle: 'dashed',
          borderColor: 'lightsteelblue',
        });
        trElement.append(tdElement);
      }
      tbody.append(trElement);
    }
  }

  setPosition(x, y) {
    this._container.style.left = x;
    this._container.style.top = y;
  }

  render() {
    $(this._parent).append(this._container);
  }

  static _createContainer() {
    const result = window.document.createElement('div');
    result.style.tableLayout = 'fixed';
    result.style.borderCollapse = 'collapse';
    result.style.emptyCells = 'show';
    result.style.position = 'absolute';
    result.innerHTML =
      '<table style="table-layout:fixed;border-collapse:collapse;empty-cells:show;"><tbody id="tableBody"></tbody></table>';
    return result;
  }
}

export default Grid;
