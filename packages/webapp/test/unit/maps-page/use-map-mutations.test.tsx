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

import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Client, { Label, MapInfo } from '../../../src/classes/client';
import { ClientContext } from '../../../src/classes/provider/client-context';
import {
  useRemoveLabel,
  useStarMap,
} from '../../../src/components/maps-page/maps-list/useMapMutations';
import { defined } from '../defined';

const research: Label = { id: 7, title: 'Research', color: '#ff0000' };
const travel: Label = { id: 8, title: 'Travel', color: '#00ff00' };

const map = (id: number, overrides: Partial<MapInfo> = {}): MapInfo => ({
  id,
  title: `Map ${id}`,
  starred: false,
  labels: [],
  createdBy: 'ana@wisemapping.com',
  creationTime: '2026-01-01T00:00:00Z',
  lastModificationBy: 'ana@wisemapping.com',
  lastModificationTime: '2026-01-01T00:00:00Z',
  description: '',
  public: false,
  role: 'owner',
  ...overrides,
});

/** A promise the test settles when it wants the server to answer. */
const deferred = () => {
  let resolve: () => void = () => undefined;
  let reject: (error: unknown) => void = () => undefined;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const setup = <T,>(hook: () => T, maps: MapInfo[] | undefined) => {
  const server = deferred();
  const client = {
    updateStarred: jest.fn(() => server.promise),
    deleteLabelFromMap: jest.fn(() => server.promise),
  };
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  if (maps) {
    queryClient.setQueryData(['maps'], maps);
  }
  const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ClientContext value={client as unknown as Client}>{children}</ClientContext>
    </QueryClientProvider>
  );
  const { result } = renderHook(hook, { wrapper });
  const cached = () => queryClient.getQueryData<MapInfo[]>(['maps']);
  return { result, client, server, queryClient, invalidate, cached };
};

/** A deep copy, to tell whether an object was changed in place. */
const copy = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

describe('useStarMap', () => {
  const maps = () => [map(1), map(2, { starred: true }), map(3)];

  test('shows the star at once, with new objects: the cached ones are not changed', async () => {
    const { result, client, cached } = setup(useStarMap, maps());
    const before = defined(cached());
    const beforeCopy = copy(before);

    act(() => result.current.mutate({ id: 1, starred: true }));

    await waitFor(() => expect(cached()?.[0]?.starred).toBe(true));
    expect(client.updateStarred).toHaveBeenCalledWith(1, true);
    const after = defined(cached());
    // A new list and a new map for the change...
    expect(after).not.toBe(before);
    expect(after[0]).not.toBe(before[0]);
    // ...the other maps keep their identity, so their rows are not re-rendered...
    expect(after[1]).toBe(before[1]);
    expect(after[2]).toBe(before[2]);
    // ...and what was cached before is as it was.
    expect(before).toEqual(beforeCopy);
    expect(before[0]?.starred).toBe(false);
  });

  test('goes back to the cached list when the server refuses, and logs the error', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const { result, server, cached, invalidate } = setup(useStarMap, maps());
    const before = defined(cached());
    const beforeCopy = copy(before);

    act(() => result.current.mutate({ id: 2, starred: false }));
    await waitFor(() => expect(cached()?.[1]?.starred).toBe(false));

    act(() => server.reject({ msg: 'boom' }));

    await waitFor(() => expect(result.current.isError).toBe(true));
    // What was cached before (React Query shares the maps the rollback did not change).
    expect(cached()).toEqual(beforeCopy);
    expect(cached()?.[0]).toBe(before[0]);
    expect(cached()?.[1]?.starred).toBe(true);
    expect(errorSpy).toHaveBeenCalledWith({ msg: 'boom' });
    // The list is reloaded either way.
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['maps'] });
    errorSpy.mockRestore();
  });

  test('reloads the list once the server has answered', async () => {
    const { result, server, invalidate, client } = setup(useStarMap, maps());

    act(() => result.current.mutate({ id: 3, starred: true }));
    await waitFor(() => expect(client.updateStarred).toHaveBeenCalled());
    expect(invalidate).not.toHaveBeenCalled();

    act(() => server.resolve());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['maps'] });
  });

  test('a list not loaded yet stays unloaded', async () => {
    const { result, server, cached, client } = setup(useStarMap, undefined);

    act(() => result.current.mutate({ id: 1, starred: true }));
    await waitFor(() => expect(client.updateStarred).toHaveBeenCalledWith(1, true));
    expect(cached()).toBeUndefined();
    act(() => server.resolve());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useRemoveLabel', () => {
  const maps = () => [map(1, { labels: [research, travel] }), map(2, { labels: [research] })];

  test('takes the label off at once, with new objects: the cached ones are not changed', async () => {
    const { result, client, cached } = setup(useRemoveLabel, maps());
    const before = defined(cached());
    const beforeCopy = copy(before);
    const beforeLabels = before[0]?.labels;

    act(() => result.current.mutate({ mapId: 1, labelId: 7 }));

    await waitFor(() => expect(cached()?.[0]?.labels).toEqual([travel]));
    expect(client.deleteLabelFromMap).toHaveBeenCalledWith(7, 1);
    const after = defined(cached());
    expect(after).not.toBe(before);
    expect(after[0]).not.toBe(before[0]);
    // The other map still has the label, and is the same object.
    expect(after[1]).toBe(before[1]);
    expect(before).toEqual(beforeCopy);
    expect(before[0]?.labels).toBe(beforeLabels);
    expect(beforeLabels).toEqual([research, travel]);
  });

  test('puts the label back when the server refuses, and logs the error', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const { result, server, cached, invalidate } = setup(useRemoveLabel, maps());
    const before = defined(cached());
    const beforeCopy = copy(before);

    act(() => result.current.mutate({ mapId: 2, labelId: 7 }));
    await waitFor(() => expect(cached()?.[1]?.labels).toEqual([]));

    act(() => server.reject({ msg: 'nope' }));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(cached()).toEqual(beforeCopy);
    expect(cached()?.[0]).toBe(before[0]);
    expect(cached()?.[1]?.labels).toEqual([research]);
    expect(errorSpy).toHaveBeenCalledWith({ msg: 'nope' });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['maps'] });
    errorSpy.mockRestore();
  });

  test('reloads the list once the server has answered', async () => {
    const { result, server, invalidate } = setup(useRemoveLabel, maps());

    act(() => result.current.mutate({ mapId: 1, labelId: 8 }));
    act(() => server.resolve());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['maps'] });
  });
});
