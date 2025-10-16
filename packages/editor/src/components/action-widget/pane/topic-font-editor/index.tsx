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

import React, { ReactElement, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import TextIncreaseOutlinedIcon from '@mui/icons-material/TextIncreaseOutlined';
import TextDecreaseOutlinedIcon from '@mui/icons-material/TextDecreaseOutlined';
import FormatBoldOutlinedIcon from '@mui/icons-material/FormatBoldOutlined';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import NotInterestedOutlined from '@mui/icons-material/NotInterestedOutlined';
import Button from '@mui/material/Button';
import { FormattedMessage, useIntl } from 'react-intl';
import { styled } from '@mui/material/styles';
import type { SelectChangeEvent } from '@mui/material/Select';

import NodeProperty from '../../../../classes/model/node-property';
import { SwitchValueDirection } from '../../../toolbar/ToolbarValueModelBuilder';
import ColorPicker from '../color-picker';
import Editor from '../../../../classes/model/editor';
import { trackFontFormatAction } from '../../../../utils/analytics';
import { StyledEditorContainer } from '../shared/StyledEditorContainer';

const ActionButton = styled(IconButton)<{ selected?: boolean }>(({ selected, theme }) => ({
  padding: '8px',
  width: '32px',
  height: '32px',
  border: selected
    ? `2px solid ${theme.palette.primary.main}`
    : `2px solid ${theme.palette.divider}`,
  borderRadius: '4px',
  backgroundColor: selected
    ? theme.palette.mode === 'dark'
      ? 'rgba(144, 202, 249, 0.08)'
      : 'rgba(25, 118, 210, 0.08)'
    : 'transparent',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

interface TopicFontEditorProps {
  closeModal: () => void;
  fontFamilyModel: NodeProperty<string | undefined>;
  fontSizeModel: NodeProperty<number>;
  fontWeightModel: NodeProperty<string | undefined>;
  fontStyleModel: NodeProperty<string>;
  fontColorModel: NodeProperty<string | undefined>;
  model?: Editor;
}

const TopicFontEditor = (props: TopicFontEditorProps): ReactElement => {
  const intl = useIntl();
  const [currentFont, setCurrentFont] = useState<string | undefined>(
    props.fontFamilyModel.getValue(),
  );
  const [currentWeight, setCurrentWeight] = useState<string | undefined>(
    props.fontWeightModel.getValue(),
  );
  const [currentStyle, setCurrentStyle] = useState<string>(props.fontStyleModel.getValue());

  useEffect(() => {
    if (props.model?.isMapLoadded()) {
      const handleUpdate = () => {
        setCurrentFont(props.fontFamilyModel.getValue());
        setCurrentWeight(props.fontWeightModel.getValue());
        setCurrentStyle(props.fontStyleModel.getValue());
      };

      if (props.model.getDesigner()) {
        props.model.getDesigner().addEvent('modelUpdate', handleUpdate);
        props.model.getDesigner().addEvent('onfocus', handleUpdate);
        props.model.getDesigner().addEvent('onblur', handleUpdate);
      }

      return () => {
        if (props.model?.getDesigner()) {
          props.model.getDesigner().removeEvent('modelUpdate', handleUpdate);
          props.model.getDesigner().removeEvent('onfocus', handleUpdate);
          props.model.getDesigner().removeEvent('onblur', handleUpdate);
        }
      };
    }
  }, [props.model?.isMapLoadded()]);

  const handleFontFamilyChange = (event: SelectChangeEvent) => {
    const setValue = props.fontFamilyModel.setValue;
    if (setValue) {
      const value = event.target.value === '' ? undefined : event.target.value;
      setValue(value);
    }
  };

  const handleFontSizeIncrease = () => {
    trackFontFormatAction('font_size_change', 'increase');
    const switchValue = props.fontSizeModel.switchValue;
    if (switchValue) {
      switchValue(SwitchValueDirection.up);
    }
  };

  const handleFontSizeDecrease = () => {
    trackFontFormatAction('font_size_change', 'decrease');
    const switchValue = props.fontSizeModel.switchValue;
    if (switchValue) {
      switchValue(SwitchValueDirection.down);
    }
  };

  const handleBoldToggle = () => {
    trackFontFormatAction('font_weight_toggle');
    const switchValue = props.fontWeightModel.switchValue;
    if (switchValue) {
      switchValue();
    }
  };

  const handleItalicToggle = () => {
    trackFontFormatAction('font_style_toggle');
    const switchValue = props.fontStyleModel.switchValue;
    if (switchValue) {
      switchValue();
    }
  };

  // Check if any font property is customized
  const hasCustomFont = currentFont !== undefined || props.fontColorModel.getValue() !== undefined;

  const handleResetToDefault = () => {
    // Reset all font properties to undefined (theme defaults)
    props.fontFamilyModel.setValue?.(undefined);
    props.fontColorModel.setValue?.(undefined);
  };

  return (
    <StyledEditorContainer
      sx={{
        pt: 2,
        px: 2,
        pb: 1,
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

      {/* Font Family */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.75rem', mb: 1 }}>
          <FormattedMessage id="topic-font-editor.font-family" defaultMessage="Font Family" />
        </Typography>
        <FormControl variant="outlined" fullWidth size="small">
          <Select
            value={currentFont || ''}
            onChange={handleFontFamilyChange}
            displayEmpty
            sx={{
              fontSize: '0.656rem',
              fontFamily: currentFont || 'inherit',
              '& .MuiSelect-select': {
                py: 1.25,
                px: 1.5,
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'divider',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'text.secondary',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: 300,
                  '& .MuiMenuItem-root': {
                    py: 1,
                    px: 2,
                  },
                },
              },
            }}
          >
            <MenuItem value="">
              <Typography
                sx={{ fontStyle: 'italic', color: 'text.secondary', fontSize: '0.656rem' }}
              >
                {currentFont === undefined
                  ? intl.formatMessage({
                      id: 'editor-panel.font-family-default',
                      defaultMessage: 'Default',
                    })
                  : intl.formatMessage({
                      id: 'editor-panel.font-family-mixed',
                      defaultMessage: 'Mixed',
                    })}
              </Typography>
            </MenuItem>
            {[
              'Arial',
              'Baskerville',
              'Georgia',
              'Helvetica',
              'Tahoma',
              'Limunari',
              'Brush Script MT',
              'Verdana',
              'Times',
              'Times New Roman',
              'Courier New',
              'Cursive',
              'Fantasy',
              'Inter',
              'Perpetua',
              'Brush Script',
              'Copperplate',
              'Garamond',
              'Palatino',
              'Century Gothic',
              'Comic Sans MS',
            ]
              .sort()
              .map((f) => (
                <MenuItem value={f} key={f}>
                  <Typography fontFamily={f} sx={{ fontSize: '0.656rem' }}>
                    {f}
                  </Typography>
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </Box>

      {/* Font Color */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.75rem', mb: 1 }}>
          <FormattedMessage id="topic-font-editor.font-color" defaultMessage="Font Color" />
        </Typography>
        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
          <ColorPicker
            closeModal={() => {}}
            colorModel={props.fontColorModel}
            hideNoneOption={true}
          />
        </Box>
      </Box>

      {/* Font Size & Font Style */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.75rem', mb: 1 }}>
          <FormattedMessage
            id="topic-font-editor.font-size-style"
            defaultMessage="Font Size & Style"
          />
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActionButton
            onClick={handleFontSizeIncrease}
            aria-label={intl.formatMessage({
              id: 'topic-font-editor.increase-size',
              defaultMessage: 'Bigger',
            })}
            title={intl.formatMessage({
              id: 'topic-font-editor.increase-size-tooltip',
              defaultMessage: 'Increase font size',
            })}
          >
            <TextIncreaseOutlinedIcon />
          </ActionButton>
          <ActionButton
            onClick={handleFontSizeDecrease}
            aria-label={intl.formatMessage({
              id: 'topic-font-editor.decrease-size',
              defaultMessage: 'Smaller',
            })}
            title={intl.formatMessage({
              id: 'topic-font-editor.decrease-size-tooltip',
              defaultMessage: 'Decrease font size',
            })}
          >
            <TextDecreaseOutlinedIcon />
          </ActionButton>

          <Divider
            orientation="vertical"
            flexItem
            sx={{ mx: 1, height: '32px', alignSelf: 'center' }}
          />

          <ActionButton
            onClick={handleBoldToggle}
            selected={currentWeight === 'bold'}
            aria-label={
              intl.formatMessage({
                id: 'topic-font-editor.bold',
                defaultMessage: 'Bold',
              }) +
              (currentWeight === 'bold'
                ? ` (${intl.formatMessage({
                    id: 'topic-font-editor.active',
                    defaultMessage: 'active',
                  })})`
                : '')
            }
            title={intl.formatMessage({
              id: 'topic-font-editor.bold-tooltip',
              defaultMessage: 'Toggle bold',
            })}
          >
            <FormatBoldOutlinedIcon />
          </ActionButton>
          <ActionButton
            onClick={handleItalicToggle}
            selected={currentStyle === 'italic'}
            aria-label={
              intl.formatMessage({
                id: 'topic-font-editor.italic',
                defaultMessage: 'Italic',
              }) +
              (currentStyle === 'italic'
                ? ` (${intl.formatMessage({
                    id: 'topic-font-editor.active',
                    defaultMessage: 'active',
                  })})`
                : '')
            }
            title={intl.formatMessage({
              id: 'topic-font-editor.italic-tooltip',
              defaultMessage: 'Toggle italic',
            })}
          >
            <FormatItalicIcon />
          </ActionButton>
        </Box>
      </Box>

      {/* Reset to Default Button - At bottom */}
      {hasCustomFont && (
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<NotInterestedOutlined />}
            onClick={handleResetToDefault}
            fullWidth
            sx={{
              textTransform: 'none',
              fontSize: '0.75rem',
              py: 0.75,
            }}
          >
            <FormattedMessage
              id="topic-font-editor.reset-to-default"
              defaultMessage="Reset to Default"
            />
          </Button>
        </Box>
      )}
    </StyledEditorContainer>
  );
};

export default TopicFontEditor;
