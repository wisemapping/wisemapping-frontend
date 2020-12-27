import { QueryClient, useQuery } from "react-query";
import { useSelector } from "react-redux";
import { ErrorInfo, MapInfo, Service } from "../../services/Service";
import { activeInstance, } from '../../reducers/serviceSlice';

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


