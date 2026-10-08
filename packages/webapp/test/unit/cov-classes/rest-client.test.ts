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

import { inspect } from 'util';
import { waitFor } from '@testing-library/react';
import ReactGA from 'react-ga4';
import RestClient from '../../../src/classes/client/rest-client';
import JwtTokenConfig from '../../../src/classes/jwt-token-config';
import { appLogger } from '../../../src/utils/logger';
import { stubBackend, flushPromises, installWebCrypto, Reply } from './helpers/axios-stub';

const API = 'http://api.test';

const newClient = (replies?: Reply[] | ((req: { url: string; method: string }) => Reply)) => {
  const client = new RestClient(API);
  const calls = stubBackend(client, replies);
  return { client, calls };
};

beforeEach(() => {
  jest.spyOn(appLogger, 'error').mockImplementation(() => undefined);
  jest.spyOn(appLogger, 'warn').mockImplementation(() => undefined);
  JwtTokenConfig.removeToken();
  localStorage.clear();
});

let removeWebCrypto: () => void;
beforeAll(() => {
  removeWebCrypto = installWebCrypto();
});

afterAll(() => {
  JwtTokenConfig.removeToken();
  removeWebCrypto();
});

describe('RestClient request headers', () => {
  it('sends the stored JWT as a bearer token and the user locale', async () => {
    JwtTokenConfig.storeToken('abc');
    localStorage.setItem('user.locale', 'es');
    const { client, calls } = newClient([{ data: { changes: [] } }]);

    await client.fetchHistory(1);

    expect(calls[0].header('Authorization')).toBe('Bearer abc');
    expect(calls[0].header('Accept-Language')).toBe('es');
  });

  it('omits the Authorization header when nobody is signed in', async () => {
    const { client, calls } = newClient([{ data: { changes: [] } }]);

    await client.fetchHistory(1);

    expect(calls[0].header('Authorization')).toBeFalsy();
  });
});

