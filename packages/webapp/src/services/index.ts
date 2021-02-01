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

interface Service {
    registerNewUser(user: NewUser): Promise<void>;
    resetPassword(email: string): Promise<void>;
    fetchAllMaps(): Promise<MapInfo[]>;

    deleteMap(id: number): Promise<void>;
    renameMap(id: number, basicInfo: BasicMapInfo): Promise<void>;
    duplicateMap(id: number, basicInfo: BasicMapInfo): Promise<void>;
    loadMapInfo(id: number): Promise<BasicMapInfo>;
    changeStarred(id: number): Promise<void>;
}


export  default Service;