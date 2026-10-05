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
import ElementPeer from '../../src/components/peer/svg/ElementPeer';
import Rect from '../../src/components/Rect';
import Workspace from '../../src/components/Workspace';
import Group from '../../src/components/Group';

const svgNode = (tag = 'rect') => document.createElementNS('http://www.w3.org/2000/svg', tag);

const click = (peer: ElementPeer, type = 'click') =>
  peer._native.dispatchEvent(new MouseEvent(type, { bubbles: true }));

describe('ElementPeer events', () => {
  it('adds and removes a listener', () => {
    const peer = new ElementPeer(svgNode());
    const fn = jest.fn();
    peer.addEvent('click', fn);
    click(peer);
    expect(fn).toHaveBeenCalledTimes(1);
    peer.removeEvent('click', fn);
    click(peer);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('removing an unknown listener is a no-op', () => {
    const peer = new ElementPeer(svgNode());
    expect(() => peer.removeEvent('click', jest.fn())).not.toThrow();
  });

  it('passes the native event to the listener', () => {
    const peer = new ElementPeer(svgNode());
    const fn = jest.fn();
    peer.addEvent('click', fn);
    click(peer);
    expect(fn.mock.calls[0]![0]).toBeInstanceOf(MouseEvent);
  });

  it('trigger dispatches a CustomEvent and passes its detail as the second argument', () => {
    const peer = new ElementPeer(svgNode());
    const fn = jest.fn();
    peer.addEvent('ontfocus', fn);
    peer.trigger('ontfocus', { id: 7 });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn.mock.calls[0]![0]).toBeInstanceOf(CustomEvent);
    expect(fn.mock.calls[0]![1]).toEqual({ id: 7 });
  });

  it('characterization: trigger does not bubble', () => {
    const parent = new ElementPeer(svgNode('g'));
    const child = new ElementPeer(svgNode());
    parent.append(child);
    const fn = jest.fn();
    parent.addEvent('custom', fn);
    child.trigger('custom', 1);
    expect(fn).not.toHaveBeenCalled();
  });

  it('native events bubble to the parent', () => {
    const parent = new ElementPeer(svgNode('g'));
    const child = new ElementPeer(svgNode());
    parent.append(child);
    const fn = jest.fn();
    parent.addEvent('click', fn);
    click(child);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('different listeners on the same type are independent', () => {
    const peer = new ElementPeer(svgNode());
    const a = jest.fn();
    const b = jest.fn();
    peer.addEvent('click', a);
    peer.addEvent('click', b);
    peer.removeEvent('click', a);
    click(peer);
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledTimes(1);
  });

  // W-TRIGGER: a native event has no payload, even though UIEvent.detail is the click count.
  it('W-TRIGGER: native events pass no detail', () => {
    const peer = new ElementPeer(svgNode());
    const fn = jest.fn();
    peer.addEvent('click', fn);
    peer._native.dispatchEvent(new MouseEvent('click', { detail: 2 }));
    expect(fn.mock.calls[0]![1]).toBeUndefined();
  });

  // W-EVTMAP: wrappers were keyed only by the listener, so registering one function for two
  // types overwrote the first wrapper.
  it('W-EVTMAP: one listener on click and dblclick can be removed from click', () => {
    const peer = new ElementPeer(svgNode());
    const fn = jest.fn();
    peer.addEvent('click', fn);
    peer.addEvent('dblclick', fn);
    peer.removeEvent('click', fn);
    click(peer, 'click');
    expect(fn).not.toHaveBeenCalled();
    click(peer, 'dblclick');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('W-EVTMAP: one listener on click and dblclick can be removed from both', () => {
    const peer = new ElementPeer(svgNode());
    const fn = jest.fn();
    peer.addEvent('click', fn);
    peer.addEvent('dblclick', fn);
    peer.removeEvent('click', fn);
    peer.removeEvent('dblclick', fn);
    click(peer, 'click');
    click(peer, 'dblclick');
    expect(fn).not.toHaveBeenCalled();
  });

  it('W-EVTMAP: adding the same listener twice fires it once', () => {
    const peer = new ElementPeer(svgNode());
    const fn = jest.fn();
    peer.addEvent('click', fn);
    peer.addEvent('click', fn);
    click(peer);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('removing a listener from a type it was never added to is a no-op', () => {
    const peer = new ElementPeer(svgNode());
    const fn = jest.fn();
    peer.addEvent('click', fn);
    peer.removeEvent('dblclick', fn);
    click(peer);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  // W-DISPOSE: there was no way to remove all of an element's listeners.
  it('W-DISPOSE: dispose() removes every listener', () => {
    const peer = new ElementPeer(svgNode());
    const fn = jest.fn();
    peer.addEvent('click', fn);
    peer.addEvent('mouseover', fn);
    peer.dispose();
    click(peer);
    click(peer, 'mouseover');
    expect(fn).not.toHaveBeenCalled();
    // The element is still usable.
    peer.addEvent('click', fn);
    click(peer);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('WorkspaceElement.dispose() removes every listener', () => {
    const rect = new Rect(0);
    const fn = jest.fn();
    rect.addEvent('click', fn);
    rect.dispose();
    click(rect.peer);
    expect(fn).not.toHaveBeenCalled();
  });

  // BL5-78: dispose() only removed the element's own listeners, so tearing down a map left the
  // listeners of every shape inside its groups.
  it('BL5-78: Group.dispose() removes the listeners of its children, recursively', () => {
    const outer = new Group();
    const inner = new Group();
    const rect = new Rect(0);
    outer.append(inner);
    inner.append(rect);
    const fns = [jest.fn(), jest.fn(), jest.fn()];
    outer.addEvent('ping', fns[0]!);
    inner.addEvent('ping', fns[1]!);
    rect.addEvent('ping', fns[2]!);
    outer.dispose();
    [outer, inner, rect].forEach((element) => element.trigger('ping'));
    fns.forEach((fn) => expect(fn).not.toHaveBeenCalled());
  });

  it('BL5-78: Workspace.dispose() removes the listeners of the whole tree', () => {
    const workspace = new Workspace();
    const group = new Group();
    const rect = new Rect(0);
    workspace.append(group);
    group.append(rect);
    const fns = [jest.fn(), jest.fn(), jest.fn()];
    workspace.addEvent('ping', fns[0]!);
    group.addEvent('ping', fns[1]!);
    rect.addEvent('ping', fns[2]!);
    workspace.dispose();
    [workspace, group, rect].forEach((element) => element.trigger('ping'));
    fns.forEach((fn) => expect(fn).not.toHaveBeenCalled());
    // The tree is kept and still usable.
    expect(workspace.peer.getChildren()).toEqual([group.peer]);
  });

  // BL5-79 (W-TRIGGER): custom event names and their detail were untyped strings. An element can
  // now take a map of its custom events (mindplot supplies its own).
  it('BL5-79: a custom event map types trigger and the listener detail', () => {
    type TestEvents = { ontfocus: { id: number }; ontblur: { id: number } };
    const group = new Group<TestEvents>();
    const ids: number[] = [];
    const onFocus = (_e: Event, detail?: { id: number }) => {
      if (detail) ids.push(detail.id);
    };
    group.addEvent('ontfocus', onFocus);
    group.trigger('ontfocus', { id: 7 });
    // Compile-time checks only (never run).
    const typeChecks = () => {
      // @ts-expect-error an event that is not in the map
      group.trigger('ontmove', { id: 1 });
      // @ts-expect-error a detail of the wrong type
      group.trigger('ontfocus', { id: 'x' });
      // @ts-expect-error a listener expecting another detail type
      group.addEvent('ontblur', (_e: Event, detail?: string) => detail);
    };
    expect(typeChecks).toBeInstanceOf(Function);
    // Native events keep an unknown detail.
    const onClick = jest.fn((e: Event) => e.type);
    group.addEvent('click', onClick);
    click(group.peer);
    group.removeEvent('ontfocus', onFocus);
    group.trigger('ontfocus', { id: 8 });
    expect(ids).toEqual([7]);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('BL5-79: without a map, any event name and detail are accepted', () => {
    const rect = new Rect(0);
    const fn = jest.fn();
    rect.addEvent('anything', fn);
    rect.trigger('anything', 5);
    expect(fn.mock.calls[0]![1]).toBe(5);
  });

  it('WorkspaceElement delegates addEvent, removeEvent and trigger', () => {
    const rect = new Rect(0);
    const fn = jest.fn();
    rect.addEvent('ping', fn);
    rect.trigger('ping', 'payload');
    rect.removeEvent('ping', fn);
    rect.trigger('ping', 'payload');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn.mock.calls[0]![1]).toBe('payload');
  });
});

describe('ElementPeer tree', () => {
  it('append sets the parent and the DOM child', () => {
    const parent = new ElementPeer(svgNode('g'));
    const child = new ElementPeer(svgNode());
    parent.append(child);
    expect(child.getParent()).toBe(parent);
    expect(parent.getChildren()).toEqual([child]);
    expect(child._native.parentNode).toBe(parent._native);
  });

  it('removeChild clears the parent and the DOM child', () => {
    const parent = new ElementPeer(svgNode('g'));
    const child = new ElementPeer(svgNode());
    parent.append(child);
    parent.removeChild(child);
    expect(child.getParent()).toBeNull();
    expect(parent.getChildren()).toEqual([]);
    expect(child._native.parentNode).toBeNull();
  });

  it('removeChild of a non-child throws', () => {
    const parent = new ElementPeer(svgNode('g'));
    expect(() => parent.removeChild(new ElementPeer(svgNode()))).toThrow();
  });

  // W-RMCHILD: removeChild cleared the parent before asserting that the element is a child.
  it('W-RMCHILD: a failed removeChild leaves the element parent untouched', () => {
    const parent = new ElementPeer(svgNode('g'));
    const other = new ElementPeer(svgNode('g'));
    const child = new ElementPeer(svgNode());
    other.append(child);
    expect(() => parent.removeChild(child)).toThrow();
    expect(child.getParent()).toBe(other);
  });

  it('moveToFront and moveToBack reorder the DOM', () => {
    const parent = new ElementPeer(svgNode('g'));
    const a = new ElementPeer(svgNode());
    const b = new ElementPeer(svgNode());
    parent.append(a);
    parent.append(b);
    a.moveToFront();
    expect(parent._native.lastChild).toBe(a._native);
    a.moveToBack();
    expect(parent._native.firstChild).toBe(a._native);
  });

  it('moveToFront and moveToBack throw when detached', () => {
    const peer = new ElementPeer(svgNode());
    expect(() => peer.moveToFront()).toThrow('node not connected to parent');
    expect(() => peer.moveToBack()).toThrow('node not connected to parent');
  });

  it('WorkspaceElement delegates moveToFront, moveToBack, cursor and test id', () => {
    const workspace = new Workspace();
    const a = new Rect(0);
    const b = new Rect(0);
    workspace.append(a);
    workspace.append(b);
    a.moveToFront();
    expect(workspace.getSVGElement().lastChild).toBe(a.peer._native);
    a.moveToBack();
    expect(workspace.getSVGElement().firstChild).toBe(a.peer._native);
    a.setCursor('move');
    expect(a.peer._native.style.cursor).toBe('move');
    a.setTestId('node-1');
    expect(a.peer._native.getAttribute('test-id')).toBe('node-1');
  });
});
