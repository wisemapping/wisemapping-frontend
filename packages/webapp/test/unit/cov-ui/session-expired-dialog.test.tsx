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

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';

jest.mock('../../../src/utils/redirect', () => ({
  ...jest.requireActual('../../../src/utils/redirect'),
  leaveTo: jest.fn(),
}));

import SessionExpiredDialog from '../../../src/components/common-page/session-expired-dialog';
import { leaveTo } from '../../../src/utils/redirect';
import { renderWithProviders } from '../helpers/render';

describe('SessionExpiredDialog', () => {
  test('signing in again comes back to the page the session expired on', () => {
    // It went to the bare /c/login: after an expiry in the editor, the user landed on the
    // map list instead of the map.
    window.history.pushState({}, '', '/c/maps/5/edit?zoom=2');
    renderWithProviders(<SessionExpiredDialog open={true} />);

    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(leaveTo).toHaveBeenCalledWith(
      `/c/login?redirect=${encodeURIComponent('/c/maps/5/edit?zoom=2')}`,
    );
    window.history.pushState({}, '', '/');
  });
});
