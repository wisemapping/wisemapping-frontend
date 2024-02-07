import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Client, {
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
} from '..';
import { getCsrfToken } from '../../../utils';
import { LocaleCode, localeFromStr } from '../../app-i18n';
import Cookies from 'universal-cookie';

export default class RestClient implements Client {
  private baseUrl: string;
  private axios: AxiosInstance;

  private checkResponseForSessionExpired = <T>(error: {
    response?: AxiosResponse<T>;
  }): Promise<{ response?: AxiosResponse<T> }> => {
    // TODO: Improve session timeout response and response handling
    if (error.response && error.response.status === 405) {
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
        const jwtToken = this._jwtToken();
        if (jwtToken) {
          config.headers['Authorization'] = jwtToken;
        }

        // Add Csrf token ...
        const csrfToken = getCsrfToken();
        if (csrfToken) {
          config.headers['X-CSRF-TOKEN'] = csrfToken;
        } else {
          console.warn('csrf token not found in html head');
        }
      }

      return config;
    });

    // Process response globally ...
    this.axios.interceptors.response.use(
      (response) => response,
      (respoonse) => this.checkResponseForSessionExpired(respoonse),
    );
  }

  login(model: JwtAuth): Promise<void> {
    const handler = (success: () => void, reject: (error: ErrorInfo) => void) => {
      this.axios
        .post(`${this.baseUrl}/api/restful/authenticate`, model, {
          headers: { 'Content-Type': 'application/json' },
        })
        .then((response) => {
          const token = response.data;
          // Set jwt token on cookie ...
          const cookies = new Cookies();
          cookies.set('jwt-auth-token', token, { path: '/', maxAge: 604800 });

          success();
        })
        .catch((error) => {
          const errorInfo = this.parseResponseOnError(error.response);
          reject(errorInfo);
        });
    };
    return new Promise(handler);
  }

  private _jwtToken(): string | null {
    // Set cookie on session ...
    const cookies = new Cookies();
    const token = cookies.get('jwt-auth-token');
    return token ? `Bearer ${token}` : null;
  }

  private _onSessionExpired: () => void;
  onSessionExpired(callback?: () => void): () => void {
    if (callback) {
      this._onSessionExpired = callback;
    }
    return this._onSessionExpired;
  }

  private sessionExpired() {
    if (this._onSessionExpired) {
      this._onSessionExpired();
    }
  }

  deleteMapPermission(id: number, email: string): Promise<void> {
    const handler = (success: () => void, reject: (error: ErrorInfo) => void) => {
      this.axios
        .delete(
          `${this.baseUrl}/api/restful/maps/${id}/collabs?email=${encodeURIComponent(email)}`,
          {
            headers: { 'Content-Type': 'text/plain' },
          },
        )
        .then(() => {
          success();
        })
        .catch((error) => {
          const errorInfo = this.parseResponseOnError(error.response);
          reject(errorInfo);
        });
    };
    return new Promise(handler);
  }

  fetchStarred(id: number): Promise<boolean> {
    const handler = (success: (starred: boolean) => void, reject: (error: ErrorInfo) => void) => {
      this.axios
        .get(`${this.baseUrl}/api/restful/maps/${id}/starred`, {
          headers: { 'Content-Type': 'text/plain' },
        })
        .then((response) => {
          const data = response.data;
          success(data);
        })
        .catch((error) => {
          const errorInfo = this.parseResponseOnError(error.response);
          reject(errorInfo);
        });
    };
    return new Promise(handler);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addMapPermissions(id: number, message: string, permissions: Permission[]): Promise<void> {
    const handler = (success: () => void, reject: (error: ErrorInfo) => void) => {
      this.axios
        .put(
          `${this.baseUrl}/api/restful/maps/${id}/collabs/`,
          {
            message: message,
            collaborations: permissions,
          },
          { headers: { 'Content-Type': 'application/json' } },
        )
        .then(() => {
          // All was ok, let's sent to success page ...;
          success();
        })
        .catch((error) => {
          const errorInfo = this.parseResponseOnError(error.response);
          reject(errorInfo);
        });
    };
    return new Promise(handler);
  }

  fetchMapPermissions(id: number): Promise<Permission[]> {
    const handler = (
      success: (labels: Permission[]) => void,
      reject: (error: ErrorInfo) => void,
    ) => {
      this.axios
        .get(`${this.baseUrl}/api/restful/maps/${id}/collabs`, {
          headers: { 'Content-Type': 'text/plain' },
        })
        .then((response) => {
          const data = response.data;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const perms: Permission[] = (data.collaborations as any[]).map((p) => {
            return {
              id: p.id,
              email: p.email,
              name: p.name,
              role: p.role,
            };
          });
          success(perms);
        })
        .catch((error) => {
          const errorInfo = this.parseResponseOnError(error.response);
          reject(errorInfo);
        });
    };
    return new Promise(handler);
  }

  deleteAccount(): Promise<void> {
    const handler = (success: () => void, reject: (error: ErrorInfo) => void) => {
      this.axios
        .delete(`${this.baseUrl}/api/restful/account`, {
          headers: { 'Content-Type': 'text/plain' },
        })
        .then(() => {
          success();
        })
        .catch((error) => {
          const errorInfo = this.parseResponseOnError(error.response);
          reject(errorInfo);
        });
    };
    return new Promise(handler);
  }

  updateAccountInfo(firstname: string, lastname: string): Promise<void> {
    const handler = (success: () => void, reject: (error: ErrorInfo) => void) => {
      this.axios
        .put(`${this.baseUrl}/api/restful/account/firstname`, firstname, {
          headers: { 'Content-Type': 'text/plain' },
        })
        .then(() => {
          return this.axios.put(`${this.baseUrl}/api/restful/account/lastname`, lastname, {
            headers: { 'Content-Type': 'text/plain' },
          });
        })
        .then(() => {
          // All was ok, let's sent to success page ...;
          success();
        })
        .catch((error) => {
          const errorInfo = this.parseResponseOnError(error.response);
          reject(errorInfo);
        });
    };
    return new Promise(handler);
  }

  updateAccountPassword(pasword: string): Promise<void> {
    const handler = (success: () => void, reject: (error: ErrorInfo) => void) => {
      this.axios
        .put(`${this.baseUrl}/api/restful/account/password`, pasword, {
          headers: { 'Content-Type': 'text/plain' },
        })
        .then(() => {
          success();
        })
        .catch((error) => {
          const errorInfo = this.parseResponseOnError(error.response);
          reject(errorInfo);
        });
    };
    return new Promise(handler);
  }

  updateAccountLanguage(locale: LocaleCode): Promise<void> {
    const handler = (success: () => void, reject: (error: ErrorInfo) => void) => {
      this.axios
        .put(`${this.baseUrl}/api/restful/account/locale`, locale, {
          headers: { 'Content-Type': 'text/plain' },
        })
        .then(() => {
          // All was ok, let's sent to success page ...;
          success();
        })
        .catch((error) => {
          const errorInfo = this.parseResponseOnError(error.response);

          // Enrich with language ...
          errorInfo.msg = `${errorInfo.msg} - Language: ${locale}`;
          reject(errorInfo);
        });
    };
    return new Promise(handler);
  }

  importMap(model: ImportMapInfo): Promise<number> {
    const handler = (success: (mapId: number) => void, reject: (error: ErrorInfo) => void) => {
      this.axios
        .post(
          `${this.baseUrl}/api/restful/maps?title=${encodeURIComponent(
            model.title,
          )}&description=${encodeURIComponent(model.description ? model.description : '')}`,
          model.content,
          { headers: { 'Content-Type': 'application/xml' } },
        )
        .then((response) => {
          const mapId = Number.parseInt(response.headers.resourceid, 10);
          success(mapId);
        })
        .catch((error) => {
          const errorInfo = this.parseResponseOnError(error.response);
          reject(errorInfo);
        });
    };
    return new Promise(handler);
  }

  fetchAccountInfo(): Promise<AccountInfo> {
    const handler = (
      success: (account: AccountInfo) => void,
      reject: (error: ErrorInfo) => void,
    ) => {
      this.axios
        .get(`${this.baseUrl}/api/restful/account`, {
          headers: { 'Content-Type': 'application/json' },
        })
        .then((response) => {
          const account = response.data;
          const locale: LocaleCode | null = account.locale;
          success({
            lastname: account.lastname ? account.lastname : '',
            firstname: account.firstname ? account.firstname : '',
            email: account.email,
            locale: locale ? localeFromStr(locale) : undefined,
            authenticationType: account.authenticationType,
          });
        })
        .catch((error) => {
          const errorInfo = this.parseResponseOnError(error.response);
          reject(errorInfo);
        });
    };
    return new Promise(handler);
  }

  deleteMaps(ids: number[]): Promise<void> {
    const handler = (success: () => void, reject: (error: ErrorInfo) => void) => {
      this.axios
        .delete(`${this.baseUrl}/api/restful/maps/batch?ids=${ids.join()}`, {
          headers: { 'Content-Type': 'text/plain' },
        })
        .then(() => {
          success();
        })
        .catch((error) => {
          const response = error.response;
          const errorInfo = this.parseResponseOnError(response);
          reject(errorInfo);
        });
    };
    return new Promise(handler);
  }

  updateMapToPublic(id: number, isPublic: boolean): Promise<void> {
    const handler = (success: () => void, reject: (error: ErrorInfo) => void) => {
      this.axios
        .put(`${this.baseUrl}/api/restful/maps/${id}/publish`, isPublic.toString(), {
          headers: { 'Content-Type': 'text/plain' },
        })
        .then(() => {
          success();
        })
        .catch((error) => {
          const errorInfo = this.parseResponseOnError(error.response);
          reject(errorInfo);
        });
    };
    return new Promise(handler);
  }

  revertHistory(id: number, hid: number): Promise<void> {
    const handler = (success: () => void, reject: (error: ErrorInfo) => void) => {
      this.axios
        .post(`${this.baseUrl}/api/restful/maps/${id}/history/${hid}`, null, {
          headers: { 'Content-Type': 'text/pain' },
        })
        .then(() => {
          success();
        })
        .catch((error) => {
          const errorInfo = this.parseResponseOnError(error.response);
          reject(errorInfo);
        });
    };
    return new Promise(handler);
  }

  fetchHistory(id: number): Promise<ChangeHistory[]> {
    const handler = (
      success: (historyList: ChangeHistory[]) => void,
      reject: (error: ErrorInfo) => void,
    ) => {
      this.axios
        .get(`${this.baseUrl}/api/restful/maps/${id}/history/`, {
          headers: { 'Content-Type': 'application/json' },
        })
        .then((response) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const historyList: ChangeHistory[] = (response.data.changes as any[]).map((h) => {
            return {
              id: h.id,
              lastModificationBy: h.creator,
              lastModificationTime: h.creationTime,
            };
          });
          success(historyList);
        })
        .catch((error) => {
          const errorInfo = this.parseResponseOnError(error.response);
          reject(errorInfo);
        });
    };
    return new Promise(handler);
  }

  renameMap(id: number, basicInfo: BasicMapInfo): Promise<void> {
    const handler = (success: () => void, reject: (error: ErrorInfo) => void) => {
      this.axios
        .put(`${this.baseUrl}/api/restful/maps/${id}/title`, basicInfo.title, {
          headers: { 'Content-Type': 'text/plain' },
        })
        .then(() => {
          return this.axios.put(
            `${this.baseUrl}/api/restful/maps/${id}/description`,
            basicInfo.description || ' ',
            { headers: { 'Content-Type': 'text/plain' } },
          );
        })
        .then(() => {
          // All was ok, let's sent to success page ...;
          success();
        })
        .catch((error) => {
          const response = error.response;
          const errorInfo = this.parseResponseOnError(response);
          reject(errorInfo);
        });
    };
    return new Promise(handler);
  }

  createMap(model: BasicMapInfo): Promise<number> {
    const handler = (success: (mapId: number) => void, reject: (error: ErrorInfo) => void) => {
      this.axios
        .post(
          `${this.baseUrl}/api/restful/maps?title=${encodeURIComponent(
            model.title,
          )}&description=${encodeURIComponent(model.description ? model.description : '')}`,
          undefined,
          { headers: { 'Content-Type': 'application/json' } },
        )
        .then((response) => {
          const mapId = Number.parseInt(response.headers.resourceid, 10);
          success(mapId);
        })
        .catch((error) => {
          const errorInfo = this.parseResponseOnError(error.response);
          reject(errorInfo);
        });
    };
    return new Promise(handler);
  }

  fetchAllMaps(): Promise<MapInfo[]> {
    const handler = (
      success: (mapsInfo: MapInfo[]) => void,
      reject: (error: ErrorInfo) => void,
    ) => {
      this.axios
        .get(`${this.baseUrl}/api/restful/maps/`, {
          headers: { 'Content-Type': 'application/json' },
        })
        .then((response) => {
          const data = response.data;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const maps: MapInfo[] = (data.mindmapsInfo as any[]).map((m) => {
            return {
              id: m.id,
              starred: m.starred,
              title: m.title,
              labels: m.labels,
              createdBy: m.creator,
              creationTime: m.creationTime,
              lastModificationBy: m.lastModifierUser,
              lastModificationTime: m.lastModificationTime,
              description: m.description,
              isPublic: m['public'],
              role: m.role,
            };
          });
          success(maps);
        })
        .catch((error) => {
          const errorInfo = this.parseResponseOnError(error.response);
          reject(errorInfo);
        });
    };
    return new Promise(handler);
  }

  registerNewUser(user: NewUser): Promise<void> {
    const handler = (success: () => void, reject: (error: ErrorInfo) => void) => {
      this.axios
        .post(`${this.baseUrl}/api/restful/users/`, JSON.stringify(user), {
          headers: { 'Content-Type': 'application/json' },
        })
        .then(() => {
          // All was ok, let's sent to success page ...;
          success();
        })
        .catch((error) => {
          const errorInfo = this.parseResponseOnError(error.response);
          reject(errorInfo);
        });
    };
    return new Promise(handler);
  }

  deleteMap(id: number): Promise<void> {
    const handler = (success: () => void, reject: (error: ErrorInfo) => void) => {
      this.axios
        .delete(`${this.baseUrl}/api/restful/maps/${id}`, {
          headers: { 'Content-Type': 'application/json' },
        })
        .then(() => {
          success();
        })
        .catch((error) => {
          const errorInfo = this.parseResponseOnError(error.response);
          reject(errorInfo);
        });
    };
    return new Promise(handler);
  }

  resetPassword(email: string): Promise<ForgotPasswordResult> {
    const handler = (
      success: (result: ForgotPasswordResult) => void,
      reject: (error: ErrorInfo) => void,
    ) => {
      this.axios
        .put(
          `${this.baseUrl}/api/restful/users/resetPassword?email=${encodeURIComponent(email)}`,
          null,
          {
            headers: { 'Content-Type': 'application/json' },
          },
        )
        .then((response) => {
          // All was ok, lets return if an email was sent or the user should login with oauth
          success({ action: response.data.action });
        })
        .catch((error) => {
          const response = error.response;
          const errorInfo = this.parseResponseOnError(response);
          reject(errorInfo);
        });
    };
    return new Promise(handler);
  }

  duplicateMap(id: number, basicInfo: BasicMapInfo): Promise<number> {
    const handler = (success: (mapId: number) => void, reject: (error: ErrorInfo) => void) => {
      this.axios
        .post(`${this.baseUrl}/api/restful/maps/${id}`, JSON.stringify(basicInfo), {
          headers: { 'Content-Type': 'application/json' },
        })
        .then((response) => {
          const mapId = Number.parseInt(response.headers.resourceid, 10);
          success(mapId);
        })
        .catch((error) => {
          const response = error.response;
          const errorInfo = this.parseResponseOnError(response);
          reject(errorInfo);
        });
    };
    return new Promise(handler);
  }

  updateStarred(id: number, starred: boolean): Promise<void> {
    const handler = (success: () => void, reject: (error: ErrorInfo) => void) => {
      this.axios
        .put(`${this.baseUrl}/api/restful/maps/${id}/starred`, starred.toString(), {
          headers: { 'Content-Type': 'text/plain' },
        })
        .then(() => {
          success();
        })
        .catch((error) => {
          const response = error.response;
          const errorInfo = this.parseResponseOnError(response);
          reject(errorInfo);
        });
    };
    return new Promise(handler);
  }

  fetchLabels(): Promise<Label[]> {
    const handler = (success: (labels: Label[]) => void, reject: (error: ErrorInfo) => void) => {
      this.axios
        .get(`${this.baseUrl}/api/restful/labels/`, {
          headers: { 'Content-Type': 'application/json' },
        })
        .then((response) => {
          const data = response.data;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const maps: Label[] = (data.labels as any[]).map((l) => {
            return {
              id: l.id,
              color: l.color,
              title: l.title,
              iconName: l.iconName,
            };
          });
          success(maps);
        })
        .catch((error) => {
          const errorInfo = this.parseResponseOnError(error.response);
          reject(errorInfo);
        });
    };
    return new Promise(handler);
  }

  createLabel(title: string, color: string): Promise<number> {
    const handler = (success: (labelId: number) => void, reject: (error: ErrorInfo) => void) => {
      this.axios
        .post(
          `${this.baseUrl}/api/restful/labels`,
          JSON.stringify({ title, color, iconName: 'smile' }),
          {
            headers: { 'Content-Type': 'application/json' },
          },
        )
        .then((response) => {
          const mapId = Number.parseInt(response.headers.resourceid, 10);
          success(mapId);
        })
        .catch((error) => {
          const errorInfo = this.parseResponseOnError(error.response);
          reject(errorInfo);
        });
    };
    return new Promise(handler);
  }

  deleteLabel(id: number): Promise<void> {
    const handler = (success: () => void, reject: (error: ErrorInfo) => void) => {
      this.axios
        .delete(`${this.baseUrl}/api/restful/labels/${id}`)
        .then(() => {
          success();
        })
        .catch((error) => {
          const errorInfo = this.parseResponseOnError(error.response);
          reject(errorInfo);
        });
    };
    return new Promise(handler);
  }

  addLabelToMap(labelId: number, mapId: number): Promise<void> {
    const handler = (success: () => void, reject: (error: ErrorInfo) => void) => {
      this.axios
        .post(`${this.baseUrl}/api/restful/maps/${mapId}/labels`, JSON.stringify(labelId), {
          headers: { 'Content-Type': 'application/json' },
        })
        .then(() => {
          success();
        })
        .catch((error) => {
          const errorInfo = this.parseResponseOnError(error.response);
          reject(errorInfo);
        });
    };
    return new Promise(handler);
  }

  deleteLabelFromMap(labelId: number, mapId: number): Promise<void> {
    const handler = (success: () => void, reject: (error: ErrorInfo) => void) => {
      this.axios
        .delete(`${this.baseUrl}/api/restful/maps/${mapId}/labels/${labelId}`)
        .then(() => {
          success();
        })
        .catch((error) => {
          const errorInfo = this.parseResponseOnError(error.response);
          reject(errorInfo);
        });
    };
    return new Promise(handler);
  }

  processGoogleCallback(code: string): Promise<Oauth2CallbackResult> {
    const handler = (
      success: (result: Oauth2CallbackResult) => void,
      reject: (error: ErrorInfo) => void,
    ) => {
      this.axios
        .post(`${this.baseUrl}/api/restful/oauth2/googlecallback?code=${code}`, {
          headers: { 'Content-Type': 'application/json' },
        })
        .then((response) => {
          success({
            email: response.data.email,
            googleSync: response.data.googleSync,
            syncCode: response.data.syncCode,
          });
        })
        .catch((error) => {
          const errorInfo = this.parseResponseOnError(error.response);
          reject(errorInfo);
        });
    };
    return new Promise(handler);
  }

  confirmAccountSync(email: string, code: string): Promise<void> {
    const handler = (success: () => void, reject: (error: ErrorInfo) => void) => {
      this.axios
        .put(`${this.baseUrl}/api/restful/oauth2/confirmaccountsync?email=${email}&code=${code}`, {
          headers: { 'Content-Type': 'application/json' },
        })
        .then(() => {
          success();
        })
        .catch((error) => {
          const errorInfo = this.parseResponseOnError(error.response);
          reject(errorInfo);
        });
    };
    return new Promise(handler);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private parseResponseOnError = (response: any): ErrorInfo => {
    console.error(`Performing backend action error: ${JSON.stringify(response)}`);

    let result: ErrorInfo | undefined;
    if (response) {
      const status: number = response.status;
      const data = response.data;
      console.error(`Status Code: ${status}`);
      console.error(`Status Data: ${response.data}`);
      console.error(`Status Message: ${response.message}`);

      switch (status) {
        case 401:
        case 302:
          this.sessionExpired();
          result = {
            msg: 'Your current session has expired. Please, sign in and try again.',
          };
          break;
        default:
          if (data) {
            // Set global errors ...
            result = {};
            const globalErrors = data.globalErrors;
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
  };
}
