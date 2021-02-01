import { Divider, ListItemIcon, Menu, MenuItem } from '@material-ui/core';
import React from 'react';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import CloudDownloadOutlinedIcon from '@material-ui/icons/CloudDownloadOutlined';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import PublicOutlinedIcon from '@material-ui/icons/PublicOutlined';
import PrintOutlinedIcon from '@material-ui/icons/PrintOutlined';
import ShareOutlinedIcon from '@material-ui/icons/ShareOutlined';
import { FormattedMessage } from 'react-intl';
import { LabelOutlined } from '@material-ui/icons';

export type ActionType = 'open' | 'share' | 'delete' | 'info' | 'duplicate' | 'export' | 'label' | 'rename' | 'print' | 'info' | 'publish' | 'history' | undefined;

interface ActionProps {
  onClose: (action: ActionType) => void;
  anchor: undefined | HTMLElement;
}

const ActionChooser = (props: ActionProps) => {
  const { anchor, onClose } = props;

  const handleOnClose = (action: ActionType): ((event: React.MouseEvent<HTMLLIElement>) => void) => {
    return (event): void => {
      event.stopPropagation();
      onClose(action);
    };
  }

  return (

    <Menu
      anchorEl={anchor}
      keepMounted
      open={Boolean(anchor)}
      onClose={handleOnClose(undefined)}
      elevation={1}
    >
      <MenuItem onClick={handleOnClose('open')} style={{width:"220px"}}>
        <ListItemIcon>
          <DescriptionOutlinedIcon />
        </ListItemIcon>
        <FormattedMessage id="action.open" defaultMessage="Open" />
      </MenuItem>
      <Divider />

      <MenuItem onClick={handleOnClose('duplicate')}>
        <ListItemIcon>
          <FileCopyOutlinedIcon />
        </ListItemIcon>
        <FormattedMessage id="action.duplicate" defaultMessage="Duplicate" />
      </MenuItem>

      <MenuItem onClick={handleOnClose('rename')}>
        <ListItemIcon>
          <EditOutlinedIcon />
        </ListItemIcon>
        <FormattedMessage id="action.rename" defaultMessage="Rename" />
      </MenuItem>

      <MenuItem onClick={handleOnClose('label')}>
        <ListItemIcon>
          <LabelOutlined />
        </ListItemIcon>
        <FormattedMessage id="action.label" defaultMessage="Add Label" />
      </MenuItem>

      <MenuItem onClick={handleOnClose('delete')}>
        <ListItemIcon>
          <DeleteOutlinedIcon />
        </ListItemIcon>
        <FormattedMessage id="action.delete" defaultMessage="Delete" />
      </MenuItem>
      <Divider />

      <MenuItem onClick={handleOnClose('export')}>
        <ListItemIcon>
          <CloudDownloadOutlinedIcon />
        </ListItemIcon>
        <FormattedMessage id="action.export" defaultMessage="Export" />
      </MenuItem>

      <MenuItem onClick={handleOnClose('print')}>
        <ListItemIcon>
          <PrintOutlinedIcon />
        </ListItemIcon>
        <FormattedMessage id="action.print" defaultMessage="Print" />
      </MenuItem>

      <MenuItem onClick={handleOnClose('publish')}>
        <ListItemIcon>
          <PublicOutlinedIcon />
        </ListItemIcon>
        <FormattedMessage id="action.publish" defaultMessage="Publish" />
      </MenuItem>

      <MenuItem onClick={handleOnClose('share')}>
        <ListItemIcon>
          <ShareOutlinedIcon />
        </ListItemIcon>
        <FormattedMessage id="action.share" defaultMessage="Share" />
      </MenuItem>
      <Divider />

      <MenuItem onClick={handleOnClose('info')}>
        <ListItemIcon>
          <InfoOutlinedIcon />
        </ListItemIcon>
        <FormattedMessage id="action.info" defaultMessage="Info" />
      </MenuItem>

      <MenuItem onClick={handleOnClose('history')}>
        <ListItemIcon>
          <DeleteOutlinedIcon />
        </ListItemIcon>
        <FormattedMessage id="action.delete" defaultMessage="History" />
      </MenuItem>
    </Menu>);
}

export default ActionChooser;