describe('RestClient maps', () => {
  it('fetchMapMetadata gets the metadata, with the xml flag when asked', async () => {
    const meta = { id: 3, title: 't' };
    const { client, calls } = newClient([{ data: meta }, { data: meta }]);

    await expect(client.fetchMapMetadata(3)).resolves.toEqual(meta);
    await client.fetchMapMetadata(3, true);

    expect(calls.map((c) => [c.method, c.url])).toEqual([
      ['GET', `${API}/api/restful/maps/3/metadata`],
      ['GET', `${API}/api/restful/maps/3/metadata?xml=true`],
    ]);
  });

  it('fetchMapMetadata turns a 422 (spam map) into a 410 gone error', async () => {
    const { client } = newClient([{ status: 422, data: { globalErrors: ['spam'] } }]);

    await expect(client.fetchMapMetadata(3)).rejects.toEqual({
      msg: 'spam',
      status: 410,
      isAuth: false,
    });
  });

  it('fetchAllMaps maps the server fields onto MapInfo', async () => {
    const { client, calls } = newClient([
      {
        data: {
          mindmapsInfo: [
            {
              id: 1,
              starred: true,
              title: 'A',
              labels: [],
              creator: 'me',
              creationTime: 'c',
              lastModifierUser: 'you',
              lastModificationTime: 'm',
              description: 'd',
              public: true,
              role: 'owner',
            },
          ],
        },
      },
    ]);

    const maps = await client.fetchAllMaps();

    expect(calls[0].url).toBe(`${API}/api/restful/maps/`);
    expect(maps).toEqual([
      {
        id: 1,
        starred: true,
        title: 'A',
        labels: [],
        createdBy: 'me',
        creationTime: 'c',
        lastModificationBy: 'you',
        lastModificationTime: 'm',
        description: 'd',
        public: true,
        role: 'owner',
      },
    ]);
  });

  it('fetchMapInfo finds the map in the list, or fails when it is missing', async () => {
    const reply = { data: { mindmapsInfo: [{ id: 5, title: 'Five' }] } };
    const { client } = newClient([reply, reply]);

    await expect(client.fetchMapInfo(5)).resolves.toMatchObject({ id: 5, title: 'Five' });
    await expect(client.fetchMapInfo(6)).rejects.toThrow('Map with id 6 could not be found');
  });

  it('createMap posts title, description and the default theme and returns the new id', async () => {
    const { client, calls } = newClient([{ headers: { resourceid: '42' } }]);

    await expect(client.createMap({ title: 'My map', description: 'a&b' })).resolves.toBe(42);

    expect(calls[0].method).toBe('POST');
    expect(calls[0].url).toBe(
      `${API}/api/restful/maps?title=My%20map&description=a%26b&theme=prism`,
    );
  });

  it('createMap sends an empty description when none is given', async () => {
    const { client, calls } = newClient([{ headers: { resourceid: '1' } }]);

    await client.createMap({ title: 'T' });

    expect(calls[0].url).toBe(`${API}/api/restful/maps?title=T&description=&theme=prism`);
  });

  it('importMap posts the XML content and returns the new id', async () => {
    const { client, calls } = newClient([
      { headers: { resourceid: '7' } },
      { headers: { resourceid: '8' } },
    ]);

    await expect(
      client.importMap({ title: 'Imp', description: 'd', content: '<map/>' }),
    ).resolves.toBe(7);
    await client.importMap({ title: 'Imp2', content: '<map/>' });

    expect(calls[0].url).toBe(`${API}/api/restful/maps?title=Imp&description=d`);
    expect(calls[0].data).toBe('<map/>');
    expect(calls[0].header('Content-Type')).toBe('application/xml');
    expect(calls[1].url).toBe(`${API}/api/restful/maps?title=Imp2&description=`);
  });

  it('renameMap updates the title, then the description (blank when cleared)', async () => {
    const { client, calls } = newClient();

    await client.renameMap(4, { title: 'New', description: 'Desc' });
    await client.renameMap(4, { title: 'Other', description: '' });

    expect(calls.map((c) => [c.method, c.url, c.data])).toEqual([
      ['PUT', `${API}/api/restful/maps/4/title`, 'New'],
      ['PUT', `${API}/api/restful/maps/4/description`, 'Desc'],
      ['PUT', `${API}/api/restful/maps/4/title`, 'Other'],
      ['PUT', `${API}/api/restful/maps/4/description`, ' '],
    ]);
  });

  it('renameMap without a description leaves the description alone', async () => {
    // The editor's app bar renames with the title only; the map keeps its description.
    const { client, calls } = newClient();

    await client.renameMap(4, { title: 'Other' });

    expect(calls.map((c) => [c.method, c.url, c.data])).toEqual([
      ['PUT', `${API}/api/restful/maps/4/title`, 'Other'],
    ]);
  });

  it('renameMap reports the field error of a duplicated title', async () => {
    const { client, calls } = newClient([
      { status: 400, data: { fieldErrors: { title: 'Title already in use' } } },
    ]);

    await expect(client.renameMap(4, { title: 'Dup' })).rejects.toEqual({
      msg: 'Title already in use',
      fields: { title: 'Title already in use' },
      status: 400,
      isAuth: false,
    });
    // The description is never sent once the title fails.
    expect(calls).toHaveLength(1);
  });

  it('duplicateMap posts the new title and returns the copy id', async () => {
    const { client, calls } = newClient([{ headers: { resourceid: '99' } }]);

    await expect(client.duplicateMap(2, { title: 'Copy' })).resolves.toBe(99);

    expect(calls[0].method).toBe('POST');
    expect(calls[0].url).toBe(`${API}/api/restful/maps/2`);
    expect(JSON.parse(calls[0].data as string)).toEqual({ title: 'Copy' });
  });

  it('deleteMap and deleteMaps call the delete endpoints', async () => {
    const { client, calls } = newClient();

    await client.deleteMap(3);
    await client.deleteMaps([1, 2, 3]);

    expect(calls.map((c) => [c.method, c.url])).toEqual([
      ['DELETE', `${API}/api/restful/maps/3`],
      ['DELETE', `${API}/api/restful/maps/batch?ids=1,2,3`],
    ]);
  });

  it('updateStarred and updateMapToPublic send the new flags', async () => {
    const { client, calls } = newClient();

    await client.updateStarred(3, true);
    await client.updateMapToPublic(3, false);

    expect(calls[0]).toMatchObject({
      method: 'PUT',
      url: `${API}/api/restful/maps/3/starred`,
      data: 'true',
    });
    expect(calls[1]).toMatchObject({ method: 'PUT', url: `${API}/api/restful/maps/3/publish` });
    expect(JSON.parse(calls[1].data as string)).toEqual({ isPublic: false });
  });

  it('fetchHistory maps the change list and revertHistory posts to the revision', async () => {
    const { client, calls } = newClient([
      { data: { changes: [{ id: 1, creator: 'me', creationTime: 't' }] } },
    ]);

    await expect(client.fetchHistory(9)).resolves.toEqual([
      { id: 1, lastModificationBy: 'me', lastModificationTime: 't' },
    ]);
    await client.revertHistory(9, 1);

    expect(calls.map((c) => [c.method, c.url])).toEqual([
      ['GET', `${API}/api/restful/maps/9/history/`],
      ['POST', `${API}/api/restful/maps/9/history/1`],
    ]);
  });
});

