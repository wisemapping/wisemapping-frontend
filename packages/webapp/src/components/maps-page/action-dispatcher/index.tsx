import React from 'react';
import RenameDialog from './rename';
import DeleteDialog from './delete';
import { ActionType } from '../action-chooser';
import { ErrorInfo, MapInfo, Service } from '../../../services/Service';
import { useSelector } from 'react-redux';
import { QueryClient, useQuery } from 'react-query';
import { activeInstance } from '../../../reducers/serviceSlice';
import DuplicateDialog from './duplicate';
import { useHistory } from 'react-router-dom';
import InfoDialog from './info';


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
      history.push(`/c/maps/${mapId}/edit`);
      break;
    case 'print':
      history.push(`/c/maps/${mapId}/print`);
      break;
  }

  return (
    <span>
      <DeleteDialog open={action === 'delete'} onClose={handleOnClose} mapId={mapId} />
      <RenameDialog open={action === 'rename'} onClose={handleOnClose} mapId={mapId} />
      <DuplicateDialog open={action === 'duplicate'} onClose={handleOnClose} mapId={mapId} />
      <InfoDialog open={action === 'info'} onClose={handleOnClose} mapId={mapId} />
    </span >
  );
}


type MapLoadResult = {
  isLoading: boolean,
  error: ErrorInfo | null,
  map: MapInfo | null
}

export const fetchMapById = (id: number): MapLoadResult => {

  const service: Service = useSelector(activeInstance);
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


