/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { createSlice } from '@reduxjs/toolkit';
import { useQuery } from 'react-query';
import Client, { AccountInfo, ErrorInfo, MapInfo } from '../classes/client';
import MockClient from '../classes/client/mock-client';
import RestClient from '../classes/client/rest-client';
import { useSelector } from 'react-redux'


interface ConfigInfo {
  apiBaseUrl: string
}

class RutimeConfig {
  private config: ConfigInfo;
  load() {

    // Config can be inserted in the html page to define the global properties ...
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.config = (window as any).serverconfig;
    return this;
  }

  buildClient(): Client {
    let result: Client;
    if (this.config) {
      result = new RestClient(this.config.apiBaseUrl, () => { sessionExpired() });
      console.log("Service using rest client. " + JSON.stringify(this.config))

    } else {
      console.log("Warning:Service using mockservice client")
      result = new MockClient();
    }
    return result;
  }
}

export interface ClientStatus {
  state: 'healthy' | 'session-expired';
  msg?: string

}

export interface ClientState {
  instance: Client;
  status: ClientStatus;
}

const initialState: ClientState = {
  instance: new RutimeConfig().load().buildClient(),
  status: { state: 'healthy' }
};

export const clientSlice = createSlice({
  name: "client",
  initialState: initialState,
  reducers: {
    sessionExpired(state) {
      state.status = { state: 'session-expired', msg: 'Sessions has expired. You need to login again'  }
    }
  },
});


type MapLoadResult = {
  isLoading: boolean,
  error: ErrorInfo | null,
  map: MapInfo | null
}

export const fetchMapById = (id: number): MapLoadResult => {

  const client: Client = useSelector(activeInstance);
  const { isLoading, error, data } = useQuery<unknown, ErrorInfo, MapInfo[]>('maps', () => {
    return client.fetchAllMaps();
  });

  const result = data?.find(m => m.id == id);
  const map = result || null;
  return { isLoading: isLoading, error: error, map: map };
}


export const fetchAccount = (): AccountInfo | undefined => {
  const client: Client = useSelector(activeInstance);
  const { data } = useQuery<unknown, ErrorInfo, AccountInfo>('account', () => {
    return client.fetchAccountInfo();
  });
  return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const activeInstance = (state: any): Client => {
  return state.client.instance;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const activeInstanceStatus = (state: any): ClientStatus => {
  return state.client.status;
}

export const { sessionExpired } = clientSlice.actions;
export default clientSlice.reducer;


