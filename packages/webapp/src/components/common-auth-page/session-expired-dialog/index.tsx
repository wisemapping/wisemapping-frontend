/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Alert from '@mui/material/Alert';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import AlertTitle from '@mui/material/AlertTitle';

const SessionExpiredDialog = ({ open }: { open: boolean }): React.ReactElement => {
  const handleOnClose = () => {
    window.location.href = '/c/login';
  };

  return (
    <div>
      <Dialog open={open} onClose={handleOnClose} maxWidth="sm" fullWidth={true}>
        <DialogTitle>
          <FormattedMessage id="expired.title" defaultMessage="Your session has expired" />
        </DialogTitle>

        <DialogContent>
          <Alert severity="error">
            <AlertTitle>
              <FormattedMessage
                id="expired.description"
                defaultMessage="Your current session has expired. Please, sign in and try again."
              />
            </AlertTitle>
          </Alert>
        </DialogContent>

        <DialogActions>
          <Button type="button" color="primary" size="medium" onClick={handleOnClose}>
            <FormattedMessage id="login.signin" defaultMessage="Sign In" />
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
export default SessionExpiredDialog;
