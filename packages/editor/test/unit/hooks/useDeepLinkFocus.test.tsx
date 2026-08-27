/** @jest-environment jsdom */
import React from 'react';
import { renderHook } from '@testing-library/react';
import type { Topic } from '@wisemapping/mindplot';
import type Model from '../../../src/classes/model/editor';
import { useDeepLinkFocus } from '../../../src/hooks/useDeepLinkFocus';

jest.mock('react-intl', () => ({
  useIntl: () => ({
    formatMessage: ({ defaultMessage }: { defaultMessage?: string }) => defaultMessage || '',
  }),
  FormattedMessage: ({ defaultMessage }: { defaultMessage?: string }) => <>{defaultMessage}</>,
  IntlProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

type Handler = () => void;

function makeDesigner() {
  const handlers = new Map<string, Set<Handler>>();
  const model = {
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
    fireLoadSuccess: () => handlers.get('loadSuccess')?.forEach((h) => h()),
    revealNode: jest.fn(),
    goToNode: jest.fn(),
    getModel: jest.fn(() => model),
  };
}

describe('useDeepLinkFocus', () => {
  it('focuses the topic with the given node id on loadSuccess', () => {
    const designer = makeDesigner();
    const model = {
      getDesigner: () => designer,
      isMapLoadded: () => false,
    } as unknown as Model;
    const searchParams = new URLSearchParams('node=42');

    renderHook(() => useDeepLinkFocus(model, searchParams));

    designer.fireLoadSuccess();
    expect(designer.getModel().findTopicById).toHaveBeenCalledWith(42);
    expect(designer.revealNode).toHaveBeenCalledWith({ id: 42, label: 'mock-topic' }, true);
    expect(designer.goToNode).toHaveBeenCalledWith({ id: 42, label: 'mock-topic' }, true);
  });

  it('does nothing when there is no node query param', () => {
    const designer = makeDesigner();
    const model = {
      getDesigner: () => designer,
      isMapLoadded: () => false,
    } as unknown as Model;
    renderHook(() => useDeepLinkFocus(model, new URLSearchParams()));
    designer.fireLoadSuccess();
    expect(designer.revealNode).not.toHaveBeenCalled();
  });

  it('does nothing when the node id is not numeric', () => {
    const designer = makeDesigner();
    const model = {
      getDesigner: () => designer,
      isMapLoadded: () => false,
    } as unknown as Model;
    const searchParams = new URLSearchParams('node=abc');
    renderHook(() => useDeepLinkFocus(model, searchParams));
    designer.fireLoadSuccess();
    expect(designer.getModel().findTopicById).not.toHaveBeenCalled();
    expect(designer.revealNode).not.toHaveBeenCalled();
  });

  it('does nothing when the topic does not exist', () => {
    const designer = makeDesigner();
    designer.getModel().findTopicById.mockReturnValue(undefined as unknown as Topic);
    const model = {
      getDesigner: () => designer,
      isMapLoadded: () => false,
    } as unknown as Model;
    renderHook(() => useDeepLinkFocus(model, new URLSearchParams('node=999')));
    designer.fireLoadSuccess();
    expect(designer.revealNode).not.toHaveBeenCalled();
  });

  it('focuses immediately if map is already loaded', () => {
    const designer = makeDesigner();
    const model = {
      getDesigner: () => designer,
      isMapLoadded: () => true,
    } as unknown as Model;
    const searchParams = new URLSearchParams('node=42');

    renderHook(() => useDeepLinkFocus(model, searchParams));
    expect(designer.getModel().findTopicById).toHaveBeenCalledWith(42);
    expect(designer.revealNode).toHaveBeenCalledWith({ id: 42, label: 'mock-topic' }, true);
    expect(designer.goToNode).toHaveBeenCalledWith({ id: 42, label: 'mock-topic' }, true);
  });
  it('is idempotent and does not reveal node multiple times', () => {
    const designer = makeDesigner();
    const model = {
      getDesigner: () => designer,
      isMapLoadded: () => false,
    } as unknown as Model;
    const searchParams = new URLSearchParams('node=42');

    renderHook(() => useDeepLinkFocus(model, searchParams));

    designer.fireLoadSuccess();
    designer.fireLoadSuccess();

    expect(designer.revealNode).toHaveBeenCalledTimes(1);
  });

  it('removes the loadSuccess listener on unmount', () => {
    const designer = makeDesigner();
    const model = {
      getDesigner: () => designer,
      isMapLoadded: () => false,
    } as unknown as Model;
    const searchParams = new URLSearchParams('node=42');

    const { unmount } = renderHook(() => useDeepLinkFocus(model, searchParams));
    expect(designer.addEvent).toHaveBeenCalledWith('loadSuccess', expect.any(Function));

    unmount();
    expect(designer.removeEvent).toHaveBeenCalledWith('loadSuccess', expect.any(Function));
  });
});
