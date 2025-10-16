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

import React, { ReactElement, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CloseIcon from '@mui/icons-material/Close';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import GridOnIcon from '@mui/icons-material/GridOn';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import NotInterestedOutlined from '@mui/icons-material/NotInterestedOutlined';
import { FormattedMessage } from 'react-intl';
import { styled } from '@mui/material/styles';
import ColorPicker from '../color-picker';
import NodeProperty from '../../../../classes/model/node-property';
import type { CanvasStyleType, BackgroundPatternType } from '@wisemapping/mindplot';

export type { CanvasStyleType as CanvasStyle, BackgroundPatternType };

type CanvasStyleEditorProps = {
  closeModal: () => void;
  initialStyle?: Partial<CanvasStyleType>;
  onStyleChange: (style: Partial<CanvasStyleType>) => void;
};

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

const GridSizeButton = styled(IconButton)<{ selected?: boolean }>(({ selected, theme }) => ({
  padding: '6px',
  width: '32px',
  height: '32px',
  border: selected ? `2px solid ${theme.palette.primary.main}` : '2px solid #e0e0e0',
  borderRadius: '4px',
  fontSize: '0.7rem',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
}));

const CanvasStyleEditor = (props: CanvasStyleEditorProps): ReactElement => {
  const defaultStyle: CanvasStyleType = {
    backgroundColor: '#f2f2f2',
    backgroundPattern: 'solid',
    backgroundGridSize: 50,
    backgroundGridColor: '#ebe9e7',
  };

  // Normalize initialStyle: if backgroundPattern is undefined, ensure backgroundGridSize and backgroundGridColor are also undefined
  const normalizedInitialStyle = props.initialStyle
    ? {
        ...props.initialStyle,
        ...(props.initialStyle.backgroundPattern === undefined && {
          backgroundGridSize: undefined,
          backgroundGridColor: undefined,
        }),
      }
    : {};

  const [style, setStyle] = useState<CanvasStyleType>({
    ...defaultStyle,
    ...normalizedInitialStyle,
  });

  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Create NodeProperty adapters for color pickers
  const backgroundColorModel: NodeProperty<string | undefined> = {
    getValue: () => style.backgroundColor,
    setValue: (color: string | undefined) => {
      const newStyle = { ...style, backgroundColor: color };
      setStyle(newStyle);
      props.onStyleChange(newStyle);
    },
  };

  const gridColorModel: NodeProperty<string | undefined> = {
    getValue: () => style.backgroundGridColor,
    setValue: (color: string | undefined) => {
      const newStyle = { ...style, backgroundGridColor: color };
      setStyle(newStyle);
      props.onStyleChange(newStyle);
    },
  };

  const preventClose = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
  };

  const handlePatternChange = (newPattern: BackgroundPatternType) => {
    const newStyle = { ...style, backgroundPattern: newPattern };

    // For grid and dots patterns, ensure default grid size and color are set
    if ((newPattern === 'grid' || newPattern === 'dots') && !style.backgroundGridSize) {
      newStyle.backgroundGridSize = 50; // Default to Medium
    }
    if ((newPattern === 'grid' || newPattern === 'dots') && !style.backgroundGridColor) {
      newStyle.backgroundGridColor = '#ebe9e7'; // Default grid color
    }

    setStyle(newStyle);
    props.onStyleChange(newStyle);
  };

  const handlePatternNone = () => {
    const newStyle = {
      ...style,
      backgroundColor: undefined,
      backgroundPattern: undefined,
      backgroundGridSize: undefined,
      backgroundGridColor: undefined,
    };
    setStyle(newStyle);
    props.onStyleChange(newStyle);
  };

  const handleGridSizeChange = (newGridSize: number) => {
    const newStyle = { ...style, backgroundGridSize: newGridSize };
    setStyle(newStyle);
    props.onStyleChange(newStyle);
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

      {/* Background Style - Always visible */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.75rem', mb: 1 }}>
          <FormattedMessage id="canvas-style.background-style" defaultMessage="Background Style" />
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Tooltip
            title={
              <FormattedMessage
                id="canvas-style.pattern-default-tooltip"
                defaultMessage="Default - All styles will be automatically selected based on the theme"
              />
            }
          >
            <ActionButton
              selected={style.backgroundPattern === undefined}
              onClick={handlePatternNone}
            >
              <NotInterestedOutlined />
            </ActionButton>
          </Tooltip>
          <Tooltip
            title={<FormattedMessage id="canvas-style.pattern-solid" defaultMessage="Solid" />}
          >
            <ActionButton
              selected={style.backgroundPattern === 'solid'}
              onClick={() => handlePatternChange('solid')}
            >
              <CheckBoxOutlineBlankIcon />
            </ActionButton>
          </Tooltip>
          <Tooltip
            title={<FormattedMessage id="canvas-style.pattern-grid" defaultMessage="Grid" />}
          >
            <ActionButton
              selected={style.backgroundPattern === 'grid'}
              onClick={() => handlePatternChange('grid')}
            >
              <GridOnIcon />
            </ActionButton>
          </Tooltip>
          <Tooltip
            title={<FormattedMessage id="canvas-style.pattern-dots" defaultMessage="Dots" />}
          >
            <ActionButton
              selected={style.backgroundPattern === 'dots'}
              onClick={() => handlePatternChange('dots')}
            >
              <FiberManualRecordIcon sx={{ fontSize: '8px' }} />
            </ActionButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Tabs - Only shown when pattern is not default */}
      {style.backgroundPattern !== undefined && (
        <>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              minHeight: '36px',
              mb: 2,
              '& .MuiTabs-indicator': {
                height: 2,
              },
              '& .MuiTab-root': {
                minHeight: '36px',
                fontSize: '0.75rem',
                py: 0.5,
                textTransform: 'none',
              },
            }}
          >
            <Tab label={<FormattedMessage id="canvas-style.tab-color" defaultMessage="Color" />} />
            <Tab
              label={<FormattedMessage id="canvas-style.tab-grid" defaultMessage="Grid Color" />}
              disabled={style.backgroundPattern !== 'grid' && style.backgroundPattern !== 'dots'}
            />
          </Tabs>

          {/* Tab 0: Background Color */}
          {activeTab === 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.75rem', mb: 1 }}>
                <FormattedMessage
                  id="canvas-style.background-color"
                  defaultMessage="Background Color"
                />
              </Typography>
              <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                <ColorPicker
                  closeModal={preventClose}
                  colorModel={backgroundColorModel}
                  hideNoneOption={true}
                />
              </Box>
            </Box>
          )}

          {/* Tab 1: Grid Color */}
          {activeTab === 1 &&
            (style.backgroundPattern === 'grid' || style.backgroundPattern === 'dots') && (
              <>
                {/* Grid Color */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.75rem', mb: 1 }}>
                    <FormattedMessage id="canvas-style.grid-color" defaultMessage="Grid Color" />
                  </Typography>
                  <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                    <ColorPicker
                      closeModal={preventClose}
                      colorModel={gridColorModel}
                      hideNoneOption={true}
                    />
                  </Box>
                </Box>

                {/* Grid Size */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.75rem', mb: 1 }}>
                    <FormattedMessage id="canvas-style.grid-style" defaultMessage="Grid Size" />
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Tooltip
                      title={
                        <FormattedMessage
                          id="canvas-style.grid-size-xs"
                          defaultMessage="Extra Small"
                        />
                      }
                    >
                      <GridSizeButton
                        selected={style.backgroundGridSize === 15}
                        onClick={() => handleGridSizeChange(15)}
                      >
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 600 }}>XS</Typography>
                      </GridSizeButton>
                    </Tooltip>
                    <Tooltip
                      title={
                        <FormattedMessage id="canvas-style.grid-size-s" defaultMessage="Small" />
                      }
                    >
                      <GridSizeButton
                        selected={style.backgroundGridSize === 25}
                        onClick={() => handleGridSizeChange(25)}
                      >
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 600 }}>S</Typography>
                      </GridSizeButton>
                    </Tooltip>
                    <Tooltip
                      title={
                        <FormattedMessage id="canvas-style.grid-size-m" defaultMessage="Medium" />
                      }
                    >
                      <GridSizeButton
                        selected={style.backgroundGridSize === 50}
                        onClick={() => handleGridSizeChange(50)}
                      >
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 600 }}>M</Typography>
                      </GridSizeButton>
                    </Tooltip>
                    <Tooltip
                      title={
                        <FormattedMessage id="canvas-style.grid-size-l" defaultMessage="Large" />
                      }
                    >
                      <GridSizeButton
                        selected={style.backgroundGridSize === 75}
                        onClick={() => handleGridSizeChange(75)}
                      >
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 600 }}>L</Typography>
                      </GridSizeButton>
                    </Tooltip>
                    <Tooltip
                      title={
                        <FormattedMessage
                          id="canvas-style.grid-size-xl"
                          defaultMessage="Extra Large"
                        />
                      }
                    >
                      <GridSizeButton
                        selected={style.backgroundGridSize === 100}
                        onClick={() => handleGridSizeChange(100)}
                      >
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 600 }}>XL</Typography>
                      </GridSizeButton>
                    </Tooltip>
                  </Box>
                </Box>
              </>
            )}
        </>
      )}
    </Box>
  );
};

export default CanvasStyleEditor;
