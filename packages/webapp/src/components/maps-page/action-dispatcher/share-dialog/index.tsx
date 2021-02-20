import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useSelector } from "react-redux";
import Client, { ErrorInfo, Permission } from "../../../../classes/client";
import { activeInstance } from '../../../../redux/clientSlice';
import { SimpleDialogProps } from "..";
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
import Typography from "@material-ui/core/Typography";
import { useStyles } from "./style";
import RoleIcon from "../../role-icon";


type ShareModel = {
  emails: string,
  role: 'editor' | 'viewer',
  message: string
}

const defaultModel: ShareModel = { emails: '', role: 'editor', message: '' };
const ShareDialog = ({ mapId, onClose }: SimpleDialogProps): React.ReactElement => {
  const intl = useIntl();
  const client: Client = useSelector(activeInstance);
  const queryClient = useQueryClient();
  const classes = useStyles();
  const [showMessage, setShowMessage] = React.useState<boolean>(false);
  const [model, setModel] = React.useState<ShareModel>(defaultModel);
  const [error, setError] = React.useState<ErrorInfo>();

  const mutation = useMutation(
    (model: ShareModel) => {
      const emails = model.emails.split("'");
      const permissions = emails.map((email) => { return { email: email, role: model.role } });
      return client.addMapPermissions(mapId, model.message, permissions);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(`perm-${mapId}`);
        setModel(defaultModel);
      },
      onError: (error: ErrorInfo) => {
        setError(error);
      }
    }
  );

  const handleOnClose = (): void => {
    onClose();
  };

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    event.preventDefault();

    const name = event.target.name;
    const value = event.target.value;
    setModel({ ...model, [name as keyof ShareModel]: value });
  }

  const handleOnClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    event.stopPropagation();
    mutation.mutate(model);
  };

  const { isLoading, data: permissions = [] } = useQuery<unknown, ErrorInfo, Permission[]>(`perm-${mapId}`, () => {
    return client.fetchMapPermissions(mapId);
  });

  return (
    <div>
      <BaseDialog
        onClose={handleOnClose}
        title={intl.formatMessage({ id: "share.delete-title", defaultMessage: "Share with people" })}
        description={intl.formatMessage({ id: "share.delete-description", defaultMessage: "Invite people to collaborate with you on the creation of your midnmap. They will be notified by email. " })}
        PaperProps={{ classes: { root: classes.paper } }}
        error={error}
      >

        <div className={classes.actionContainer}>
          <TextField
            id="emails"
            name="emails"
            required={true}
            style={{ width: '300px' }}
            size="small"
            type="email"
            variant="outlined"
            placeholder="Add collaboration email"
            label="Emails"
            onChange={handleOnChange}
            value={model.emails}
          />

          <Select
            variant="outlined"
            onChange={handleOnChange}
            value={model.role}
            name="role"
            style={{ margin: '0px 10px' }}
          >
            <MenuItem value='editor'><FormattedMessage id="share.can-edit" defaultMessage="Can edit" /></MenuItem>
            <MenuItem value='viewer'><FormattedMessage id="share.can-view" defaultMessage="Can view" /></MenuItem>
          </Select>

          <FormControlLabel
            value="start"
            onChange={(event, value) => { setShowMessage(value) }}
            style={{ fontSize: "5px" }}
            control={<Checkbox color="primary" />}
            label={<Typography variant="subtitle2"><FormattedMessage id="share.add-message" defaultMessage="Add message" /></Typography>}
            labelPlacement="end"
          />

          <Button
            color="primary"
            type="button"
            variant="contained"
            disableElevation={true}
            onClick={handleOnClick}>
            <FormattedMessage id="share.add-button" defaultMessage="Add " />
          </Button>

          {showMessage &&
            <TextField
              multiline
              rows={3}
              rowsMax={3}
              className={classes.textArea}
              variant="filled"
              name="message"
              onChange={handleOnChange}
              value={model.message}
              placeholder="Include a customize message to ..."
            />
          }
        </div>

        {!isLoading &&
          <Paper elevation={1} className={classes.listPaper} variant="outlined">
            <List>
              {permissions && permissions.map((permission) => {
                return (
                  <ListItem key={permission.email} role={undefined} dense button>
                    <ListItemText id={`${permission.name}<${permission.email}>`} primary={permission.email} />

                    <RoleIcon role={permission.role} />

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
        }

      </BaseDialog>
    </div >
  );
}

export default ShareDialog;