import React, { useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { FormattedMessage, useIntl } from 'react-intl';
import { BasicMapInfo, ErrorInfo, Service } from '../../services/Service';
import { FormControl, TextField } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';

type DialogProps = {
  open: boolean,
  mapId: number,
  onClose: (reload: boolean) => void,
  service: Service
}

function DeleteConfirmDialog(props: DialogProps) {

  const handleOnClose = (action: 'accept' | undefined): void => {
    let result = false;
    if (action == 'accept') {
      props.service.deleteMap(props.mapId);
      result = true;
    }
    props.onClose(result);
  };

  return (
    <div>
      <Dialog
        open={props.open}
        onClose={() => handleOnClose(undefined)} >
        <DialogTitle><FormattedMessage id="action.delete-title" defaultMessage="Delete" /></DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Alert severity="warning">
              <AlertTitle>Map to be deleted</AlertTitle>
              <FormattedMessage id="action.delete-description" defaultMessage="Deleted mindmap can not be recovered. Do you want to continue ?." />
            </Alert>
          </DialogContentText>
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

function RenameDialog(props: DialogProps) {
  const defaultModel: BasicMapInfo = { name: '', description: '' };
  const [model, setModel] = React.useState<BasicMapInfo>(defaultModel);
  const [errorInfo, setErroInfo] = React.useState<ErrorInfo>();

  const intl = useIntl();

  useEffect(() => {
    props.service.loadMapInfo(props.mapId)
      .then((info: BasicMapInfo) => {
        setModel(info);
      })
  }, []);

  const handleOnClose = (): void => {
    // Clean Up ...
    setModel(defaultModel);
    setErroInfo(undefined);

    props.onClose(false);
  };

  const handleOnSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    // Stop form submit ...
    event.preventDefault();

    // Fire rest call ...
    const mapId = props.mapId;
    props.service.renameMap(mapId, model).
      then(() => {
        props.onClose(true);
      }).catch((errorInfo: ErrorInfo) => {
        setErroInfo(errorInfo)
      });
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
                variant="filled" required={true}/>
            </FormControl>
            <FormControl margin="normal" required fullWidth>
              <TextField name="description" label={intl.formatMessage({ id: "action.rename-description-placeholder", defaultMessage: "Description" })} value={model.description} onChange={handleOnChange} variant="filled" />
            </FormControl>
          </DialogContent>

          <DialogActions>
            <Button color="primary" variant="outlined" type="submit">
              <FormattedMessage id="action.rename-button" defaultMessage="Rename"/>
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
  action: DialogType | undefined,
  mapId: number,
  service: Service,
  onClose: (reload: boolean) => void
}

const ActionDialog = (props: ActionDialogProps) => {

  const handleOnClose = (reload: boolean): void => {
    props.onClose(reload);
  }

  return (
    <span>
      <DeleteConfirmDialog open={props.action === 'delete'} service={props.service} onClose={handleOnClose} mapId={props.mapId} />
      <RenameDialog open={props.action === 'rename'} service={props.service} onClose={handleOnClose} mapId={props.mapId} />

    </span >
  );
}

export default ActionDialog;
