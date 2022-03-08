/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { createSlice } from '@reduxjs/toolkit';
import { useQuery } from 'react-query';
import Client, { AccountInfo, ErrorInfo, MapInfo } from '../classes/client';
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
    map: MapInfo | null;
};

export const fetchMapById = (id: number): MapLoadResult => {
    const client: Client = useSelector(activeInstance);
    const { isLoading, error, data } = useQuery<unknown, ErrorInfo, MapInfo[]>('maps', () => {
        return client.fetchAllMaps();
    });

    // If the map can not be loaded, create an error object.
    let map: MapInfo;
    let errorMsg: ErrorInfo;
    if (!isLoading) {
        // Sanitize error structure ...
        if (error) {
            errorMsg = Object.keys(error).length !== 0 ? error : null;
        }
        //  Seach for object...
        map = data?.find((m) => m.id == id);
        if (map === null && !errorMsg) {
            errorMsg = { msg: `Map with id ${id} could not be found. Please, reflesh the page` }
        }
    }
    return { isLoading: isLoading, error: errorMsg, map: map };
};

export const fetchAccount = (): AccountInfo | undefined => {
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