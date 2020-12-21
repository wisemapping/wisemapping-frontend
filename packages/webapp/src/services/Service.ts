import axios from 'axios'

export type NewUser = {
    email: string;
    firstname: string;
    lastname: string;
    password: string;
    recaptcha: string | null;
}

export type MapInfo = {
    id: number;
    starred: boolean;
    name: string;
    labels: [string];
    creator: string;
    modified: number;
}

export type BasicMapInfo = {
    name: string;
    description: string;
}

export type FieldError = {
    id: string,
    msg: string
}

export type ErrorInfo = {
    msg?: string;
    fields?: Map<String, String>;
}

interface Service {
    registerNewUser(user: NewUser): Promise<void>;
    resetPassword(email: string): Promise<void>;
    fetchAllMaps(): Promise<MapInfo[]>;

    deleteMap(id: number): Promise<void>;
    renameMap(id: number, basicInfo: BasicMapInfo): Promise<void>;
    loadMapInfo(id: number): Promise<BasicMapInfo>;
}

class RestService implements Service {
    private baseUrl: string;
    private authFailed: () => void

    constructor(baseUrl: string, authFailed: () => void) {
        this.baseUrl = baseUrl;
    }

    loadMapInfo(id: number): Promise<BasicMapInfo> {
        return Promise.resolve({ name: 'My Map', description: 'My Description' });
    }

    renameMap(id: number, basicInfo: BasicMapInfo): Promise<void> {
        const fieldErrors: Map<string, string> = new Map<string, string>();
        fieldErrors.set('name', 'name already exists ')

        return Promise.reject({
            msg: 'Map already exists ...' + basicInfo.name,
            fields: fieldErrors
        });
    }

    async deleteMap(id: number): Promise<void> {
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

    async fetchAllMaps(): Promise<MapInfo[]> {
        function createMapInfo(
            id: number,
            starred: boolean,
            name: string,
            labels: [string],
            creator: string,
            modified: number,
        ): MapInfo {
            return { id, name, labels, creator, modified, starred };
        }

        const maps = [
            createMapInfo(1, true, "El Mapa", [""], "Paulo", 67,),
            createMapInfo(2, false, "El Mapa2", [""], "Paulo2", 67),
            createMapInfo(3, false, "El Mapa3", [""], "Paulo3", 67)
        ];

        return Promise.resolve(maps);
    }

    resetPassword(email: string): Promise<void> {

        const handler = (success: () => void, reject: (error: ErrorInfo) => void) => {
            axios.post(this.baseUrl + '/service/users/resetPassword?email=' + email,
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
                        // Set global errorrs ...
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
export { Service, RestService }