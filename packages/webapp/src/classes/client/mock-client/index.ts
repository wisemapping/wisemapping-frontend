/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import Client, {
  AccountInfo,
  BasicMapInfo,
  ChangeHistory,
  ImportMapInfo,
  Label,
  MapInfo,
  NewUser,
  Permission,
  Oauth2CallbackResult,
  ForgotPasswordResult,
  JwtAuth,
  MapMetadata,
} from '..';
import { LocaleCode, localeFromStr } from '../../app-i18n';
import Cookies from 'universal-cookie';
import JwtTokenConfig from '../../jwt-token-config';

const label1: Label = {
  id: 1,
  title: 'label 1',
  color: 'black',
};

const label2: Label = {
  id: 2,
  title: 'label 2',
  color: 'green',
};

const label3: Label = {
  id: 3,
  title: 'label 3',
  color: 'red',
};

class MockClient implements Client {
  private maps: MapInfo[] = [];
  private labels: Label[] = [];
  private permissionsByMap: Map<number, Permission[]> = new Map();

  constructor() {
    // Remove, just for develop ....
    function createMapInfo(
      id: number,
      starred: boolean,
      title: string,
      labels: Label[],
      creator: string,
      creationTime: string,
      modifiedByUser: string,
      modifiedTime: string,
      description: string,
      isPublic: boolean,
      role: 'owner' | 'viewer' | 'editor',
    ): MapInfo {
      return {
        id,
        title,
        labels,
        createdBy: creator,
        creationTime,
        lastModificationBy: modifiedByUser,
        lastModificationTime: modifiedTime,
        starred,
        description,
        public: isPublic,
        role,
      };
    }

    this.maps = [
      createMapInfo(
        1,
        true,
        'El Mapa',
        [],
        'Paulo',
        '2008-06-02T00:00:00Z',
        'Berna',
        '2008-06-02T00:00:00Z',
        '',
        true,
        'owner',
      ),
      createMapInfo(
        2,
        false,
        'My New Project',
        [label1],
        'Paulo',
        '2025-01-15T10:30:00Z',
        'Paulo',
        '2025-01-15T14:20:00Z',
        'A new mindmap project for testing',
        false,
        'owner',
      ),
      createMapInfo(
        11,
        false,
        'El Mapa3',
        [label1, label2],
        'Paulo3',
        '2008-06-02T00:00:00Z',
        'Berna',
        '2008-06-02T00:00:00Z',
        '',
        false,
        'editor',
      ),
      createMapInfo(
        12,
        false,
        'Team Roadmap (View Only)',
        [label2, label3],
        'Maria',
        '2024-11-20T08:15:00Z',
        'Maria',
        '2025-01-10T16:45:00Z',
        'Shared by Maria - view only access',
        false,
        'viewer',
      ),
    ];

    this.labels = [label1, label2, label3];
  }
  fetchMapInfo(id: number): Promise<MapInfo> {
    const map = this.maps.find((m) => m.id === id);
    if (!map) {
      throw new Error(`Map could not be found ${id}`);
    }
    return Promise.resolve(map);
  }

  fetchMapMetadata(id: number): Promise<MapMetadata> {
    return Promise.resolve({
      title: 'my map',
      creatorFullName: 'The Map Creator',
      id: id,
      isLocked: false,
      jsonProps: '{ "zoom": 0.8 }',
    });
  }

  logout(): Promise<void> {
    return Promise.resolve();
  }

  login(auth: JwtAuth): Promise<void> {
    JwtTokenConfig.storeToken(auth.email);
    return Promise.resolve();
  }

  private _jwtToken(): string | undefined {
    // Set cookie on session ...
    const cookies = new Cookies();
    return cookies.get('jwt-token-mock');
  }

  fetchStarred(id: number): Promise<boolean> {
    return Promise.resolve(Boolean(this.maps.find((m) => m.id == id)?.starred));
  }

  onSessionExpired(callback?: () => void): (() => void) | undefined {
    return callback;
  }

  deleteMapPermission(id: number, email: string): Promise<void> {
    let perm = this.permissionsByMap.get(id) || [];
    perm = perm.filter((p) => p.email != email);
    this.permissionsByMap.set(id, perm);
    return Promise.resolve();
  }

  addMapPermissions(id: number, message: string, permissions: Permission[]): Promise<void> {
    let perm = this.permissionsByMap.get(id) || [];
    perm = perm.concat(permissions);
    this.permissionsByMap.set(id, perm);
    return Promise.resolve();
  }

  fetchMapPermissions(id: number): Promise<Permission[]> {
    let perm = this.permissionsByMap.get(id);
    if (!perm) {
      perm = [
        {
          name: 'Cosme Editor',
          email: 'pepe@example.com',
          role: 'editor',
        },
        {
          name: 'Cosme Owner',
          email: 'pepe2@example.com',
          role: 'owner',
        },
        {
          name: 'Cosme Viewer',
          email: 'pepe3@example.com',
          role: 'viewer',
        },
      ];
      this.permissionsByMap.set(id, perm);
    }
    return Promise.resolve(perm);
  }

