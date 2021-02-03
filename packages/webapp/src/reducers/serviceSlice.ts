import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios';
import Client from '../client';
import MockClient from '../client/mock-client';
import RestClient from '../client/rest-client';

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
      result = new RestClient(this.config.apiBaseUrl, () => { console.log("401 error") });
      console.log("Service using rest client. " + JSON.stringify(this.config))

    } else {
      console.log("Warning:Service using mockservice client")
      result = new MockClient();
    }
    return result;
  }
}

interface ServiceState {
  instance: Client;
}

const initialState: ServiceState = {
  instance: new RutimeConfig().load().buildClient()
};

export const serviceSlice = createSlice({
  name: "service",
  initialState: initialState,
  reducers: {
    initialize(state, action: PayloadAction<void[]>) {
      // state.instance = new RutimeConfig().load().buildClient()
    }
  },
});

export const activeInstance = (state: any): Client => {
  return state.service.instance;
}

export default serviceSlice.reducer

