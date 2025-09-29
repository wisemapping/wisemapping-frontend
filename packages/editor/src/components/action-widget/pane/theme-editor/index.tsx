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
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import React, { ReactElement, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import NodeProperty from '../../../../classes/model/node-property';
import ThemeType from '@wisemapping/mindplot/src/components/model/ThemeType';

const ThemeEditor = (props: {
  closeModal: () => void;
  themeModel: NodeProperty<ThemeType>;
}): ReactElement => {
  const [theme, setTheme] = useState(props.themeModel.getValue());
  const intl = useIntl();

  const themes = [
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
      id: 'sunrise' as ThemeType,
      name: intl.formatMessage({ id: 'theme.sunrise.name', defaultMessage: 'Sunrise' }),
      description: intl.formatMessage({
        id: 'theme.sunrise.description',
        defaultMessage:
          'Sunrise theme with light/dark mode variants. Enhanced colors and contrast for better readability.',
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
  ];

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
    <Dialog
      open={true}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '350px',
          border: '2px solid #ffa800',
          boxShadow: 'none',
        },
      }}
    >
      <DialogTitle>
        <FormattedMessage id="theme-editor.title" defaultMessage="Choose Theme" />
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.4 }}>
          <FormattedMessage
            id="theme-editor.description"
            defaultMessage="A theme defines the visual style of your mind map, including colors, fonts, and overall appearance. Choose a theme that best fits your content and audience."
          />
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {themes.map((themeOption) => (
            <Card
              key={themeOption.id}
              sx={{
                cursor: 'pointer',
                border: theme === themeOption.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                '&:hover': {
                  border: '2px solid #1976d2',
                  boxShadow: 2,
                },
              }}
              onClick={() => handleThemeSelect(themeOption.id)}
            >
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography
                  variant="subtitle2"
                  component="div"
                  sx={{ fontWeight: 'bold', mb: 0.25, fontSize: '0.875rem' }}
                >
                  {themeOption.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.2, fontSize: '0.75rem' }}
                >
                  {themeOption.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>
          <FormattedMessage id="theme-editor.cancel" defaultMessage="Cancel" />
        </Button>
        <Button onClick={handleAccept} variant="contained">
          <FormattedMessage id="theme-editor.accept" defaultMessage="Apply Theme" />
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ThemeEditor;
