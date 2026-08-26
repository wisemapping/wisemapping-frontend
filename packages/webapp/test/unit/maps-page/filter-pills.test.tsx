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

import { FilterPills, FilterPillButton } from '../../../src/components/maps-page/filter-pills';

const buttons: FilterPillButton[] = [
  { filter: { type: 'all' }, label: 'All', icon: <span>all-icon</span> },
  { filter: { type: 'owned' }, label: 'My Maps', icon: <span>owned-icon</span> },
  {
    filter: { type: 'label', label: { id: 7, title: 'Research', color: '#fff' } },
    label: 'Research',
    icon: <span>label-icon</span>,
  },
];

describe('FilterPills', () => {
  test('renders one pill per filter button', () => {
    render(<FilterPills buttons={buttons} active={{ type: 'all' }} onSelect={jest.fn()} />);
    expect(screen.getByText('All')).toBeDefined();
    expect(screen.getByText('My Maps')).toBeDefined();
    expect(screen.getByText('Research')).toBeDefined();
  });

  test('marks the active filter pill as selected', () => {
    render(<FilterPills buttons={buttons} active={{ type: 'owned' }} onSelect={jest.fn()} />);
    expect(screen.getByTestId('filter-pill-owned').getAttribute('aria-selected')).toBe('true');
    expect(screen.getByTestId('filter-pill-all').getAttribute('aria-selected')).toBe('false');
  });

  test('clicking a pill calls onSelect with its filter', () => {
    const onSelect = jest.fn();
    render(<FilterPills buttons={buttons} active={{ type: 'all' }} onSelect={onSelect} />);
    fireEvent.click(screen.getByTestId('filter-pill-owned'));
    expect(onSelect).toHaveBeenCalledWith({ type: 'owned' });
  });

  test('clicking a label pill delete icon calls onDeleteLabel and not onSelect', () => {
    const onSelect = jest.fn();
    const onDeleteLabel = jest.fn();
    render(
      <FilterPills
        buttons={buttons}
        active={{ type: 'all' }}
        onSelect={onSelect}
        onDeleteLabel={onDeleteLabel}
      />,
    );
    fireEvent.click(screen.getByLabelText('Delete'));
    expect(onDeleteLabel).toHaveBeenCalledWith(7);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
