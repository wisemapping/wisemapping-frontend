import { Divider, Menu, MenuItem } from '@material-ui/core';
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
import { StyledMenuItem } from './styled';
import { FormattedMessage } from 'react-intl';

export type ActionType = 'open' | 'share' | 'delete' | 'info' | 'duplicate' | 'export' | 'rename' | 'print' | 'info' | 'publish' | 'history'| undefined;

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

    >
      <StyledMenuItem onClick={handleOnClose('open')}>
        <DescriptionOutlinedIcon /><FormattedMessage id="action.open" defaultMessage="Open" />
      </StyledMenuItem>
      <Divider />

      <MenuItem onClick={handleOnClose('duplicate')}>
        <FileCopyOutlinedIcon /><FormattedMessage id="action.duplicate" defaultMessage="Duplicate" />
      </MenuItem>
      <MenuItem onClick={handleOnClose('rename')}>
        <EditOutlinedIcon /> <FormattedMessage id="action.rename" defaultMessage="Rename" />
      </MenuItem>
      <MenuItem onClick={handleOnClose('delete')}>
        <DeleteOutlinedIcon /><FormattedMessage id="action.delete" defaultMessage="Delete" />
      </MenuItem>
      <Divider />

      <MenuItem onClick={handleOnClose('export')}>
        <CloudDownloadOutlinedIcon /><FormattedMessage id="action.export" defaultMessage="Export" />
      </MenuItem>
      <MenuItem onClick={handleOnClose('print')}>
        <PrintOutlinedIcon /><FormattedMessage id="action.print" defaultMessage="Print" />
      </MenuItem>
      <MenuItem onClick={handleOnClose('publish')}>
        <PublicOutlinedIcon /><FormattedMessage id="action.publish" defaultMessage="Publish" />
      </MenuItem>
      <MenuItem onClick={handleOnClose('share')}>
        <ShareOutlinedIcon /><FormattedMessage id="action.share" defaultMessage="Share" />
      </MenuItem>
      <Divider />

      <MenuItem onClick={handleOnClose('info')}>
        <InfoOutlinedIcon /><FormattedMessage id="action.info" defaultMessage="Info" />
      </MenuItem>
     
      <MenuItem onClick={handleOnClose('history')}>
        <DeleteOutlinedIcon /><FormattedMessage id="action.delete" defaultMessage="History" />
      </MenuItem>

    </Menu>);
}

export default ActionChooser;