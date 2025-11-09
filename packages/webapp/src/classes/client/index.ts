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
import { Locale, LocaleCode } from '../app-i18n';

export type JwtAuth = {
  email: string;
  password: string;
};

export type NewUser = {
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  recaptcha: string | null;
};

export type ImportMapInfo = {
  title: string;
  description?: string;
  contentType?: string;
  content?: ArrayBuffer | null | string;
};

export type Label = {
  id: number;
  title: string;
  color: string;
};

export type Role = 'owner' | 'editor' | 'viewer';

export type MapInfo = {
  id: number;
  starred: boolean;
  title: string;
  labels: Label[];
  createdBy: string;
  creationTime: string;
  lastModificationBy: string;
  lastModificationTime: string;
  description: string;
  public: boolean;
  role: Role;
};

export type MapMetadata = {
  id: number;
  title: string;
  creatorFullName: string;
  isLocked: boolean;
  isLockedBy?: string;
  jsonProps: string;
  role: Role; // User's role for this map (owner, editor, viewer, or none)
  // Extended fields to match MapInfo
  description?: string;
  createdBy?: string; // Email
  creationTime?: string;
  lastModificationBy?: string;
  lastModificationTime?: string;
  starred?: boolean;
  public?: boolean;
  xml?: string; // Map XML content (included when ?xml=true query parameter is provided)
};

export type ChangeHistory = {
  id: number;
  lastModificationBy: string;
  lastModificationTime: string;
};

export type BasicMapInfo = {
  title: string;
  description?: string;
};

export type FieldError = {
  id: string;
  msg: string;
};

export type ErrorInfo = {
  isAuth?: boolean;
  msg?: string;
  fields?: Map<string, string>;
  status?: number;
};

export type LoginErrorInfo = ErrorInfo & {
  code: 1 | 2 | 3;
};

export enum AuthenticationType {
  GOOGLE_OAUTH2 = 'GOOGLE_OAUTH2',
  FACEBOOK_OAUTH2 = 'FACEBOOK_OAUTH2',
  DATABASE = 'DATABASE',
  LDAP = 'LDAP',
}

export type AccountInfo = {
  firstname: string;
  lastname: string;
  email: string;
  locale?: Locale;
  authenticationType: AuthenticationType;
  isAdmin: boolean;
};

export type Permission = {
  name?: string;
  email: string;
  role: Role;
};

export type Oauth2CallbackResult = {
  email: string;
  oauthSync: boolean;
  syncCode?: string;
};

export type ForgotPasswordResult = {
  action: 'EMAIL_SENT' | 'OAUTH2_USER';
};

interface Client {
  login(auth: JwtAuth): Promise<void>;
  logout(): Promise<void>;
  deleteAccount(): Promise<void>;
  importMap(model: ImportMapInfo): Promise<number>;
  createMap(map: BasicMapInfo): Promise<number>;
  deleteMaps(ids: number[]): Promise<void>;
  deleteMap(id: number): Promise<void>;
  renameMap(id: number, basicInfo: BasicMapInfo): Promise<void>;
  fetchAllMaps(): Promise<MapInfo[]>;
  fetchMapMetadata(id: number, includeXml?: boolean): Promise<MapMetadata>;
  fetchMapInfo(id: number): Promise<MapInfo>;

  fetchMapPermissions(id: number): Promise<Permission[]>;
  addMapPermissions(id: number, message: string, permissions: Permission[]): Promise<void>;
  deleteMapPermission(id: number, email: string): Promise<void>;

  duplicateMap(id: number, basicInfo: BasicMapInfo): Promise<number>;

  updateAccountLanguage(locale: LocaleCode): Promise<void>;
  updateAccountPassword(pasword: string): Promise<void>;
  updateAccountInfo(firstname: string, lastname: string): Promise<void>;

  updateStarred(id: number, starred: boolean): Promise<void>;
  updateMapToPublic(id: number, isPublic: boolean): Promise<void>;

  createLabel(title: string, color: string): Promise<number>;
  fetchLabels(): Promise<Label[]>;
  deleteLabel(id: number): Promise<void>;
  addLabelToMap(labelId: number, mapId: number): Promise<void>;
  deleteLabelFromMap(labelId: number, mapId: number): Promise<void>;
  fetchAccountInfo(): Promise<AccountInfo>;

  registerNewUser(user: NewUser): Promise<void>;
  resetPassword(email: string): Promise<ForgotPasswordResult>;
  activateAccount(code: string): Promise<void>;
  processGoogleCallback(code: string): Promise<Oauth2CallbackResult>;
  processFacebookCallback(code: string): Promise<Oauth2CallbackResult>;
  confirmAccountSync(email: string, code?: string): Promise<Oauth2CallbackResult>;

  fetchHistory(id: number): Promise<ChangeHistory[]>;
  revertHistory(id: number, cid: number): Promise<void>;

  onSessionExpired(callback?: () => void): (() => void) | undefined;
}

export default Client;
