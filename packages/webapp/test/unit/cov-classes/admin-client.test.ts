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

import AdminClient from '../../../src/classes/client/admin-client';
import JwtTokenConfig from '../../../src/classes/jwt-token-config';
import { stubBackend, Reply } from './helpers/axios-stub';

const API = 'http://api.test';
const ADMIN = `${API}/api/restful/admin`;

const newClient = (replies?: Reply[] | (() => Reply)) => {
  const client = new AdminClient(API);
  const calls = stubBackend(client, replies);
  return { client, calls };
};

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
  JwtTokenConfig.removeToken();
});

afterAll(() => {
  JwtTokenConfig.removeToken();
});

describe('AdminClient requests', () => {
  it('sends the bearer token and always an English locale', async () => {
    JwtTokenConfig.storeToken('adm');
    const { client, calls } = newClient([{ data: { status: 'UP' } }]);

    await client.getSystemHealth();

    expect(calls[0].header('Authorization')).toBe('Bearer adm');
    expect(calls[0].header('Accept-Language')).toBe('en');
  });

  it('getAdminUsers lists users without a query string by default', async () => {
    const page = { data: [], page: 0 };
    const { client, calls } = newClient([{ data: page }, { data: page }]);

    await expect(client.getAdminUsers()).resolves.toEqual(page);
    await client.getAdminUsers({});

    expect(calls[0].url).toBe(`${ADMIN}/users`);
    expect(calls[1].url).toBe(`${ADMIN}/users`);
  });

  it('getAdminUsers encodes every filter', async () => {
    const { client, calls } = newClient();

    await client.getAdminUsers({
      page: 2,
      pageSize: 20,
      search: 'ana li',
      sortBy: 'email',
      sortOrder: 'desc',
      filterActive: false,
      filterSuspended: true,
      filterAuthType: 'DATABASE',
    });

    expect(calls[0].url).toBe(
      `${ADMIN}/users?page=2&pageSize=20&search=ana+li&sortBy=email&sortOrder=desc&filterActive=false&filterSuspended=true&filterAuthType=DATABASE`,
    );
  });

  it('getAdminMaps encodes every filter', async () => {
    const { client, calls } = newClient();

    await client.getAdminMaps();
    await client.getAdminMaps({
      page: 1,
      pageSize: 5,
      search: 'x',
      sortBy: 'title',
      sortOrder: 'asc',
      filterPublic: true,
      filterLocked: false,
      filterSpam: true,
      dateFilter: '7d',
    });

    expect(calls[0].url).toBe(`${ADMIN}/maps`);
    expect(calls[1].url).toBe(
      `${ADMIN}/maps?page=1&pageSize=5&search=x&sortBy=title&sortOrder=asc&filterPublic=true&filterLocked=false&filterSpam=true&dateFilter=7d`,
    );
  });

  it('user management calls hit the matching endpoints and return the body', async () => {
    const user = { id: 3, email: 'u@x.y' };
    const { client, calls } = newClient(() => ({ data: user }));

    await expect(client.getAdminUser(3)).resolves.toEqual(user);
    await expect(client.updateAdminUser(3, { firstname: 'U' })).resolves.toEqual(user);
    await expect(
      client.createAdminUser({ email: 'n@x.y', password: 'p' } as never),
    ).resolves.toEqual(user);
    await expect(client.deleteAdminUser(3)).resolves.toBeUndefined();
    await expect(
      client.updateUserSuspension(3, { suspended: true, suspensionReason: 'spam' }),
    ).resolves.toEqual(user);
    await expect(client.suspendAdminUser(3)).resolves.toEqual(user);
    await expect(client.unsuspendAdminUser(3)).resolves.toEqual(user);
    await expect(client.activateAdminUser(3)).resolves.toBeUndefined();
    await expect(client.changeUserPassword(3, 'newpass')).resolves.toBeUndefined();
    await expect(client.getUserByFacebookId('fb/1')).resolves.toEqual(user);
    await expect(client.removeFacebookAccount(3)).resolves.toBeUndefined();
    await expect(client.getUserMaps(3)).resolves.toEqual(user);

    expect(calls.map((c) => [c.method, c.url])).toEqual([
      ['GET', `${ADMIN}/users/3`],
      ['PUT', `${ADMIN}/users/3`],
      ['POST', `${ADMIN}/users`],
      ['DELETE', `${ADMIN}/users/3`],
      ['PUT', `${ADMIN}/users/3/suspension`],
      ['PUT', `${ADMIN}/users/3/suspend`],
      ['PUT', `${ADMIN}/users/3/unsuspend`],
      ['PUT', `${ADMIN}/users/3/activate`],
      ['PUT', `${ADMIN}/users/3/password`],
      ['GET', `${ADMIN}/users/facebook/fb%2F1`],
      ['DELETE', `${ADMIN}/users/3/facebook`],
      ['GET', `${ADMIN}/users/3/maps`],
    ]);
    expect(JSON.parse(calls[1].data as string)).toEqual({ firstname: 'U' });
    expect(JSON.parse(calls[4].data as string)).toEqual({
      suspended: true,
      suspensionReason: 'spam',
    });
    expect(calls[8].data).toBe('newpass');
    expect(calls[8].header('Content-Type')).toBe('text/plain');
  });

  it('updateAdminMap renames public to isPublic for the backend', async () => {
    const { client, calls } = newClient([{ data: { id: 4 } }]);

    await expect(
      client.updateAdminMap(4, { title: 'T', description: 'D', public: true, isLocked: false }),
    ).resolves.toEqual({ id: 4 });

    expect(calls[0]).toMatchObject({ method: 'PUT', url: `${ADMIN}/maps/4` });
    expect(JSON.parse(calls[0].data as string)).toEqual({
      id: 4,
      title: 'T',
      description: 'D',
      isPublic: true,
      isLocked: false,
    });
  });

  it('updateMapSpamStatus sends isSpam', async () => {
    const { client, calls } = newClient([{ data: { id: 4, spam: true } }]);

    await client.updateMapSpamStatus(4, { spam: true });

    expect(calls[0]).toMatchObject({ method: 'PUT', url: `${ADMIN}/maps/4/spam` });
    expect(JSON.parse(calls[0].data as string)).toEqual({ isSpam: true });
  });

  it('deleteAdminMap, getAdminMapXml and getSystemInfo hit their endpoints', async () => {
    const { client, calls } = newClient([{}, { data: '<map/>' }, { data: { application: {} } }]);

    await client.deleteAdminMap(4);
    await expect(client.getAdminMapXml(4)).resolves.toBe('<map/>');
    await expect(client.getSystemInfo()).resolves.toEqual({ application: {} });

    expect(calls.map((c) => [c.method, c.url])).toEqual([
      ['DELETE', `${ADMIN}/maps/4`],
      ['GET', `${ADMIN}/maps/4/xml`],
      ['GET', `${ADMIN}/system/info`],
    ]);
  });

  it('fetchMapMetadata gets the map metadata, with xml when asked', async () => {
    const { client, calls } = newClient([{ data: { id: 1 } }, { data: { id: 1 } }]);

    await expect(client.fetchMapMetadata(1)).resolves.toEqual({ id: 1 });
    await client.fetchMapMetadata(1, true);

    expect(calls.map((c) => c.url)).toEqual([
      `${API}/api/restful/maps/1/metadata`,
      `${API}/api/restful/maps/1/metadata?xml=true`,
    ]);
  });

  it('login stores the returned token', async () => {
    const { client, calls } = newClient([{ data: 'adm-jwt' }]);

    await client.login({ email: 'a@x.y', password: 'p' });

    expect(calls[0]).toMatchObject({ method: 'POST', url: `${API}/api/restful/authenticate` });
    expect(JwtTokenConfig.retreiveToken()).toBe('adm-jwt');
  });

  it('login reports a 403 with code 3 and other failures with code 1', async () => {
    const forbidden = newClient([{ status: 403, data: { msg: 'Disabled' } }]);
    await expect(forbidden.client.login({ email: 'a', password: 'b' })).rejects.toMatchObject({
      msg: 'Disabled',
      code: 3,
    });

    const offline = newClient(['network']);
    await expect(offline.client.login({ email: 'a', password: 'b' })).rejects.toEqual({
      msg: 'Unexpected error. Please, try latter',
      code: 1,
    });
  });
});

