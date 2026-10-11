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

import React, { memo } from 'react';
import { useIntl } from 'react-intl';
import { DeleteLabelButton, DeleteLabelIcon, LabelContainer, LabelIcon, LabelText } from './styled';

import { Label } from '../../../../classes/client';

type LabelSize = 'small' | 'big';
type LabelComponentProps = { label: Label; onDelete?: (label: Label) => void; size?: LabelSize };

const LabelComponent = ({
  label,
  onDelete,
  size = 'small',
}: LabelComponentProps): React.ReactElement<LabelComponentProps> => {
  const intl = useIntl();
  const big = size === 'big';

  // Keep original label colors in both light and dark mode
  const getIconColor = () => {
    return label.color;
  };

  return (
    <LabelContainer color={label.color}>
      <LabelIcon htmlColor={getIconColor()} big={big} />
      <LabelText>{label.title}</LabelText>
      {onDelete && (
        <DeleteLabelButton
          color="default"
          size="small"
          aria-label={intl.formatMessage({ id: 'common.delete-tag', defaultMessage: 'Delete tag' })}
          component="span"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(label);
          }}
          className="delete-button"
        >
          <DeleteLabelIcon big={big} />
        </DeleteLabelButton>
      )}
    </LabelContainer>
  );
};

export default memo(LabelComponent);
