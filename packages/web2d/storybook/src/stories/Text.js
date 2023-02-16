/* eslint-disable import/prefer-default-export */
// eslint-disable-next-line import/prefer-default-export
import Text from '../../../src/components/Text';
import Workspace from '../../../src/components/Workspace';

export const createText = ({
  text,
  fontFamily,
  color,
  weight,
  style,
}) => {
  const divElem = document.createElement('div');

  const workspace = new Workspace();
  workspace.setSize('400px', '400px');
  workspace.setCoordSize('400', '400');
  workspace.setCoordOrigin(0, 0);

  [6, 8, 10, 15, 20].forEach((size, i) => {
    const wText = new Text();
    workspace.append(wText);

    wText.setText(text);
    wText.setFont(fontFamily, size, style, weight);
    wText.setPosition(30, 70 * i);
    wText.setColor(color);
  });

  workspace.addItAsChildTo(divElem);
  return divElem;
};
