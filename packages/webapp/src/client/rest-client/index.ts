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
        const handler = (success: (mapsInfo: MapInfo[]) => void, reject: (error: ErrorInfo) => void) => {
            axios.get(
                this.baseUrl + '/c/restful/maps/',
                { headers: { 'Content-Type': 'application/json' } 
            }
            ).then(response => {
                console.log("Maps List Response=>")
                console.log(response.data)

                const data = response.data;
                const maps: MapInfo[] = (data.mindmapsInfo as any[]).map(m => {
                    return {
                        id: m.id,
                        starred: Boolean(m.starred),
                        name: m.title,
                        labels: [],
                        creator: m.creator,
                        modified: m.lastModificationTime,
                        description: m.description,
                        isPublic: false
                    }
                })
                success(maps);
            }).catch(error => {

                console.log("Maps List Error=>")
                console.log(error)

                const response = error.response;
                const errorInfo = parseResponseOnError(response);
                reject(errorInfo);
            });
        }
        return new Promise(handler);
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

