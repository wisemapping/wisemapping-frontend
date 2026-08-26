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

import AppConfig from '../../../classes/app-config';
import React, { useContext, useEffect } from 'react';
import RenameDialog from './rename-dialog';
import DeleteDialog from './delete-dialog';
import { ActionType } from '../action-chooser';
import { PageModeType } from '../../editor-page/loader';
import { QueryClient } from '@tanstack/react-query';
import DuplicateDialog from './duplicate-dialog';
import SaveAsDialog from './save-as-dialog';
import CreateDialog from './create-dialog';
import HistoryDialog from './history-dialog';
import ImportDialog from './import-dialog';
import InfoDialog from './info-dialog';
import DeleteMultiselectDialog from './delete-multiselect-dialog';
import ExportDialog from './export-dialog';
import ShareSheet from './share-sheet';
import LabelDialog from './label-dialog';
import { ClientContext } from '../../../classes/provider/client-context';
import { trackMindmapListAction } from '../../../utils/analytics';

export type BasicMapInfo = {
  name: string;
  description: string | undefined;
};

type ActionDialogProps = {
  action?: ActionType;
  mapsId: number[];
  onClose: (success?: boolean) => void;
  fromEditor: boolean;
  pageMode?: PageModeType;
};

const ActionDispatcher = ({
  mapsId,
  action,
  onClose,
  fromEditor,
  pageMode,
}: ActionDialogProps): React.ReactElement => {
  const client = useContext(ClientContext);
  useEffect(() => {
    if (action) {
      trackMindmapListAction(action, 'map_metadata');

      // Handle immediate actions
      switch (action) {
        case 'open':
          window.location.href = `/c/maps/${mapsId}/edit`;
          onClose(true);
          break;
        case 'back':
          if (pageMode === 'try') {
            window.history.back();
          } else {
            window.location.href = '/c/maps';
          }
          onClose(true);
          break;
        case 'print':
          window.open(`/c/maps/${mapsId}/print`, 'print');
          onClose(true);
          break;
        case 'theme':
          // Theme is handled within the editor, just close the dialog
          onClose(true);
          break;
        case 'open-gdrive': {
          const authService = AppConfig.getGoogleAuthService();
          const pickerService = AppConfig.getGooglePickerService();
          authService
            .requestToken()
            .then((token) => {
              pickerService.showPicker({
                token,
                title: 'Open Mindmap from Google Drive',
                onPicked: async (file) => {
                  const title = file.name
                    ? file.name.replace(/\.(wxml|xml)$/i, '')
                    : 'Google Drive Mindmap';
                  try {
                    await client.createMap({
                      title,
                      sourceType: 'gdrive',
                      sourceId: file.id,
                    });
                  } catch (e) {
                    console.warn('Failed to link Google Drive map in database', e);
                  }
                  window.location.href = `/c/maps/gdrive/${file.id}/edit`;
                  onClose(true);
                },
                onCancel: () => {
                  onClose(false);
                },
              });
            })
            .catch((err) => {
              console.error('Failed to authenticate or open Google Drive picker', err);
              onClose(false);
            });
          break;
        }
      }
    }
  }, [action, mapsId, onClose]);

  const handleOnClose = (success?: boolean): void => {
    onClose(success);
  };

  return (
    <span>
      {action === 'create' && <CreateDialog onClose={handleOnClose} />}
      {action === 'delete' && mapsId.length == 1 && (
        <DeleteDialog onClose={handleOnClose} mapId={mapsId[0]} />
      )}
      {action === 'delete' && mapsId.length > 1 && (
        <DeleteMultiselectDialog onClose={handleOnClose} mapsId={mapsId} />
      )}
      {action === 'rename' && <RenameDialog onClose={handleOnClose} mapId={mapsId[0]} />}
      {action === 'save-as' && <SaveAsDialog onClose={handleOnClose} mapId={mapsId[0]} />}
      {action === 'duplicate' && <DuplicateDialog onClose={handleOnClose} mapId={mapsId[0]} />}
      {action === 'history' && <HistoryDialog onClose={handleOnClose} mapId={mapsId[0]} />}
      {action === 'import' && <ImportDialog onClose={handleOnClose} />}
      {action === 'info' && <InfoDialog onClose={handleOnClose} mapId={mapsId[0]} />}
      {action === 'export' && (
        <ExportDialog onClose={handleOnClose} mapId={mapsId[0]} enableImgExport={fromEditor} />
      )}
      {(action === 'share' || action === 'publish') && (
        <ShareSheet onClose={handleOnClose} mapId={mapsId[0]} />
      )}
      {action === 'label' && <LabelDialog onClose={handleOnClose} mapsId={mapsId} />}
    </span>
  );
};

ActionDispatcher.defaultProps = {
  fromEditor: false,
};

export const handleOnMutationSuccess = (onClose: () => void, queryClient: QueryClient): void => {
  queryClient.invalidateQueries({ queryKey: ['maps'] });
  onClose();
};

export type SimpleDialogProps = {
  mapId: number;
  onClose: (success?: boolean) => void;
};

export type MultiDialogProps = {
  mapsId: number[];
  onClose: (success?: boolean) => void;
};

export default ActionDispatcher;
