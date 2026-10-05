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

import MockClient from '../../../src/classes/client/mock-client';
import JwtTokenConfig from '../../../src/classes/jwt-token-config';

let client: MockClient;

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  JwtTokenConfig.removeToken();
  localStorage.clear();
  client = new MockClient();
});

afterAll(() => {
  JwtTokenConfig.removeToken();
});

describe('MockClient maps', () => {
  it('lists the seeded maps with every role', async () => {
    const maps = await client.fetchAllMaps();

    expect(maps).toHaveLength(50);
    expect(maps[0]).toMatchObject({ id: 1, title: 'El Mapa', starred: true, role: 'owner' });
    expect(new Set(maps.map((m) => m.role))).toEqual(new Set(['owner', 'editor', 'viewer']));
  });

  it('fetchMapInfo returns a known map', async () => {
    await expect(client.fetchMapInfo(2)).resolves.toMatchObject({ title: 'My New Project' });
  });

  // It used to throw synchronously, so `client.fetchMapInfo(id).catch(...)` never saw the error.
  it('fetchMapInfo rejects for an unknown map', async () => {
    await expect(client.fetchMapInfo(9999)).rejects.toThrow('Map could not be found 9999');
  });

  it('fetchMapMetadata returns metadata, with a map document when asked', async () => {
    const plain = await client.fetchMapMetadata(5);
    expect(plain).toMatchObject({ id: 5, isLocked: false, role: 'owner' });
    expect(plain.xml).toBeUndefined();

    const withXml = await client.fetchMapMetadata(5, true);
    expect(withXml.xml).toContain('<map name="5"');
    expect(withXml.xml).toContain('Mock Map 5');
  });

  it('createMap adds an owned map that is then listed', async () => {
    const id = await client.createMap({ title: 'Fresh', description: 'D' });
    await client.createMap({ title: 'No description' });

    const maps = await client.fetchAllMaps();
    expect(maps.find((m) => m.id === id)).toMatchObject({
      title: 'Fresh',
      description: 'D',
      role: 'owner',
      starred: false,
      public: false,
    });
    expect(maps.find((m) => m.title === 'No description')?.description).toBe('');
  });

  it('renameMap changes title and description', async () => {
    await client.renameMap(1, { title: 'Renamed', description: 'New desc' });
    await client.renameMap(2, { title: 'Renamed 2' });

    const maps = await client.fetchAllMaps();
    expect(maps.find((m) => m.id === 1)).toMatchObject({
      title: 'Renamed',
      description: 'New desc',
    });
    expect(maps.find((m) => m.id === 2)?.description).toBe('');
  });

  it('renameMap rejects a title that is already taken', async () => {
    await expect(client.renameMap(2, { title: 'El Mapa' })).rejects.toMatchObject({
      msg: 'Map already exists ...El Mapa',
    });
  });

  it('duplicateMap adds a copy, and rejects a taken title', async () => {
    const id = await client.duplicateMap(1, { title: 'Copy', description: 'Copied' });

    const maps = await client.fetchAllMaps();
    expect(maps.find((m) => m.id === id)).toMatchObject({ title: 'Copy', description: 'Copied' });

    await expect(client.duplicateMap(1, { title: 'Copy' })).rejects.toMatchObject({
      msg: 'Maps name must be unique:Copy',
    });
  });

  // It used to store String(undefined), so the copy showed the literal text "undefined".
  it('duplicateMap leaves the description empty when none is given', async () => {
    const id = await client.duplicateMap(1, { title: 'Bare copy' });

    const maps = await client.fetchAllMaps();
    expect(maps.find((m) => m.id === id)?.description).toBe('');
  });

  it('deleteMap and deleteMaps remove maps', async () => {
    await client.deleteMap(1);
    await client.deleteMaps([2, 11]);

    const ids = (await client.fetchAllMaps()).map((m) => m.id);
    expect(ids).not.toEqual(expect.arrayContaining([1]));
    expect(ids).not.toContain(2);
    expect(ids).not.toContain(11);
    expect(ids).toHaveLength(47);
  });

  it('updateStarred and updateMapToPublic change the flags', async () => {
    await client.updateStarred(2, true);
    await client.updateMapToPublic(2, true);
    await client.updateMapToPublic(9999, true);

    const map = (await client.fetchAllMaps()).find((m) => m.id === 2);
    expect(map).toMatchObject({ starred: true, public: true });
  });

  it('updateStarred rejects for an unknown map', async () => {
    await expect(client.updateStarred(9999, true)).rejects.toBeUndefined();
  });

  it('fetchHistory returns the change list and revertHistory succeeds', async () => {
    const history = await client.fetchHistory(1);

    expect(history).toHaveLength(7);
    expect(history[0]).toEqual({
      id: 1,
      lastModificationBy: 'Paulo',
      lastModificationTime: '2008-06-02T00:00:00Z',
    });
    await expect(client.revertHistory(1, 2)).resolves.toBeUndefined();
  });

  it('importMap returns a map id', async () => {
    await expect(client.importMap({ title: 'Imported' })).resolves.toBe(10);
  });
});

