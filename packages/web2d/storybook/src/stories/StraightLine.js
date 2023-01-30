/* eslint-disable import/prefer-default-export */
// eslint-disable-next-line import/prefer-default-export
import StraightLine from '../../../src/components/StraightLine';
import Workspace from '../../../src/components/Workspace';

export const createStraightLine = ({
  strokeColor,
  strokeWidth,
  strokeStyle,
}) => {
  const divElem = document.createElement('div');

  const workspace = new Workspace();
  workspace.setSize('400px', '400px');
  workspace.setCoordSize(300, 300);
  workspace.setCoordOrigin(-150, -150);

  const line = new StraightLine();
  line.setFrom(100, 100);
  line.setTo(-100, -100);

  line.setStroke(strokeWidth, strokeStyle, strokeColor, 1);
  workspace.append(line);

  workspace.addItAsChildTo(divElem);
  return divElem;
};
