/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { createSlice } from '@reduxjs/toolkit';
import { useQuery } from 'react-query';
import Client, { AccountInfo, ErrorInfo, MapInfo, MapMetadata } from '../classes/client';
import { useSelector } from 'react-redux';
import AppConfig from '../classes/app-config';
import { RootState } from './rootReducer';

export interface ClientStatus {
  state: 'healthy' | 'session-expired';
  msg?: string;
}

export interface ClientState {
  instance: Client;
  status: ClientStatus;
}

const initialState: ClientState = {
  instance: AppConfig.buildClient(),
  status: { state: 'healthy' },
};

export const clientSlice = createSlice({
  name: 'client',
  initialState: initialState,
  reducers: {
    sessionExpired(state) {
      state.status = {
        state: 'session-expired',
        msg: 'Sessions has expired. You need to login again',
      };
    },
  },
});

type MapLoadResult = {
  isLoading: boolean;
  error: ErrorInfo | null;
  data: MapInfo | undefined;
};

export const useFetchMapById = (id: number): MapLoadResult => {
  const client: Client = useSelector(activeInstance);
  const { isLoading, error, data } = useQuery<unknown, ErrorInfo, MapInfo[]>(`maps-${id}`, () => {
    return client.fetchAllMaps();
  });

  // If the map can not be loaded, create an error object.
  let map: MapInfo | undefined;
  let errorMsg: ErrorInfo | null = error;
  if (!isLoading) {
    // Sanitize error structure ...
    if (errorMsg) {
      errorMsg = Object.keys(errorMsg).length !== 0 ? error : null;
    }
    //  Seach for object...
    map = data?.find((m) => m.id == id);
    if (!map && !errorMsg) {
      errorMsg = {
        msg: `Map with id ${id} could not be found. Please, reflesh the page. Map: ${JSON.stringify(
          data,
        )}`,
      };
    }
  }
  return { isLoading: isLoading, error: errorMsg, data: map };
};

type MapMetadataLoadResult = {
  isLoading: boolean;
  error: ErrorInfo | null;
  data: MapMetadata | undefined;
};

export const useFetchMapMetadata = (id: number): MapMetadataLoadResult => {
  const client: Client = useSelector(activeInstance);
  const { isLoading, error, data } = useQuery<unknown, ErrorInfo, MapMetadata>(
    `maps-metadata-${id}`,
    () => {
      return client.fetchMapMetadata(id);
    },
  );
  return { isLoading: isLoading, error: error, data: data };
};

export const useFetchAccount = (): AccountInfo | undefined => {
  const client: Client = useSelector(activeInstance);
  const { data } = useQuery<unknown, ErrorInfo, AccountInfo>('account', () => {
    return client.fetchAccountInfo();
  });
  return data;
};

export const activeInstance = (state: RootState): Client => {
  return state.client.instance;
};

export const activeInstanceStatus = (state: RootState): ClientStatus => {
  return state.client.status;
};

export const { sessionExpired } = clientSlice.actions;
export default clientSlice.reducer;
