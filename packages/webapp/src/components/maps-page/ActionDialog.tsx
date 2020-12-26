import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { FormattedMessage, useIntl } from 'react-intl';
import { ErrorInfo, MapInfo, Service } from '../../services/Service';
import { FormControl, TextField } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import { useSelector } from 'react-redux';
import {
  activeInstance,
} from '../../reducers/serviceSlice'
import { useMutation, useQuery, useQueryClient } from 'react-query';


type DialogProps = {
  open: boolean,
  mapId: number,
  onClose: () => void
}

export type BasicMapInfo = {
  name: string;
  description: string | undefined;
}

function DeleteDialog(props: DialogProps) {
  const service: Service = useSelector(activeInstance);
  const queryClient = useQueryClient();
  const mapId = props.mapId;

  const mutation = useMutation((id: number) => service.deleteMap(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries()
        props.onClose();
      }
    }
  );

  const { isLoading, error, data } = useQuery<unknown, ErrorInfo, MapInfo[]>('maps', () => {
    return service.fetchAllMaps();
  });

  let mapInfo: MapInfo | undefined = undefined;
  if (data) {
    mapInfo = data.find((m) => m.id == mapId);
  }

  const handleOnClose = (action: 'accept' | undefined): void => {
    if (action == 'accept' && mapInfo) {
      mutation.mutate(mapId);
    }
  };

  return (
    <div>
      <Dialog
        open={props.open}
        onClose={() => handleOnClose(undefined)} >
        <DialogTitle><FormattedMessage id="action.delete-title" defaultMessage="Delete" /></DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            <AlertTitle>Delete '{mapInfo?.name}'</AlertTitle>
            <FormattedMessage id="action.delete-description" defaultMessage="Deleted mindmap can not be recovered. Do you want to continue ?." />
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleOnClose('accept')} variant="outlined" color="primary">
            <FormattedMessage id="action.delete-button" defaultMessage="Delete" />
          </Button>
          <Button onClick={() => handleOnClose(undefined)} variant="outlined" color="secondary" autoFocus>
            <FormattedMessage id="action.cancel-button" defaultMessage="Cancel" />
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
export type RenameModel = {
  id: number;
  name: string;
  description?: string;
}

function RenameDialog(props: DialogProps) {

  const defaultModel: RenameModel = { name: '', description: '', id: -1 };
  const [model, setModel] = React.useState<RenameModel>(defaultModel);
  const [errorInfo, setErroInfo] = React.useState<ErrorInfo>();
  const intl = useIntl();

  // useEffect(() => {
  //   const mapId: number = props.mapId;
  //   if (mapId != -1) {
  //     const mapInfo: MapInfo | undefined = useSelector(activeInstance)
  //       .find(m => m.id == props.mapId);

  //     if (!mapInfo) {
  //       throw "Please, reflesh the page.";
  //     }

  //     setModel({ ...mapInfo });
  //   }
  // }, []);

  const handleOnClose = (): void => {
    // Clean Up ...
    setModel(defaultModel);
    setErroInfo(undefined);

    props.onClose();
  };

  const handleOnSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    // Stop form submit ...
    event.preventDefault();

    // Fire rename ...
    const mapId: number = props.mapId;
    try {
      //      dispatch(rename({ id: mapId, name: model.name, description: model.description }))
      handleOnClose();

    } catch (errorInfo) {
      setErroInfo(errorInfo)
    }
  };

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    event.preventDefault();

    // Update value ...
    const name = event.target.name;
    const value = event.target.value;
    setModel({ ...model, [name as keyof BasicMapInfo]: value });
  }

  return (
    <div>
      <Dialog
        open={props.open}
        onClose={() => handleOnClose()} >
        <form autoComplete="off" onSubmit={handleOnSubmit}>
          <DialogTitle>
            <FormattedMessage id="action.rename-title" defaultMessage="Rename" />
          </DialogTitle>

          <DialogContent>
            <DialogContentText>
              <FormattedMessage id="action.rename-description" defaultMessage="Please, update the name and description for your mindmap." />
            </DialogContentText>

            {Boolean(errorInfo?.msg) ? <Alert severity="error" variant="filled" hidden={!Boolean(errorInfo?.msg)}>{errorInfo?.msg}</Alert> : null}
            <FormControl margin="normal" required fullWidth>
              <TextField name="name" label={intl.formatMessage({ id: "action.rename-name-placeholder", defaultMessage: "Name" })}
                value={model.name} onChange={handleOnChange}
                error={Boolean(errorInfo?.fields?.get('name'))} helperText={errorInfo?.fields?.get('name')}
                variant="filled" required={true} />
            </FormControl>
            <FormControl margin="normal" required fullWidth>
              <TextField name="description" label={intl.formatMessage({ id: "action.rename-description-placeholder", defaultMessage: "Description" })} value={model.description} onChange={handleOnChange} variant="filled" />
            </FormControl>
          </DialogContent>

          <DialogActions>
            <Button color="primary" variant="outlined" type="submit">
              <FormattedMessage id="action.rename-button" defaultMessage="Rename" />
            </Button>

            <Button color="secondary" variant="outlined" autoFocus onClick={handleOnClose}>
              <FormattedMessage id="action.cancel-button" defaultMessage="Cancel" />
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
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