describe('AdminClient errors', () => {
  it('uses a text body as the message', async () => {
    const { client } = newClient([{ status: 500, data: 'Boom' }]);

    await expect(client.getAdminUser(1)).rejects.toEqual({
      msg: 'Boom',
      status: 500,
      isAuth: false,
    });
  });

  it('keeps an object body and adds the status', async () => {
    const { client } = newClient([{ status: 400, data: { msg: 'Bad', fields: { a: 'b' } } }]);

    await expect(client.getAdminUser(1)).rejects.toEqual({
      msg: 'Bad',
      fields: { a: 'b' },
      status: 400,
      isAuth: false,
    });
  });

  it('treats a 403 without a session as an auth problem and notifies session expiry', async () => {
    const expired = jest.fn();
    const { client } = newClient([
      { status: 403, data: {} },
      { status: 405, data: {} },
    ]);
    client.onSessionExpired(expired);

    await expect(client.getSystemInfo()).rejects.toEqual({ status: 403, isAuth: true });
    await expect(client.getSystemInfo()).rejects.toEqual({ status: 405, isAuth: false });
    expect(expired).toHaveBeenCalledTimes(2);
  });

  it('a 403 with a session token is not an auth problem', async () => {
    JwtTokenConfig.storeToken('tok');
    const { client } = newClient([{ status: 403, data: {} }]);

    await expect(client.getSystemInfo()).rejects.toEqual({ status: 403, isAuth: false });
  });

  it('reports an empty body or network failure with a generic message', async () => {
    const { client } = newClient([{ status: 500 }, 'network']);

    await expect(client.getSystemInfo()).rejects.toEqual({
      msg: 'Unexpected error. Please, try latter',
    });
    await expect(client.getSystemInfo()).rejects.toEqual({
      msg: 'Unexpected error. Please, try latter',
    });
  });

  it('does not notify session expiry on other errors, nor without a callback', async () => {
    const quiet = newClient([{ status: 403, data: {} }]);
    await expect(quiet.client.getSystemInfo()).rejects.toBeDefined();

    const expired = jest.fn();
    const { client } = newClient([{ status: 500, data: {} }]);
    client.onSessionExpired(expired);
    await expect(client.getSystemInfo()).rejects.toBeDefined();
    expect(expired).not.toHaveBeenCalled();
  });

  it('onSessionExpired returns the callback, or a no-op when given none', () => {
    const client = new AdminClient(API);
    const cb = jest.fn();

    expect(client.onSessionExpired(cb)).toBe(cb);
    const noop = client.onSessionExpired();
    expect(typeof noop).toBe('function');
    expect(noop?.()).toBeUndefined();
  });

  it.each<[string, (c: AdminClient) => Promise<unknown>]>([
    ['getAdminUsers', (c) => c.getAdminUsers()],
    ['updateAdminUser', (c) => c.updateAdminUser(1, {})],
    ['createAdminUser', (c) => c.createAdminUser({} as never)],
    ['deleteAdminUser', (c) => c.deleteAdminUser(1)],
    ['updateUserSuspension', (c) => c.updateUserSuspension(1, { suspended: false })],
    ['suspendAdminUser', (c) => c.suspendAdminUser(1)],
    ['unsuspendAdminUser', (c) => c.unsuspendAdminUser(1)],
    ['activateAdminUser', (c) => c.activateAdminUser(1)],
    ['changeUserPassword', (c) => c.changeUserPassword(1, 'p')],
    ['getUserByFacebookId', (c) => c.getUserByFacebookId('f')],
    ['removeFacebookAccount', (c) => c.removeFacebookAccount(1)],
    ['getAdminMaps', (c) => c.getAdminMaps()],
    ['getUserMaps', (c) => c.getUserMaps(1)],
    ['updateAdminMap', (c) => c.updateAdminMap(1, {})],
    ['updateMapSpamStatus', (c) => c.updateMapSpamStatus(1, { spam: false })],
    ['deleteAdminMap', (c) => c.deleteAdminMap(1)],
    ['getAdminMapXml', (c) => c.getAdminMapXml(1)],
    ['getSystemHealth', (c) => c.getSystemHealth()],
    ['fetchMapMetadata', (c) => c.fetchMapMetadata(1)],
  ])('%s rejects with the parsed server error', async (_name, call) => {
    const { client } = newClient(() => ({ status: 409, data: 'Conflict' }));

    await expect(call(client)).rejects.toEqual({ msg: 'Conflict', status: 409, isAuth: false });
  });
});

