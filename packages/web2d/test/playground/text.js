import $ from 'jquery';
import {
  Toolkit, Workspace, Text,
} from '../../src';
import TransformUtils from '../../src/components/peer/utils/TransformUtils';

const workspaces = [];
global.$ = $;

global.zoomIn = function zoomIn() {
  for (let i = 0; i < workspaces.length; i++) {
    const coordSize = workspaces[i].getCoordSize();
    workspaces[i].setCoordSize(coordSize.width * 2, coordSize.height * 2);
  }
};

const textTestHelper = function textTestHelper(coordSize, textval, font, fontSizeval, style, modifier, fontColor, htmlElemId, iesimo) {
  const workspace = new Workspace();

  workspace.setSize('300px', '100px');
  workspace.setCoordSize('coordSize', coordSize);
  workspace.setCoordOrigin(0, 0);
  workspace.addItAsChildTo($(`#${htmlElemId}`));

  const text = new Text();

  const scale = TransformUtils.workoutScale(text.peer);
  text.setText(`${textval} - Scale: ${scale.height}`);
  text.setFont(font, fontSizeval, style, modifier);
  text.setPosition(0, 0);
  text.setColor(fontColor);
  workspace.append(text);

  const parent = document.getElementById(htmlElemId);
  const span = document.createElement('span');
  span.setAttribute('id', `textoHTML${iesimo}`);
  const textsize = `${textval} - Scale: ${scale.height}`;
  const textHtml = document.createTextNode(textsize);
  const fontSize = text.getHtmlFontSize();
  span.append(textHtml);
  span.setAttribute('style', `font-weight:${modifier};font-style: ${style}; font-size:${fontSize}pt; font-family: ${font};width:30;height:30;`);

  parent.append(span);
  workspaces[iesimo] = workspace;
};

Toolkit.init();
textTestHelper(200, 'Test Text 1', 'Arial', 10, 'normal', 'normal', 'red', 'text0', 0);
textTestHelper(100, 'Test Text 2', 'Arial', 10, 'normal', 'normal', 'blue', 'text1', 1);
textTestHelper(50, 'Test Text 3', 'Arial', 10, 'normal', 'normal', 'blue', 'text2', 2);
textTestHelper(100, 'Test Text 4', 'Arial', 10, 'italic', 'normal', 'blue', 'text3', 3);
textTestHelper(100, 'Test Text 5', 'Arial', 10, 'italic', 'bold', 'green', 'text4', 4);
textTestHelper(100, 'Test Text 6 \nMultiline', 'Arial', 10, 'italic', 'bold', 'green', 'text5', 5);
