import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Client from '../classes/client';
import MockClient from '../classes/client/mock-client';
import RestClient from '../classes/client/rest-client';

interface ConfigInfo {
  apiBaseUrl: string
}

class RutimeConfig {
  private config: ConfigInfo;

  constructor() {

  }

  load() {

    // Config can be inserted in the html page to define the global properties ...
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
    sessionExpired(state, action: PayloadAction<void>) {
      state.status = { state: 'session-expired', msg: 'Sessions has expired. You need to login again.' }
    }
  },
});

export const activeInstance = (state: any): Client => {
  return state.client.instance;
}

export const activeInstanceStatus = (state: any): ClientStatus => {
  return state.client.status;
}

export const { sessionExpired } = clientSlice.actions;
export default clientSlice.reducer;