describe('MockClient labels', () => {
  it('lists the seeded labels', async () => {
    await expect(client.fetchLabels()).resolves.toEqual([
      { id: 1, title: 'label 1', color: 'black' },
      { id: 2, title: 'label 2', color: 'green' },
      { id: 3, title: 'label 3', color: 'red' },
    ]);
  });

  it('createLabel gives the next id and lists the new label', async () => {
    const id = await client.createLabel('Work', 'blue');

    expect(id).toBe(4);
    expect(await client.fetchLabels()).toContainEqual({ id: 4, title: 'Work', color: 'blue' });
  });

  // The Client contract returns a Promise; it used to return the bare number, so
  // `client.createLabel(...).then(...)` threw a TypeError.
  it('createLabel returns a promise', () => {
    expect(client.createLabel('Work', 'blue')).toBeInstanceOf(Promise);
  });

  it('addLabelToMap and deleteLabelFromMap round-trip a label on a map', async () => {
    await client.addLabelToMap(3, 1);
    expect((await client.fetchAllMaps()).find((m) => m.id === 1)?.labels).toEqual([
      { id: 3, title: 'label 3', color: 'red' },
    ]);

    await client.deleteLabelFromMap(3, 1);
    expect((await client.fetchAllMaps()).find((m) => m.id === 1)?.labels).toEqual([]);
  });

  it('label operations reject unknown labels or maps', async () => {
    await expect(client.addLabelToMap(99, 1)).rejects.toEqual({
      msg: 'unable to find label with id 99',
    });
    await expect(client.addLabelToMap(1, 9999)).rejects.toEqual({
      msg: 'unable to find map with id 9999',
    });
    await expect(client.deleteLabelFromMap(1, 9999)).rejects.toEqual({
      msg: 'unable to find map with id 9999',
    });
  });

  it('deleteLabel removes it from the list and from every map', async () => {
    await client.deleteLabel(1);

    expect((await client.fetchLabels()).map((l) => l.id)).toEqual([2, 3]);
    const maps = await client.fetchAllMaps();
    expect(maps.some((m) => m.labels.some((l) => l.id === 1))).toBe(false);
  });
});

describe('MockClient sharing', () => {
  it('starts every map with three collaborators', async () => {
    const perms = await client.fetchMapPermissions(1);

    expect(perms.map((p) => [p.email, p.role])).toEqual([
      ['pepe@example.com', 'editor'],
      ['pepe2@example.com', 'owner'],
      ['pepe3@example.com', 'viewer'],
    ]);
  });

  it('adds and removes collaborators', async () => {
    await client.fetchMapPermissions(1);
    await client.addMapPermissions(1, 'welcome', [{ email: 'new@x.y', role: 'viewer' }]);
    await client.deleteMapPermission(1, 'pepe@example.com');

    const emails = (await client.fetchMapPermissions(1)).map((p) => p.email);
    expect(emails).toEqual(['pepe2@example.com', 'pepe3@example.com', 'new@x.y']);
  });

  it('adding or removing on a fresh map starts from an empty list', async () => {
    await client.deleteMapPermission(7, 'nobody@x.y');
    expect(await client.fetchMapPermissions(7)).toEqual([]);

    await client.addMapPermissions(8, '', [{ email: 'a@x.y', role: 'editor' }]);
    expect(await client.fetchMapPermissions(8)).toEqual([{ email: 'a@x.y', role: 'editor' }]);
  });
});

