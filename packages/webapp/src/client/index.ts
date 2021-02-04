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
    title: string;
    labels: string[];
    creator: string;
    modified: string;
    description: string;
    isPublic: boolean;
}

export type HistoryChange = {
    id: number;
    creator: string;
    modified: string;
}

export type BasicMapInfo = {
    title: string;
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


interface Client {
    createMap(map: BasicMapInfo): Promise<number>;
    deleteLabel(label: string): Promise<void>;
    registerNewUser(user: NewUser): Promise<void>;
    resetPassword(email: string): Promise<void>;
    fetchAllMaps(): Promise<MapInfo[]>;
    fetchLabels(): Promise<string[]>;
    deleteMap(id: number): Promise<void>;
    renameMap(id: number, basicInfo: BasicMapInfo): Promise<void>;
    duplicateMap(id: number, basicInfo: BasicMapInfo): Promise<number>;
    loadMapInfo(id: number): Promise<BasicMapInfo>;
    changeStarred(id: number, starred: boolean): Promise<void>;
}


export default Client;