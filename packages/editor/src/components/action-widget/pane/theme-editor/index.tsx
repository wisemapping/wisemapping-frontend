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
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import React, { ReactElement, useState, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import NodeProperty from '../../../../classes/model/node-property';
import { ThemeType } from '@wisemapping/mindplot';
import {
  OptionCard,
  OptionCardContent,
  OptionChooserContent,
  OptionChooserDescription,
  OptionChooserDialog,
  OptionDescription,
  OptionList,
  OptionTitle,
} from '../shared/StyledOptionChooser';

const ThemeEditor = (props: {
  closeModal: () => void;
  themeModel: NodeProperty<ThemeType>;
}): ReactElement => {
  const [theme, setTheme] = useState(props.themeModel.getValue());
  const intl = useIntl();

  // Memoize themes array to avoid recreating and calling intl.formatMessage on every render
  const themes = useMemo(
    () => [
      {
        id: 'prism' as ThemeType,
        name: intl.formatMessage({ id: 'theme.summer.name', defaultMessage: 'Summer' }),
        description: intl.formatMessage({
          id: 'theme.summer.description',
          defaultMessage:
            'Bright and vibrant orange theme. Great for creative projects and energetic presentations.',
        }),
      },
      {
        id: 'aurora' as ThemeType,
        name: intl.formatMessage({ id: 'theme.aurora.name', defaultMessage: 'Aurora' }),
        description: intl.formatMessage({
          id: 'theme.aurora.description',
          defaultMessage:
            'Neon-inspired gradient theme with glow effects, bold typography, and high-contrast connectors designed for immersive storytelling.',
        }),
      },
      {
        id: 'retro' as ThemeType,
        name: intl.formatMessage({ id: 'theme.retro.name', defaultMessage: '80s Retro Night' }),
        description: intl.formatMessage({
          id: 'theme.retro.description',
          defaultMessage:
            '80s synthwave palette with neon rims, chrome gradients, and grid-lined canvases inspired by retro night parties.',
        }),
      },
      {
        id: 'sunrise' as ThemeType,
        name: intl.formatMessage({ id: 'theme.sunrise.name', defaultMessage: 'Sunrise' }),
        description: intl.formatMessage({
          id: 'theme.sunrise.description',
          defaultMessage:
            'Sunrise theme with light/dark mode variants. Enhanced colors and contrast for better readability.',
        }),
      },
      {
        id: 'ocean' as ThemeType,
        name: intl.formatMessage({ id: 'theme.ocean.name', defaultMessage: 'Ocean' }),
        description: intl.formatMessage({
          id: 'theme.ocean.description',
          defaultMessage:
            'Ocean-inspired blue theme with light/dark variants. Calm and professional colors perfect for business and creative projects.',
        }),
      },
      {
        id: 'classic' as ThemeType,
        name: intl.formatMessage({ id: 'theme.classic.name', defaultMessage: 'Classic' }),
        description: intl.formatMessage({
          id: 'theme.classic.description',
          defaultMessage:
            'Clean and professional design with blue accents. Perfect for business presentations and formal documents.',
        }),
      },
      {
        id: 'robot' as ThemeType,
        name: intl.formatMessage({ id: 'theme.robot.name', defaultMessage: 'Robot' }),
        description: intl.formatMessage({
          id: 'theme.robot.description',
          defaultMessage:
            'Tech-inspired green theme. Perfect for technical documentation and futuristic presentations.',
        }),
      },
    ],
    [intl],
  );

  const handleThemeSelect = (selectedTheme: ThemeType) => {
    setTheme(selectedTheme);
  };

  const handleAccept = () => {
    const setValue = props.themeModel.setValue;
    if (setValue) {
      setValue(theme);
    }
    props.closeModal();
  };

  const handleCancel = () => {
    // Reset to original theme
    setTheme(props.themeModel.getValue());
    props.closeModal();
  };

  return (
    <OptionChooserDialog open={true} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        <FormattedMessage id="theme-editor.title" defaultMessage="Choose Theme" />
      </DialogTitle>
      <OptionChooserContent dividers>
        <OptionChooserDescription variant="body2">
          <FormattedMessage
            id="theme-editor.description"
            defaultMessage="A theme defines the visual style of your mind map, including colors, fonts, and overall appearance. Choose a theme that best fits your content and audience."
          />
        </OptionChooserDescription>
        <OptionList>
          {themes.map((themeOption) => (
            <OptionCard
              key={themeOption.id}
              selected={theme === themeOption.id}
              onClick={() => handleThemeSelect(themeOption.id)}
            >
              <OptionCardContent>
                <OptionTitle variant="subtitle2">{themeOption.name}</OptionTitle>
                <OptionDescription variant="body2">{themeOption.description}</OptionDescription>
              </OptionCardContent>
            </OptionCard>
          ))}
        </OptionList>
      </OptionChooserContent>
      <DialogActions>
        <Button onClick={handleCancel}>
          <FormattedMessage id="theme-editor.cancel" defaultMessage="Cancel" />
        </Button>
        <Button onClick={handleAccept} variant="contained">
          <FormattedMessage id="theme-editor.accept" defaultMessage="Apply Theme" />
        </Button>
      </DialogActions>
    </OptionChooserDialog>
  );
};

export default ThemeEditor;
