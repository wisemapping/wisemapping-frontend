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
import { fireEvent, screen, waitFor } from '@testing-library/react';

import LabelComponent from '../../../../src/components/maps-page/maps-list/label';
import { LabelsCell } from '../../../../src/components/maps-page/maps-list/labels-cell';
import { LabelSelector } from '../../../../src/components/maps-page/maps-list/label-selector';
import LabelDeleteConfirm from '../../../../src/components/maps-page/maps-list/label-delete-confirm';
import {
  MapsPageLoading,
  TableRowSkeleton,
  CardSkeleton,
} from '../../../../src/components/maps-page/maps-list/MapsListSkeleton';
import { Label, MapInfo } from '../../../../src/classes/client';
import { renderWithWrapper } from '../providers';

const research: Label = { id: 7, title: 'Research', color: '#ff0000' };
const travel: Label = { id: 8, title: 'Travel', color: '#00ff00' };

const makeMap = (id: number, labels: Label[]): MapInfo => ({
  id,
  title: `Map ${id}`,
  description: '',
  starred: false,
  labels,
  createdBy: 'ana@wisemapping.com',
  creationTime: '2026-01-01T00:00:00Z',
  lastModificationBy: 'ana@wisemapping.com',
  lastModificationTime: '2026-01-01T00:00:00Z',
  public: false,
  role: 'owner',
});

describe('LabelComponent', () => {
  test('shows the title and no delete button without onDelete', () => {
    renderWithWrapper(<LabelComponent label={research} />);

    expect(screen.getByText('Research')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Delete tag' })).toBeNull();
  });

  test('the delete button reports the label and does not bubble', () => {
    const onDelete = jest.fn();
    const onParentClick = jest.fn();
    renderWithWrapper(
      <div onClick={onParentClick}>
        <LabelComponent label={research} onDelete={onDelete} size="big" />
      </div>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete tag' }));

    expect(onDelete).toHaveBeenCalledWith(research);
    expect(onParentClick).not.toHaveBeenCalled();
  });
});

describe('LabelsCell', () => {
  test('renders one chip per label and deletes the clicked one', () => {
    const onDelete = jest.fn();
    const onParentClick = jest.fn();
    renderWithWrapper(
      <div onClick={onParentClick}>
        <LabelsCell labels={[research, travel]} onDelete={onDelete} />
      </div>,
    );

    expect(screen.getByText('Research')).toBeTruthy();
    expect(screen.getByText('Travel')).toBeTruthy();

    fireEvent.click(screen.getAllByRole('button', { name: 'Delete tag' })[1]);
    expect(onDelete).toHaveBeenCalledWith(travel);
    expect(onParentClick).not.toHaveBeenCalled();
  });

  test('renders nothing for a map without labels', () => {
    const { container } = renderWithWrapper(<LabelsCell labels={[]} onDelete={jest.fn()} />);
    expect(container.textContent).toBe('');
  });
});

describe('LabelSelector', () => {
  const buildClient = () => ({ fetchLabels: jest.fn().mockResolvedValue([research, travel]) });

  test('lists the account labels, checking those every map already has', async () => {
    const client = buildClient();
    renderWithWrapper(
      <LabelSelector
        maps={[makeMap(1, [research, travel]), makeMap(2, [research])]}
        onChange={jest.fn()}
      />,
      { client },
    );

    const researchBox = (await screen.findByRole('checkbox', {
      name: 'Research',
    })) as HTMLInputElement;
    const travelBox = screen.getByRole('checkbox', { name: 'Travel' }) as HTMLInputElement;

    expect(client.fetchLabels).toHaveBeenCalled();
    expect(researchBox.checked).toBe(true);
    // Only one of the two maps has Travel.
    expect(travelBox.checked).toBe(false);
  });

  test('toggling a label reports it with the new checked state', async () => {
    const onChange = jest.fn();
    renderWithWrapper(<LabelSelector maps={[makeMap(1, [research])]} onChange={onChange} />, {
      client: buildClient(),
    });

    fireEvent.click(await screen.findByRole('checkbox', { name: 'Travel' }));
    expect(onChange).toHaveBeenCalledWith(travel, true);

    fireEvent.click(screen.getByRole('checkbox', { name: 'Research' }));
    expect(onChange).toHaveBeenCalledWith(research, false);
  });

  test('adding a new label reports it as checked', async () => {
    const onChange = jest.fn();
    renderWithWrapper(<LabelSelector maps={[makeMap(1, [])]} onChange={onChange} />, {
      client: buildClient(),
    });
    await screen.findByRole('checkbox', { name: 'Travel' });

    fireEvent.change(screen.getByRole('textbox', { name: 'Label title' }), {
      target: { value: 'Ideas' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add label' }));

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ title: 'Ideas' }), true),
    );
  });

  test('adding a new label carries the colour the user picked', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const onChange = jest.fn();
    renderWithWrapper(<LabelSelector maps={[makeMap(1, [])]} onChange={onChange} />, {
      client: buildClient(),
    });
    await screen.findByRole('checkbox', { name: 'Travel' });

    fireEvent.change(screen.getByRole('textbox', { name: 'Label title' }), {
      target: { value: 'Ideas' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add label' }));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Ideas', color: '#00b327' }),
      true,
    );
  });
});

describe('LabelDeleteConfirm', () => {
  test('names the label and wires confirm and cancel', () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();
    renderWithWrapper(
      <LabelDeleteConfirm label={research} onClose={onClose} onConfirm={onConfirm} />,
    );

    expect(screen.getAllByText('Confirm label deletion').length).toBeGreaterThan(0);
    expect(screen.getByText(/Research/)).toBeTruthy();
    expect(
      screen.getByText(/will be deleted, including its associations to all existing maps/),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });
});

describe('maps list loading skeletons', () => {
  const rowCount = (container: HTMLElement) => container.querySelectorAll('tbody tr').length;

  test('the row and card placeholders render as loading skeletons', () => {
    const { container } = renderWithWrapper(
      <>
        <table>
          <tbody>
            <TableRowSkeleton />
          </tbody>
        </table>
        <CardSkeleton />
      </>,
    );
    expect(container.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(5);
  });

  test('the page loading placeholder lays out the app bar, drawer and list', () => {
    const { container } = renderWithWrapper(<MapsPageLoading />);

    expect(container.querySelector('header')).toBeTruthy();
    // The list placeholder caps itself at five rows.
    expect(rowCount(container)).toBe(5);
    expect(container.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(10);
  });
});
