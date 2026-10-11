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

import { ReactElement } from 'react';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { FormattedMessage, useIntl } from 'react-intl';
import { styled } from '@mui/material/styles';
import {
  RelationshipStartArrowIcon,
  RelationshipEndArrowIcon,
} from '../../../icons/RelationshipArrowIcons';

import NodeProperty from '../../../../classes/model/node-property';
import { StrokeStyle } from '@wisemapping/mindplot';
import ColorPicker from '../color-picker';
import {
  PaneCard,
  PaneCenteredRow,
  PaneCloseButton,
  PaneControlRow,
  PaneDivider,
  PaneSection,
  PaneSectionTitle,
} from '../shared/StyledPane';
import { trackRelationshipAction } from '../../../../utils/analytics';

const ActionButton = styled(IconButton)<{ selected?: boolean }>(({ selected, theme }) => ({
  padding: '8px',
  width: '32px',
  height: '32px',
  border: selected ? `2px solid ${theme.palette.primary.main}` : '2px solid #e0e0e0',
  borderRadius: '4px',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
}));

interface RelationshipStyleEditorProps {
  closeModal: () => void;
  strokeStyleModel: NodeProperty<StrokeStyle>;
  startArrowModel: NodeProperty<boolean>;
  endArrowModel: NodeProperty<boolean>;
  colorModel: NodeProperty<string | undefined>;
}

const RelationshipStyleEditor = (props: RelationshipStyleEditorProps): ReactElement => {
  const intl = useIntl();

  const handleStrokeStyleChange = (style: StrokeStyle) => {
    trackRelationshipAction('stroke_style_change', style.toLowerCase());
    const setValue = props.strokeStyleModel.setValue;
    if (setValue) {
      setValue(style);
    }
  };

  const handleStartArrowToggle = () => {
    trackRelationshipAction('arrow_toggle', 'start_arrow');
    const setValue = props.startArrowModel.setValue;
    if (setValue) {
      setValue(!props.startArrowModel.getValue());
    }
  };

  const handleEndArrowToggle = () => {
    trackRelationshipAction('arrow_toggle', 'end_arrow');
    const setValue = props.endArrowModel.setValue;
    if (setValue) {
      setValue(!props.endArrowModel.getValue());
    }
  };

  return (
    <PaneCard>
      <PaneCloseButton onClick={props.closeModal}>
        <CloseIcon />
      </PaneCloseButton>

      {/* Relationship Color */}
      <PaneSection>
        <PaneSectionTitle variant="subtitle2" gutterBottom>
          <FormattedMessage
            id="relationship-style-editor.color"
            defaultMessage="Relationship Color"
          />
        </PaneSectionTitle>
        <PaneCenteredRow>
          <ColorPicker closeModal={() => {}} colorModel={props.colorModel} />
        </PaneCenteredRow>
      </PaneSection>

      {/* Line Style & Arrows */}
      <PaneSection>
        <PaneSectionTitle variant="subtitle2" gutterBottom>
          <FormattedMessage
            id="relationship-style-editor.line-arrows"
            defaultMessage="Line Style & Arrows"
          />
        </PaneSectionTitle>
        <PaneControlRow>
          <ActionButton
            onClick={() => handleStrokeStyleChange(StrokeStyle.SOLID)}
            selected={props.strokeStyleModel.getValue() === StrokeStyle.SOLID}
            aria-label={intl.formatMessage({
              id: 'relationship-style-editor.solid-line',
              defaultMessage: 'Solid Line',
            })}
            title={intl.formatMessage({
              id: 'relationship-style-editor.solid-line-tooltip',
              defaultMessage: 'Solid line style',
            })}
          >
            <RemoveIcon />
          </ActionButton>
          <ActionButton
            onClick={() => handleStrokeStyleChange(StrokeStyle.DASHED)}
            selected={props.strokeStyleModel.getValue() === StrokeStyle.DASHED}
            aria-label={intl.formatMessage({
              id: 'relationship-style-editor.dashed-line',
              defaultMessage: 'Dashed Line',
            })}
            title={intl.formatMessage({
              id: 'relationship-style-editor.dashed-line-tooltip',
              defaultMessage: 'Dashed line style',
            })}
          >
            <MoreHorizIcon />
          </ActionButton>
          <ActionButton
            onClick={() => handleStrokeStyleChange(StrokeStyle.DOTTED)}
            selected={props.strokeStyleModel.getValue() === StrokeStyle.DOTTED}
            aria-label={intl.formatMessage({
              id: 'relationship-style-editor.dotted-line',
              defaultMessage: 'Dotted Line',
            })}
            title={intl.formatMessage({
              id: 'relationship-style-editor.dotted-line-tooltip',
              defaultMessage: 'Dotted line style',
            })}
          >
            <FiberManualRecordIcon />
          </ActionButton>

          <PaneDivider orientation="vertical" flexItem />

          <ActionButton
            onClick={handleEndArrowToggle}
            selected={props.endArrowModel.getValue()}
            aria-label={intl.formatMessage({
              id: 'relationship-style-editor.end-arrow',
              defaultMessage: 'End Arrow',
            })}
            title={intl.formatMessage({
              id: 'relationship-style-editor.end-arrow-tooltip',
              defaultMessage: 'Toggle end arrow',
            })}
          >
            <RelationshipStartArrowIcon />
          </ActionButton>
          <ActionButton
            onClick={handleStartArrowToggle}
            selected={props.startArrowModel.getValue()}
            aria-label={intl.formatMessage({
              id: 'relationship-style-editor.start-arrow',
              defaultMessage: 'Start Arrow',
            })}
            title={intl.formatMessage({
              id: 'relationship-style-editor.start-arrow-tooltip',
              defaultMessage: 'Toggle start arrow',
            })}
          >
            <RelationshipEndArrowIcon />
          </ActionButton>
        </PaneControlRow>
      </PaneSection>
    </PaneCard>
  );
};

export default RelationshipStyleEditor;
