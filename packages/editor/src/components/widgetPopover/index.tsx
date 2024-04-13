import Popover from '@mui/material/Popover';
import Box from '@mui/material/Box';
import { WidgetManager } from '@wisemapping/mindplot';
import React from 'react';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

type WidgetPopoverProps = {
  widgetManager: WidgetManager;
};
const WidgetPopover = ({ widgetManager }: WidgetPopoverProps): React.ReactElement => {
  const isOpen = widgetManager.isEditorOpen();
  const anchorl = widgetManager.getAnchorElement();

  const closeHander = () => {
    widgetManager.handleClose();
    // @todo: review ..
    designer.fireEvent('featureEdit', { event: 'close' });
  };

  const dialogTitle = widgetManager.getEditorTile();
  const widgetContent = widgetManager.getEditorContent();
  return (
    <Popover
      id="popover"
      open={isOpen}
      anchorEl={anchorl}
      onClose={closeHander}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
    >
      <Box textAlign={'right'} ml={1}>
        <Typography variant="body1" style={{ paddingTop: '10px', float: 'left' }}>
          <FormattedMessage id={dialogTitle} defaultMessage=""></FormattedMessage>
        </Typography>

        <IconButton onClick={closeHander} aria-label={'Close'}>
          <CloseIcon />
        </IconButton>
      </Box>
      {widgetContent}
    </Popover>
  );
};

export default WidgetPopover;