describe('RestClient sharing', () => {
  it('fetchMapPermissions maps the collaborations', async () => {
    const { client, calls } = newClient([
      {
        data: {
          collaborations: [{ id: 1, email: 'a@b.c', name: 'A', role: 'editor', extra: 'x' }],
        },
      },
    ]);

    await expect(client.fetchMapPermissions(3)).resolves.toEqual([
      { id: 1, email: 'a@b.c', name: 'A', role: 'editor' },
    ]);
    expect(calls[0].url).toBe(`${API}/api/restful/maps/3/collabs`);
  });

  it('addMapPermissions puts the message and collaborations', async () => {
    const { client, calls } = newClient();
    const perms = [{ email: 'a@b.c', role: 'viewer' as const }];

    await client.addMapPermissions(3, 'hello', perms);

    expect(calls[0]).toMatchObject({ method: 'PUT', url: `${API}/api/restful/maps/3/collabs/` });
    expect(JSON.parse(calls[0].data as string)).toEqual({
      message: 'hello',
      collaborations: perms,
    });
  });

  it('deleteMapPermission url-encodes the email', async () => {
    const { client, calls } = newClient();

    await client.deleteMapPermission(3, 'a+b@c.d');

    expect(calls[0]).toMatchObject({
      method: 'DELETE',
      url: `${API}/api/restful/maps/3/collabs?email=a%2Bb%40c.d`,
    });
  });
});

describe('RestClient labels', () => {
  it('fetchLabels maps the label list', async () => {
    const { client } = newClient([
      { data: { labels: [{ id: 1, color: 'red', title: 'L', iconName: 'smile', other: 1 }] } },
    ]);

    await expect(client.fetchLabels()).resolves.toEqual([
      { id: 1, color: 'red', title: 'L', iconName: 'smile' },
    ]);
  });

  it('createLabel posts the label and returns the new id', async () => {
    const { client, calls } = newClient([{ headers: { resourceid: '12' } }]);

    await expect(client.createLabel('Work', '#fff')).resolves.toBe(12);

    expect(calls[0].url).toBe(`${API}/api/restful/labels`);
    expect(JSON.parse(calls[0].data as string)).toEqual({
      title: 'Work',
      color: '#fff',
      iconName: 'smile',
    });
  });

  it('deleteLabel, addLabelToMap and deleteLabelFromMap hit the label endpoints', async () => {
    const { client, calls } = newClient();

    await client.deleteLabel(5);
    await client.addLabelToMap(5, 9);
    await client.deleteLabelFromMap(5, 9);

    expect(calls.map((c) => [c.method, c.url, c.data])).toEqual([
      ['DELETE', `${API}/api/restful/labels/5`, undefined],
      ['POST', `${API}/api/restful/maps/9/labels`, '5'],
      ['DELETE', `${API}/api/restful/maps/9/labels/5`, undefined],
    ]);
  });
});