describe('AdminClient regular-client stand-ins', () => {
  it('answers the non-admin Client methods locally without calling the backend', async () => {
    const { client, calls } = newClient();

    await expect(client.logout()).resolves.toBeUndefined();
    await expect(client.deleteAccount()).resolves.toBeUndefined();
    await expect(client.importMap({ title: 't' })).resolves.toBe(1);
    await expect(client.createMap({ title: 't' })).resolves.toBe(1);
    await expect(client.deleteMaps([1])).resolves.toBeUndefined();
    await expect(client.deleteMap(1)).resolves.toBeUndefined();
    await expect(client.renameMap(1, { title: 't' })).resolves.toBeUndefined();
    await expect(client.fetchAllMaps()).resolves.toEqual([]);
    await expect(client.fetchMapInfo(9)).resolves.toMatchObject({ id: 1, role: 'owner' });
    await expect(client.fetchMapPermissions(1)).resolves.toEqual([]);
    await expect(client.addMapPermissions(1, 'm', [])).resolves.toBeUndefined();
    await expect(client.deleteMapPermission(1, 'e')).resolves.toBeUndefined();
    await expect(client.duplicateMap(1, { title: 't' })).resolves.toBe(1);
    await expect(client.updateAccountLanguage('en')).resolves.toBeUndefined();
    await expect(client.updateAccountPassword('p')).resolves.toBeUndefined();
    await expect(client.updateAccountInfo('a', 'b')).resolves.toBeUndefined();
    await expect(client.updateStarred(1, true)).resolves.toBeUndefined();
    await expect(client.updateMapToPublic(1, true)).resolves.toBeUndefined();
    await expect(client.createLabel('t', 'c')).resolves.toBe(1);
    await expect(client.fetchLabels()).resolves.toEqual([]);
    await expect(client.deleteLabel(1)).resolves.toBeUndefined();
    await expect(client.addLabelToMap(1, 2)).resolves.toBeUndefined();
    await expect(client.deleteLabelFromMap(1, 2)).resolves.toBeUndefined();
    await expect(client.fetchAccountInfo()).resolves.toMatchObject({
      email: 'admin@wisemapping.com',
      isAdmin: true,
    });
    await expect(client.registerNewUser({} as never)).resolves.toBeUndefined();
    await expect(client.resetPassword('e')).resolves.toEqual({ action: 'EMAIL_SENT' });
    await expect(client.processGoogleCallback('c')).resolves.toMatchObject({ oauthSync: false });
    await expect(client.processFacebookCallback('c')).resolves.toMatchObject({
      oauthSync: false,
    });
    await expect(client.confirmAccountSync('e')).resolves.toMatchObject({
      email: 'admin@wisemapping.com',
    });
    await expect(client.fetchHistory(1)).resolves.toEqual([]);
    await expect(client.revertHistory(1, 2)).resolves.toBeUndefined();

    expect(calls).toHaveLength(0);
  });
});
