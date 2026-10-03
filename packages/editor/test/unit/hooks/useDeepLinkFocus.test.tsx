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

/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import type { Topic } from '@wisemapping/mindplot';
import type Model from '../../../src/classes/model/editor';
import { useDeepLinkFocus } from '../../../src/hooks/useDeepLinkFocus';

type Handler = () => void;

// A stand-in for mindplot's LayoutEventBus singleton. The hook keys off its
// 'forceLayout' event as the "layout has settled" signal, so the test drives
// that event directly rather than advancing timers.
jest.mock('@wisemapping/mindplot', () => ({
  LayoutEventBus: {
    addEvent: jest.fn(),
    removeEvent: jest.fn(),
    fireEvent: jest.fn(),
  },
}));

const busHandlers = new Map<string, Set<Handler>>();
const { LayoutEventBus: layoutEventBus } = jest.requireMock('@wisemapping/mindplot') as {
  LayoutEventBus: {
    addEvent: jest.Mock;
    removeEvent: jest.Mock;
    fireEvent: jest.Mock;
  };
};

layoutEventBus.addEvent.mockImplementation((event: string, h: Handler) => {
  if (!busHandlers.has(event)) busHandlers.set(event, new Set());
  busHandlers.get(event)!.add(h);
});
layoutEventBus.removeEvent.mockImplementation((event: string, h: Handler) => {
  busHandlers.get(event)?.delete(h);
});
layoutEventBus.fireEvent.mockImplementation((event: string) => {
  [...(busHandlers.get(event) ?? [])].forEach((h) => h());
});

const fireForceLayout = () => layoutEventBus.fireEvent('forceLayout');

function makeDesigner() {
  const handlers = new Map<string, Set<Handler>>();
  const designerModel = {
    findTopicById: jest.fn((id: number) => ({ id, label: 'mock-topic' }) as unknown as Topic),
  };
  return {
    addEvent: jest.fn((event: string, h: Handler) => {
      if (!handlers.has(event)) handlers.set(event, new Set());
      handlers.get(event)!.add(h);
    }),
    removeEvent: jest.fn((event: string, h: Handler) => {
      handlers.get(event)?.delete(h);
    }),
    fireLoadSuccess: () => [...(handlers.get('loadSuccess') ?? [])].forEach((h) => h()),
    revealNode: jest.fn(),
    goToNode: jest.fn(),
    getModel: jest.fn(() => designerModel),
  };
}

type FakeDesigner = ReturnType<typeof makeDesigner>;

const makeModel = (designer: FakeDesigner, isLoaded = false): Model =>
  ({
    getDesigner: () => designer,
    isMapLoadded: () => isLoaded,
  }) as unknown as Model;

// jsdom's window.location is non-configurable, so drive it through history.
const setLocation = (url: string) => {
  window.history.replaceState({}, '', url);
};