describe('RestClient account', () => {
  it('fetchAccountInfo maps the account, defaulting missing names and the locale', async () => {
    const { client } = newClient([
      {
        data: {
          firstname: 'Ana',
          lastname: 'Li',
          email: 'a@b.c',
          locale: 'fr',
          authenticationType: 'DATABASE',
          isAdmin: true,
        },
      },
      { data: { email: 'x@y.z', locale: null, authenticationType: 'LDAP', isAdmin: 'yes' } },
    ]);

    const first = await client.fetchAccountInfo();
    expect(first).toMatchObject({
      firstname: 'Ana',
      lastname: 'Li',
      email: 'a@b.c',
      authenticationType: 'DATABASE',
      isAdmin: true,
    });
    expect(first.locale?.code).toBe('fr');

    await expect(client.fetchAccountInfo()).resolves.toEqual({
      firstname: '',
      lastname: '',
      email: 'x@y.z',
      locale: undefined,
      authenticationType: 'LDAP',
      isAdmin: false,
    });
  });

  it('fetchAccountInfo falls back to English for a locale the frontend does not support', async () => {
    const { client } = newClient([{ data: { email: 'a@b.c', locale: 'xx' } }]);

    const account = await client.fetchAccountInfo();

    expect(account.email).toBe('a@b.c');
    expect(account.locale?.code).toBe('en');
    expect(appLogger.warn).toHaveBeenCalledWith("Unsupported account locale 'xx', using English");
  });

  it('updateAccountInfo puts the first name and then the last name', async () => {
    const { client, calls } = newClient();

    await client.updateAccountInfo('Ana', 'Li');

    expect(calls.map((c) => [c.method, c.url, c.data])).toEqual([
      ['PUT', `${API}/api/restful/account/firstname`, 'Ana'],
      ['PUT', `${API}/api/restful/account/lastname`, 'Li'],
    ]);
  });

  it('updateAccountPassword and deleteAccount hit the account endpoints', async () => {
    const { client, calls } = newClient();

    await client.updateAccountPassword('s3cret');
    await client.deleteAccount();

    expect(calls.map((c) => [c.method, c.url, c.data])).toEqual([
      ['PUT', `${API}/api/restful/account/password`, 's3cret'],
      ['DELETE', `${API}/api/restful/account`, undefined],
    ]);
  });

  it('updateAccountLanguage puts the locale and adds it to the error message', async () => {
    const { client, calls } = newClient([{}, { status: 400, data: { globalErrors: ['Nope'] } }]);

    await client.updateAccountLanguage('de');
    await expect(client.updateAccountLanguage('ja')).rejects.toMatchObject({
      msg: 'Nope - Language: ja',
    });

    expect(calls[0]).toMatchObject({ url: `${API}/api/restful/account/locale`, data: 'de' });
  });

  it('registerNewUser posts the user as JSON', async () => {
    const { client, calls } = newClient();
    const user = {
      email: 'a@b.c',
      firstname: 'A',
      lastname: 'B',
      password: 'p',
      recaptcha: null,
      acceptedTerms: true,
    };

    await client.registerNewUser(user);

    expect(calls[0]).toMatchObject({ method: 'POST', url: `${API}/api/restful/users/` });
    expect(JSON.parse(calls[0].data as string)).toEqual(user);
  });

  it('activateAccount puts the activation code', async () => {
    const { client, calls } = newClient();

    await client.activateAccount('xyz');

    expect(calls[0]).toMatchObject({
      method: 'PUT',
      url: `${API}/api/restful/users/activation?code=xyz`,
    });
  });

  it('resetPassword returns the action the server took', async () => {
    const { client, calls } = newClient([{ data: { action: 'OAUTH2_USER' } }]);

    await expect(client.resetPassword('a+b@c.d')).resolves.toEqual({ action: 'OAUTH2_USER' });
    expect(calls[0].url).toBe(`${API}/api/restful/users/resetPassword?email=a%2Bb%40c.d`);
  });

  it('resetPasswordFromToken posts the token and the new password', async () => {
    const { client, calls } = newClient();

    await client.resetPasswordFromToken('tok', 'newpass');

    expect(calls[0].url).toBe(`${API}/api/restful/users/resetPasswordToken`);
    expect(JSON.parse(calls[0].data as string)).toEqual({ token: 'tok', password: 'newpass' });
  });
});

