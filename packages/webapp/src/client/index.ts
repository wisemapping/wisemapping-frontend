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
    createdBy: string;
    creationTime: string;
    lastModificationBy: string;
    lastModificationTime: string;
    description: string;
    isPublic: boolean;
    role: 'owner' | 'editor'  | 'viewer'
}

export type ChangeHistory = {
    id: number;
    lastModificationBy: string;
    lastModificationTime: string;
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
    deleteMap(id: number): Promise<void>;
    renameMap(id: number, basicInfo: BasicMapInfo): Promise<void>;
    fetchAllMaps(): Promise<MapInfo[]>;
    duplicateMap(id: number, basicInfo: BasicMapInfo): Promise<number>;
    fetchMapInfo(id: number): Promise<BasicMapInfo>;
    changeStarred(id: number, starred: boolean): Promise<void>;
    updateMapToPublic(id: number, starred: boolean): Promise<void>;

    fetchLabels(): Promise<Label[]>;
    // createLabel(label: Label): Promise<void>;
    deleteLabel(id: number): Promise<void>;

    registerNewUser(user: NewUser): Promise<void>;
    resetPassword(email: string): Promise<void>;

    fetchHistory(id:number):Promise<ChangeHistory[]>;
    revertHistory(id:number,cid:number): Promise<void>
}


export default Client;