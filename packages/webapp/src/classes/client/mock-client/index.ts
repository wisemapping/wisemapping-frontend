import { Language } from '@material-ui/icons';
import Client, { AccountInfo, BasicMapInfo, ChangeHistory, ImportMapInfo, Label, MapInfo, NewUser } from '..';
import { LocaleCode } from '../../app-locale';
class MockClient implements Client {
    private maps: MapInfo[] = [];
    private labels: Label[] = [];

    constructor() {

        // Remove, just for develop ....
        function createMapInfo(
            id: number,
            starred: boolean,
            title: string,
            labels: number[],
            creator: string,
            creationTime: string,
            modifiedByUser: string,
            modifiedTime: string,
            description: string,
            isPublic: boolean,
            role: 'owner' | 'viewer' | 'editor'
        ): MapInfo {
            return { id, title, labels, createdBy: creator, creationTime, lastModificationBy: modifiedByUser, lastModificationTime: modifiedTime, starred, description, isPublic, role };
        }
        this.maps = [
            createMapInfo(1, true, "El Mapa", [], "Paulo", "2008-06-02T00:00:00Z", "Berna", "2008-06-02T00:00:00Z", "", true, 'owner'),
            createMapInfo(11, false, "El Mapa3", [1, 2, 3], "Paulo3", "2008-06-02T00:00:00Z", "Berna", "2008-06-02T00:00:00Z", "", false, 'editor'),
            createMapInfo(12, false, "El Mapa3", [1, 2, 3], "Paulo3", "2008-06-02T00:00:00Z", "Berna", "2008-06-02T00:00:00Z", "", false, 'editor')
        ];

        this.labels = [
            { id: 1, title: "Red Label", iconName: "", color: 'red' },
            { id: 2, title: "Blue Label", iconName: "", color: 'blue' }
        ];

    }

    updateAccountLanguage(locale: LocaleCode): Promise<void> {
        localStorage.setItem('locale', locale);
        return Promise.resolve();
    }

    importMap(model: ImportMapInfo): Promise<number> {
        return Promise.resolve(10);
    }

    fetchAccountInfo(): Promise<AccountInfo> {
        const locale: LocaleCode | null = localStorage.getItem('locale') as LocaleCode;
        return Promise.resolve({
            firstName: 'Costme',
            lastName: 'Fulanito',
            email: 'test@example.com',
            language: locale ? locale : 'en'
        });
    }
    deleteMaps(ids: number[]): Promise<void> {
        ids.forEach(id => this.deleteMap(id));
        return Promise.resolve();
    }
    revertHistory(id: number, cid: number): Promise<void> {
        return Promise.resolve();
    }

    createMap(map: BasicMapInfo): Promise<number> {
        throw new Error("Method not implemented.");
    }

    fetchLabels(): Promise<Label[]> {
        console.log("Fetching  labels from server")
        return Promise.resolve(this.labels);
    }

    updateMapToPublic(id: number, isPublic: boolean): Promise<void> {
        const mapInfo = this.maps.find(m => m.id == id);
        if (mapInfo) {
            mapInfo.isPublic = isPublic;
        }
        return Promise.resolve();
    }

    updateStarred(id: number, starred: boolean): Promise<void> {
        const mapInfo = this.maps.find(m => m.id == id);
        if (!mapInfo) {
            console.log(`Could not find the map iwth id ${id}`);
            return Promise.reject();
        }
        mapInfo.starred = starred;
        return Promise.resolve();
    }

    renameMap(id: number, basicInfo: BasicMapInfo): Promise<void> {

        const exists = this.maps.find(m => m.title == basicInfo.title) != undefined;
        if (!exists) {
            this.maps = this.maps.map(m => {
                const result = m;
                if (m.id == id) {
                    result.description = basicInfo.description ? basicInfo.description : '';
                    result.title = basicInfo.title;
                }
                return result;
            })
            return Promise.resolve();
        } else {
            const fieldErrors: Map<string, string> = new Map<string, string>();
            fieldErrors.set('name', 'name already exists ')

            return Promise.reject({
                msg: 'Map already exists ...' + basicInfo.title,
                fields: fieldErrors

            })
        };
    }
    fetchHistory(id: number): Promise<ChangeHistory[]> {
        const result = [{
            id: 1,
            lastModificationBy: 'Paulo',
            lastModificationTime: '2008-06-02T00:00:00Z'
        },
        {
            id: 2,
            lastModificationBy: 'Paulo',
            lastModificationTime: '2008-06-02T00:00:00Z'
        }
            ,
        {
            id: 3,
            lastModificationBy: 'Paulo',
            lastModificationTime: '2008-06-02T00:00:00Z'
        },
        {
            id: 4,
            lastModificationBy: 'Paulo',
            lastModificationTime: '2008-06-02T00:00:00Z'
        },
        {
            id: 5,
            lastModificationBy: 'Paulo',
            lastModificationTime: '2008-06-02T00:00:00Z'
        },
        {
            id: 6,
            lastModificationBy: 'Paulo',
            lastModificationTime: '2008-06-02T00:00:00Z'
        },
        {
            id: 7,
            lastModificationBy: 'Paulo',
            lastModificationTime: '2008-06-02T00:00:00Z'
        }
        ]
        return Promise.resolve(result);
    }

    duplicateMap(id: number, basicInfo: BasicMapInfo): Promise<number> {

        const exists = this.maps.find(m => m.title == basicInfo.title) != undefined;
        if (!exists) {

            const newMap: MapInfo = {
                id: Math.random() * 1000,
                description: String(basicInfo.description),
                title: basicInfo.title,
                starred: false,
                createdBy: "current user",
                labels: [],
                lastModificationTime: "2008-06-02T00:00:00Z",
                lastModificationBy: "Berna",
                creationTime: "2008-06-02T00:00:00Z",
                isPublic: false,
                role: 'owner'
            };
            this.maps.push(newMap);
            return Promise.resolve(newMap.id);
        } else {
            const fieldErrors: Map<string, string> = new Map<string, string>();
            fieldErrors.set('name', 'name already exists ')

            return Promise.reject({
                msg: 'Maps name must be unique:' + basicInfo.title,
                fields: fieldErrors

            })
        };
    }

    deleteLabel(id: number): Promise<void> {
        this.labels = this.labels.filter(l => l.id != id);
        console.log("Label delete:" + this.labels);
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