describe('RestClient login and logout', () => {
  it('login stores the token and reports the account email to analytics', async () => {
    const set = jest.spyOn(ReactGA, 'set');
    const { client, calls } = newClient([{ data: 'jwt-123' }, { data: { email: 'me@x.y' } }]);

    await client.login({ email: 'me@x.y', password: 'p' });
    await flushPromises();
    await flushPromises();

    expect(calls[0]).toMatchObject({ method: 'POST', url: `${API}/api/restful/authenticate` });
    expect(JSON.parse(calls[0].data as string)).toEqual({ email: 'me@x.y', password: 'p' });
    expect(JwtTokenConfig.retreiveToken()).toBe('jwt-123');
    // The account info request already carries the new token.
    expect(calls[1].header('Authorization')).toBe('Bearer jwt-123');
    // The digest resolves on Node's thread pool, not in a microtask: wait for the call itself.
    await waitFor(() =>
      expect(set).toHaveBeenCalledWith({ userId: expect.stringMatching(/^[0-9a-f]{64}$/) }),
    );
  });

  it('login still succeeds when the account info can not be fetched', async () => {
    const { client } = newClient([{ data: 'jwt' }, 'network']);

    await expect(client.login({ email: 'a', password: 'b' })).resolves.toBeUndefined();
    await flushPromises();

    expect(appLogger.warn).toHaveBeenCalledWith(
      'Failed to set analytics user ID after login:',
      expect.anything(),
    );
  });

  it('login reports bad credentials with code 1 without expiring the session', async () => {
    const expired = jest.fn();
    const { client } = newClient([{ status: 401, data: { globalErrors: ['Bad credentials'] } }]);
    client.onSessionExpired(expired);

    await expect(client.login({ email: 'a', password: 'b' })).rejects.toEqual({
      msg: 'Bad credentials',
      status: 401,
      isAuth: false,
      code: 1,
    });
    expect(expired).not.toHaveBeenCalled();
  });

  it('a failed login logs neither the password nor the token', async () => {
    JwtTokenConfig.storeToken('secret.jwt.value');
    const { client } = newClient([{ status: 500, data: { globalErrors: ['Boom'] } }]);

    await expect(client.login({ email: 'a', password: 'S3cret-pass!' })).rejects.toBeDefined();

    const logged = inspect(jest.mocked(appLogger.error).mock.calls, { depth: 10 });
    expect(appLogger.error).toHaveBeenCalled();
    expect(logged).not.toContain('S3cret-pass!');
    expect(logged).not.toContain('secret.jwt.value');
    expect(logged).toContain('/api/restful/authenticate');
    expect(logged).toContain('500');
  });

  it('login reports a 403 (account not active) with code 3', async () => {
    const { client } = newClient([{ status: 403, data: { globalErrors: ['Inactive'] } }]);

    await expect(client.login({ email: 'a', password: 'b' })).rejects.toMatchObject({
      msg: 'Inactive',
      code: 3,
    });
  });

  it('login reports a network failure with code 1', async () => {
    const { client } = newClient(['network']);

    await expect(client.login({ email: 'a', password: 'b' })).rejects.toEqual({
      msg: 'Unexpected error. Please, try latter',
      code: 1,
    });
  });

  it('logout removes the token and tells the backend', async () => {
    JwtTokenConfig.storeToken('tok');
    const { client, calls } = newClient();

    await client.logout();
    await flushPromises();

    expect(JwtTokenConfig.retreiveToken()).toBeUndefined();
    expect(calls[0]).toMatchObject({ method: 'POST', url: `${API}/api/restful/logout` });
  });
  // The backend call is awaited, so a failed logout is logged (it used to escape the try/catch
  // as an unhandled promise rejection).
  it('logout logs a backend failure', async () => {
    const client = new RestClient(API);
    // Already handled here, so the test run itself sees no unhandled rejection.
    const failure = Promise.reject(new Error('backend down'));
    failure.catch(() => undefined);
    (client as unknown as { axios: { post: () => Promise<unknown> } }).axios.post = () => failure;

    await client.logout();
    await flushPromises();

    expect(appLogger.error).toHaveBeenCalledWith(
      'Error logging out from backend',
      expect.anything(),
    );
  });
});

