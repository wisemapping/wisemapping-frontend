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
    labels: string[];
    creator: string;
    modified: number;
    description: string;
    isPublic: boolean;
}

export type BasicMapInfo = {
    name: string;
    description?: string;
}

export type FieldError = {
    id: string,
    msg: string
}

export type ErrorInfo = {
    msg?: string;
    fields?: Map<String, String>;
}

export const parseResponseOnError = (response: any): ErrorInfo => {

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

interface Client {
    createMap(rest: { name: string; description?: string | undefined })
    deleteLabel(label: string): Promise<unknown>;
    registerNewUser(user: NewUser): Promise<void>;
    resetPassword(email: string): Promise<void>;
    fetchAllMaps(): Promise<MapInfo[]>;
    fetchLabels(): Promise<string[]>;
    deleteMap(id: number): Promise<void>;
    renameMap(id: number, basicInfo: BasicMapInfo): Promise<void>;
    duplicateMap(id: number, basicInfo: BasicMapInfo): Promise<void>;
    loadMapInfo(id: number): Promise<BasicMapInfo>;
    changeStarred(id: number): Promise<void>;

}


export default Client;