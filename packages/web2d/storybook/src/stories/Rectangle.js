/* eslint-disable import/prefer-default-export */
// eslint-disable-next-line import/prefer-default-export
import Rect from '../../../src/components/Rect';
import Elipse from '../../../src/components/Elipse';
import Workspace from '../../../src/components/Workspace';

export const createRectangle = ({
  backgroundColor,
  strokeColor,
  strokeWidth,
  onClick,
  strokeStyle,
  size,
  arc,
}) => {
  const divElem = document.createElement('div');

  const workspace = new Workspace();
  workspace.setSize('400px', '400px');
  workspace.setCoordSize(300, 300);
  workspace.setCoordOrigin(-150, -150);

  const rect = new Rect(arc);
  rect.setFill(backgroundColor);

  const parsedSize = JSON.parse(size);
  rect.setSize(parsedSize.width, parsedSize.height);

  rect.setPosition(-parsedSize.width / 2, -parsedSize.height / 2);

  rect.setStroke(strokeWidth, strokeStyle, strokeColor, 1);

  rect.addEvent('click', onClick);

  // Add referene point ...
  const e1 = new Elipse();
  e1.setSize(5, 5);
  e1.setPosition(0, 0);
  e1.setFill('red');

  workspace.append(rect);
  workspace.append(e1);
  workspace.addItAsChildTo(divElem);

  return divElem;
};
