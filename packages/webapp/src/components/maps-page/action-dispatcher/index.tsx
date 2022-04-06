import React from 'react';
import RenameDialog from './rename-dialog';
import DeleteDialog from './delete-dialog';
import { ActionType } from '../action-chooser';
import { QueryClient } from 'react-query';
import DuplicateDialog from './duplicate-dialog';
import CreateDialog from './create-dialog';
import HistoryDialog from './history-dialog';
import ImportDialog from './import-dialog';
import PublishDialog from './publish-dialog';
import InfoDialog from './info-dialog';
import DeleteMultiselectDialog from './delete-multiselect-dialog';
import ExportDialog from './export-dialog';
import ShareDialog from './share-dialog';
import LabelDialog from './label-dialog';

export type BasicMapInfo = {
    name: string;
    description: string | undefined;
};

type ActionDialogProps = {
    action?: ActionType;
    mapsId: number[];
    onClose: (success?: boolean) => void;
    fromEditor: boolean;
};

const ActionDispatcher = ({ mapsId, action, onClose, fromEditor }: ActionDialogProps): React.ReactElement => {
    const handleOnClose = (success?: boolean): void => {
        onClose(success);
    };

    switch (action) {
        case 'open':
            window.location.href = `/c/maps/${mapsId}/edit`;
            break;
        case 'print':
            window.open(`/c/maps/${mapsId}/print`, 'print');
            break;
    }

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
            {action === 'duplicate' && (
                <DuplicateDialog onClose={handleOnClose} mapId={mapsId[0]} />
            )}
            {action === 'history' && <HistoryDialog onClose={handleOnClose} mapId={mapsId[0]} />}
            {action === 'import' && <ImportDialog onClose={handleOnClose} />}
            {action === 'publish' && <PublishDialog onClose={handleOnClose} mapId={mapsId[0]} />}
            {action === 'info' && <InfoDialog onClose={handleOnClose} mapId={mapsId[0]} />}
            {action === 'create' && <CreateDialog onClose={handleOnClose} />}
            {action === 'export' && (
                <ExportDialog onClose={handleOnClose} mapId={mapsId[0]} enableImgExport={fromEditor} />
            )}
            {action === 'share' && <ShareDialog onClose={handleOnClose} mapId={mapsId[0]} />}
            {action === 'label' && <LabelDialog onClose={handleOnClose} mapsId={mapsId} />}
        </span>
    );
};

ActionDispatcher.defaultProps = {
    fromEditor: false,
};

export const handleOnMutationSuccess = (onClose: () => void, queryClient: QueryClient): void => {
    queryClient.invalidateQueries('maps');
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
