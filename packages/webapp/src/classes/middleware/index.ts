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

import { useQuery } from 'react-query';
import { AccountInfo, ErrorInfo, MapInfo, MapMetadata } from '../client';
import { ClientContext } from '../provider/client-context';
import { useContext } from 'react';

type MapLoadResult = {
  isLoading: boolean;
  error: ErrorInfo | null;
  data: MapInfo | undefined;
};

export const useFetchMapById = (id: number): MapLoadResult => {
  const client = useContext(ClientContext);
  const { isLoading, error, data } = useQuery<unknown, ErrorInfo, MapMetadata>(
    `maps-metadata-${id}`,
    () => {
      return client.fetchMapMetadata(id);
    },
  );

  // Convert MapMetadata to MapInfo format
  let map: MapInfo | undefined;
  let errorMsg: ErrorInfo | null = error;
  if (!isLoading && data) {
    // Convert MapMetadata to MapInfo
    map = {
      id: data.id,
      title: data.title,
      starred: data.starred ?? false,
      labels: [], // Labels not included in metadata - would need separate call if needed
      createdBy: data.createdBy ?? data.creatorFullName,
      creationTime: data.creationTime ?? '',
      lastModificationBy: data.lastModificationBy ?? '',
      lastModificationTime: data.lastModificationTime ?? '',
      description: data.description ?? '',
      public: data.public ?? false,
      role: data.role,
    };
  } else if (!isLoading && error) {
    errorMsg = error;
  }
  return { isLoading: isLoading, error: errorMsg, data: map };
};

type MapMetadataLoadResult = {
  isLoading: boolean;
  error: ErrorInfo | null;
  data: MapMetadata | undefined;
};

export const useFetchMapMetadata = (id: number): MapMetadataLoadResult => {
  const client = useContext(ClientContext);
  const { isLoading, error, data } = useQuery<unknown, ErrorInfo, MapMetadata>(
    `maps-metadata-${id}`,
    () => {
      return client.fetchMapMetadata(id);
    },
  );
  return { isLoading: isLoading, error: error, data: data };
};

export const useFetchAccount = (): AccountInfo | undefined => {
  const client = useContext(ClientContext);
  const { data } = useQuery<unknown, ErrorInfo, AccountInfo>('account', () => {
    return client.fetchAccountInfo();
  });
  return data;
};

export const useFetchAccountWithState = (): {
  data: AccountInfo | undefined;
  isLoading: boolean;
  error: ErrorInfo | null;
} => {
  const client = useContext(ClientContext);
  const { data, isLoading, error } = useQuery<unknown, ErrorInfo, AccountInfo>('account', () => {
    return client.fetchAccountInfo();
  });
  return { data, isLoading, error };
};
