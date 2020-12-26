import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios';
import { ErrorInfo } from 'react';
import { RestService, Service } from '../services/Service';

type RutimeConfig = {
  apiBaseUrl: string;
}

async function loadRuntimeConfig() {
  let result: RutimeConfig | undefined;

  await axios.get("runtime-config.json"
  ).then(response => {
    // All was ok, let's sent to success page ...
    result = response.data as RutimeConfig;
    console.log("Dynamic configuration->" + response.data);
  }).catch(e => {
    console.log(e)
  });

  if (!result) {
    // Ok, try to create a default configuration relative to the current path ...
    console.log("Configuration could not be loaded, falback to default config.")
    const location = window.location;
    const basePath = location.protocol + "//" + location.host + "/" + location.pathname.split('/')[1]

    result = {
      apiBaseUrl: basePath
    }
  }
  return result;
}


interface ServiceState {
  instance: Service
}

const initialState: ServiceState = { 
  instance: new RestService("", () => { console.log("401 error") })
};

export const serviceSlice = createSlice({
  name: "service",
  initialState: initialState,
  reducers: {
    initialize(state, action: PayloadAction<void[]>) {
      state.instance = new RestService("", () => { console.log("401 error") });
    }
  },
});

export const activeInstance = (state: any): Service => {
  return state.service.instance;
}
export default serviceSlice.reducer

