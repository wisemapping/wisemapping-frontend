import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
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
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";


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
        title={intl.formatMessage({ id: "share.delete-title", defaultMessage: "Share with people" })}
        description={intl.formatMessage({ id: "share.delete-description", defaultMessage: "Collaboration " })}
        submitButton={intl.formatMessage({ id: "share.delete-title", defaultMessage: "Share" })}
        maxWidth="md">

        <div style={{ padding: '10px 10px', background: '#f9f9f9' }}>
          <TextField id="email" style={{ width: '300px' }} size="small" type="text" variant="outlined" placeholder="Add collaboratos's emails seperated by commas" label="Email" />
          <Select
            value='edit'
            variant="outlined"
            style={{ margin: '0px 10px' }}
          >
            <MenuItem value='edit'>Can Edit</MenuItem>
            <MenuItem value='view'>Can View</MenuItem>
          </Select>

          <FormControlLabel
            value="start"
            control={<Checkbox color="primary" />}
            label={<FormattedMessage id="share.add-message" defaultMessage="Add message" />}
            labelPlacement="end"
            />
          <Button 
          color="primary" 
          variant="contained" disableElevation={true}><FormattedMessage id="share.add-button" defaultMessage="Add " /></Button>
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
    </div >
  );
}


export default ShareDialog;