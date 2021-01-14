import { Alert, AlertTitle } from "@material-ui/lab";
import React from "react";
import { FormattedMessage } from "react-intl";
import { useMutation, useQueryClient } from "react-query";
import { useSelector } from "react-redux";
import { Service } from "../../../../services/Service";
import { activeInstance } from '../../../../reducers/serviceSlice';
import { DialogProps, fetchMapById, handleOnMutationSuccess } from "../DialogCommon";
import BaseDialog from "../action-dialog";


const DeleteDialog = (props: DialogProps) => {
  const service: Service = useSelector(activeInstance);
  const queryClient = useQueryClient();
  const mutation = useMutation((id: number) => service.deleteMap(id),
    {
      onSuccess: () => handleOnMutationSuccess(props.onClose, queryClient)
    }
  );

  const mapId = props.mapId;
  const handleOnClose = (): void => {
    props.onClose();
  };

  const handleOnSubmit = (): void => {
    mutation.mutate(mapId);
  }

  // Fetch map model to be rendered ...
  const { map } = fetchMapById(mapId);
  return (
    <div>
      <BaseDialog
        open={props.open} onClose={handleOnClose} onSubmit={handleOnSubmit}
        title={{ id: "action.delete-title", defaultMessage: "Delete" }} 
        submitButton={{ id: "action.delete-title", defaultMessage: "Delete" }} >

        <Alert severity="warning">
          <AlertTitle>Delete '{map?.name}'</AlertTitle>
          <FormattedMessage id="action.delete-description" defaultMessage="Deleted mindmap can not be recovered. Do you want to continue ?." />
        </Alert>
      </BaseDialog>
    </div>
  );
}


export default DeleteDialog;