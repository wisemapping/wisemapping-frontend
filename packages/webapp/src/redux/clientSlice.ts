/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { createSlice } from '@reduxjs/toolkit';
import { useQuery } from 'react-query';
import Client, { AccountInfo, ErrorInfo, MapInfo } from '../classes/client';
import { useSelector } from 'react-redux';
import AppConfig from '../classes/server-config';


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

    const result = data?.find((m) => m.id == id);
    const map = result || null;
    return { isLoading: isLoading, error: error, map: map };
};

export const fetchAccount = (): AccountInfo | undefined => {
    const client: Client = useSelector(activeInstance);
    const { data } = useQuery<unknown, ErrorInfo, AccountInfo>('account', () => {
        return client.fetchAccountInfo();
    });
    return data;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const activeInstance = (state: any): Client => {
    return state.client.instance;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const activeInstanceStatus = (state: any): ClientStatus => {
    return state.client.status;
};

export const { sessionExpired } = clientSlice.actions;
export default clientSlice.reducer;
