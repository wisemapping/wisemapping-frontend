import $ from 'jquery';
import * as src from '../../src';

global.$ = $;

let xScale = 1000;
let yScale = 600;
let shapeOrigX = 0;

const workspace = new src.Workspace();
workspace.setSize(`${xScale}px`, `${yScale}px`);
workspace.setCoordSize(xScale, yScale);
workspace.setCoordOrigin(0, 0);
workspace.setFill('#f0f0f0');

// Center Topic Rect ...
const centralRect = new src.Rect(0.3);
centralRect.setSize(200, 60);
centralRect.setPosition(300, 300);
centralRect.setFill('#99ccff');
centralRect.setStroke(1, 'solid', '#878b8f');
workspace.append(centralRect);

workspace.addItAsChildTo($('#divWorkspace'));

global.zoomIn = function zoomIn() {
  xScale /= 2;
  yScale /= 2;
  workspace.setSize(`${xScale}px`, `${yScale}px`);
};

global.zoomOut = function zoomOut() {
  xScale *= 2;
  yScale *= 2;
  workspace.setSize(`${xScale}px`, `${yScale}px`);
};

global.createShape = function createShape() {
  // Secondary Idea...
  const nodeGroup = new src.Group();
  nodeGroup.setSize(200, 60);
  nodeGroup.setCoordSize(200, 60);
  nodeGroup.setPosition(700, shapeOrigX);
  shapeOrigX += 50;

  const outerRect = new src.Rect();
  outerRect.setSize(200, 100);
  outerRect.setVisibility(false);
  outerRect.setPosition(0, 0);
  outerRect.setFill('#3e9eff');
  outerRect.setStroke(1, 'solid', '#878b8f');
  nodeGroup.append(outerRect);

  const inerRect = new src.Rect(0.3);
  inerRect.setSize(190, 85);
  inerRect.setPosition(5, 10);
  inerRect.setFill('white');
  inerRect.setStroke(1, 'dash', '#878b8f');
  nodeGroup.append(inerRect);
  nodeGroup._drag = false;

  workspace.append(nodeGroup);

  // Add behaviour ...
  inerRect.addEvent('mouseover', () => {
    outerRect.setVisibility(true);
  });
  inerRect.addEvent('mouseout', () => {
    if (!nodeGroup._drag) {
      outerRect.setVisibility(false);
    }
  });

  nodeGroup.addEvent('mousedown', function addEvent(e) {
    const shadowGroup = new src.Group();
    shadowGroup.setSize(200, 60);
    shadowGroup.setCoordSize(200, 60);

    const position = nodeGroup.getPosition();
    shadowGroup.setPosition(position.x, position.y);

    const shadowRect = new src.Rect(0.3);
    shadowRect.setSize(190, 85);
    shadowRect.setPosition(5, 10);
    shadowRect.setFill('white', 0.3);
    shadowRect.setStroke(1, 'dash', '#878b8f');
    shadowGroup.append(shadowRect);

    workspace.append(shadowGroup);

    this._shadowGroup = shadowGroup;
    if (!this._moveFunction) {
      nodeGroup._drag = true;
      workspace._moveFunction = (event) => {
        // Esto mas o menos funciona por que el size del workspace es 1 a uno con
        // el del la pantalla.
        let posx = 0;
        let posy = 0;
        if (event.pageX || event.pageY) {
          posx = e.pageX;
          posy = e.pageY;
        } else if (event.clientX || event.clientY) {
          posx = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
          posy = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        shadowGroup.setPosition(posx - 50, posy - 150);
      };
    }
    workspace.addEvent('mousemove', workspace._moveFunction);
    const mouseUp = () => {
      workspace.removeChild(shadowGroup);

      const pos = shadowGroup.getPosition();
      nodeGroup.setPosition(pos.x, pos.y);
      nodeGroup._drag = false;
      outerRect.setVisibility(true);
      workspace.removeEvent('mousemove', workspace._moveFunction);
      workspace.removeEvent('mouseup', mouseUp);
    };
    workspace.addEvent('mouseup', mouseUp);
  });
};
