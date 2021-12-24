/* eslint-disable no-alert */
import $ from 'jquery';
import {
  Toolkit, Workspace, Elipse,
} from '../../src';

global.$ = $;

function EventLogger(type, element) {
  this._enable = false;
  this._element = element;
  this._type = type;
  this._listener = function logger() {
    const oldColor = element.getAttribute('fillColor');
    element.setFill('yellow');

    alert(`Event on:${element.getType()}, Type:${type}`);
    element.setFill(oldColor);
  };
}

EventLogger.prototype.changeState = function changeState() {
  this._enable = !this._enable;
  if (this._enable) {
    this._element.addEvent(this._type, this._listener);
  } else {
    this._element.removeEvent(this._type, this._listener);
  }
  return this._enable;
};

function MultipleEventHandler(type, element) {
  this._listeners = [];
  this._type = type;
  this._element = element;
}

MultipleEventHandler.prototype.registerOneListener = function registerOneListener() {
  const count = this._listeners.length;
  const listener = () => {
    alert(`Listener #:${count}`);
  };
  this._listeners.push(listener);
  this._element.addEvent(this._type, listener);
};

MultipleEventHandler.prototype.listenerCount = function listenerCount() {
  return this._listeners.length;
};

MultipleEventHandler.prototype.unRegisterOneListener = function unRegisterOneListener() {
  if (this._listeners.length > 0) {
    const listener = this._listeners.pop();
    this._element.removeEvent(this._type, listener);
  }
};

Toolkit.init();

// Workspace with CoordOrigin(100,100);
const workspace = new Workspace();
workspace.setSize('150px', '150px');
workspace.setCoordSize(150, 150);

const bigElipse = new Elipse();
bigElipse.setSize(100, 100);
bigElipse.setPosition(75, 75);
workspace.append(bigElipse);

const smallElipse = new Elipse();
smallElipse.setSize(50, 50);
smallElipse.setPosition(75, 75);
smallElipse.setFill('red');
workspace.append(smallElipse);

global.wClickEventLogger = new EventLogger('click', workspace);
global.wMouseoverEventLogger = new EventLogger('mouseover', workspace);
global.wMouseoutEventLogger = new EventLogger('mouseout', workspace);
global.wMousemoveEventLogger = new EventLogger('mousemove', workspace);
global.wDblCickEventLogger = new EventLogger('dblclick', workspace);

global.esClickEventLogger = new EventLogger('click', smallElipse);
global.esMouseoverEventLogger = new EventLogger('mouseover', smallElipse);
global.esMouseoutEventLogger = new EventLogger('mouseout', smallElipse);
global.esMousemoveEventLogger = new EventLogger('mousemove', smallElipse);
global.esDblCickEventLogger = new EventLogger('dblclick', smallElipse);

global.ebClickEventLogger = new EventLogger('click', bigElipse);
global.ebMouseoverEventLogger = new EventLogger('mouseover', bigElipse);
global.ebMouseoutEventLogger = new EventLogger('mouseout', bigElipse);
global.ebousemoveEventLogger = new EventLogger('mousemove', bigElipse);
global.ebblCickEventLogger = new EventLogger('dblclick', bigElipse);

workspace.addItAsChildTo($('#workspaceContainer').first());

const mEventWorkspace = new Workspace();
mEventWorkspace.setSize('150px', '150px');
mEventWorkspace.setCoordSize(150, 150);

const elipse = new Elipse();
elipse.setSize(100, 100);
elipse.setPosition(75, 75);
elipse.setFill('blue');
mEventWorkspace.append(elipse);

mEventWorkspace.addItAsChildTo($('#workspaceMultipleEvents').first());
global.multipleHandler = new MultipleEventHandler('click', elipse);