  deleteAccount(): Promise<void> {
    return Promise.resolve();
  }

  updateAccountInfo(firstname: string, lastname: string): Promise<void> {
    console.log('firstname:' + firstname, +lastname);
    return Promise.resolve();
  }

  updateAccountPassword(pasword: string): Promise<void> {
    console.log('password:' + pasword);
    return Promise.resolve();
  }

  updateAccountLanguage(locale: LocaleCode): Promise<void> {
    localStorage.setItem('locale', locale);
    return Promise.resolve();
  }

  importMap(model: ImportMapInfo): Promise<number> {
    console.log('model:' + model);
    return Promise.resolve(10);
  }

  fetchAccountInfo(): Promise<AccountInfo> {
    console.log('Fetch account info ...');
    const locale: LocaleCode | null = localStorage.getItem('locale') as LocaleCode;
    return Promise.resolve({
      firstname: 'Costme',
      lastname: 'Fulanito',
      email: 'test@example.com',
      locale: localeFromStr(locale),
      authenticationType: 'DATABASE',
      admin: true, // Mock admin user for testing
    });
  }

  deleteMaps(ids: number[]): Promise<void> {
    ids.forEach((id) => this.deleteMap(id));
    return Promise.resolve();
  }
  revertHistory(id: number, cid: number): Promise<void> {
    console.log('model:' + id + cid);
    return Promise.resolve();
  }

  createMap(map: BasicMapInfo): Promise<number> {
    throw new Error('Method not implemented.' + map);
  }

  fetchLabels(): Promise<Label[]> {
    console.log('Fetching  labels from server');
    return Promise.resolve(this.labels);
  }

  updateMapToPublic(id: number, isPublic: boolean): Promise<void> {
    const mapInfo = this.maps.find((m) => m.id == id);
    if (mapInfo) {
      mapInfo.public = isPublic;
    }
    return Promise.resolve();
  }

  updateStarred(id: number, starred: boolean): Promise<void> {
    const mapInfo = this.maps.find((m) => m.id == id);
    if (!mapInfo) {
      console.log(`Could not find the map iwth id ${id}`);
      return Promise.reject();
    }
    mapInfo.starred = starred;
    return Promise.resolve();
  }

  renameMap(id: number, basicInfo: BasicMapInfo): Promise<void> {
    const exists = this.maps.find((m) => m.title == basicInfo.title) != undefined;
    if (!exists) {
      this.maps = this.maps.map((m) => {
        const result = m;
        if (m.id == id) {
          result.description = basicInfo.description ? basicInfo.description : '';
          result.title = basicInfo.title;
        }
        return result;
      });
      return Promise.resolve();
    } else {
      const fieldErrors: Map<string, string> = new Map<string, string>();
      fieldErrors.set('name', 'name already exists ');

      return Promise.reject({
        msg: 'Map already exists ...' + basicInfo.title,
        fields: fieldErrors,
      });
    }
  }

  fetchHistory(id: number): Promise<ChangeHistory[]> {
    console.log(`Fetching history for ${id}`);
    const result = [
      {
        id: 1,
        lastModificationBy: 'Paulo',
        lastModificationTime: '2008-06-02T00:00:00Z',
      },
      {
        id: 2,
        lastModificationBy: 'Paulo',
        lastModificationTime: '2008-06-02T00:00:00Z',
      },
      {
        id: 3,
        lastModificationBy: 'Paulo',
        lastModificationTime: '2008-06-02T00:00:00Z',
      },
      {
        id: 4,
        lastModificationBy: 'Paulo',
        lastModificationTime: '2008-06-02T00:00:00Z',
      },
      {
        id: 5,
        lastModificationBy: 'Paulo',
        lastModificationTime: '2008-06-02T00:00:00Z',
      },
      {
        id: 6,
        lastModificationBy: 'Paulo',
        lastModificationTime: '2008-06-02T00:00:00Z',
      },
      {
        id: 7,
        lastModificationBy: 'Paulo',
        lastModificationTime: '2008-06-02T00:00:00Z',
      },
    ];
    return Promise.resolve(result);
  }

  duplicateMap(id: number, basicInfo: BasicMapInfo): Promise<number> {
    const exists = this.maps.find((m) => m.title == basicInfo.title) != undefined;
    if (!exists) {
      const newMap: MapInfo = {
        id: Math.random() * 1000,
        description: String(basicInfo.description),
        title: basicInfo.title,
        starred: false,
        createdBy: 'current user',
        labels: [],
        lastModificationTime: '2008-06-02T00:00:00Z',
        lastModificationBy: 'Berna',
        creationTime: '2008-06-02T00:00:00Z',
        public: false,
        role: 'owner',
      };
      this.maps.push(newMap);
      return Promise.resolve(newMap.id);
    } else {
      const fieldErrors: Map<string, string> = new Map<string, string>();
      fieldErrors.set('name', 'name already exists ');

      return Promise.reject({
        msg: 'Maps name must be unique:' + basicInfo.title,
        fields: fieldErrors,
      });
    }
  }

