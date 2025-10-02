/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  ErrorInfo,
  MapInfo,
  BasicMapInfo,
  NewUser,
  Label,
  ChangeHistory,
  AccountInfo,
  ImportMapInfo,
  Permission,
  Oauth2CallbackResult,
  ForgotPasswordResult,
  JwtAuth,
  MapMetadata,
  LoginErrorInfo,
} from '..';
import { Locale, LocaleCode } from '../../app-i18n';
import JwtTokenConfig from '../../jwt-token-config';

export interface AdminUser {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  fullName: string;
  locale: string;
  creationDate: string;
  isActive: boolean;
  isSuspended: boolean;
  allowSendEmail: boolean;
  authenticationType: string;
  isAdmin?: boolean;
}

export interface AdminUsersResponse {
  data: AdminUser[];
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface AdminUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filterActive?: boolean;
  filterSuspended?: boolean;
  filterAuthType?: string;
}

export interface AdminMapsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filterPublic?: boolean;
  filterLocked?: boolean;
  filterSpam?: boolean;
}

export interface AdminMap {
  id: number;
  title: string;
  description: string;
  createdBy: string;
  createdById: number;
  creationTime: string;
  lastModificationBy: string;
  lastModificationById: number;
  lastModificationTime: string;
  isPublic: boolean;
  isLocked: boolean;
  isLockedBy?: string;
  starred: boolean;
  labels: string[];
  isSpam?: boolean;
  spamType?: string;
  spamDetectedDate?: string;
  spamDescription?: string;
}

export interface AdminMapsResponse {
  data: AdminMap[];
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface SystemInfo {
  application: {
    name: string;
    port: string;
  };
  database: {
    driver: string;
    url: string;
    username: string;
    hibernateDdlAuto: string;
  };
  jvm: {
    javaVersion: string;
    javaVendor: string;
    uptime: number;
    startTime: number;
    maxMemory: number;
    usedMemory: number;
    totalMemory: number;
    availableProcessors: number;
    systemLoadAverage: number;
  };
  statistics: {
    totalUsers?: number;
    totalMindmaps?: number;
    error?: string;
  };
}

export interface SystemHealth {
  database: string;
  memory: string;
  memoryUsagePercent?: number;
  databaseError?: string;
}

export interface AdminClientInterface {
  getAdminUsers(params?: AdminUsersParams): Promise<AdminUsersResponse>;
  updateAdminUser(userId: number, userData: Partial<AdminUser>): Promise<AdminUser>;
  createAdminUser(
    userData: Omit<AdminUser, 'id' | 'fullName'> & { password: string },
  ): Promise<AdminUser>;
  deleteAdminUser(userId: number): Promise<void>;
  updateUserSuspension(
    userId: number,
    suspensionData: { suspended: boolean; suspensionReason?: string },
  ): Promise<AdminUser>;
  suspendAdminUser(userId: number): Promise<AdminUser>;
  unsuspendAdminUser(userId: number): Promise<AdminUser>;

  getAdminMaps(params?: AdminMapsParams): Promise<AdminMapsResponse>;
  updateAdminMap(mapId: number, mapData: Partial<AdminMap>): Promise<AdminMap>;
  updateMapSpamStatus(mapId: number, spamData: { isSpam: boolean }): Promise<AdminMap>;
  deleteAdminMap(mapId: number): Promise<void>;
  getAdminMapXml(mapId: number): Promise<string>;

  getSystemInfo(): Promise<SystemInfo>;
  getSystemHealth(): Promise<SystemHealth>;
}

export default class AdminClient implements AdminClientInterface {
  private baseUrl: string;
  private axios: AxiosInstance;
  private _onSessionExpired: () => void;

  private checkResponseForSessionExpired = <T>(error: {
    response?: AxiosResponse<T>;
  }): Promise<{ response?: AxiosResponse<T> }> => {
    if (error.response && (error.response.status === 405 || error.response.status === 403)) {
      this.sessionExpired();
    }
    return Promise.reject(error);
  };

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.axios = axios.create({ maxRedirects: 0 });

