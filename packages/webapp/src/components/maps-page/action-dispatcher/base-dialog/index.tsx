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

import React, { useContext, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { ErrorInfo } from '../../../../classes/client';
import { StyledDialog, StyledDialogActions, StyledDialogContent, StyledDialogTitle } from './style';
import GlobalError from '../../../form/global-error';
import DialogContentText from '@mui/material/DialogContentText';
import Button from '@mui/material/Button';
import { CSSObject } from '@emotion/react';
import { KeyboardContext } from '../../../../classes/provider/keyboard-context';

export type DialogProps = {
  onClose: () => void;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  children: unknown;
  error?: ErrorInfo;

  title: string;
  description?: string;

  submitButton?: string;
  actionUrl?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  papercss?: CSSObject;
};

const BaseDialog = (props: DialogProps): React.ReactElement => {
  const { setHotkeyEnabled } = useContext(KeyboardContext);
  useEffect(() => {
    setHotkeyEnabled(false);
    return () => {
      setHotkeyEnabled(true);
    };
  }, []);
  const { onClose, onSubmit, maxWidth = 'sm', papercss } = props;

  const handleOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  const description = props.description ? (
    <DialogContentText>{props.description}</DialogContentText>
  ) : null;
  return (
    <div>
      <StyledDialog
        open={true}
        onClose={onClose}
        maxWidth={maxWidth}
        papercss={{ '& .MuiPaper-root.MuiDialog-paper': papercss }}
        fullWidth={true}
      >
        <form autoComplete="off" onSubmit={handleOnSubmit}>
          <StyledDialogTitle>{props.title}</StyledDialogTitle>

          <StyledDialogContent>
            <>
              {description}
              <GlobalError error={props.error} />
              {props.children}
            </>
          </StyledDialogContent>

          <StyledDialogActions>
            <Button type="button" color="primary" size="medium" onClick={onClose}>
              {onSubmit ? (
                <FormattedMessage id="action.cancel-button" defaultMessage="Cancel" />
              ) : (
                <FormattedMessage id="action.close-button" defaultMessage="Close" />
              )}
            </Button>
            {onSubmit && (
              <Button
                color="primary"
                size="medium"
                variant="contained"
                type="submit"
                disableElevation={true}
              >
                {props.submitButton}
              </Button>
            )}
          </StyledDialogActions>
        </form>
      </StyledDialog>
    </div>
  );
};

export default BaseDialog;