describe('useDeepLinkFocus', () => {
  beforeEach(() => {
    busHandlers.clear();
    layoutEventBus.addEvent.mockClear();
    layoutEventBus.removeEvent.mockClear();
    layoutEventBus.fireEvent.mockClear();
    setLocation('/');
  });

  describe('url parsing', () => {
    it('focuses the topic with the given node id on loadSuccess', () => {
      const designer = makeDesigner();
      const model = makeModel(designer);

      renderHook(() => useDeepLinkFocus(model, new URLSearchParams('node=42')));

      designer.fireLoadSuccess();
      expect(designer.getModel().findTopicById).toHaveBeenCalledWith(42);
      expect(designer.revealNode).toHaveBeenCalledWith({ id: 42, label: 'mock-topic' }, true);
    });

    it('falls back to window.location.search when no searchParams are supplied', () => {
      setLocation('/?node=7');
      const designer = makeDesigner();

      renderHook(() => useDeepLinkFocus(makeModel(designer), null));

      designer.fireLoadSuccess();
      expect(designer.revealNode).toHaveBeenCalledWith({ id: 7, label: 'mock-topic' }, true);
    });

    it('falls back to window.location.hash for hash-routed hosts', () => {
      setLocation('/#node=9');
      const designer = makeDesigner();

      renderHook(() => useDeepLinkFocus(makeModel(designer), new URLSearchParams()));

      designer.fireLoadSuccess();
      expect(designer.revealNode).toHaveBeenCalledWith({ id: 9, label: 'mock-topic' }, true);
    });

    it('does nothing when there is no node query param', () => {
      const designer = makeDesigner();

      renderHook(() => useDeepLinkFocus(makeModel(designer), new URLSearchParams()));

      designer.fireLoadSuccess();
      fireForceLayout();
      expect(designer.revealNode).not.toHaveBeenCalled();
      expect(designer.addEvent).not.toHaveBeenCalled();
      expect(layoutEventBus.addEvent).not.toHaveBeenCalled();
    });

    it('does nothing when the node id is not numeric', () => {
      const designer = makeDesigner();

      renderHook(() => useDeepLinkFocus(makeModel(designer), new URLSearchParams('node=abc')));

      designer.fireLoadSuccess();
      expect(designer.getModel().findTopicById).not.toHaveBeenCalled();
      expect(designer.revealNode).not.toHaveBeenCalled();
    });

    it('does nothing when there is no model', () => {
      expect(() =>
        renderHook(() => useDeepLinkFocus(undefined, new URLSearchParams('node=42'))),
      ).not.toThrow();
      expect(layoutEventBus.addEvent).not.toHaveBeenCalled();
    });
  });

  describe('layout-settled signal', () => {
    it('subscribes to both loadSuccess and the layout bus', () => {
      const designer = makeDesigner();

      renderHook(() => useDeepLinkFocus(makeModel(designer), new URLSearchParams('node=42')));

      expect(designer.addEvent).toHaveBeenCalledWith('loadSuccess', expect.any(Function));
      expect(layoutEventBus.addEvent).toHaveBeenCalledWith('forceLayout', expect.any(Function));
    });

    it('reveals on forceLayout even if loadSuccess never arrives', () => {
      const designer = makeDesigner();

      renderHook(() => useDeepLinkFocus(makeModel(designer), new URLSearchParams('node=42')));

      fireForceLayout();
      expect(designer.revealNode).toHaveBeenCalledWith({ id: 42, label: 'mock-topic' }, true);
    });

    it('retries on the next layout pass when the topic does not exist yet', () => {
      const designer = makeDesigner();
      designer.getModel().findTopicById.mockReturnValueOnce(undefined as unknown as Topic);

      renderHook(() => useDeepLinkFocus(makeModel(designer), new URLSearchParams('node=42')));

      // First signal: the topic is not built yet, so nothing happens -- and in
      // particular no timer is scheduled to try again.
      designer.fireLoadSuccess();
      expect(designer.revealNode).not.toHaveBeenCalled();

      // Second signal: the layout has run again and the topic now resolves.
      fireForceLayout();
      expect(designer.revealNode).toHaveBeenCalledWith({ id: 42, label: 'mock-topic' }, true);
    });

    it('never reveals when the topic does not exist at all', () => {
      const designer = makeDesigner();
      designer.getModel().findTopicById.mockReturnValue(undefined as unknown as Topic);

      renderHook(() => useDeepLinkFocus(makeModel(designer), new URLSearchParams('node=999')));

      designer.fireLoadSuccess();
      fireForceLayout();
      fireForceLayout();
      expect(designer.revealNode).not.toHaveBeenCalled();
    });

    it('focuses immediately if the map is already loaded', () => {
      const designer = makeDesigner();

      renderHook(() => useDeepLinkFocus(makeModel(designer, true), new URLSearchParams('node=42')));

      expect(designer.getModel().findTopicById).toHaveBeenCalledWith(42);
      expect(designer.revealNode).toHaveBeenCalledWith({ id: 42, label: 'mock-topic' }, true);
    });

    it('reveals exactly once however many signals arrive', () => {
      const designer = makeDesigner();

      renderHook(() => useDeepLinkFocus(makeModel(designer), new URLSearchParams('node=42')));

      designer.fireLoadSuccess();
      designer.fireLoadSuccess();
      fireForceLayout();
      fireForceLayout();

      expect(designer.revealNode).toHaveBeenCalledTimes(1);
    });

    it('does not hijack the viewport when later edits re-run the layout', () => {
      const designer = makeDesigner();

      renderHook(() => useDeepLinkFocus(makeModel(designer), new URLSearchParams('node=42')));

      designer.fireLoadSuccess();
      expect(designer.revealNode).toHaveBeenCalledTimes(1);

      // Every edit fires 'forceLayout'; none of them may re-centre.
      designer.revealNode.mockClear();
      fireForceLayout();
      fireForceLayout();
      expect(designer.revealNode).not.toHaveBeenCalled();
    });

    it('does not call the rejected goToNode-after-revealNode double hop', () => {
      const designer = makeDesigner();

      renderHook(() => useDeepLinkFocus(makeModel(designer), new URLSearchParams('node=42')));

      designer.fireLoadSuccess();
      expect(designer.revealNode).toHaveBeenCalledTimes(1);
      expect(designer.goToNode).not.toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('removes both listeners on unmount', () => {
      const designer = makeDesigner();

      const { unmount } = renderHook(() =>
        useDeepLinkFocus(makeModel(designer), new URLSearchParams('node=42')),
      );

      unmount();

      expect(designer.removeEvent).toHaveBeenCalledWith('loadSuccess', expect.any(Function));
      expect(layoutEventBus.removeEvent).toHaveBeenCalledWith('forceLayout', expect.any(Function));

      designer.fireLoadSuccess();
      fireForceLayout();
      expect(designer.revealNode).not.toHaveBeenCalled();
    });
  });
});
