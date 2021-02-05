export type NewUser = {
    email: string;
    firstname: string;
    lastname: string;
    password: string;
    recaptcha: string | null;
}

export type Label = {
    id: number;
    title: string;
    color: string;
    iconName: string;
}


export type MapInfo = {
    id: number;
    starred: boolean;
    title: string;
    labels: number[];
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
    registerNewUser(user: NewUser): Promise<void>;
    resetPassword(email: string): Promise<void>;
    fetchAllMaps(): Promise<MapInfo[]>;
    deleteMap(id: number): Promise<void>;
    renameMap(id: number, basicInfo: BasicMapInfo): Promise<void>;
    duplicateMap(id: number, basicInfo: BasicMapInfo): Promise<number>;
    loadMapInfo(id: number): Promise<BasicMapInfo>;
    changeStarred(id: number, starred: boolean): Promise<void>;

    fetchLabels(): Promise<Label[]>;
    deleteLabel(id: number): Promise<void>;
}


export default Client;