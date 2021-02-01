import { BasicMapInfo, ErrorInfo, MapInfo, NewUser } from "..";
import Service from "..";
import axios from "axios";

class MockService implements Service {
    private baseUrl: string;
    private authFailed: () => void
    private maps: MapInfo[] = [];

    constructor(baseUrl: string, authFailed: () => void) {
        this.baseUrl = baseUrl;

        // Remove, just for develop ....
        function createMapInfo(
            id: number,
            starred: boolean,
            name: string,
            labels: string[],
            creator: string,
            modified: number,
            description: string,
            isPublic: boolean
        ): MapInfo {
            return { id, name, labels, creator, modified, starred, description, isPublic };
        }
        this.maps = [
            createMapInfo(1, true, "El Mapa", [""], "Paulo", 67, "", true),
            createMapInfo(2, false, "El Mapa2", [""], "Paulo2", 67, "", false),
            createMapInfo(3, false, "El Mapa3", [""], "Paulo3", 67, "", false),
            createMapInfo(4, false, "El Mapa3", [""], "Paulo3", 67, "", false),
            createMapInfo(5, false, "El Mapa3", [""], "Paulo3", 67, "", false),
            createMapInfo(6, false, "El Mapa3", [""], "Paulo3", 67, "", false),
            createMapInfo(7, false, "El Mapa3", [""], "Paulo3", 67, "", false),
            createMapInfo(8, false, "El Mapa3", [""], "Paulo3", 67, "", false),
            createMapInfo(9, false, "El Mapa3", [""], "Paulo3", 67, "", false),
            createMapInfo(10, false, "El Mapa3", [""], "Paulo3", 67, "", false),
            createMapInfo(11, false, "El Mapa3", [""], "Paulo3", 67, "", false),
            createMapInfo(12, false, "El Mapa3", [""], "Paulo3", 67, "", false)
        ];
    }

    changeStarred(id: number): Promise<void> {
        const mapInfo = this.maps.find(m => m.id == id);
        if (!mapInfo) {
            console.log(`Could not find the map iwth id ${id}`);
            return Promise.reject();
        }
        const newStarredValue = !mapInfo?.starred;
        mapInfo.starred = newStarredValue;

        return Promise.resolve();
    }

    loadMapInfo(id: number): Promise<BasicMapInfo> {
        return Promise.resolve({ name: 'My Map', description: 'My Description' });
    }

    renameMap(id: number, basicInfo: BasicMapInfo): Promise<void> {

        const exists = this.maps.find(m => m.name == basicInfo.name) != undefined;
        if (!exists) {
            this.maps = this.maps.map(m => {
                const result = m;
                if (m.id == id) {
                    result.description = basicInfo.description ? basicInfo.description : '';
                    result.name = basicInfo.name;
                }
                return result;
            })
            return Promise.resolve();
        } else {
            const fieldErrors: Map<string, string> = new Map<string, string>();
            fieldErrors.set('name', 'name already exists ')

            return Promise.reject({
                msg: 'Map already exists ...' + basicInfo.name,
                fields: fieldErrors

            })
        };
    }

    duplicateMap(id: number, basicInfo: BasicMapInfo): Promise<void> {

        const exists = this.maps.find(m => m.name == basicInfo.name) != undefined;
        if (!exists) {

            const newMap: MapInfo = {
                id: Math.random() * 1000,
                description: String(basicInfo.description),
                name: basicInfo.name,
                starred: false,
                creator: "current user",
                labels: [],
                modified: -1,
                isPublic: false
            };
            this.maps.push(newMap);
            return Promise.resolve();
        } else {
            const fieldErrors: Map<string, string> = new Map<string, string>();
            fieldErrors.set('name', 'name already exists ')

            return Promise.reject({
                msg: 'Maps name must be unique:' + basicInfo.name,
                fields: fieldErrors

            })
        };
    }

    deleteMap(id: number): Promise<void> {
        this.maps = this.maps.filter(m => m.id != id);
        return Promise.resolve();
    }

    registerNewUser(user: NewUser): Promise<void> {
        const handler = (success: () => void, reject: (error: ErrorInfo) => void) => {
            axios.post(this.baseUrl + '/service/users',
                JSON.stringify(user),
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

    fetchAllMaps(): Promise<MapInfo[]> {
        console.log("Fetch maps from server")
        return Promise.resolve(this.maps);
    }

    resetPassword(email: string): Promise<void> {

        const handler = (success: () => void, reject: (error: ErrorInfo) => void) => {
            axios.post(`${this.baseUrl}/service/users/resetPassword?email=${email}`,
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

    private parseResponseOnError = (response: any): ErrorInfo => {

        let result: ErrorInfo | undefined;
        if (response) {
            const status: number = response.status;
            const data = response.data;
            console.log(data);

            switch (status) {
                case 401:
                    this.authFailed();
                    break;
                default:
                    if (data) {
                        // Set global errors ...
                        if (data.globalErrors) {
                            let msg;
                            let errors = data.globalErrors;
                            if (errors.length > 0) {
                                msg = errors[0];
                            }
                            result = { msg: errors };
                        }

                        // Set field errors ...
                        if (data.fieldErrors) {
                            // @Todo: Fix this ...
                            result = { msg: data.fieldErrors };
                            result.fields = new Map<string, string>();
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

export default MockService;