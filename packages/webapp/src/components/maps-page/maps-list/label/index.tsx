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
import { useIntl } from 'react-intl';
import { LabelContainer, LabelText } from './styled';

import { Label } from '../../../../classes/client';
import LabelTwoTone from '@mui/icons-material/LabelTwoTone';
import DeleteIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';

type LabelSize = 'small' | 'big';
type LabelComponentProps = { label: Label; onDelete?: (label: Label) => void; size?: LabelSize };

export default function LabelComponent({
  label,
  onDelete,
  size = 'small',
}: LabelComponentProps): React.ReactElement<LabelComponentProps> {
  const intl = useIntl();
  const iconSize =
    size === 'small'
      ? {
          height: '0.6em',
          width: '0.6em',
        }
      : { height: '0.9em', width: '0.9em' };

  // Keep original label colors in both light and dark mode
  const getIconColor = () => {
    return label.color;
  };

  return (
    <LabelContainer color={label.color}>
      <LabelTwoTone htmlColor={getIconColor()} style={iconSize} />
      <LabelText>{label.title}</LabelText>
      {onDelete && (
        <IconButton
          color="default"
          size="small"
          aria-label={intl.formatMessage({ id: 'common.delete-tag', defaultMessage: 'Delete tag' })}
          component="span"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(label);
          }}
          sx={{
            padding: '0px',
            marginLeft: '2px',
            '&:hover': {
              opacity: 0.8,
            },
          }}
          className="delete-button"
        >
          <DeleteIcon
            style={iconSize}
            sx={{
              color: 'rgba(255, 255, 255, 0.95)',
              filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
            }}
          />
        </IconButton>
      )}
    </LabelContainer>
  );
}
