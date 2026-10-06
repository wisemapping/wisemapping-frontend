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

import { AuthenticationType } from '../../../../src/classes/client';
import type {
  AdminMap,
  AdminUser,
  AdminClientInterface,
} from '../../../../src/classes/client/admin-client';

export const makeUser = (overrides: Partial<AdminUser> & { id: number }): AdminUser => ({
  email: `user${overrides.id}@example.com`,
  firstname: 'First',
  lastname: `Last${overrides.id}`,
  fullName: `First Last${overrides.id}`,
  locale: 'en',
  creationDate: '2026-01-15T00:00:00Z',
  isActive: true,
  isSuspended: false,
  allowSendEmail: false,
  authenticationType: AuthenticationType.DATABASE,
  ...overrides,
});

export const makeAdminMap = (overrides: Partial<AdminMap> & { id: number }): AdminMap => ({
  title: `Map ${overrides.id}`,
  description: `Description ${overrides.id}`,
  createdBy: 'owner@example.com',
  createdById: 50,
  creationTime: '2026-02-01T00:00:00Z',
  lastModificationBy: 'owner@example.com',
  lastModificationById: 50,
  lastModificationTime: '2026-02-02T00:00:00Z',
  public: false,
  isLocked: false,
  starred: false,
  labels: [],
  collaboratorCount: 0,
  ...overrides,
});

export type Page<T> = {
  data: T[];
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export const page = <T>(data: T[], totalPages = 1): Page<T> => ({
  data,
  page: 0,
  pageSize: 50,
  totalElements: data.length,
  totalPages,
  hasNext: false,
  hasPrevious: false,
});

export type MockAdminClient = { [K in keyof AdminClientInterface]: jest.Mock };

export const buildAdminClient = (): MockAdminClient => ({
  getAdminUsers: jest.fn().mockResolvedValue(page([])),
  getAdminUser: jest.fn(),
  updateAdminUser: jest.fn().mockResolvedValue({}),
  createAdminUser: jest.fn().mockResolvedValue({}),
  deleteAdminUser: jest.fn().mockResolvedValue(undefined),
  updateUserSuspension: jest.fn().mockResolvedValue({}),
  suspendAdminUser: jest.fn().mockResolvedValue({}),
  unsuspendAdminUser: jest.fn().mockResolvedValue({}),
  activateAdminUser: jest.fn().mockResolvedValue(undefined),
  changeUserPassword: jest.fn().mockResolvedValue(undefined),
  getUserByFacebookId: jest.fn(),
  removeFacebookAccount: jest.fn().mockResolvedValue(undefined),
  getAdminMaps: jest.fn().mockResolvedValue(page([])),
  getUserMaps: jest.fn().mockResolvedValue([]),
  updateAdminMap: jest.fn().mockResolvedValue({}),
  updateMapSpamStatus: jest.fn().mockResolvedValue({}),
  deleteAdminMap: jest.fn().mockResolvedValue(undefined),
  getAdminMapXml: jest.fn().mockResolvedValue(''),
  getSystemInfo: jest.fn(),
  getSystemHealth: jest.fn(),
});
