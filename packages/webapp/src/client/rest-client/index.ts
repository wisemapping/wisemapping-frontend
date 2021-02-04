import axios from 'axios';
import { ErrorInfo, MapInfo, NewUser, parseResponseOnError } from '..';
import MockClient from '../mock-client/';

//@Remove inheritance once is it completed.
export default class RestClient extends MockClient {
    private baseUrl: string;
    private authFailed: () => void
    
    constructor(baseUrl: string, authFailed: () => void) {
        super();
        this.baseUrl = baseUrl;
    }
    
    fetchAllMaps(): Promise<MapInfo[]> {
        // https://app.wisemapping.com/c/restful/maps/
        
        // const handler = (success: () => void, reject: (error: ErrorInfo) => void) => {
        //     axios.post(this.baseUrl + '/service/users/',
        //         JSON.stringify(user),
        //         { headers: { 'Content-Type': 'application/json' } }
        //     ).then(response => {
        //         // All was ok, let's sent to success page ...;
        //         success();
        //     }).catch(error => {
        //         const response = error.response;
        //         const errorInfo = parseResponseOnError(response);
        //         reject(errorInfo);
        //     });
        // }
        // return new Promise(handler);
        // https://app.wisemapping.com/c/restful/maps/


        // console.log("Fetching  maps from server")
        return Promise.resolve([]);
    }

    registerNewUser(user: NewUser): Promise<void> {
        const handler = (success: () => void, reject: (error: ErrorInfo) => void) => {
            axios.post(this.baseUrl + '/service/users/',
                JSON.stringify(user),
                { headers: { 'Content-Type': 'application/json' } }
            ).then(response => {
                // All was ok, let's sent to success page ...;
                success();
            }).catch(error => {
                const response = error.response;
                const errorInfo = parseResponseOnError(response);
                reject(errorInfo);
            });
        }
        return new Promise(handler);
    }

    resetPassword(email: string): Promise<void> {

        const handler = (success: () => void, reject: (error: ErrorInfo) => void) => {
            axios.put(`${this.baseUrl}/service/users/resetPassword?email=${email}`,
                null,
                { headers: { 'Content-Type': 'application/json' } }
            ).then(response => {
                // All was ok, let's sent to success page ...;
                success();
            }).catch(error => {
                const response = error.response;
                const errorInfo = parseResponseOnError(response);
                reject(errorInfo);
            });
        }
        return new Promise(handler);
    }
}

