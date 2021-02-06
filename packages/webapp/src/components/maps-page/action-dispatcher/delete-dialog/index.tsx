import { Alert, AlertTitle } from "@material-ui/lab";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useMutation, useQueryClient } from "react-query";
import { useSelector } from "react-redux";
import Client from "../../../../client";
import { activeInstance } from '../../../../redux/clientSlice';
import { DialogProps, fetchMapById, handleOnMutationSuccess } from "..";
import BaseDialog from "../base-dialog";


const DeleteDialog = (props: DialogProps) => {
  const intl = useIntl();

  const service: Client = useSelector(activeInstance);
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
        onClose={handleOnClose} onSubmit={handleOnSubmit}
        title={intl.formatMessage({ id: "action.delete-title", defaultMessage: "Delete" })}
        submitButton={intl.formatMessage({ id: "action.delete-title", defaultMessage: "Delete" })} >
        <Alert severity="warning">
          <AlertTitle>Delete '{map?.title}'</AlertTitle>
          <FormattedMessage id="action.delete-description" defaultMessage="Deleted mindmap can not be recovered. Do you want to continue ?." />
        </Alert>
      </BaseDialog>
    </div>
  );
}


export default DeleteDialog;