describe('RestClient OAuth callbacks', () => {
  const oauthReply = { data: { email: 'o@x.y', oauthSync: true, syncCode: 'S', jwtToken: 'J' } };

  it.each([
    ['processGoogleCallback', 'googlecallback'],
    ['processFacebookCallback', 'facebookcallback'],
  ] as const)('%s returns the sync result and stores the token', async (method, path) => {
    const { client, calls } = newClient([oauthReply, { data: { email: 'o@x.y' } }]);

    await expect(client[method]('the-code')).resolves.toEqual({
      email: 'o@x.y',
      oauthSync: true,
      syncCode: 'S',
    });
    await flushPromises();

    expect(calls[0]).toMatchObject({
      method: 'POST',
      url: `${API}/api/restful/oauth2/${path}?code=the-code`,
    });
    expect(JwtTokenConfig.retreiveToken()).toBe('J');
    expect(calls[1].url).toBe(`${API}/api/restful/account`);
  });

  it.each(['processGoogleCallback', 'processFacebookCallback'] as const)(
    '%s keeps no token when the server sends none, and tolerates account failures',
    async (method) => {
      const noToken = newClient([{ data: { email: 'o', oauthSync: false } }]);
      await noToken.client[method]('c');
      expect(noToken.calls).toHaveLength(1);
      expect(JwtTokenConfig.retreiveToken()).toBeUndefined();

      const failing = newClient([oauthReply, 'network']);
      await failing.client[method]('c');
      await flushPromises();
      expect(appLogger.warn).toHaveBeenCalled();
    },
  );

  it.each(['processGoogleCallback', 'processFacebookCallback'] as const)(
    '%s rejects with the server error',
    async (method) => {
      const { client } = newClient([{ status: 400, data: { globalErrors: ['Bad code'] } }]);

      await expect(client[method]('c')).rejects.toMatchObject({ msg: 'Bad code', status: 400 });
    },
  );

  // The code travels in the query string, so the body is a JSON null like confirmAccountSync's;
  // the request config used to be sent as the body (`{"headers":{"Content-Type":...}}`).
  it.each(['processGoogleCallback', 'processFacebookCallback'] as const)(
    '%s sends no payload, only the JSON content type',
    async (method) => {
      const { client, calls } = newClient([{ data: { email: 'o' } }]);

      await client[method]('c');

      expect(calls[0].data).toBe('null');
      expect(calls[0].header('Content-Type')).toBe('application/json');
    },
  );

  it('confirmAccountSync puts email, code and provider and stores the token', async () => {
    const { client, calls } = newClient([oauthReply, { data: { email: 'o' } }]);

    await expect(client.confirmAccountSync('a@b.c', 'C1', 'google')).resolves.toEqual({
      email: 'o@x.y',
      oauthSync: true,
      syncCode: 'S',
    });
    await flushPromises();

    expect(calls[0]).toMatchObject({
      method: 'PUT',
      url: `${API}/api/restful/oauth2/confirmaccountsync?email=a%40b.c&code=C1&provider=google`,
    });
    expect(JwtTokenConfig.retreiveToken()).toBe('J');
  });

  it('confirmAccountSync sends only the email when code and provider are missing', async () => {
    const { client, calls } = newClient([{ data: { email: 'o' } }, 'network']);

    await client.confirmAccountSync('a@b.c');

    expect(calls[0].url).toBe(`${API}/api/restful/oauth2/confirmaccountsync?email=a%40b.c`);
  });

  it('confirmAccountSync tolerates account failures and rejects with server errors', async () => {
    const ok = newClient([oauthReply, 'network']);
    await ok.client.confirmAccountSync('a');
    await flushPromises();
    expect(appLogger.warn).toHaveBeenCalledWith(
      'Failed to set analytics user ID after account sync:',
      expect.anything(),
    );

    const ko = newClient([{ status: 409, data: { globalErrors: ['Conflict'] } }]);
    await expect(ko.client.confirmAccountSync('a')).rejects.toMatchObject({
      msg: 'Conflict',
      status: 409,
    });
  });
});

