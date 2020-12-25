import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios';
import { RestService, Service } from '../services/Service';

function createMapInfo(
  id: number,
  starred: boolean,
  name: string,
  labels: [string],
  creator: string,
  modified: number,
  description: string
): MapInfo {
  return { id, name, labels, creator, modified, starred, description };
}

const maps = [
  createMapInfo(1, true, "El Mapa", [""], "Paulo", 67, ""),
  createMapInfo(2, false, "El Mapa2", [""], "Paulo2", 67, ""),
  createMapInfo(3, false, "El Mapa3", [""], "Paulo3", 67, "")
];

export type MapInfo = {
  id: number;
  starred: boolean;
  name: string;
  labels: [string];
  creator: string;
  modified: number;
  description: string
}

interface MapsListState {
  maps: MapInfo[]
}

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

const initialState: MapsListState = { maps: maps };

const service: Service = new RestService("", () => { console.log("401 error") });

type RemovePayload = {
  id: number;
}

type RenamePayload = {
  id: number;
  name: string;
  description: string | undefined;

}

export const mapsListSlice = createSlice({
  name: 'maps',
  initialState: initialState,
  reducers: {
    remove(state, action: PayloadAction<RemovePayload>) {
      const maps: MapInfo[] = state.maps as MapInfo[];
      const payload = action.payload;
      state.maps = maps.filter(map => map.id != payload.id);
    },
    rename(state, action: PayloadAction<RenamePayload>) {
      let maps: MapInfo[] = state.maps as MapInfo[];
      const payload = action.payload;

      const mapInfo = maps.find(m => m.id == payload.id);
      if (mapInfo) {
        mapInfo.name = payload.name;
        mapInfo.description = payload.description ? payload.description: "";

        // Remove and add the new map.
        maps = maps.filter(map => map.id != payload.id);
        maps.push(mapInfo);

        state.maps = maps;

      }
    }
  },
});

export const allMaps = (state: any): MapInfo[] => state.mapsList.maps;

export const { remove, rename } = mapsListSlice.actions
export default mapsListSlice.reducer