import axios from 'axios';
import Client, { ErrorInfo, MapInfo, BasicMapInfo, NewUser, Label, ChangeHistory, AccountInfo } from '..';

export default class RestClient implements Client {
    private baseUrl: string;
    private sessionExpired: () => void

    constructor(baseUrl: string, sessionExpired: () => void) {
        this.baseUrl = baseUrl;
        this.sessionExpired = sessionExpired;
    }

    fetchAccountInfo(): Promise<AccountInfo> {
        const handler = (success: (account: AccountInfo) => void, reject: (error: ErrorInfo) => void) => {
            axios.get(
                this.baseUrl + '/c/restful/account',
                {
                    headers: { 'Content-Type': 'application/json' }
                }
            ).then(response => {
                const account = response.data;
                success({
                    lastName: account.lastName ? account.lastName : '',
                    firstName: account.fistName ? account.fistName : '',
                    email: account.email,
                });
            }).catch(error => {
                const errorInfo = this.parseResponseOnError(error.response);
                reject(errorInfo);
            });
        }
        return new Promise(handler);
    }

    deleteMaps(ids: number[]): Promise<void> {
        const handler = (success: () => void, reject: (error: ErrorInfo) => void) => {
            axios.delete(this.baseUrl + `/c/restful/maps/batch?ids=${ids.join()}`,
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

    updateMapToPublic(id: number, isPublic: boolean): Promise<void> {
        const handler = (success: () => void, reject: (error: ErrorInfo) => void) => {
            axios.put(`${this.baseUrl}/c/restful/maps/${id}/publish`,
                isPublic,
                { headers: { 'Content-Type': 'text/plain' } }
            ).then(() => {
                // All was ok, let's sent to success page ...;
                success();
            }).catch(error => {
                const errorInfo = this.parseResponseOnError(error.response);
                reject(errorInfo);
            });
        }
        return new Promise(handler);
    }

    revertHistory(id: number, hid: number): Promise<void> {
        const handler = (success: () => void, reject: (error: ErrorInfo) => void) => {
            axios.post(this.baseUrl + `/maps/${id}/history/${hid}`,
                null,
                { headers: { 'Content-Type': 'text/pain' } }
            ).then(() => {
                success();
            }).catch(error => {
                const errorInfo = this.parseResponseOnError(error.response);
                reject(errorInfo);
            });
        }
        return new Promise(handler);
    }

    fetchHistory(id: number): Promise<ChangeHistory[]> {
        throw new Error('Method not implemented.');
    }

    renameMap(id: number, basicInfo: BasicMapInfo): Promise<void> {
        const handler = (success: () => void, reject: (error: ErrorInfo) => void) => {
            axios.put(`${this.baseUrl}/c/restful/maps/${id}/title`,
                basicInfo.title,
                { headers: { 'Content-Type': 'text/plain' } }
            ).then(() => {
                return axios.put(`${this.baseUrl}/c/restful/maps/${id}/description`,
                    basicInfo.description,
                    { headers: { 'Content-Type': 'text/plain' } }
                )
            }).then(() => {
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

    createMap(model: BasicMapInfo): Promise<number> {
        const handler = (success: (mapId: number) => void, reject: (error: ErrorInfo) => void) => {
            axios.post(this.baseUrl + `/c/restful/maps?title=${model.title}&description=${model.description ? model.description : ''}`,
                null,
                { headers: { 'Content-Type': 'application/json' } }
            ).then(response => {
                const mapId = response.headers.resourceid;
                success(mapId);
            }).catch(error => {
                const errorInfo = this.parseResponseOnError(error.response);
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
                        labels: m.labels,
                        createdBy: m.creator,
                        creationTime: m.creationTime,
                        lastModificationBy: m.lastModifierUser,
                        lastModificationTime: m.lastModificationTime,
                        description: m.description,
                        isPublic: m['public'],
                        role: m.role
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
                const errorInfo = this.parseResponseOnError(error.response);
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

    updateStarred(id: number, starred: boolean): Promise<void> {
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

    fetchLabels(): Promise<Label[]> {
        const handler = (success: (labels: Label[]) => void, reject: (error: ErrorInfo) => void) => {
            axios.get(
                this.baseUrl + '/c/restful/labels/',
                {
                    headers: { 'Content-Type': 'application/json' }
                }
            ).then(response => {
                const data = response.data;
                const maps: Label[] = (data.labels as any[]).map(l => {
                    return {
                        id: l.id,
                        color: l.color,
                        title: l.title,
                        iconName: l.iconName
                    }
                })
                success(maps);
            }).catch(error => {
                const errorInfo = this.parseResponseOnError(error.response);
                reject(errorInfo);
            });
        }
        return new Promise(handler);
    }

    deleteLabel(id: number): Promise<void> {
        const handler = (success: () => void, reject: (error: ErrorInfo) => void) => {
            axios.delete(this.baseUrl + `/c/restful/label/${id}`).then(response => {
                success();
            }).catch(error => {
                const errorInfo = this.parseResponseOnError(error.response);
                reject(errorInfo);
            });
        }
        return new Promise(handler);
    }

    private parseResponseOnError = (response: any): ErrorInfo => {
        let result: ErrorInfo | undefined;
        if (response) {
            const status: number = response.status;
            const data = response.data;
            console.log(data);

            switch (status) {
                case 401:
                case 302:
                    this.sessionExpired();
                    result = { msg: "Your current session has expired. Please, sign in and try again." };
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

}