describe('RestClient error handling', () => {
  // Every endpoint shares the same error mapping; drive it through one call per case.
  const failWith = (reply: Reply) => newClient([reply]).client.deleteMap(1);

  it('uses the first global error as the message', async () => {
    await expect(
      failWith({ status: 400, data: { globalErrors: ['First', 'Second'] } }),
    ).rejects.toEqual({ msg: 'First', status: 400, isAuth: false });
  });

  it('keeps the field errors and uses the first one as message when there is no global one', async () => {
    await expect(
      failWith({ status: 400, data: { globalErrors: [], fieldErrors: { email: 'Bad email' } } }),
    ).rejects.toEqual({
      msg: 'Bad email',
      fields: { email: 'Bad email' },
      status: 400,
      isAuth: false,
    });
  });

  it('keeps the global message when there are also field errors', async () => {
    await expect(
      failWith({ status: 400, data: { globalErrors: ['G'], fieldErrors: { a: 'F' } } }),
    ).rejects.toMatchObject({ msg: 'G', fields: { a: 'F' } });
  });

  it('falls back to a plain-text body, then to data.message', async () => {
    await expect(failWith({ status: 500, data: 'Server exploded' })).rejects.toEqual({
      msg: 'Server exploded',
      status: 500,
      isAuth: false,
    });
    await expect(failWith({ status: 500, data: { message: 'From message' } })).rejects.toEqual({
      msg: 'From message',
      status: 500,
      isAuth: false,
    });
  });

  it('falls back to the status text when there is no body', async () => {
    await expect(failWith({ status: 404, statusText: 'Not Found' })).rejects.toEqual({
      msg: 'Not Found',
      status: 404,
      isAuth: false,
    });
    await expect(failWith({ status: 404, statusText: '  ' })).rejects.toEqual({
      status: 404,
      isAuth: false,
    });
  });

  it('ignores blank text bodies and blank messages', async () => {
    await expect(failWith({ status: 500, data: '   ' })).rejects.toEqual({
      status: 500,
      isAuth: false,
    });
    await expect(failWith({ status: 500, data: { message: ' ' } })).rejects.toEqual({
      status: 500,
      isAuth: false,
    });
  });

  it('treats a 403 without a session token as an auth problem', async () => {
    await expect(failWith({ status: 403, data: {} })).rejects.toEqual({
      status: 403,
      isAuth: true,
    });

    JwtTokenConfig.storeToken('tok');
    await expect(failWith({ status: 403, data: {} })).rejects.toEqual({
      status: 403,
      isAuth: false,
    });
  });

  it('turns a 401 without details into a session-expired auth error', async () => {
    const expired = jest.fn();
    const { client } = newClient([{ status: 401 }]);
    client.onSessionExpired(expired);

    await expect(client.deleteMap(1)).rejects.toEqual({
      isAuth: true,
      msg: 'Your current session has expired. Please, sign in and try again.',
      status: 401,
    });
    expect(expired).toHaveBeenCalled();
  });

  it('treats a 302 redirect like an expired session', async () => {
    await expect(failWith({ status: 302 })).rejects.toMatchObject({ isAuth: true, status: 302 });
  });

  it('reports a network failure with a generic message', async () => {
    await expect(failWith('network')).rejects.toEqual({
      msg: 'Unexpected error. Please, try latter',
    });
  });

  it.each([403, 405])('notifies the session-expired callback on a %s', async (status) => {
    const expired = jest.fn();
    const { client } = newClient([{ status, data: {} }]);
    client.onSessionExpired(expired);

    await expect(client.deleteMap(1)).rejects.toBeDefined();

    expect(expired).toHaveBeenCalled();
  });

  it('does not notify the session-expired callback on other errors', async () => {
    const expired = jest.fn();
    const { client } = newClient([{ status: 500, data: {} }, 'network']);
    client.onSessionExpired(expired);

    await expect(client.deleteMap(1)).rejects.toBeDefined();
    await expect(client.deleteMap(1)).rejects.toBeDefined();

    expect(expired).not.toHaveBeenCalled();
  });

  it('onSessionExpired returns the registered callback and keeps it when called without one', () => {
    const client = new RestClient(API);
    const cb = jest.fn();

    expect(client.onSessionExpired(cb)).toBe(cb);
    expect(client.onSessionExpired()).toBe(cb);
  });

  it.each<[string, (c: RestClient) => Promise<unknown>]>([
    ['fetchMapMetadata', (c) => c.fetchMapMetadata(1)],
    ['deleteMapPermission', (c) => c.deleteMapPermission(1, 'a')],
    ['addMapPermissions', (c) => c.addMapPermissions(1, 'm', [])],
    ['fetchMapPermissions', (c) => c.fetchMapPermissions(1)],
    ['deleteAccount', (c) => c.deleteAccount()],
    ['updateAccountInfo', (c) => c.updateAccountInfo('a', 'b')],
    ['updateAccountPassword', (c) => c.updateAccountPassword('p')],
    ['importMap', (c) => c.importMap({ title: 't' })],
    ['fetchAccountInfo', (c) => c.fetchAccountInfo()],
    ['deleteMaps', (c) => c.deleteMaps([1])],
    ['updateMapToPublic', (c) => c.updateMapToPublic(1, true)],
    ['revertHistory', (c) => c.revertHistory(1, 2)],
    ['fetchHistory', (c) => c.fetchHistory(1)],
    ['createMap', (c) => c.createMap({ title: 't' })],
    ['fetchAllMaps', (c) => c.fetchAllMaps()],
    ['registerNewUser', (c) => c.registerNewUser({} as never)],
    ['activateAccount', (c) => c.activateAccount('x')],
    ['resetPassword', (c) => c.resetPassword('e')],
    ['resetPasswordFromToken', (c) => c.resetPasswordFromToken('t', 'p')],
    ['duplicateMap', (c) => c.duplicateMap(1, { title: 't' })],
    ['updateStarred', (c) => c.updateStarred(1, true)],
    ['fetchLabels', (c) => c.fetchLabels()],
    ['createLabel', (c) => c.createLabel('t', 'c')],
    ['deleteLabel', (c) => c.deleteLabel(1)],
    ['addLabelToMap', (c) => c.addLabelToMap(1, 2)],
    ['deleteLabelFromMap', (c) => c.deleteLabelFromMap(1, 2)],
  ])('%s rejects with the parsed server error', async (_name, call) => {
    const { client } = newClient(() => ({ status: 409, data: { globalErrors: ['Conflict'] } }));

    await expect(call(client)).rejects.toMatchObject({ msg: 'Conflict', status: 409 });
  });
});
