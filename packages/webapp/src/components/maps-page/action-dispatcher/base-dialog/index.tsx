/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import React, { use, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { ErrorInfo } from '../../../../classes/client';
import Dialog from '@mui/material/Dialog';
import {
  StyledCloseButton,
  StyledDialogActions,
  StyledDialogContent,
  StyledDialogSubtitle,
  StyledDialogTitle,
} from './style';
import GlobalError from '../../../form/global-error';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import type { SxProps, Theme } from '@mui/material/styles';
import { KeyboardContext } from '../../../../classes/provider/keyboard-context';
import AsyncButton from '../../../form/async-button';

export type DialogProps = {
  onClose: () => void;
  onSubmit?: ((event: React.FormEvent<HTMLFormElement>) => void) | undefined;
  children?: React.ReactNode;
  error?: ErrorInfo | undefined;

  title: string;
  description?: string;

  submitButton?: string | undefined;
  actionUrl?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  /** Sizes the dialog's paper; without it the dialog takes the full `maxWidth`. */
  paperSx?: SxProps<Theme> | undefined;
  isDangerousAction?: boolean;
  isLoading?: boolean;
};

const BaseDialog = (props: DialogProps): React.ReactElement => {
  const { disableHotkeys } = use(KeyboardContext);
  const intl = useIntl();
  // Hotkeys stay disabled while any dialog is open: released on unmount.
  useEffect(() => disableHotkeys(), [disableHotkeys]);
  const { onClose, onSubmit, maxWidth = 'sm', paperSx, isLoading = false } = props;

  const handleOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  const closeLabel = intl.formatMessage({ id: 'dialog.close', defaultMessage: 'Close dialog' });
  return (
    <div>
      <Dialog
        open={true}
        // Escape and the backdrop wait for the request too, as Cancel does.
        onClose={isLoading ? undefined : onClose}
        maxWidth={maxWidth}
        fullWidth={!paperSx}
        slotProps={paperSx ? { paper: { sx: paperSx } } : undefined}
      >
        <form autoComplete="off" onSubmit={handleOnSubmit}>
          <StyledDialogTitle>
            {props.title}
            {props.description && <StyledDialogSubtitle>{props.description}</StyledDialogSubtitle>}
          </StyledDialogTitle>
          <StyledCloseButton
            aria-label={closeLabel}
            title={closeLabel}
            onClick={onClose}
            disabled={isLoading}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </StyledCloseButton>

          <StyledDialogContent dividers>
            <GlobalError error={props.error} />
            {props.children}
          </StyledDialogContent>

          <StyledDialogActions>
            <Button
              type="button"
              color="primary"
              size="medium"
              onClick={onClose}
              disabled={isLoading}
            >
              {onSubmit ? (
                <FormattedMessage id="action.cancel-button" defaultMessage="Cancel" />
              ) : (
                <FormattedMessage id="action.close-button" defaultMessage="Close" />
              )}
            </Button>
            {onSubmit && (
              <AsyncButton
                color="primary"
                size="medium"
                variant="contained"
                type="submit"
                disableElevation={true}
                isLoading={isLoading}
                loadingText={intl.formatMessage({
                  id: 'common.wait',
                  defaultMessage: 'Please wait ...',
                })}
              >
                {props.submitButton}
              </AsyncButton>
            )}
          </StyledDialogActions>
        </form>
      </Dialog>
    </div>
  );
};

export default BaseDialog;
