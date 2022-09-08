import { Locale, LocaleCode } from '../app-i18n';

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
  isPublic: boolean;
  role: Role;
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
  msg?: string;
  fields?: Map<string, string>;
};

export type AccountInfo = {
  firstname: string;
  lastname: string;
  email: string;
  locale?: Locale;
};

export type Permission = {
  name?: string;
  email: string;
  role: Role;
};

interface Client {
  deleteAccount(): Promise<void>;
  importMap(model: ImportMapInfo): Promise<number>;
  createMap(map: BasicMapInfo): Promise<number>;
  deleteMaps(ids: number[]): Promise<void>;
  deleteMap(id: number): Promise<void>;
  renameMap(id: number, basicInfo: BasicMapInfo): Promise<void>;
  fetchAllMaps(): Promise<MapInfo[]>;

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
  resetPassword(email: string): Promise<void>;

  fetchHistory(id: number): Promise<ChangeHistory[]>;
  revertHistory(id: number, cid: number): Promise<void>;

  onSessionExpired(callback?: () => void): () => void;
}

export default Client;
