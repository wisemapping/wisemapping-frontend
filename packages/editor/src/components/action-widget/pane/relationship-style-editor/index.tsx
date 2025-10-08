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

import React, { ReactElement } from 'react';
import { Box, Typography, IconButton, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { FormattedMessage, useIntl } from 'react-intl';
import { styled } from '@mui/material/styles';

import NodeProperty from '../../../../classes/model/node-property';
import { StrokeStyle } from '@wisemapping/mindplot/src/components/model/RelationshipModel';
import ColorPicker from '../color-picker';
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
    <Box
      sx={{
        pt: 1.5,
        px: 1.5,
        pb: 1,
        minWidth: '280px',
        maxWidth: '320px',
        backgroundColor: 'background.paper',
        borderRadius: '8px',
        border: '1px solid',
        borderColor: 'divider',
        position: 'relative',
      }}
    >
      <IconButton
        onClick={props.closeModal}
        sx={{
          position: 'absolute',
          top: 4,
          right: 4,
          zIndex: 1,
          width: 24,
          height: 24,
          '& .MuiSvgIcon-root': {
            fontSize: '16px',
          },
        }}
      >
        <CloseIcon />
      </IconButton>

      {/* Relationship Color */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.75rem', mb: 1 }}>
          <FormattedMessage
            id="relationship-style-editor.color"
            defaultMessage="Relationship Color"
          />
        </Typography>
        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
          <ColorPicker closeModal={() => {}} colorModel={props.colorModel} />
        </Box>
      </Box>

      {/* Line Style & Arrows */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.75rem', mb: 1 }}>
          <FormattedMessage
            id="relationship-style-editor.line-arrows"
            defaultMessage="Line Style & Arrows"
          />
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
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

          <Divider
            orientation="vertical"
            flexItem
            sx={{ mx: 1, height: '32px', alignSelf: 'center' }}
          />

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
            <ArrowLeftIcon />
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
            <ArrowRightIcon />
          </ActionButton>
        </Box>
      </Box>
    </Box>
  );
};

export default RelationshipStyleEditor;