    // Configure request interceptors ...
    this.axios.interceptors.request.use((config) => {
      if (config.headers) {
        // JWT Token ...
        const jwtToken = this._jwtHeaderTokenValue();
        if (jwtToken) {
          config.headers['Authorization'] = jwtToken;
        }

        // Send browser locale ...
        const locale = this.getDefaultLocale();
        config.headers['Accept-Language'] = locale.code;
      }

      return config;
    });

    // Process response globally ...
    this.axios.interceptors.response.use(
      (response) => response,
      (respoonse) => this.checkResponseForSessionExpired(respoonse),
    );
  }

  // Admin-specific methods
  getAdminUsers(params?: AdminUsersParams): Promise<AdminUsersResponse> {
    const queryParams = new URLSearchParams();

    if (params) {
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.filterActive !== undefined)
        queryParams.append('filterActive', params.filterActive.toString());
      if (params.filterSuspended !== undefined)
        queryParams.append('filterSuspended', params.filterSuspended.toString());
      if (params.filterAuthType) queryParams.append('filterAuthType', params.filterAuthType);
    }

    const url = `${this.baseUrl}/api/restful/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.axios
      .get(url)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Failed to fetch admin users:', error);
        throw this.parseResponseOnError(error.response);
      });
  }

  updateAdminUser(userId: number, userData: Partial<AdminUser>): Promise<AdminUser> {
    return this.axios
      .put(`${this.baseUrl}/api/restful/admin/users/${userId}`, userData)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Failed to update admin user:', error);
        throw this.parseResponseOnError(error.response);
      });
  }

  createAdminUser(
    userData: Omit<AdminUser, 'id' | 'fullName'> & { password: string },
  ): Promise<AdminUser> {
    return this.axios
      .post(`${this.baseUrl}/api/restful/admin/users`, userData)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Failed to create admin user:', error);
        throw this.parseResponseOnError(error.response);
      });
  }

  deleteAdminUser(userId: number): Promise<void> {
    return this.axios
      .delete(`${this.baseUrl}/api/restful/admin/users/${userId}`)
      .then(() => {})
      .catch((error) => {
        console.error('Failed to delete admin user:', error);
        throw this.parseResponseOnError(error.response);
      });
  }

  updateUserSuspension(
    userId: number,
    suspensionData: { suspended: boolean; suspensionReason?: string },
  ): Promise<AdminUser> {
    return this.axios
      .put(`${this.baseUrl}/api/restful/admin/users/${userId}/suspension`, suspensionData)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Failed to update user suspension:', error);
        throw this.parseResponseOnError(error.response);
      });
  }

  suspendAdminUser(userId: number): Promise<AdminUser> {
    return this.axios
      .put(`${this.baseUrl}/api/restful/admin/users/${userId}/suspend`)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Failed to suspend admin user:', error);
        throw this.parseResponseOnError(error.response);
      });
  }

  unsuspendAdminUser(userId: number): Promise<AdminUser> {
    return this.axios
      .put(`${this.baseUrl}/api/restful/admin/users/${userId}/unsuspend`)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Failed to unsuspend admin user:', error);
        throw this.parseResponseOnError(error.response);
      });
  }

  // Maps management methods
  getAdminMaps(params?: AdminMapsParams): Promise<AdminMapsResponse> {
    const queryParams = new URLSearchParams();

    if (params) {
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.filterPublic !== undefined)
        queryParams.append('filterPublic', params.filterPublic.toString());
      if (params.filterLocked !== undefined)
        queryParams.append('filterLocked', params.filterLocked.toString());
    }

    const url = `${this.baseUrl}/api/restful/admin/maps${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.axios
      .get(url)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Failed to fetch admin maps:', error);
        throw this.parseResponseOnError(error.response);
      });
  }

  updateAdminMap(mapId: number, mapData: Partial<AdminMap>): Promise<AdminMap> {
    return this.axios
      .put(`${this.baseUrl}/api/restful/admin/maps/${mapId}`, mapData)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Failed to update admin map:', error);
        throw this.parseResponseOnError(error.response);
      });
  }

  updateMapSpamStatus(mapId: number, spamData: { isSpam: boolean }): Promise<AdminMap> {
    return this.axios
      .put(`${this.baseUrl}/api/restful/admin/maps/${mapId}/spam`, spamData)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Failed to update map spam status:', error);
        throw this.parseResponseOnError(error.response);
      });
  }

  deleteAdminMap(mapId: number): Promise<void> {
    return this.axios
      .delete(`${this.baseUrl}/api/restful/admin/maps/${mapId}`)
      .then(() => {})
      .catch((error) => {
        console.error('Failed to delete admin map:', error);
        throw this.parseResponseOnError(error.response);
      });
  }

  getAdminMapXml(mapId: number): Promise<string> {
    return this.axios
      .get(`${this.baseUrl}/api/restful/admin/maps/${mapId}/xml`, {
        responseType: 'text',
      })
      .then((response) => response.data)
      .catch((error) => {
        console.error('Failed to fetch admin map XML:', error);
        throw this.parseResponseOnError(error.response);
      });
  }

  getSystemInfo(): Promise<SystemInfo> {
    return this.axios
      .get(`${this.baseUrl}/api/restful/admin/system/info`)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Failed to fetch system info:', error);
        throw this.parseResponseOnError(error.response);
      });
  }

  getSystemHealth(): Promise<SystemHealth> {
    return this.axios
      .get(`${this.baseUrl}/api/restful/admin/system/health`)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Failed to fetch system health:', error);
        throw this.parseResponseOnError(error.response);
      });
  }

  private _jwtHeaderTokenValue(): string | null {
    // Set cookie on session ...
    const token = JwtTokenConfig.retreiveToken();
    return token ? `Bearer ${token}` : null;
  }

  private getDefaultLocale(): Locale {
    // Return a default locale without using React hooks - FIXED
    return { code: 'en', message: {}, label: 'English' };
  }

  private sessionExpired(): void {
    if (this._onSessionExpired) {
      this._onSessionExpired();
    }
  }

  // Implement all Client interface methods
  fetchMapMetadata(id: number): Promise<MapMetadata> {
    const handler = (
      success: (mapMetadata: MapMetadata) => void,
      reject: (error: ErrorInfo) => void,
    ) => {
      this.axios
        .get(`${this.baseUrl}/api/restful/maps/${id}/metadata`)
        .then((response) => {
          success(response.data);
        })
        .catch((error) => {
          console.error(error);
          const errorInfo = this.parseResponseOnError(error.response) as ErrorInfo;
          reject(errorInfo);
        });
    };
    return new Promise(handler);
  }

  logout(): Promise<void> {
    return Promise.resolve();
  }

  login(model: JwtAuth): Promise<void> {
    const handler = (success: () => void, reject: (error: LoginErrorInfo) => void) => {
      this.axios
        .post(`${this.baseUrl}/api/restful/authenticate`, model, {
          headers: { 'Content-Type': 'application/json' },
        })
        .then((response) => {
          // Story JWT token ...
          const token = response.data;

          JwtTokenConfig.storeToken(token);
          success();
        })
        .catch((error) => {
          // Handle an expected error ...
          console.error(error);
          const errorInfo = this.parseResponseOnError(error.response) as LoginErrorInfo;
          errorInfo.code = !error.response || error.response.status !== 403 ? 1 : 3;

          reject(errorInfo);
        });
    };
    return new Promise(handler);
  }

  deleteAccount(): Promise<void> {
    return Promise.resolve();
  }

  importMap(_model: ImportMapInfo): Promise<number> {
    return Promise.resolve(1);
  }

  createMap(_map: BasicMapInfo): Promise<number> {
    return Promise.resolve(1);
  }

  deleteMaps(_ids: number[]): Promise<void> {
    return Promise.resolve();
  }

  deleteMap(_id: number): Promise<void> {
    return Promise.resolve();
  }

  renameMap(_id: number, _basicInfo: BasicMapInfo): Promise<void> {
    return Promise.resolve();
  }

  fetchAllMaps(): Promise<MapInfo[]> {
    return Promise.resolve([]);
  }

  fetchMapInfo(_id: number): Promise<MapInfo> {
    return Promise.resolve({
      id: 1,
      title: 'Sample Map',
      labels: [],
      createdBy: 'admin',
      creationTime: new Date().toISOString(),
      lastModificationBy: 'admin',
      lastModificationTime: new Date().toISOString(),
      starred: false,
      description: '',
      isPublic: false,
      role: 'owner',
    });
  }

  fetchStarred(_id: number): Promise<boolean> {
    return Promise.resolve(false);
  }

  fetchMapPermissions(_id: number): Promise<Permission[]> {
    return Promise.resolve([]);
  }

  addMapPermissions(_id: number, _message: string, _permissions: Permission[]): Promise<void> {
    return Promise.resolve();
  }

  deleteMapPermission(_id: number, _email: string): Promise<void> {
    return Promise.resolve();
  }

  duplicateMap(_id: number, _basicInfo: BasicMapInfo): Promise<number> {
    return Promise.resolve(1);
  }

  updateAccountLanguage(_locale: LocaleCode): Promise<void> {
    return Promise.resolve();
  }

  updateAccountPassword(_password: string): Promise<void> {
    return Promise.resolve();
  }

  updateAccountInfo(_firstname: string, _lastname: string): Promise<void> {
    return Promise.resolve();
  }

  updateStarred(_id: number, _starred: boolean): Promise<void> {
    return Promise.resolve();
  }

  updateMapToPublic(_id: number, _isPublic: boolean): Promise<void> {
    return Promise.resolve();
  }

  createLabel(_title: string, _color: string): Promise<number> {
    return Promise.resolve(1);
  }

  fetchLabels(): Promise<Label[]> {
    return Promise.resolve([]);
  }

  deleteLabel(_id: number): Promise<void> {
    return Promise.resolve();
  }

  addLabelToMap(_labelId: number, _mapId: number): Promise<void> {
    return Promise.resolve();
  }

  deleteLabelFromMap(_labelId: number, _mapId: number): Promise<void> {
    return Promise.resolve();
  }

  fetchAccountInfo(): Promise<AccountInfo> {
    return Promise.resolve({
      email: 'admin@wisemapping.com',
      firstname: 'Admin',
      lastname: 'User',
      locale: { code: 'en', message: {}, label: 'English' },
      authenticationType: 'DATABASE',
      isAdmin: true, // Admin client should always return admin user
    });
  }

  registerNewUser(_user: NewUser): Promise<void> {
    return Promise.resolve();
  }

  resetPassword(_email: string): Promise<ForgotPasswordResult> {
    return Promise.resolve({ action: 'EMAIL_SENT' });
  }

  processGoogleCallback(_code: string): Promise<Oauth2CallbackResult> {
    return Promise.resolve({
      email: 'admin@wisemapping.com',
      googleSync: false,
      syncCode: '',
    });
  }

  processFacebookCallback(_code: string): Promise<Oauth2CallbackResult> {
    return Promise.resolve({
      email: 'admin@wisemapping.com',
      googleSync: false,
      syncCode: '',
    });
  }

  confirmAccountSync(_email: string, _code?: string): Promise<Oauth2CallbackResult> {
    return this.processGoogleCallback('');
  }

  fetchHistory(_id: number): Promise<ChangeHistory[]> {
    return Promise.resolve([]);
  }

  revertHistory(_id: number, _cid: number): Promise<void> {
    return Promise.resolve();
  }

  onSessionExpired(callback?: () => void): (() => void) | undefined {
    this._onSessionExpired = callback || (() => {});
    return this._onSessionExpired;
  }

  private parseResponseOnError = (response: AxiosResponse | undefined): ErrorInfo => {
    let result: ErrorInfo | undefined;

    if (response) {
      const status = response.status;
      const data = response.data as Record<string, unknown>;

      // Parse error response ...
      if (typeof data === 'string') {
        result = { msg: data };
      } else if (data && typeof data === 'object') {
        result = data as ErrorInfo;
      }

      // Set status code ...
      if (result) {
        (result as Record<string, unknown>).status = status;
        result.isAuth = false;

        // No access to the operation and not seession token, assuming that the issue is related ot missing auth.
        result.isAuth = status === 403 && JwtTokenConfig.retreiveToken() === undefined;
      }
    }

    // Network related problem ...
    if (!result) {
      result = { msg: 'Unexpected error. Please, try latter' };
    }

    return result;
  };
}
