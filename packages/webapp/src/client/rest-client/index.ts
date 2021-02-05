import axios from 'axios';
import { ErrorInfo, MapInfo, BasicMapInfo, NewUser, Label } from '..';
import MockClient from '../mock-client/';

//@Remove inheritance once is it completed.
export default class RestClient extends MockClient {
    private baseUrl: string;
    private authFailed: () => void

    constructor(baseUrl: string, authFailed: () => void) {
        super();
        this.baseUrl = baseUrl;
    }

    private parseResponseOnError = (response: any): ErrorInfo => {

        let result: ErrorInfo | undefined;
        if (response) {
            const status: number = response.status;
            const data = response.data;
            console.log(data);

            switch (status) {
                case 401:
                    //    this.authFailed();
                    break;
                default:
                    if (data) {
                        // Set global errors ...
                        result = {};
                        let globalErrors = data.globalErrors;
                        if (globalErrors && globalErrors.length > 0) {
                            result.msg = globalErrors[0];
                        }

                        // Set field errors ...
                        if (data.fieldErrors && Object.keys(data.fieldErrors).length > 0) {
                            result.fields = data.fieldErrors;
                            if (!result.msg) {
                                const key = Object.keys(data.fieldErrors)[0];
                                result.msg = data.fieldErrors[key];
                            }
                        }

                    } else {
                        result = { msg: response.statusText };
                    }
            }
        }

        // Network related problem ...
        if (!result) {
            result = { msg: 'Unexpected error. Please, try latter' };
        }

        return result;
    }

    renameMap(id: number, basicInfo: BasicMapInfo): Promise<void> {
        throw "Method not implemented yet";
    }

    createMap(model: BasicMapInfo): Promise<number> {
        const handler = (success: (mapId: number) => void, reject: (error: ErrorInfo) => void) => {
            axios.post(this.baseUrl + `/c/restful/maps?title=${model.title}&description=${model.description ? model.description : ''}`,
                null,
                { headers: { 'Content-Type': 'application/json' } }
            ).then(response => {
                const mapId = response.headers.resourceid;
                success(mapId);
            }).catch(error => {
                const response = error.response;
                const errorInfo = this.parseResponseOnError(response);
                reject(errorInfo);
            });
        }
        return new Promise(handler);
    }

    fetchAllMaps(): Promise<MapInfo[]> {
        const handler = (success: (mapsInfo: MapInfo[]) => void, reject: (error: ErrorInfo) => void) => {
            axios.get(
                this.baseUrl + '/c/restful/maps/',
                {
                    headers: { 'Content-Type': 'application/json' }
                }
            ).then(response => {
                const data = response.data;
                const maps: MapInfo[] = (data.mindmapsInfo as any[]).map(m => {
                    return {
                        id: m.id,
                        starred: Boolean(m.starred),
                        title: m.title,
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
                const errorInfo = this.parseResponseOnError(response);
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
                console.log(error);
                const response = error.response;
                const errorInfo = this.parseResponseOnError(response);
                reject(errorInfo);
            });
        }
        return new Promise(handler);
    }

    deleteMap(id: number): Promise<void> {
        const handler = (success: () => void, reject: (error: ErrorInfo) => void) => {
            axios.delete(this.baseUrl + `/c/restful/maps/${id}`,
                { headers: { 'Content-Type': 'application/json' } }
            ).then(response => {
                success();
            }).catch(error => {
                const response = error.response;
                const errorInfo = this.parseResponseOnError(response);
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
                const errorInfo = this.parseResponseOnError(response);
                reject(errorInfo);
            });
        }
        return new Promise(handler);
    }

    duplicateMap(id: number, basicInfo: BasicMapInfo): Promise<number> {

        const handler = (success: (mapId: number) => void, reject: (error: ErrorInfo) => void) => {
            axios.post(this.baseUrl + `/c/restful/maps/${id}`,
                JSON.stringify(basicInfo),
                { headers: { 'Content-Type': 'application/json' } }
            ).then(response => {
                const mapId = response.headers.resourceid;
                success(mapId);
            }).catch(error => {
                const response = error.response;
                const errorInfo = this.parseResponseOnError(response);
                reject(errorInfo);
            });
        }
        return new Promise(handler);
    }

    changeStarred(id: number, starred: boolean): Promise<void> {
        const handler = (success: () => void, reject: (error: ErrorInfo) => void) => {
            axios.put(this.baseUrl + `/c/restful/maps/${id}/starred`,
            starred,
                { headers: { 'Content-Type': 'text/plain' } }
            ).then(() => {
                success();
            }).catch(error => {
                const response = error.response;
                const errorInfo = this.parseResponseOnError(response);
                reject(errorInfo);
            });
        }
        return new Promise(handler);
    }

    deleteLabel(id: number): Promise<void> {
        console.log("Fetching  labels from server")
        return Promise.resolve();
    }
}

