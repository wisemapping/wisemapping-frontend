import React from 'react';
import RenameDialog from './RenameDialog';
import DeleteDialog from './DeleteDialog';


export type BasicMapInfo = {
  name: string;
  description: string | undefined;
}

export type DialogType = 'share' | 'delete' | 'info' | 'duplicate' | 'export' | 'rename' | 'publish';

type ActionDialogProps = {
  action?: DialogType,
  mapId: number,
  onClose: () => void
}

const ActionDialog = (props: ActionDialogProps) => {
  const handleOnClose = (): void => {
    props.onClose();
  }

  const mapId = props.mapId;
  const action = props.action;

  return (
    <span>
      <DeleteDialog open={action === 'delete'} onClose={handleOnClose} mapId={mapId} />
      <RenameDialog open={action === 'rename'} onClose={handleOnClose} mapId={mapId} />
    </span >
  );
}

export default ActionDialog;
