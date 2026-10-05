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
import { render } from '@testing-library/react';
import Redirect from '../../../src/components/redirect';

// react-router is ESM-only (see jest.config.js): record what the redirect asks of it.
const navigate = jest.fn();
const navigateElement = jest.fn();
jest.mock('react-router', () => ({
  useNavigate: () => navigate,
  Navigate: (props: { to: string; replace?: boolean }) => {
    navigateElement(props);
    return null;
  },
}));

// BL5-175: the root redirect called navigate(to) from an effect with no dependency array: it
// navigated again on every re-render, and pushed a history entry that Back returned to.
describe('Redirect', () => {
  beforeEach(() => {
    navigate.mockClear();
    navigateElement.mockClear();
  });

  it('replaces the current entry instead of pushing one', () => {
    render(<Redirect to="/c/login" />);

    expect(navigate).not.toHaveBeenCalled();
    expect(navigateElement).toHaveBeenLastCalledWith({ to: '/c/login', replace: true });
  });

  it('does not call navigate on a re-render', () => {
    const { rerender } = render(<Redirect to="/c/login" />);
    rerender(<Redirect to="/c/login" />);
    rerender(<Redirect to="/c/login" />);

    expect(navigate).not.toHaveBeenCalled();
    navigateElement.mock.calls.forEach(([props]) =>
      expect(props).toEqual({ to: '/c/login', replace: true }),
    );
  });
});