  createLabel(title: string, color: string): Promise<number> {
    const newId =
      Math.max.apply(
        Number,
        this.labels.map((l) => l.id),
      ) + 1;
    this.labels.push({
      id: newId,
      title,
      color,
    });
    return newId;
  }

  deleteLabel(id: number): Promise<void> {
    this.labels = this.labels.filter((l) => l.id != id);
    this.maps = this.maps.map((m) => {
      return {
        ...m,
        labels: m.labels.filter((l) => l.id != id),
      };
    });
    return Promise.resolve();
  }

  addLabelToMap(labelId: number, mapId: number): Promise<void> {
    const labelToAdd = this.labels.find((l) => l.id === labelId);
    if (!labelToAdd) {
      return Promise.reject({ msg: `unable to find label with id ${labelId}` });
    }
    const map = this.maps.find((m) => m.id === mapId);
    if (!map) {
      return Promise.reject({ msg: `unable to find map with id ${mapId}` });
    }
    map.labels.push(labelToAdd);
    return Promise.resolve();
  }

  deleteLabelFromMap(labelId: number, mapId: number): Promise<void> {
    const map = this.maps.find((m) => m.id === mapId);
    if (!map) {
      return Promise.reject({ msg: `unable to find map with id ${mapId}` });
    }
    map.labels = map.labels.filter((l) => l.id !== labelId);
    return Promise.resolve();
  }

  deleteMap(id: number): Promise<void> {
    this.maps = this.maps.filter((m) => m.id != id);
    return Promise.resolve();
  }

  registerNewUser(user: NewUser): Promise<void> {
    console.log('user:' + user);
    if (user.email == 'error@example.com') {
      return Promise.reject({ msg: 'Unexpected error' });
    }
    return Promise.resolve();
  }

  fetchAllMaps(): Promise<MapInfo[]> {
    console.log('Fetching  maps from server');
    return Promise.resolve(this.maps);
  }

  resetPassword(email: string): Promise<ForgotPasswordResult> {
    console.log('email:' + email);
    return Promise.resolve({ action: 'EMAIL_SENT' });
  }

  activateAccount(code: string): Promise<void> {
    console.log('Activating account with code:' + code);
    return Promise.resolve();
  }

  processGoogleCallback(): Promise<Oauth2CallbackResult> {
    // artificial delay for more realistic mock experience
    const handler = (success: (result: Oauth2CallbackResult) => void) => {
      setTimeout(() => {
        success({
          email: 'test@email.com',
          // -- use case 1) user must confirm if he wants to link accounts
          // googleSync: false,
          // syncCode: "834580239598234650234578"
          // -- use case 2) user already confirmed
          googleSync: true,
          syncCode: undefined,
        });
      }, 3000);
    };
    return new Promise(handler);
  }

  processFacebookCallback(): Promise<Oauth2CallbackResult> {
    // artificial delay for more realistic mock experience
    const handler = (success: (result: Oauth2CallbackResult) => void) => {
      setTimeout(() => {
        success({
          email: 'test@email.com',
          // -- use case 1) user must confirm if he wants to link accounts
          // googleSync: false,
          // syncCode: "834580239598234650234578"
          // -- use case 2) user already confirmed
          googleSync: true,
          syncCode: undefined,
        });
      }, 2000);
    };
    return new Promise(handler);
  }

  confirmAccountSync(): Promise<Oauth2CallbackResult> {
    return this.processGoogleCallback();
  }

  // Admin methods (mock implementations)
  getAdminUsers(): Promise<Record<string, unknown>[]> {
    return Promise.resolve([
      {
        id: 1,
        email: 'admin@example.com',
        firstname: 'Admin',
        lastname: 'User',
        fullName: 'Admin User',
        locale: 'en',
        creationDate: '2023-01-01T00:00:00Z',
        isActive: true,
        isSuspended: false,
        allowSendEmail: true,
        authenticationType: 'DATABASE',
      },
      {
        id: 2,
        email: 'user@example.com',
        firstname: 'Regular',
        lastname: 'User',
        fullName: 'Regular User',
        locale: 'en',
        creationDate: '2023-01-02T00:00:00Z',
        isActive: true,
        isSuspended: false,
        allowSendEmail: false,
        authenticationType: 'GOOGLE_OAUTH2',
      },
    ]);
  }

  updateAdminUser(
    userId: number,
    userData: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return Promise.resolve({
      id: userId,
      ...userData,
      fullName: `${userData.firstname as string} ${userData.lastname as string}`,
    });
  }

  createAdminUser(userData: Record<string, unknown>): Promise<Record<string, unknown>> {
    return Promise.resolve({
      id: Math.floor(Math.random() * 1000),
      ...userData,
      fullName: `${userData.firstname as string} ${userData.lastname as string}`,
      isActive: true,
      isSuspended: false,
      authenticationType: 'DATABASE',
    });
  }

  deleteAdminUser(_userId: number): Promise<void> {
    return Promise.resolve();
  }
}

export default MockClient;
