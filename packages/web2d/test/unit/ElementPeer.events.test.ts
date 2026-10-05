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

const svgNode = (tag: 'rect' | 'g' = 'rect') =>
  document.createElementNS('http://www.w3.org/2000/svg', tag);

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

  it('trigger dispatches a CustomEvent whose detail is the payload', () => {
    const peer = new ElementPeer(svgNode());
    const fn = jest.fn();
    peer.addEvent('ontfocus', fn);
    peer.trigger('ontfocus', { id: 7 });
    expect(fn).toHaveBeenCalledTimes(1);
    const [event] = fn.mock.calls[0]!;
    expect(event).toBeInstanceOf(CustomEvent);
    expect((event as CustomEvent).detail).toEqual({ id: 7 });
    // W5: no jQuery-style second argument.
    expect(fn.mock.calls[0]).toHaveLength(1);
  });

  // W5: the listener is registered as it is, with no wrapper, and with the element's signal.
  it('W5: addEvent registers the listener itself, with an abort signal', () => {
    const peer = new ElementPeer(svgNode());
    const add = jest.spyOn(peer._native, 'addEventListener');
    const fn = jest.fn();
    peer.addEvent('click', fn);
    expect(add).toHaveBeenCalledWith('click', fn, { signal: expect.any(AbortSignal) });
    const { signal } = add.mock.calls[0]![2] as AddEventListenerOptions;
    peer.dispose();
    expect(signal!.aborted).toBe(true);
  });

  it('W5: dispose() aborts in one go, without removing listeners one by one', () => {
    const peer = new ElementPeer(svgNode());
    const remove = jest.spyOn(peer._native, 'removeEventListener');
    const fn = jest.fn();
    peer.addEvent('click', fn);
    peer.addEvent('mouseover', fn);
    peer.addEvent('ping', fn);
    peer.dispose();
    expect(remove).not.toHaveBeenCalled();
    click(peer);
    click(peer, 'mouseover');
    peer.trigger('ping');
    expect(fn).not.toHaveBeenCalled();
  });

  it('W5: dispose() of an element without listeners is a no-op', () => {
    const peer = new ElementPeer(svgNode());
    expect(() => peer.dispose()).not.toThrow();
  });

  // W5 phase 2: the jQuery-style second argument is gone, even for a listener that declares it.
  it('W5: a listener that declares a second parameter gets only the event', () => {
    const peer = new ElementPeer(svgNode());
    const seen: unknown[] = [];
    const listener = (e: Event, detail?: unknown) => seen.push(e.type, detail);
    peer.addEvent('ontfocus', listener);
    peer.trigger('ontfocus', { id: 7 });
    peer.removeEvent('ontfocus', listener);
    peer.trigger('ontfocus', { id: 8 });
    expect(seen).toEqual(['ontfocus', undefined]);
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
    const onFocus = (e: CustomEvent<{ id: number }>) => {
      ids.push(e.detail.id);
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
      group.addEvent('ontblur', (e: CustomEvent<string>) => e.detail);
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
    expect((fn.mock.calls[0]![0] as CustomEvent).detail).toBe(5);
  });

  it('WorkspaceElement delegates addEvent, removeEvent and trigger', () => {
    const rect = new Rect(0);
    const fn = jest.fn();
    rect.addEvent('ping', fn);
    rect.trigger('ping', 'payload');
    rect.removeEvent('ping', fn);
    rect.trigger('ping', 'payload');
    expect(fn).toHaveBeenCalledTimes(1);
    expect((fn.mock.calls[0]![0] as CustomEvent).detail).toBe('payload');
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

// Typing T6: a listener gets the event type its event name implies. The assignments below are
// checked by tsc (tsconfig.test.json); the runtime part checks what the listeners receive.
describe('typed element events (typing T6)', () => {
  it('a native event type gives its DOM event', () => {
    const rect = new Rect(0);
    const seen: number[] = [];
    rect.addEvent('click', (event) => {
      const mouse: MouseEvent = event;
      seen.push(mouse.clientX);
    });
    rect.peer._native.dispatchEvent(new MouseEvent('click', { clientX: 12 }));
    expect(seen).toEqual([12]);
  });

  it('a custom event of a typed map gives a CustomEvent of its detail', () => {
    const group = new Group<{ moved: { dx: number } }>();
    const seen: number[] = [];
    const listener = (event: CustomEvent<{ dx: number }>) => {
      seen.push(event.detail.dx);
    };
    group.addEvent('moved', listener);
    group.trigger('moved', { dx: 3 });
    group.removeEvent('moved', listener);
    group.trigger('moved', { dx: 4 });
    expect(seen).toEqual([3]);
  });

  // W5: Pointer Events pass through like any native type, typed PointerEvent. (jsdom has no
  // PointerEvent, so a MouseEvent of that type stands in at run time.)
  it('W5: pointer event types pass through, typed PointerEvent', () => {
    const rect = new Rect(0);
    const seen: string[] = [];
    const types = ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'] as const;
    rect.addEvent('pointerdown', (event) => {
      const pointer: PointerEvent = event;
      seen.push(pointer.type);
    });
    rect.addEvent('pointermove', (event: PointerEvent) => seen.push(event.type));
    rect.addEvent('pointerup', (event: PointerEvent) => seen.push(event.type));
    rect.addEvent('pointercancel', (event: PointerEvent) => seen.push(event.type));
    types.forEach((type) => rect.peer._native.dispatchEvent(new MouseEvent(type)));
    expect(seen).toEqual([...types]);
    const typeChecks = () => {
      // @ts-expect-error a pointer event is not a keyboard event
      rect.addEvent('pointerdown', (event: KeyboardEvent) => event.key);
    };
    expect(typeChecks).toBeInstanceOf(Function);
  });
});

// W5: CSS classes for visual states.
describe('element CSS classes (W5)', () => {
  it('adds, removes, toggles and reads classes', () => {
    const rect = new Rect(0);
    rect.addClass('wm-hover', 'wm-selected');
    expect(rect.getNode().getAttribute('class')).toBe('wm-hover wm-selected');
    expect(rect.hasClass('wm-hover')).toBe(true);
    rect.removeClass('wm-hover');
    expect(rect.hasClass('wm-hover')).toBe(false);
    expect(rect.toggleClass('wm-hover')).toBe(true);
    expect(rect.toggleClass('wm-hover')).toBe(false);
    expect(rect.toggleClass('wm-selected', true)).toBe(true);
    expect(rect.toggleClass('wm-selected', false)).toBe(false);
    expect(rect.getNode().getAttribute('class')).toBe('');
  });
});
