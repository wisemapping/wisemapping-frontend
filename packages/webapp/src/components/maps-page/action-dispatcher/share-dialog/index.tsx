import React from "react";
import { useIntl } from "react-intl";
import { useMutation, useQueryClient } from "react-query";
import { useSelector } from "react-redux";
import Client from "../../../../classes/client";
import { activeInstance } from '../../../../redux/clientSlice';
import { SimpleDialogProps, handleOnMutationSuccess } from "..";
import BaseDialog from "../base-dialog";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import IconButton from "@material-ui/core/IconButton";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import DeleteIcon from '@material-ui/icons/Delete';
import Paper from "@material-ui/core/Paper";


const ShareDialog = ({ mapId, onClose }: SimpleDialogProps): React.ReactElement => {
  const intl = useIntl();
  const client: Client = useSelector(activeInstance);
  const queryClient = useQueryClient();

  const mutation = useMutation((id: number) => client.deleteMap(id),
    {
      onSuccess: () => handleOnMutationSuccess(onClose, queryClient)
    }
  );

  const handleOnClose = (): void => {
    onClose();
  };

  const handleOnSubmit = (): void => {
    mutation.mutate(mapId);
  }

  // Fetch map model to be rendered ...
  return (
    <div>
      <BaseDialog
        onClose={handleOnClose} onSubmit={handleOnSubmit}
        title={intl.formatMessage({ id: "share.delete-title", defaultMessage: "Share with collaborators" })}
        description={intl.formatMessage({ id: "share.delete-description", defaultMessage: "Collaboration " })}
        submitButton={intl.formatMessage({ id: "share.delete-title", defaultMessage: "Share" })} >


        <div style={{ margin: "10px 0px", padding:"30px 0px"   ,background:"gray" }}>
          <input type="text" placeholder="Enter collaboratior emails separated by comas" />
        </div>

        <Paper elevation={1} style={{ maxHeight: 200, overflowY: 'scroll' }} variant="outlined">
          <List>
            {[.4, 5, 7, 7, 8, 9, 100, 1, 2, 3].map((value) => {
              const labelId = `checkbox-list-label-${value}`;

              return (
                <ListItem key={value} role={undefined} dense button>
                  <ListItemText id={labelId} primary={`Line item ${value + 1}`} />
                  <ListItemSecondaryAction>
                    <IconButton edge="end">
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        </Paper>

      </BaseDialog>
    </div>
  );
}


export default ShareDialog;