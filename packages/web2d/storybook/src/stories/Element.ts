/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
/* eslint-disable import/prefer-default-export */
// eslint-disable-next-line import/prefer-default-export
import Rect from '../../../src/components/Rect';
import Ellipse from '../../../src/components/Ellipse';
import Workspace from '../../../src/components/Workspace';

/** A Storybook action: it logs the event it receives in the Actions panel. */
export type Action = (event: Event) => void;

/** The event handlers of the event stories, and whether to show the on-page log. */
export type EventArgs = {
  onClick?: Action;
  onMouseOver?: Action;
  onMouseOut?: Action;
  onDblClick?: Action;
  eventLog?: boolean;
};

export type ElementArgs = EventArgs & {
  visibility?: boolean;
  visibilityDelay?: number;
  fillOpacity?: number;
  strokeOpacity?: number;
};

export type EventRegistrationArgs = EventArgs & {
  enableForWorkspace: boolean;
  enableForInnerCircle: boolean;
  enableForOuterCircle: boolean;
  stopEventPropagation: boolean;
};

type Log = (entry: string) => void;

// Optional on-page log of the events received, as "<element>:<type>" items, so Cypress can assert
// the event wiring (Storybook actions are only visible in the manager UI).
const createEventLog = (divElem: HTMLDivElement, enabled: boolean): Log => {
  if (!enabled) {
    return () => {};
  }
  const list = document.createElement('ol');
  list.setAttribute('data-testid', 'event-log');
  list.style.fontFamily = 'monospace';
  list.style.fontSize = '12px';
  divElem.append(list);
  return (entry: string) => {
    const item = document.createElement('li');
    item.textContent = entry;
    list.append(item);
  };
};

const logged = (log: Log, name: string, action: Action | undefined) => (event: Event) => {
  log(`${name}:${event.type}`);
  if (action) {
    action(event);
  }
};

export const createElement = ({
  visibility = true,
  visibilityDelay = 0,
  fillOpacity = 1,
  strokeOpacity = 1,
  onClick,
  onMouseOver,
  onMouseOut,
  onDblClick,
  eventLog = false,
}: ElementArgs): HTMLDivElement => {
  const divElem = document.createElement('div');

  const workspace = new Workspace();
  workspace.setSize('400px', '400px');
  workspace.setCoordSize(300, 300);
  workspace.setCoordOrigin(-150, -150);

  // No arc: the rect is drawn without rx/ry (new Rect(0) would write rx="0" ry="0").
  const rect = new Rect(undefined as unknown as number);
  rect.setSize(100, 100);
  rect.setPosition(-50, -50);
  rect.setVisibility(visibility, visibilityDelay);
  rect.setStroke(2, 'solid', 'red', strokeOpacity);
  rect.setFill('gray', fillOpacity);
  const logContainer = document.createElement('div');
  const log = createEventLog(logContainer, eventLog);

  rect.addEvent('click', logged(log, 'rect', onClick));
  rect.addEvent('mouseover', logged(log, 'rect', onMouseOver));
  rect.addEvent('mouseout', logged(log, 'rect', onMouseOut));
  rect.addEvent('dblclick', logged(log, 'rect', onDblClick));

  // Add referene point ...
  const e1 = new Ellipse();
  e1.setSize(70, 70);
  e1.setPosition(0, 0);
  e1.setFill('red', fillOpacity);
  e1.setStroke(2, 'solid', 'blue', strokeOpacity);
  e1.setVisibility(visibility, visibilityDelay);

  e1.addEvent('click', logged(log, 'ellipse', onClick));
  e1.addEvent('mouseover', logged(log, 'ellipse', onMouseOver));
  e1.addEvent('mouseout', logged(log, 'ellipse', onMouseOut));
  e1.addEvent('dblclick', logged(log, 'ellipse', onDblClick));

  workspace.append(rect);
  workspace.append(e1);
  workspace.addItAsChildTo(divElem);
  // The log goes below the workspace.
  divElem.append(logContainer);

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
  eventLog = false,
}: EventRegistrationArgs): HTMLDivElement => {
  const logContainer = document.createElement('div');
  const log = createEventLog(logContainer, eventLog);
  const registerEvent = (
    type: 'click' | 'mouseover' | 'mouseout' | 'dblclick',
    elem: Workspace | Ellipse,
    action: Action | undefined,
    name: string,
  ) => {
    elem.addEvent(type, (event) => {
      log(`${name}:${event.type}`);
      if (action) {
        action(event);
      }
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
    registerEvent('click', workspace, onClick, 'workspace');
    registerEvent('mouseover', workspace, onMouseOver, 'workspace');
    registerEvent('mouseout', workspace, onMouseOut, 'workspace');
    registerEvent('dblclick', workspace, onDblClick, 'workspace');
  }

  if (enableForInnerCircle) {
    registerEvent('click', smallElipse, onClick, 'inner');
    registerEvent('mouseover', smallElipse, onMouseOver, 'inner');
    registerEvent('mouseout', smallElipse, onMouseOut, 'inner');
    registerEvent('dblclick', smallElipse, onDblClick, 'inner');
  }

  if (enableForOuterCircle) {
    registerEvent('click', bigElipse, onClick, 'outer');
    registerEvent('mouseover', bigElipse, onMouseOver, 'outer');
    registerEvent('mouseout', bigElipse, onMouseOut, 'outer');
    registerEvent('dblclick', bigElipse, onDblClick, 'outer');
  }

  workspace.addItAsChildTo(divElem);
  divElem.append(logContainer);
  return divElem;
};
