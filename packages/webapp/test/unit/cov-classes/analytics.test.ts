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

import { waitFor } from '@testing-library/react';
import ReactGA from 'react-ga4';
import {
  clearAnalyticsUserId,
  setAnalyticsUserEmail,
  trackExport,
  trackMindmapListAction,
  trackPageView,
  trackToolbarAction,
} from '../../../src/utils/analytics';
import { analyticsLogger } from '../../../src/utils/logger';
import { flushPromises, installWebCrypto } from './helpers/axios-stub';

// SHA-256 of "me@example.com".
const HASH = '8c2a47d3bdb8d3096a6479f53eac3b724291db5f1c31611100f675be5537329d';

let warn: jest.SpyInstance;
beforeEach(() => {
  warn = jest.spyOn(analyticsLogger, 'warn').mockImplementation(() => undefined);
});

describe('event tracking', () => {
  it('sends mind map list actions, with the default category', () => {
    const event = jest.spyOn(ReactGA, 'event');

    trackMindmapListAction('open');
    trackMindmapListAction('star', 'favourites', 'map-1');

    expect(event).toHaveBeenNthCalledWith(1, {
      category: 'mindmap_list',
      action: 'open',
      label: undefined,
      nonInteraction: false,
    });
    expect(event).toHaveBeenNthCalledWith(2, {
      category: 'favourites',
      action: 'star',
      label: 'map-1',
      nonInteraction: false,
    });
  });

  it('sends toolbar actions under the toolbar category', () => {
    const event = jest.spyOn(ReactGA, 'event');

    trackToolbarAction('zoom-in', 'button');

    expect(event).toHaveBeenCalledWith({
      category: 'toolbar',
      action: 'zoom-in',
      label: 'button',
      nonInteraction: false,
    });
  });

  it('sends exports with the format as action and the group as label', () => {
    const event = jest.spyOn(ReactGA, 'event');

    trackExport('svg', 'image');

    expect(event).toHaveBeenCalledWith({
      category: 'export',
      action: 'svg',
      label: 'image',
      nonInteraction: false,
    });
  });

  it('sends page views', () => {
    const send = jest.spyOn(ReactGA, 'send');

    trackPageView('/c/maps', 'Maps');

    expect(send).toHaveBeenCalledWith({ hitType: 'pageview', page: '/c/maps', title: 'Maps' });
  });

  it('never lets an analytics failure break the caller', () => {
    const failure = new Error('blocked');
    jest.spyOn(ReactGA, 'event').mockImplementation(() => {
      throw failure;
    });
    jest.spyOn(ReactGA, 'send').mockImplementation(() => {
      throw failure;
    });

    expect(() => trackMindmapListAction('open')).not.toThrow();
    expect(() => trackExport('pdf', 'doc')).not.toThrow();
    expect(() => trackPageView('/', 'Home')).not.toThrow();

    expect(warn).toHaveBeenCalledWith('Failed to track mindmap list action:', failure);
    expect(warn).toHaveBeenCalledWith('Failed to track export action:', failure);
    expect(warn).toHaveBeenCalledWith('Failed to track page view:', failure);
  });
});

describe('analytics user id', () => {
  let removeWebCrypto: () => void;
  beforeAll(() => {
    removeWebCrypto = installWebCrypto();
  });
  afterAll(() => {
    removeWebCrypto();
  });

  it('identifies the user by a SHA-256 hash of the normalised email', async () => {
    const set = jest.spyOn(ReactGA, 'set');

    setAnalyticsUserEmail('  Me@Example.com ');

    // The digest resolves on Node's thread pool, not in a microtask: wait for the call itself,
    // or it lands in a later test. The raw email never reaches analytics.
    await waitFor(() => expect(set).toHaveBeenCalledWith({ userId: HASH }));
  });

  it('clears the user id for an empty email and on clear', () => {
    const set = jest.spyOn(ReactGA, 'set');

    setAnalyticsUserEmail(null);
    clearAnalyticsUserId();

    expect(set).toHaveBeenCalledTimes(2);
    expect(set).toHaveBeenNthCalledWith(1, { userId: undefined });
    expect(set).toHaveBeenNthCalledWith(2, { userId: undefined });
  });

  it('logs instead of throwing when the user id can not be set', async () => {
    jest.spyOn(ReactGA, 'set').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(() => clearAnalyticsUserId()).not.toThrow();
    expect(warn).toHaveBeenCalledWith('Failed to set analytics user ID:', expect.any(Error));
  });

  it('warns when the email can not be hashed', async () => {
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(globalThis.crypto.subtle, 'digest').mockRejectedValue(new Error('no crypto'));
    const set = jest.spyOn(ReactGA, 'set');

    setAnalyticsUserEmail('me@example.com');
    await flushPromises();

    expect(set).not.toHaveBeenCalled();
    expect(consoleWarn).toHaveBeenCalledWith('Failed to set analytics user ID:', expect.any(Error));
  });
});
