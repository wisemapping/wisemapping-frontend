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

import { ReactElement, useState, useEffect } from 'react';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import CloseIcon from '@mui/icons-material/Close';
import TextIncreaseOutlinedIcon from '@mui/icons-material/TextIncreaseOutlined';
import TextDecreaseOutlinedIcon from '@mui/icons-material/TextDecreaseOutlined';
import FormatBoldOutlinedIcon from '@mui/icons-material/FormatBoldOutlined';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import NotInterestedOutlined from '@mui/icons-material/NotInterestedOutlined';
import { FormattedMessage, useIntl } from 'react-intl';
import type { SelectChangeEvent } from '@mui/material/Select';

import NodeProperty from '../../../../classes/model/node-property';
import { SwitchValueDirection } from '../../../../classes/model/value-stepper';
import ColorPicker from '../color-picker';
import Editor from '../../../../classes/model/editor';
import { trackFontFormatAction } from '../../../../utils/analytics';
import {
  PaneCenteredRow,
  PaneCloseButton,
  PaneControlRow,
  PaneDivider,
  PaneSection,
  PaneSectionTitle,
} from '../shared/StyledPane';
import {
  ActionButton,
  FontFallbackLabel,
  FontOptionLabel,
  FontPaneContainer,
  FontSelect,
  ResetButton,
  ResetSection,
  fontMenuProps,
} from './styled';

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

  const { model, fontFamilyModel, fontWeightModel, fontStyleModel } = props;
  const mapLoaded = model?.isMapLoadded() ?? false;

  // Subscribes again when the model or a font property changes, or once the map has loaded ...
  useEffect(() => {
    if (!model || !mapLoaded) {
      return undefined;
    }
    const designer = model.getDesigner();
    if (!designer) {
      return undefined;
    }

    const handleUpdate = () => {
      setCurrentFont(fontFamilyModel.getValue());
      setCurrentWeight(fontWeightModel.getValue());
      setCurrentStyle(fontStyleModel.getValue());
    };
    designer.addEvent('modelUpdate', handleUpdate);
    designer.addEvent('onfocus', handleUpdate);
    designer.addEvent('onblur', handleUpdate);
    return () => {
      designer.removeEvent('modelUpdate', handleUpdate);
      designer.removeEvent('onfocus', handleUpdate);
      designer.removeEvent('onblur', handleUpdate);
    };
  }, [model, mapLoaded, fontFamilyModel, fontWeightModel, fontStyleModel]);

  // The styled select does not carry Select's generic: the value is read as a string here.
  const handleFontFamilyChange = (event: SelectChangeEvent<unknown>) => {
    const setValue = props.fontFamilyModel.setValue;
    if (setValue) {
      const value = event.target.value === '' ? undefined : String(event.target.value);
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
    <FontPaneContainer>
      <PaneCloseButton onClick={props.closeModal}>
        <CloseIcon />
      </PaneCloseButton>
      {/* Font Family */}
      <PaneSection>
        <PaneSectionTitle variant="subtitle2" gutterBottom>
          <FormattedMessage id="topic-font-editor.font-family" defaultMessage="Font Family" />
        </PaneSectionTitle>
        <FormControl variant="outlined" fullWidth size="small">
          <FontSelect
            currentFamily={currentFont}
            value={currentFont || ''}
            onChange={handleFontFamilyChange}
            displayEmpty
            MenuProps={fontMenuProps}
          >
            <MenuItem value="">
              <FontFallbackLabel>
                {currentFont === undefined
                  ? intl.formatMessage({
                      id: 'editor-panel.font-family-default',
                      defaultMessage: 'Default',
                    })
                  : intl.formatMessage({
                      id: 'editor-panel.font-family-mixed',
                      defaultMessage: 'Mixed',
                    })}
              </FontFallbackLabel>
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
                  <FontOptionLabel family={f}>{f}</FontOptionLabel>
                </MenuItem>
              ))}
          </FontSelect>
        </FormControl>
      </PaneSection>
      {/* Font Color */}
      <PaneSection>
        <PaneSectionTitle variant="subtitle2" gutterBottom>
          <FormattedMessage id="topic-font-editor.font-color" defaultMessage="Font Color" />
        </PaneSectionTitle>
        <PaneCenteredRow>
          <ColorPicker
            closeModal={() => {}}
            colorModel={props.fontColorModel}
            hideNoneOption={true}
          />
        </PaneCenteredRow>
      </PaneSection>
      {/* Font Size & Font Style */}
      <PaneSection>
        <PaneSectionTitle variant="subtitle2" gutterBottom>
          <FormattedMessage
            id="topic-font-editor.font-size-style"
            defaultMessage="Font Size & Style"
          />
        </PaneSectionTitle>
        <PaneControlRow>
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

          <PaneDivider orientation="vertical" flexItem />

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
        </PaneControlRow>
      </PaneSection>
      {/* Reset to Default Button - At bottom */}
      {hasCustomFont && (
        <ResetSection>
          <ResetButton
            variant="outlined"
            size="small"
            startIcon={<NotInterestedOutlined />}
            onClick={handleResetToDefault}
            fullWidth
          >
            <FormattedMessage
              id="topic-font-editor.reset-to-default"
              defaultMessage="Reset to Default"
            />
          </ResetButton>
        </ResetSection>
      )}
    </FontPaneContainer>
  );
};

export default TopicFontEditor;