describe('MockClient account', () => {
  it('fetchAccountInfo rejects as unauthenticated until somebody logs in', async () => {
    await expect(client.fetchAccountInfo()).rejects.toEqual({
      msg: 'User not authenticated',
      isAuth: true,
      status: 401,
    });

    await client.login({ email: 'me@x.y', password: 'p' });

    await expect(client.fetchAccountInfo()).resolves.toMatchObject({
      email: 'test@example.com',
      isAdmin: true,
      locale: undefined,
    });
    expect(JwtTokenConfig.retreiveToken()).toBe('me@x.y');
  });

  it('updateAccountLanguage is reflected in the account locale', async () => {
    await client.login({ email: 'me@x.y', password: 'p' });
    await client.updateAccountLanguage('fr');

    expect((await client.fetchAccountInfo()).locale?.code).toBe('fr');
  });

  it('accepts the remaining account operations', async () => {
    await expect(client.logout()).resolves.toBeUndefined();
    await expect(client.deleteAccount()).resolves.toBeUndefined();
    await expect(client.updateAccountInfo('A', 'B')).resolves.toBeUndefined();
    await expect(client.updateAccountPassword('p')).resolves.toBeUndefined();
    await expect(client.resetPassword('a@x.y')).resolves.toEqual({ action: 'EMAIL_SENT' });
    await expect(client.resetPasswordFromToken('t', 'p')).resolves.toBeUndefined();
  });

  it('registerNewUser fails only for the error@example.com address', async () => {
    const user = {
      email: 'ok@example.com',
      firstname: 'a',
      lastname: 'b',
      password: 'p',
      recaptcha: null,
      acceptedTerms: true,
    };

    await expect(client.registerNewUser(user)).resolves.toBeUndefined();
    await expect(client.registerNewUser({ ...user, email: 'error@example.com' })).rejects.toEqual({
      msg: 'Unexpected error',
    });
  });

  it('activateAccount rejects the reserved invalid code', async () => {
    await expect(client.activateAccount('123')).resolves.toBeUndefined();
    await expect(client.activateAccount('999999999')).rejects.toEqual({
      msg: 'Invalid activation code. The link may be incorrect or expired.',
    });
  });

  it('OAuth callbacks report an account that needs syncing', async () => {
    const expected = { email: 'test@email.com', oauthSync: true, syncCode: undefined };

    await expect(client.processGoogleCallback()).resolves.toEqual(expected);
    await expect(client.processFacebookCallback()).resolves.toEqual(expected);
    await expect(client.confirmAccountSync('a@x.y')).resolves.toEqual(expected);
  });

  it('onSessionExpired echoes the callback', () => {
    const cb = jest.fn();

    expect(client.onSessionExpired(cb)).toBe(cb);
    expect(client.onSessionExpired()).toBeUndefined();
  });
});

describe('MockClient admin helpers', () => {
  it('lists two admin users', async () => {
    const users = await client.getAdminUsers();

    expect(users.map((u) => u.email)).toEqual(['admin@example.com', 'user@example.com']);
  });

  it('updateAdminUser and createAdminUser build the full name', async () => {
    await expect(
      client.updateAdminUser(5, { firstname: 'Ana', lastname: 'Li' }),
    ).resolves.toMatchObject({ id: 5, fullName: 'Ana Li' });
    await expect(
      client.createAdminUser({ firstname: 'Bo', lastname: 'Ma' }),
    ).resolves.toMatchObject({
      fullName: 'Bo Ma',
      isActive: true,
      isSuspended: false,
      authenticationType: 'DATABASE',
    });
    await expect(client.deleteAdminUser(5)).resolves.toBeUndefined();
  });
});
