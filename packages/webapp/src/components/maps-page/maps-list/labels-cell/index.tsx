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
import {
  DeleteLabelButton,
  DeleteLabelIcon,
  LabelContainer,
  LabelIcon,
  LabelText,
} from '../label/styled';

import { Label } from '../../../../classes/client';
import { useIntl } from 'react-intl';

type Props = {
  labels: Label[];
  onDelete: (label: Label) => void;
};

const LabelsCellComponent: React.FC<Props> = ({ labels, onDelete }) => {
  const intl = useIntl();

  // Keep original label colors in both light and dark mode
  const getIconColor = (label: Label) => {
    return label.color;
  };

  return (
    <>
      {labels.map((label) => (
        <LabelContainer key={label.id} color={label.color}>
          <LabelIcon htmlColor={getIconColor(label)} />
          <LabelText>{label.title}</LabelText>
          <DeleteLabelButton
            color="default"
            size="small"
            aria-label={intl.formatMessage({
              id: 'common.delete-tag',
              defaultMessage: 'Delete tag',
            })}
            component="span"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(label);
            }}
            className="delete-button"
          >
            <DeleteLabelIcon />
          </DeleteLabelButton>
        </LabelContainer>
      ))}
    </>
  );
};

export const LabelsCell = memo(LabelsCellComponent);
