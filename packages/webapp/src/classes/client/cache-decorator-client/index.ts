import { Mindmap } from '@wisemapping/mindplot';
import Client, {
    AccountInfo,
    BasicMapInfo,
    ChangeHistory,
    ImportMapInfo,
    Label,
    MapInfo,
    NewUser,
    Permission,
} from '..';
import { LocaleCode } from '../../app-i18n';

class CacheDecoratorClient implements Client {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
    }
    fetchMindmap(id: number): Mindmap {
        return this.client.fetchMindmap(id);
    }

    deleteAccount(): Promise<void> {
        return this.client.deleteAccount();
    }

    importMap(model: ImportMapInfo): Promise<number> {
        return this.client.importMap(model);
    }

    createMap(map: BasicMapInfo): Promise<number> {
        return this.client.createMap(map);
    }

    deleteMaps(ids: number[]): Promise<void> {
        return this.client.deleteMaps(ids);
    }

    deleteMap(id: number): Promise<void> {
        return this.client.deleteMap(id);
    }

    renameMap(id: number, basicInfo: BasicMapInfo): Promise<void> {
        return this.client.renameMap(id, basicInfo);
    }

    fetchAllMaps(): Promise<MapInfo[]> {
        return this.client.fetchAllMaps();
    }

    fetchMapPermissions(id: number): Promise<Permission[]> {
        return this.client.fetchMapPermissions(id);
    }

    addMapPermissions(id: number, message: string, permissions: Permission[]): Promise<void> {
        return this.client.addMapPermissions(id, message, permissions);
    }

    deleteMapPermission(id: number, email: string): Promise<void> {
        return this.client.deleteMapPermission(id, email);
    }

    duplicateMap(id: number, basicInfo: BasicMapInfo): Promise<number> {
        return this.client.duplicateMap(id, basicInfo);
    }

    updateAccountLanguage(locale: LocaleCode): Promise<void> {
        return this.client.updateAccountLanguage(locale);
    }

    updateAccountPassword(pasword: string): Promise<void> {
        return this.client.updateAccountPassword(pasword);
    }

    updateAccountInfo(firstname: string, lastname: string): Promise<void> {
        return this.client.updateAccountInfo(firstname, lastname);
    }

    updateStarred(id: number, starred: boolean): Promise<void> {
        return this.client.updateStarred(id, starred);
    }

    updateMapToPublic(id: number, isPublic: boolean): Promise<void> {
        return this.client.updateMapToPublic(id, isPublic);
    }

    fetchLabels(): Promise<Label[]> {
        return this.client.fetchLabels();
    }

    deleteLabel(id: number): Promise<void> {
        return this.client.deleteLabel(id);
    }

    fetchAccountInfo(): Promise<AccountInfo> {
        return this.client.fetchAccountInfo();
    }

    registerNewUser(user: NewUser): Promise<void> {
        return this.client.registerNewUser(user);
    }

    resetPassword(email: string): Promise<void> {
        return this.client.resetPassword(email);
    }

    fetchHistory(id: number): Promise<ChangeHistory[]> {
        return this.client.fetchHistory(id);
    }

    revertHistory(id: number, cid: number): Promise<void> {
        return this.client.revertHistory(id, cid);
    }
}

export default CacheDecoratorClient;