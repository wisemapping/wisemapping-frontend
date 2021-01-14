import React from 'react';
import RenameDialog from './rename';
import DeleteDialog from './delete';
import { ActionType } from '../action-chooser';


export type BasicMapInfo = {
  name: string;
  description: string | undefined;
}

type ActionDialogProps = {
  action?: ActionType,
  mapId: number,
  onClose: () => void
}

const ActionDialogDispatcher = (props: ActionDialogProps) => {
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

export default ActionDialogDispatcher;
