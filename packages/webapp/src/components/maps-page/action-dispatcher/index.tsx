import React from 'react';
import RenameDialog from './rename-dialog';
import DeleteDialog from './delete-dialog';
import { ActionType } from '../action-chooser';
import { ErrorInfo, MapInfo } from '../../../client';
import Client from '../../../client';
import { useSelector } from "react-redux";
import { QueryClient, useQuery } from 'react-query';
import { activeInstance } from '../../../redux/clientSlice';
import DuplicateDialog from './duplicate-dialog';
import { useHistory } from 'react-router-dom';
import CreateDialog from './create-dialog';
import HistoryDialog from './history-dialog';

export type BasicMapInfo = {
  name: string;
  description: string | undefined;
}

type ActionDialogProps = {
  action?: ActionType,
  mapId: number,
  onClose: () => void
}

const ActionDispatcher = (props: ActionDialogProps) => {
  const history = useHistory();
  const mapId = props.mapId;
  const action = props.action;

  const handleOnClose = (): void => {
    props.onClose();
  }

  switch (action) {
    case 'open':
      window.location.href = `/c/maps/${mapId}/edit`;
      break;
    case 'print':
      window.open(`/c/maps/${mapId}/print`, 'print');
      break;
  }

  return (
    <span>

      {action === 'create' ? <CreateDialog open={true} onClose={handleOnClose} /> : null}
      {action === 'delete' ? <DeleteDialog open={true} onClose={handleOnClose} mapId={mapId} /> : null}
      {action === 'rename' ? <RenameDialog open={true} onClose={handleOnClose} mapId={mapId} /> : null}
      {action === 'duplicate' ? <DuplicateDialog open={true} onClose={handleOnClose} mapId={mapId} /> : null}
      {action === 'history' ? <HistoryDialog open={true} onClose={handleOnClose} mapId={mapId} /> : null}
    </span >
  );
}
type MapLoadResult = {
  isLoading: boolean,
  error: ErrorInfo | null,
  map: MapInfo | null
}

export const fetchMapById = (id: number): MapLoadResult => {

  const service: Client = useSelector(activeInstance);
  const { isLoading, error, data } = useQuery<unknown, ErrorInfo, MapInfo[]>('maps', () => {
    return service.fetchAllMaps();
  });

  const result = data?.find(m => m.id == id);
  const map = result ? result : null;
  return { isLoading: isLoading, error: error, map: map };
}


export const handleOnMutationSuccess = (onClose: () => void, queryClient: QueryClient): void => {
  queryClient.invalidateQueries('maps')
  onClose();
}

export type DialogProps = {
  open: boolean,
  mapId: number,
  onClose: () => void
}

export default ActionDispatcher;


