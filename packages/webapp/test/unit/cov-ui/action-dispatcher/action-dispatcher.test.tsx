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
import { QueryClient } from '@tanstack/react-query';

// Each dialog is replaced by a marker naming it and the props it was given: this suite is about
// which dialog the dispatcher opens for which action.
type MarkerProps = {
  mapId?: number;
  mapsId?: number[];
  enableImgExport?: boolean;
  onClose: (success?: boolean) => void;
};
const mockMarker = (name: string) =>
  function Marker({ mapId, mapsId, enableImgExport, onClose }: MarkerProps): React.ReactElement {
    return (
      <button type="button" onClick={() => onClose(true)}>
        {`${name} ${JSON.stringify({ mapId, mapsId, enableImgExport })}`}
      </button>
    );
  };
jest.mock('../../../../src/components/maps-page/action-dispatcher/create-dialog', () =>
  mockMarker('create'),
);
jest.mock('../../../../src/components/maps-page/action-dispatcher/delete-dialog', () =>
  mockMarker('delete'),
);
jest.mock('../../../../src/components/maps-page/action-dispatcher/delete-multiselect-dialog', () =>
  mockMarker('delete-multi'),
);
jest.mock('../../../../src/components/maps-page/action-dispatcher/rename-dialog', () =>
  mockMarker('rename'),
);
jest.mock('../../../../src/components/maps-page/action-dispatcher/duplicate-dialog', () =>
  mockMarker('duplicate'),
);
jest.mock('../../../../src/components/maps-page/action-dispatcher/history-dialog', () =>
  mockMarker('history'),
);
jest.mock('../../../../src/components/maps-page/action-dispatcher/import-dialog', () =>
  mockMarker('import'),
);
jest.mock('../../../../src/components/maps-page/action-dispatcher/publish-dialog', () =>
  mockMarker('publish'),
);
jest.mock('../../../../src/components/maps-page/action-dispatcher/info-dialog', () =>
  mockMarker('info'),
);
jest.mock('../../../../src/components/maps-page/action-dispatcher/export-dialog', () =>
  mockMarker('export'),
);
jest.mock('../../../../src/components/maps-page/action-dispatcher/share-dialog', () =>
  mockMarker('share'),
);
jest.mock('../../../../src/components/maps-page/action-dispatcher/label-dialog', () =>
  mockMarker('label'),
);
jest.mock('../../../../src/utils/analytics', () => ({ trackMindmapListAction: jest.fn() }));

import ActionDispatcher, {
  handleOnMutationSuccess,
} from '../../../../src/components/maps-page/action-dispatcher';
import { ActionType } from '../../../../src/components/maps-page/action-chooser';
import { trackMindmapListAction } from '../../../../src/utils/analytics';
import { renderWithProviders } from '../../helpers/render';

const dispatch = (
  action: ActionType,
  mapsId: number[] = [5],
  extra: { fromEditor?: boolean; pageMode?: 'try' | 'edit' } = {},
) => {
  const onClose = jest.fn();
  const view = renderWithProviders(
    <ActionDispatcher
      action={action}
      mapsId={mapsId}
      onClose={onClose}
      fromEditor={extra.fromEditor ?? false}
      pageMode={extra.pageMode}
    />,
  );
  return { onClose, view };
};

describe('ActionDispatcher', () => {
  beforeEach(() => {
    jest.mocked(trackMindmapListAction).mockClear();
  });

  test.each([
    ['create', [5], 'create {}'],
    ['rename', [5], 'rename {"mapId":5}'],
    ['duplicate', [5], 'duplicate {"mapId":5}'],
    ['history', [5], 'history {"mapId":5}'],
    ['import', [5], 'import {}'],
    ['publish', [5], 'publish {"mapId":5}'],
    ['info', [5], 'info {"mapId":5}'],
    ['share', [5], 'share {"mapId":5}'],
    ['label', [5, 6], 'label {"mapsId":[5,6]}'],
    ['delete', [5], 'delete {"mapId":5}'],
    ['delete', [5, 6], 'delete-multi {"mapsId":[5,6]}'],
  ] as [ActionType, number[], string][])('"%s" on %j opens %s', (action, mapsId, marker) => {
    dispatch(action, mapsId);

    expect(screen.getByRole('button').textContent).toBe(marker);
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(trackMindmapListAction).toHaveBeenCalledWith(action, 'map_metadata');
  });

  test('export allows images only from the editor', () => {
    dispatch('export', [5]);
    expect(screen.getByRole('button').textContent).toBe(
      'export {"mapId":5,"enableImgExport":false}',
    );
  });

  test('export from the editor enables image formats', () => {
    dispatch('export', [5], { fromEditor: true });
    expect(screen.getByRole('button').textContent).toBe(
      'export {"mapId":5,"enableImgExport":true}',
    );
  });

  test("a dialog's result is passed on to onClose", () => {
    const { onClose } = dispatch('rename', [5]);
    fireEvent.click(screen.getByRole('button'));
    expect(onClose).toHaveBeenCalledWith(true);
  });

  test('no action renders nothing and tracks nothing', () => {
    const { onClose, view } = dispatch(undefined);
    expect(view.container.textContent).toBe('');
    expect(onClose).not.toHaveBeenCalled();
    expect(trackMindmapListAction).not.toHaveBeenCalled();
  });

  test('open goes to the editor at once, without a dialog', () => {
    const { onClose, view } = dispatch('open', [5]);
    expect(onClose).toHaveBeenCalledWith(true);
    expect(view.container.textContent).toBe('');
  });

  test('print opens the print view of the map in its own window', () => {
    const open = jest.spyOn(window, 'open').mockImplementation(() => null);
    const { onClose } = dispatch('print', [5]);

    expect(open).toHaveBeenCalledWith('/c/maps/5/print', 'print');
    expect(onClose).toHaveBeenCalledWith(true);
  });

  test('back in try mode goes back in the browser history', () => {
    const back = jest.spyOn(window.history, 'back').mockImplementation(() => undefined);
    const { onClose } = dispatch('back', [5], { pageMode: 'try' });

    expect(back).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith(true);
  });

  test('back from the editor returns to the map list, not the browser history', () => {
    const back = jest.spyOn(window.history, 'back').mockImplementation(() => undefined);
    const { onClose } = dispatch('back', [5], { pageMode: 'edit' });

    expect(back).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledWith(true);
  });

  test('theme is handled by the editor: the dispatcher only closes', () => {
    const { onClose, view } = dispatch('theme', [5]);
    expect(onClose).toHaveBeenCalledWith(true);
    expect(view.container.textContent).toBe('');
  });
});

describe('handleOnMutationSuccess', () => {
  test('refreshes the map list and closes', () => {
    const queryClient = new QueryClient();
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    const onClose = jest.fn();

    handleOnMutationSuccess(onClose, queryClient);

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['maps'] });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
