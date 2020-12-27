import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";
import React from "react";
import { FormattedMessage } from "react-intl";
import { useMutation, useQueryClient } from "react-query";
import { useSelector } from "react-redux";
import { Service } from "../../services/Service";
import { activeInstance } from '../../reducers/serviceSlice';
import { DialogProps, fetchMapById, handleOnMutationSuccess } from "./DialogCommon";


const DeleteDialog = (props: DialogProps) => {
    const service: Service = useSelector(activeInstance);
    const queryClient = useQueryClient();
    const mutation = useMutation((id: number) => service.deleteMap(id),
      {
        onSuccess: () => handleOnMutationSuccess(props.onClose, queryClient)
      }
    );
  
    const mapId = props.mapId;
    const handleOnClose = (action: 'accept' | undefined): void => {
      if (action == 'accept') {
        mutation.mutate(mapId);
      } else {
        props.onClose();
      }
    };
  
    // Fetch map model to be rendered ...
    const { map } = fetchMapById(mapId);
    return (
      <div>
        <Dialog
          open={props.open}
          onClose={() => handleOnClose(undefined)} >
          <DialogTitle><FormattedMessage id="action.delete-title" defaultMessage="Delete" /></DialogTitle>
          <DialogContent>
            <Alert severity="warning">
              <AlertTitle>Delete '{map?.name}'</AlertTitle>
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
  
  
  export default DeleteDialog;