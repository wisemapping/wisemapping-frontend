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
import { render, screen, fireEvent } from '@testing-library/react';

jest.mock('react-intl', () => {
  const ReactActual = require('react');
  return {
    FormattedMessage: ({ defaultMessage, id }: { defaultMessage?: string; id?: string }) =>
      ReactActual.createElement('span', null, defaultMessage || id),
    useIntl: () => ({
      formatMessage: ({ defaultMessage, id }: { defaultMessage?: string; id?: string }) =>
        defaultMessage || id,
    }),
  };
});

import { MapCard } from '../../../src/components/maps-page/maps-list/map-card';
import { MapInfo } from '../../../src/classes/client';

const map: MapInfo = {
  id: 42,
  starred: false,
  title: 'Q3 product plan',
  labels: [{ id: 7, title: 'Client work', color: '#c67139' }],
  createdBy: 'Ana Ruiz',
  creationTime: '2026-01-01T00:00:00Z',
  lastModificationBy: 'Ana Ruiz',
  lastModificationTime: '2026-01-01T00:00:00Z',
  description: '',
  public: false,
  role: 'owner',
};

describe('MapCard', () => {
  test('renders title, owner, and labels', () => {
    render(
      <MapCard
        map={map}
        getEditUrl={() => '/c/maps/42/edit'}
        onStarToggle={jest.fn()}
        onOpenActions={() => jest.fn()}
        onRemoveLabel={jest.fn()}
      />,
    );
    expect(screen.getByText('Q3 product plan')).toBeDefined();
    expect(screen.getByText('Ana Ruiz')).toBeDefined();
    expect(screen.getByText('Client work')).toBeDefined();
  });

  test('clicking the star icon calls onStarToggle with the map id', () => {
    const onStarToggle = jest.fn();
    render(
      <MapCard
        map={map}
        getEditUrl={() => '/c/maps/42/edit'}
        onStarToggle={onStarToggle}
        onOpenActions={() => jest.fn()}
        onRemoveLabel={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText('Starred'));
    expect(onStarToggle).toHaveBeenCalledWith(expect.anything(), 42);
  });

  test('clicking the more-actions icon invokes onOpenActions for the map id', () => {
    const actionHandler = jest.fn();
    const onOpenActions = jest.fn().mockReturnValue(actionHandler);
    render(
      <MapCard
        map={map}
        getEditUrl={() => '/c/maps/42/edit'}
        onStarToggle={jest.fn()}
        onOpenActions={onOpenActions}
        onRemoveLabel={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText('Settings'));
    expect(onOpenActions).toHaveBeenCalledWith(42);
    expect(actionHandler).toHaveBeenCalled();
  });

  test('clicking a label delete icon calls onRemoveLabel with map and label ids', () => {
    const onRemoveLabel = jest.fn();
    render(
      <MapCard
        map={map}
        getEditUrl={() => '/c/maps/42/edit'}
        onStarToggle={jest.fn()}
        onOpenActions={() => jest.fn()}
        onRemoveLabel={onRemoveLabel}
      />,
    );
    fireEvent.click(screen.getByLabelText('Delete tag'));
    expect(onRemoveLabel).toHaveBeenCalledWith(42, 7);
  });
});
