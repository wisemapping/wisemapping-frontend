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

import { use } from 'react';
import { QueryClient, UseMutationResult, useMutation, useQueryClient } from '@tanstack/react-query';
import { ErrorInfo, MapInfo } from '../../../classes/client';
import { ClientContext } from '../../../classes/provider/client-context';

/**
 * The changes the map list makes to a map in place: starring it and removing one of its labels.
 *
 * Both are optimistic: the cached list shows the change at once, and goes back to what it was if
 * the server refuses it. The cache is never edited in place: the list and the changed map are new
 * objects, every other map keeps its identity, so only the row of the changed map re-renders.
 * Either way, the list is reloaded once the server has answered.
 */

const MAPS_KEY = ['maps'];

/** What `onMutate` saw in the cache, for the rollback. */
export type Snapshot = { previous: MapInfo[] | undefined };

/** Replaces the cached map `id` with `change(map)`; a list not loaded yet stays unloaded. */
const updateCachedMap = async (
  queryClient: QueryClient,
  id: number,
  change: (map: MapInfo) => MapInfo,
): Promise<Snapshot> => {
  // A reload in flight would overwrite the optimistic list with the one from before the change.
  await queryClient.cancelQueries({ queryKey: MAPS_KEY });
  const previous = queryClient.getQueryData<MapInfo[]>(MAPS_KEY);
  queryClient.setQueryData<MapInfo[]>(MAPS_KEY, (maps) =>
    maps?.map((map) => (map.id === id ? change(map) : map)),
  );
  return { previous };
};

const rollback = (queryClient: QueryClient, snapshot: Snapshot | undefined): void => {
  if (snapshot) {
    queryClient.setQueryData<MapInfo[]>(MAPS_KEY, snapshot.previous);
  }
};

export type StarMapVariables = { id: number; starred: boolean };

/** Stars or unstars a map: `starred` is the new value. */
export const useStarMap = (): UseMutationResult<void, ErrorInfo, StarMapVariables, Snapshot> => {
  const client = use(ClientContext);
  const queryClient = useQueryClient();

  return useMutation<void, ErrorInfo, StarMapVariables, Snapshot>({
    mutationFn: ({ id, starred }) => client.updateStarred(id, starred),
    onMutate: ({ id, starred }) => updateCachedMap(queryClient, id, (map) => ({ ...map, starred })),
    onError: (error, _variables, snapshot) => {
      rollback(queryClient, snapshot);
      console.error(error);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: MAPS_KEY }),
  });
};

export type RemoveLabelVariables = { mapId: number; labelId: number };

/** Takes a label off one map (the label itself stays). */
export const useRemoveLabel = (): UseMutationResult<
  void,
  ErrorInfo,
  RemoveLabelVariables,
  Snapshot
> => {
  const client = use(ClientContext);
  const queryClient = useQueryClient();

  return useMutation<void, ErrorInfo, RemoveLabelVariables, Snapshot>({
    mutationFn: ({ mapId, labelId }) => client.deleteLabelFromMap(labelId, mapId),
    onMutate: ({ mapId, labelId }) =>
      updateCachedMap(queryClient, mapId, (map) => ({
        ...map,
        labels: map.labels.filter((label) => label.id !== labelId),
      })),
    onError: (error, _variables, snapshot) => {
      rollback(queryClient, snapshot);
      console.error(error);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: MAPS_KEY }),
  });
};
