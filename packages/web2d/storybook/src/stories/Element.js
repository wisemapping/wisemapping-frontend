/* eslint-disable import/prefer-default-export */
// eslint-disable-next-line import/prefer-default-export
import Rect from '../../../src/components/Rect';
import Ellipse from '../../../src/components/Ellipse';
import Workspace from '../../../src/components/Workspace';

export const createElement = ({
  visibility = true,
  visibilityDelay = 0,
  fillOpacity = 1,
  strokeOpacity = 1,
  onClick,
  onMouseOver,
  onMouseOut,
  onDblClick,
}) => {
  const divElem = document.createElement('div');

  const workspace = new Workspace();
  workspace.setSize('400px', '400px');
  workspace.setCoordSize(300, 300);
  workspace.setCoordOrigin(-150, -150);

  const rect = new Rect();
  rect.setSize(100, 100);
  rect.setPosition(-50, -50);
  rect.setVisibility(visibility, visibilityDelay);
  rect.setStroke(2, 'solid', 'red', strokeOpacity);
  rect.setFill('gray', fillOpacity);

  rect.addEvent('click', onClick);
  rect.addEvent('mouseover', onMouseOver);
  rect.addEvent('mouseout', onMouseOut);
  rect.addEvent('dblclick', onDblClick);

  // Add referene point ...
  const e1 = new Ellipse();
  e1.setSize(70, 70);
  e1.setPosition(0, 0);
  e1.setFill('red', fillOpacity);
  e1.setStroke(2, 'solid', 'blue', strokeOpacity);
  e1.setVisibility(visibility, visibilityDelay);

  e1.addEvent('click', onClick);
  e1.addEvent('mouseover', onMouseOver);
  e1.addEvent('mouseout', onMouseOut);
  e1.addEvent('dblclick', onDblClick);

  workspace.append(rect);
  workspace.append(e1);
  workspace.addItAsChildTo(divElem);

  return divElem;
};

export const createEventRegistration = ({
  enableForWorkspace,
  enableForInnerCircle,
  enableForOuterCircle,
  stopEventPropagation,
  onClick,
  onMouseOver,
  onMouseOut,
  onDblClick,
}) => {
  const registerEvent = (type, elem, action) => {
    elem.addEvent(type, (event) => {
      action(event);
      if (stopEventPropagation) {
        event.stopPropagation();
      }
    });
  };

  const divElem = document.createElement('div');

  // Workspace with CoordOrigin(100,100);
  const workspace = new Workspace();
  workspace.setSize('150px', '150px');
  workspace.setCoordSize(150, 150);

  const bigElipse = new Ellipse();
  bigElipse.setSize(100, 100);
  bigElipse.setPosition(75, 75);
  workspace.append(bigElipse);

  const smallElipse = new Ellipse();
  smallElipse.setSize(50, 50);
  smallElipse.setPosition(75, 75);
  smallElipse.setFill('red');
  workspace.append(smallElipse);

  if (enableForWorkspace) {
    registerEvent('click', workspace, onClick);
    registerEvent('mouseover', workspace, onMouseOver);
    registerEvent('mouseout', workspace, onMouseOut);
    registerEvent('dblclick', workspace, onDblClick);
  }

  if (enableForInnerCircle) {
    registerEvent('click', smallElipse, onClick);
    registerEvent('mouseover', smallElipse, onMouseOver);
    registerEvent('mouseout', smallElipse, onMouseOut);
    registerEvent('dblclick', smallElipse, onDblClick);
  }

  if (enableForOuterCircle) {
    registerEvent('click', bigElipse, onClick);
    registerEvent('mouseover', bigElipse, onMouseOver);
    registerEvent('mouseout', bigElipse, onMouseOut);
    registerEvent('dblclick', bigElipse, onDblClick);
  }

  workspace.addItAsChildTo(divElem);
  return divElem;
};
