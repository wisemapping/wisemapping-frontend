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

const mockUseFetchMapById = jest.fn();
jest.mock('../../../../src/classes/middleware', () => ({
  useFetchMapById: (id: number) => mockUseFetchMapById(id),
}));
jest.mock('../../../../src/utils/analytics', () => ({ trackMindmapListAction: jest.fn() }));

import ActionChooser from '../../../../src/components/maps-page/action-chooser';
import { Role } from '../../../../src/classes/client';
import { trackMindmapListAction } from '../../../../src/utils/analytics';
import { renderWithProviders } from '../../helpers/render';

const ALL = [
  'Open',
  'Duplicate',
  'Rename',
  'Add Label',
  'Delete',
  'Export',
  'Print',
  'Publish',
  'Share',
  'Info',
  'History',
];

const setup = (role: Role | undefined, open = true) => {
  mockUseFetchMapById.mockReturnValue({
    isLoading: false,
    error: null,
    data: role ? { id: 9, role } : undefined,
  });
  const anchor = document.createElement('button');
  document.body.appendChild(anchor);
  const onClose = jest.fn();
  renderWithProviders(
    <ActionChooser mapId={9} onClose={onClose} anchor={open ? anchor : undefined} />,
  );
  return onClose;
};

const items = (): string[] => screen.getAllByRole('menuitem').map((item) => item.textContent ?? '');

describe('ActionChooser', () => {
  beforeEach(() => {
    jest.mocked(trackMindmapListAction).mockClear();
  });

  test('the owner gets every action', () => {
    setup('owner');
    expect(items()).toEqual(ALL);
    expect(mockUseFetchMapById).toHaveBeenCalledWith(9);
  });

  test('an editor can not rename, publish or share', () => {
    setup('editor');
    expect(items()).toEqual(ALL.filter((a) => !['Rename', 'Publish', 'Share'].includes(a)));
  });

  test('a viewer can not see the history either', () => {
    setup('viewer');
    expect(items()).toEqual(
      ALL.filter((a) => !['Rename', 'Publish', 'Share', 'History'].includes(a)),
    );
  });

  test.each([
    ['Open', 'open'],
    ['Duplicate', 'duplicate'],
    ['Rename', 'rename'],
    ['Add Label', 'label'],
    ['Delete', 'delete'],
    ['Export', 'export'],
    ['Print', 'print'],
    ['Publish', 'publish'],
    ['Share', 'share'],
    ['Info', 'info'],
    ['History', 'history'],
  ])('choosing "%s" reports the %s action', (label, action) => {
    const onClose = setup('owner');

    fireEvent.click(screen.getByRole('menuitem', { name: label }));

    expect(onClose).toHaveBeenCalledWith(action);
    expect(trackMindmapListAction).toHaveBeenCalledWith(action);
  });

  test('dismissing the menu reports no action and tracks nothing', () => {
    const onClose = setup('owner');

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });

    expect(onClose).toHaveBeenCalledWith(undefined);
    expect(trackMindmapListAction).not.toHaveBeenCalled();
  });

  test('without an anchor the menu is closed', () => {
    setup('owner', false);
    expect(screen.queryByRole('menu')).toBeNull();
  });
});
