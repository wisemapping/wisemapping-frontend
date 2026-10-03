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
import { render as renderBare, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createAppTheme } from '../../../src/theme';

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

import StyleListItem from '../../../src/components/maps-page/drawer-nav/filter-list-item';
import type { Filter } from '../../../src/components/maps-page/index';

const researchLabel = { id: 7, title: 'Research', color: '#fff' };

// These components style themselves through `withEmotionStyles((theme) => ...)`,
// which Emotion resolves against the theme in context -- so they have to be
// mounted under a ThemeProvider. Wrapping via RTL's `wrapper` option keeps the
// provider in place across `rerender` too.
const wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement => (
  <ThemeProvider theme={createAppTheme('light')}>{children}</ThemeProvider>
);

const render = (ui: React.ReactElement) => renderBare(ui, { wrapper });

describe('StyleListItem', () => {
  test('renders the supplied label and icon', () => {
    render(
      <StyleListItem
        icon={<span>all-icon</span>}
        label="All"
        filter={{ type: 'all' }}
        active={{ type: 'all' }}
        onClick={jest.fn()}
      />,
    );
    expect(screen.getByText('All')).toBeDefined();
    expect(screen.getByText('all-icon')).toBeDefined();
  });

  test('marks the item selected when the active filter matches its own type', () => {
    const { container } = render(
      <StyleListItem
        icon={<span>owned-icon</span>}
        label="My Maps"
        filter={{ type: 'owned' }}
        active={{ type: 'owned' }}
        onClick={jest.fn()}
      />,
    );
    expect(container.querySelector('.Mui-selected')).not.toBeNull();
  });

  test('does not mark the item selected when the active filter is a different type', () => {
    const { container } = render(
      <StyleListItem
        icon={<span>owned-icon</span>}
        label="My Maps"
        filter={{ type: 'owned' }}
        active={{ type: 'all' }}
        onClick={jest.fn()}
      />,
    );
    expect(container.querySelector('.Mui-selected')).toBeNull();
  });

  test('distinguishes two label filters by their label identity', () => {
    const other = { id: 9, title: 'Other', color: '#000' };
    const { container } = render(
      <StyleListItem
        icon={<span>label-icon</span>}
        label="Research"
        filter={{ type: 'label', label: researchLabel }}
        active={{ type: 'label', label: other }}
        onClick={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    expect(container.querySelector('.Mui-selected')).toBeNull();
  });

  test('clicking the item calls onClick with its own filter', () => {
    const onClick = jest.fn();
    const filter: Filter = { type: 'starred' };
    render(
      <StyleListItem
        icon={<span>starred-icon</span>}
        label="Starred"
        filter={filter}
        active={{ type: 'all' }}
        onClick={onClick}
      />,
    );
    fireEvent.click(screen.getByText('Starred'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(filter);
  });

  test('renders a delete button only for label filters', () => {
    const { rerender } = render(
      <StyleListItem
        icon={<span>all-icon</span>}
        label="All"
        filter={{ type: 'all' }}
        active={{ type: 'all' }}
        onClick={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull();

    rerender(
      <StyleListItem
        icon={<span>label-icon</span>}
        label="Research"
        filter={{ type: 'label', label: researchLabel }}
        active={{ type: 'all' }}
        onClick={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDefined();
  });

  test('clicking delete reports the label id and does not also select the filter', () => {
    const onClick = jest.fn();
    const onDelete = jest.fn();
    render(
      <StyleListItem
        icon={<span>label-icon</span>}
        label="Research"
        filter={{ type: 'label', label: researchLabel }}
        active={{ type: 'all' }}
        onClick={onClick}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledWith(7);
    expect(onClick).not.toHaveBeenCalled();
  });
});
