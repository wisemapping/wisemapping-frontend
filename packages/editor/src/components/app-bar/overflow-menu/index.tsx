import React, { ReactElement, useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Divider from '@mui/material/Divider';
import SaveAsOutlinedIcon from '@mui/icons-material/SaveAsOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import StarRateRoundedIcon from '@mui/icons-material/StarRateRounded';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';

import { ToolbarActionType } from '../../toolbar/ToolbarActionType';

export interface OverflowMenuProps {
  onAction?: (action: ToolbarActionType) => void;
  isStarred?: boolean;
  onToggleStar?: () => void;
  onOpenTheme?: () => void;
  onOpenLayout?: () => void;
  readOnly?: boolean;
}

export const AppBarOverflowMenu = ({
  onAction,
  isStarred = false,
  onToggleStar,
  onOpenTheme,
  onOpenLayout,
  readOnly = false,
}: OverflowMenuProps): ReactElement => {
  const intl = useIntl();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTriggerAction = (action: ToolbarActionType) => {
    handleClose();
    if (onAction) {
      onAction(action);
    }
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleOpen}
        aria-label={intl.formatMessage({
          id: 'appbar.overflow.title',
          defaultMessage: 'More options',
        })}
        aria-controls={open ? 'appbar-overflow-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="appbar-overflow-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: {
              width: 220,
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            },
          },
        }}
      >
        {!readOnly && (
          <MenuItem onClick={() => handleTriggerAction('save-as')}>
            <ListItemIcon>
              <SaveAsOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={<FormattedMessage id="appbar.save_as" defaultMessage="Save As..." />}
            />
          </MenuItem>
        )}

        <MenuItem onClick={() => handleTriggerAction('print')}>
          <ListItemIcon>
            <PrintOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={<FormattedMessage id="appbar.print" defaultMessage="Print" />} />
        </MenuItem>

        <MenuItem onClick={() => handleTriggerAction('export')}>
          <ListItemIcon>
            <FileDownloadOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={<FormattedMessage id="appbar.export" defaultMessage="Export" />} />
        </MenuItem>

        <MenuItem onClick={() => handleTriggerAction('history')}>
          <ListItemIcon>
            <HistoryOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={<FormattedMessage id="appbar.history" defaultMessage="History" />}
          />
        </MenuItem>

        <Divider />

        {onToggleStar && !readOnly && (
          <MenuItem
            onClick={() => {
              handleClose();
              onToggleStar();
            }}
          >
            <ListItemIcon>
              <StarRateRoundedIcon
                fontSize="small"
                sx={{ color: isStarred ? '#FDDA0D' : 'inherit' }}
              />
            </ListItemIcon>
            <ListItemText
              primary={
                isStarred ? (
                  <FormattedMessage id="appbar.unstar" defaultMessage="Unstar Map" />
                ) : (
                  <FormattedMessage id="appbar.star" defaultMessage="Star Map" />
                )
              }
            />
          </MenuItem>
        )}

        {onOpenTheme && (
          <MenuItem
            onClick={() => {
              handleClose();
              onOpenTheme();
            }}
          >
            <ListItemIcon>
              <PaletteOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={<FormattedMessage id="appbar.theme" defaultMessage="Map Theme" />}
            />
          </MenuItem>
        )}

        {onOpenLayout && (
          <MenuItem
            onClick={() => {
              handleClose();
              onOpenLayout();
            }}
          >
            <ListItemIcon>
              <AccountTreeIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={<FormattedMessage id="appbar.layout" defaultMessage="Map Layout" />}
            />
          </MenuItem>
        )}

        <Divider />

        <MenuItem onClick={() => handleTriggerAction('info')}>
          <ListItemIcon>
            <InfoOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={<FormattedMessage id="appbar.help" defaultMessage="Map Information" />}
          />
        </MenuItem>
      </Menu>
    </>
  );
};

export default AppBarOverflowMenu;
