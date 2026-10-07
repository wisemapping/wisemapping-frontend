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

import MockAdminClient from '../../../src/classes/client/mock-admin-client';
import { AdminUser } from '../../../src/classes/client/admin-client';
import { AuthenticationType } from '../../../src/classes/client';
import { appLogger } from '../../../src/utils/logger';

let client: MockAdminClient;

/** Runs one of the client's delayed (500 ms) calls to completion. */
const settle = <T>(promise: Promise<T>): Promise<T> => {
  jest.advanceTimersByTime(500);
  return promise;
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  client = new MockAdminClient();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('MockAdminClient users listing', () => {
  it('traces its calls through the app logger, not straight to the console', async () => {
    const debug = jest.spyOn(appLogger, 'debug').mockImplementation(() => undefined);
    await settle(client.getAdminUsers());

    expect(console.log).not.toHaveBeenCalled();
    expect(debug).toHaveBeenCalledWith(
      'MockAdminClient: Returning paginated admin users',
      undefined,
    );
  });

  it('returns the first page of ten users by default', async () => {
    const page = await client.getAdminUsers();

    expect(page).toMatchObject({
      page: 0,
      pageSize: 10,
      totalElements: 12,
      totalPages: 2,
      hasNext: true,
      hasPrevious: false,
    });
    expect(page.data).toHaveLength(10);
  });

  it('pages through the users', async () => {
    const page = await client.getAdminUsers({ page: 1, pageSize: 10 });

    expect(page.data.map((u) => u.id)).toEqual([11, 12]);
    expect(page).toMatchObject({ page: 1, hasNext: false, hasPrevious: true });
  });

  it('searches email, names and full name case-insensitively', async () => {
    expect((await client.getAdminUsers({ search: 'JOHN' })).data.map((u) => u.id)).toEqual([3]);
    expect((await client.getAdminUsers({ search: 'analyst' })).data.map((u) => u.id)).toEqual([8]);
    expect((await client.getAdminUsers({ search: 'ui/ux d' })).data.map((u) => u.id)).toEqual([11]);
    expect((await client.getAdminUsers({ search: 'hr@' })).data.map((u) => u.id)).toEqual([7]);
  });

  it('filters by active, suspended and authentication type', async () => {
    const inactive = await client.getAdminUsers({ filterActive: false });
    expect(inactive.data.map((u) => u.id)).toEqual([4, 12]);

    const suspended = await client.getAdminUsers({ filterSuspended: true });
    expect(suspended.data.map((u) => u.id)).toEqual([4]);

    const google = await client.getAdminUsers({ filterAuthType: 'GOOGLE_OAUTH2' });
    expect(google.data.map((u) => u.id)).toEqual([2, 6, 10]);
  });

  it('sorts ascending and descending', async () => {
    const asc = await client.getAdminUsers({ sortBy: 'email', pageSize: 3 });
    expect(asc.data.map((u) => u.email)).toEqual([
      'admin@wisemapping.com',
      'design@wisemapping.com',
      'finance@wisemapping.com',
    ]);

    const desc = await client.getAdminUsers({ sortBy: 'email', sortOrder: 'desc', pageSize: 1 });
    expect(desc.data[0].email).toBe('user@wisemapping.com');

    // Missing values sort as empty strings.
    const bySuspension = await client.getAdminUsers({ sortBy: 'suspensionReason' });
    expect(bySuspension.totalElements).toBe(12);
  });
});

describe('MockAdminClient user changes', () => {
  it('getAdminUser resolves a known user after a delay, and rejects an unknown one', async () => {
    await expect(settle(client.getAdminUser(3))).resolves.toMatchObject({
      email: 'john.doe@wisemapping.com',
    });

    const missing = client.getAdminUser(999);
    jest.advanceTimersByTime(500);
    await expect(missing).rejects.toThrow('User 999 not found');
  });

  it('updateAdminUser merges the change and rebuilds the full name', async () => {
    const updated = await client.updateAdminUser(3, { firstname: 'Johnny' });

    expect(updated).toMatchObject({ firstname: 'Johnny', lastname: 'Doe', fullName: 'Johnny Doe' });
    expect((await client.getAdminUsers({ search: 'johnny' })).data).toHaveLength(1);

    expect((await client.updateAdminUser(3, { lastname: 'Roe' })).fullName).toBe('Johnny Roe');
  });

  it('updateAdminUser rejects for an unknown user', async () => {
    await expect(client.updateAdminUser(999, {})).rejects.toThrow('User with id 999 not found');
  });

  it('createAdminUser adds an active database user with the next id', async () => {
    const created = await client.createAdminUser({
      email: 'new@x.y',
      firstname: 'New',
      lastname: 'Person',
      password: 'p',
    } as Omit<AdminUser, 'id' | 'fullName'> & { password: string });

    expect(created).toMatchObject({
      id: 13,
      fullName: 'New Person',
      isActive: true,
      isSuspended: false,
      authenticationType: AuthenticationType.DATABASE,
    });
    expect((await client.getAdminUsers()).totalElements).toBe(13);
  });

  it('deleteAdminUser removes the user, and rejects for an unknown one', async () => {
    await client.deleteAdminUser(12);

    expect((await client.getAdminUsers()).totalElements).toBe(11);
    await expect(client.deleteAdminUser(12)).rejects.toThrow('User with id 12 not found');
  });

  it('updateUserSuspension records and clears the suspension reason', async () => {
    const suspended = await settle(
      client.updateUserSuspension(3, { suspended: true, suspensionReason: 'Spam' }),
    );
    expect(suspended).toMatchObject({ isSuspended: true, suspensionReason: 'Spam' });
    expect(suspended.suspendedDate).toEqual(expect.any(String));

    const restored = await settle(client.updateUserSuspension(3, { suspended: false }));
    expect(restored).toMatchObject({
      isSuspended: false,
      suspensionReason: undefined,
      suspendedDate: undefined,
    });

    // Suspending without a reason leaves the reason untouched.
    const noReason = await settle(client.updateUserSuspension(5, { suspended: true }));
    expect(noReason).toMatchObject({ isSuspended: true });
    expect(noReason.suspensionReason).toBeUndefined();
  });

  it('suspend, unsuspend and activate change the user flags', async () => {
    expect((await settle(client.suspendAdminUser(3))).isSuspended).toBe(true);
    expect((await settle(client.unsuspendAdminUser(3))).isSuspended).toBe(false);
    await settle(client.activateAdminUser(12));
    await settle(client.changeUserPassword(12, 'p'));

    const page = await client.getAdminUsers({ filterActive: false });
    expect(page.data.map((u) => u.id)).toEqual([4]);
  });

  // These used to throw inside the setTimeout callback, so for an unknown user the promise
  // never settled and the error escaped as an uncaught exception.
  it.each([
    [
      'updateUserSuspension',
      (c: MockAdminClient) => c.updateUserSuspension(999, { suspended: true }),
    ],
    ['suspendAdminUser', (c: MockAdminClient) => c.suspendAdminUser(999)],
    ['unsuspendAdminUser', (c: MockAdminClient) => c.unsuspendAdminUser(999)],
    ['activateAdminUser', (c: MockAdminClient) => c.activateAdminUser(999)],
    ['changeUserPassword', (c: MockAdminClient) => c.changeUserPassword(999, 'p')],
  ] as const)('%s rejects for an unknown user', async (_name, call) => {
    const result: Promise<unknown> = call(client);
    jest.advanceTimersByTime(500);
    await expect(result).rejects.toThrow('User with ID 999 not found');
  });

  it('getUserByFacebookId only finds Facebook users', async () => {
    await expect(client.getUserByFacebookId('1')).rejects.toThrow(
      'User with Facebook ID 1 not found',
    );

    await client.updateAdminUser(2, { authenticationType: AuthenticationType.FACEBOOK_OAUTH2 });
    await expect(client.getUserByFacebookId('2')).resolves.toMatchObject({ id: 2 });
  });

  it('removeFacebookAccount turns the user into a database user', async () => {
    await client.updateAdminUser(2, { authenticationType: AuthenticationType.FACEBOOK_OAUTH2 });
    await client.removeFacebookAccount(2);

    await expect(client.getUserByFacebookId('2')).rejects.toThrow();
    await expect(client.removeFacebookAccount(999)).rejects.toThrow('User with ID 999 not found');
  });
});

describe('MockAdminClient maps', () => {
  it('returns paginated maps', async () => {
    const page = await client.getAdminMaps({ pageSize: 5, page: 1 });

    expect(page.data.map((m) => m.id)).toEqual([6, 7, 8, 9, 10]);
    expect(page).toMatchObject({
      totalElements: 12,
      totalPages: 3,
      hasNext: true,
      hasPrevious: true,
    });
    expect((await client.getAdminMaps()).data).toHaveLength(10);
  });

  it('searches title, description and creator', async () => {
    expect((await client.getAdminMaps({ search: 'roadmap' })).data.map((m) => m.id)).toEqual([7]);
    expect((await client.getAdminMaps({ search: 'BUDGETING' })).data.map((m) => m.id)).toEqual([9]);
    expect((await client.getAdminMaps({ search: 'spammer2' })).data.map((m) => m.id)).toEqual([12]);
  });

  it('filters by public, locked and spam', async () => {
    expect((await client.getAdminMaps({ filterLocked: true })).data.map((m) => m.id)).toEqual([
      3, 8,
    ]);
    expect((await client.getAdminMaps({ filterSpam: true })).data.map((m) => m.id)).toEqual([
      5, 12,
    ]);
    expect(
      (await client.getAdminMaps({ filterPublic: true, filterSpam: false })).data.map((m) => m.id),
    ).toEqual([1, 4, 10]);
  });

  it('sorts maps both ways', async () => {
    const asc = await client.getAdminMaps({ sortBy: 'title', pageSize: 1 });
    expect(asc.data[0].title).toBe('Another Spam Map');

    const desc = await client.getAdminMaps({ sortBy: 'title', sortOrder: 'desc', pageSize: 1 });
    expect(desc.data[0].title).toBe('Technical Architecture');

    const byLockOwner = await client.getAdminMaps({ sortBy: 'isLockedBy' });
    expect(byLockOwner.totalElements).toBe(12);
  });

  it('getUserMaps returns the maps a user created', async () => {
    expect((await client.getUserMaps(1)).map((m) => m.id)).toEqual([1, 4]);
    await expect(client.getUserMaps(999)).rejects.toThrow('User not found');
  });

  it('updateAdminMap merges the change', async () => {
    await expect(client.updateAdminMap(2, { title: 'Renamed' })).resolves.toMatchObject({
      id: 2,
      title: 'Renamed',
    });
    await expect(client.updateAdminMap(999, {})).rejects.toThrow('Map not found');
  });

  it('updateMapSpamStatus sets and clears the spam details', async () => {
    const marked = await client.updateMapSpamStatus(1, { spam: true });
    expect(marked).toMatchObject({
      spam: true,
      spamType: 'MANUAL',
      spamDescription: 'Manually marked as spam by admin',
    });

    const cleared = await client.updateMapSpamStatus(5, { spam: false });
    expect(cleared).toMatchObject({
      spam: false,
      spamType: undefined,
      spamDetectedDate: undefined,
      spamDescription: undefined,
    });

    await expect(client.updateMapSpamStatus(999, { spam: true })).rejects.toThrow('Map not found');
  });

  it('deleteAdminMap removes the map', async () => {
    await client.deleteAdminMap(1);

    expect((await client.getAdminMaps()).totalElements).toBe(11);
    await expect(client.deleteAdminMap(1)).rejects.toThrow('Map not found');
  });

  it('getAdminMapXml describes the map', async () => {
    const xml = await client.getAdminMapXml(1);

    expect(xml).toContain('<title>Sample Mind Map</title>');
    expect(xml).toContain('<label>Sample</label>');
    expect(xml).toContain('<is-public>true</is-public>');
    await expect(client.getAdminMapXml(999)).rejects.toThrow('Map not found');
  });
});

describe('MockAdminClient system', () => {
  it('reports the user and map counts', async () => {
    await client.deleteAdminMap(1);

    const info = await client.getSystemInfo();
    expect(info.statistics).toEqual({ totalUsers: 12, totalMindmaps: 11 });
    expect(info.application.name).toContain('Mock');
  });

  it('reports a healthy system', async () => {
    await expect(client.getSystemHealth()).resolves.toEqual({
      database: 'UP',
      memory: 'UP',
      memoryUsagePercent: 50,
    });
  });
});
