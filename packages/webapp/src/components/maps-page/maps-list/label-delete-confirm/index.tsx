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

import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';

import BaseDialog from '../../action-dispatcher/base-dialog';
import { Label } from '../../../../classes/client';

export type LabelDeleteConfirmType = {
  label: Label;
  onClose: () => void;
  onConfirm: () => void;
};

const LabelDeleteConfirm = ({
  label,
  onClose,
  onConfirm,
}: LabelDeleteConfirmType): React.ReactElement => {
  const intl = useIntl();

  return (
    <div>
      <BaseDialog
        onClose={onClose}
        onSubmit={onConfirm}
        title={intl.formatMessage({
          id: 'label.delete-title',
          defaultMessage: 'Confirm label deletion',
        })}
        submitButton={intl.formatMessage({
          id: 'action.delete-title',
          defaultMessage: 'Delete',
        })}
      >
        <Alert severity="warning">
          <AlertTitle>
            {intl.formatMessage({
              id: 'label.delete-title',
              defaultMessage: 'Confirm label deletion',
            })}
          </AlertTitle>
          <span>
            <Typography fontWeight="bold" component="span">
              {label.title}{' '}
            </Typography>
            <FormattedMessage
              id="label.delete-description"
              defaultMessage="will be deleted, including its associations to all existing maps. Do you want to continue?"
            />
          </span>
        </Alert>
      </BaseDialog>
    </div>
  );
};

export default LabelDeleteConfirm;
