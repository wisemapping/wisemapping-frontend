import EditorImage from '../../../assets/images/editortoolbar.png';

export const css = `
.palette-panel {
    cursor: default;
    font: normal 13px "Helvetica Neue", Helvetica, Arial, sans-serif;
    margin: 0;
    outline: none;
    padding: 4px 0;
    z-index: 20000;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

.palette {
    cursor: default;
    outline: none;
}

.palette-table {
    border: 1px solid #666;
    border-collapse: collapse;
    margin: 5px;
}

tbody {
    display: table-row-group;
    vertical-align: middle;
    border-color: inherit;
}

.palette-table {
    border-collapse: collapse;
}

tr {
    display: table-row;
    vertical-align: inherit;
    border-color: inherit;
}

.palette-cell {
    border: 0;
    border-right: 1px solid #666;
    cursor: pointer;
    height: 18px;
    margin: 0;
    text-align: center;
    vertical-align: middle;
    width: 18px;
}

.palette-cell .palette-colorswatch {
    border: none;
    font-size: x-small;
    height: 18px;
    position: relative;
    width: 18px;
}

.palette-cell-selected .palette-colorswatch {
    background: url(${EditorImage}) no-repeat -368px 0;
    border: 1px solid #333;
    color: white;
    font-weight: bold;
    height: 16px;
    width: 16px;
}

.palette-colorswatch:hover {
    border: 1px solid white;
    height: 16px;
    width: 16px;
}
`;

export const cell = (color) => `<td class="palette-cell palette-cell-selected">
<div class="palette-colorswatch" style="background-color: rgb${color};"
    title="RGB ${color}"></div>
</td>`;

export const row = (colors) => `
<tr class="palette-row">
  ${colors.map((c) => cell(c)).join('\n')}
</tr>
`;

export const palette = (rows, id) => `
  <div class="palette" id="${id}">
    <table class="palette-table" cellspacing="0" cellpadding="0" role="grid"
        aria-activedescendent="palette-cell-244">
        <tbody class="palette-body">
          ${rows.map((r) => row(r)).join('\n')}
        </tbody>
    </table>
  </div>
  `;

export const buildHtml = () => {
  const palettes = [
    {
      id: ':3p',
      colors: [['(0, 0, 0)', '(68, 68, 68)', '(102, 102, 102)', '(153, 153, 153)', '(204, 204, 204)', '(238, 238, 238)', '(243, 243, 243)', '(254, 255, 255)']],
    },
    {
      id: '3q',
      colors: [['(255, 0, 0)', '(255, 153, 0)', '(255, 255, 0)', '(0, 255, 0)', '(0, 255, 255)', '(0, 0, 255)', '(153, 0, 255)', '(255, 0, 255)']],
    },
    {
      id: '3r',
      colors: [
        ['(244, 204, 204)', '(252, 229, 205)', '(255, 242, 204)', '(217, 234, 211)', '(208, 224, 227)', '(207, 226, 243)', '(217, 210, 233)', '(234, 209, 220)'],
        ['(234, 153, 153)', '(249, 203, 156)', '(255, 229, 153)', '(182, 215, 168)', '(162, 196, 201)', '(159, 197, 232)', '(180, 167, 214)', '(213, 166, 189)'],
        ['(224, 102, 102)', '(246, 178, 107)', '(255, 217, 102)', '(147, 196, 125)', '(118, 165, 175)', '(111, 168, 220)', '(142, 124, 195)', '(194, 123, 160)'],
        ['(204, 0, 0)', '(230, 145, 56)', '(241, 194, 50)', '(106, 168, 79)', '(69, 129, 142)', '(61, 133, 198)', '(103, 78, 167)', '(166, 77, 121)'],
        ['(153, 0, 0)', '(180, 95, 6)', '(191, 144, 0)', '(56, 118, 29)', '(19, 79, 92)', '(11, 83, 148)', '(53, 28, 117)', '(116, 27, 71)'],
        ['(102, 0, 0)', '(120, 63, 4)', '(127, 96, 0)', '(39, 78, 19)', '(12, 52, 61)', '(7, 55, 99)', '(32, 18, 77)', '(76, 17, 48)'],
      ],
    },
    {
      id: '2p',
      colors: [['(255, 255, 255)', '(224, 229, 239)', '(80, 157, 192)', '(57, 113, 177)', '(2, 59, 185)', '(244, 184, 45)', '(241, 163, 39)', '(82, 92, 97)']],
    },
  ];

  return `<div id="color-palette" class="palette-panel palette-panel-vertical palette-panel-noaccel"
  style="-webkit-user-select: none; left: 451px; top: 128px; visibility: visible; " role="menu" aria-haspopup="true"
  aria-activedescendant="">
    ${palettes.map((p) => palette(p.colors, p.id)).join('\n')}
  </div>`;
};
