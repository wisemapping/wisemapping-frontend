import Client, { BasicMapInfo, ErrorInfo, MapInfo, NewUser, parseResponseOnError } from '..';
import axios from "axios";

class MockClient implements Client {
    private maps: MapInfo[] = [];
    private labels: string[] = [];

    constructor() {

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
            createMapInfo(11, false, "El Mapa3", ["label 3", "label3"], "Paulo3", 67, "", false),
            createMapInfo(12, false, "El Mapa3", ["label 2"], "Paulo3", 67, "", false)
        ];

        this.labels = ["label 1,", "label 2", "label 3"];

    }

    createMap(rest: { name: string; description?: string | undefined; }) {
        throw new Error("Method not implemented.");
    }
    s
    fetchLabels(): Promise<string[]> {
        console.log("Fetching  labels from server")
        return Promise.resolve(this.labels);
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

    fetchLabes(id: number): Promise<BasicMapInfo> {
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

    deleteLabel(label: string): Promise<void> {
        this.labels = this.labels.filter(l => l != label);
        console.log("Label delete:" + label);
        return Promise.resolve();
    }

    deleteMap(id: number): Promise<void> {
        this.maps = this.maps.filter(m => m.id != id);
        return Promise.resolve();
    }

    registerNewUser(user: NewUser): Promise<void> {
        return Promise.resolve();
    }

    fetchAllMaps(): Promise<MapInfo[]> {
        console.log("Fetching  maps from server")
        return Promise.resolve(this.maps);
    }

    resetPassword(email: string): Promise<void> {
        return Promise.resolve();
    }
}

export default MockClient;