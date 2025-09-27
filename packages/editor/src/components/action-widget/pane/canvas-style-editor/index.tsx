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
import ButtonGroup from '@mui/material/ButtonGroup';
import Typography from '@mui/material/Typography';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import React, { ReactElement, useState, useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { CirclePicker as ReactColorPicker } from 'react-color';
import { useTheme } from '@mui/material/styles';
import colors from '../color-picker/colors.json';

export interface CanvasStyle {
  backgroundColor: string;
  backgroundPattern: 'solid' | 'grid' | 'dots' | 'none';
  gridSize: number;
  gridColor: string;
}

type CanvasStyleEditorProps = {
  closeModal: () => void;
  initialStyle?: CanvasStyle;
  onStyleChange: (style: CanvasStyle) => void;
};

const CanvasStyleEditor = (props: CanvasStyleEditorProps): ReactElement => {
  const theme = useTheme();
  const defaultStyle: CanvasStyle = {
    backgroundColor: '#f2f2f2',
    backgroundPattern: 'solid',
    gridSize: 50,
    gridColor: '#ebe9e7',
  };

  // Use initialStyle if provided, otherwise fall back to default
  const [style, setStyle] = useState<CanvasStyle>(props.initialStyle || defaultStyle);
  const [showBackgroundColorPicker, setShowBackgroundColorPicker] = useState(false);
  const [showGridColorPicker, setShowGridColorPicker] = useState(false);

  // Refs for color picker buttons
  const backgroundColorButtonRef = useRef<HTMLDivElement>(null);
  const gridColorButtonRef = useRef<HTMLDivElement>(null);

  const handlePatternChange = (
    event: React.MouseEvent<HTMLElement>,
    newPattern: CanvasStyle['backgroundPattern'],
  ) => {
    if (newPattern !== null) {
      const newStyle = { ...style, backgroundPattern: newPattern };
      setStyle(newStyle);
      props.onStyleChange(newStyle);
    }
  };

  const handleGridSizeChange = (event: React.MouseEvent<HTMLElement>, newGridSize: number) => {
    const newStyle = { ...style, gridSize: newGridSize };
    setStyle(newStyle);
    props.onStyleChange(newStyle);
  };

  const applyStyle = () => {
    props.onStyleChange(style);
    props.closeModal();
  };

  const resetToDefault = () => {
    setStyle(defaultStyle);
    props.onStyleChange(defaultStyle);
  };

  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        width: '430px',
        maxHeight: '60vh',
        overflowY: 'auto',
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        zIndex: 1600,
        position: 'relative',
      }}
    >
      {/* Background Pattern */}
      <Box
        component="fieldset"
        sx={{
          mb: 2,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '8px',
          p: 1.5,
          backgroundColor: theme.palette.background.default,
          position: 'relative',
        }}
      >
        <Typography
          component="legend"
          sx={{
            px: 1,
            backgroundColor: theme.palette.background.default,
          }}
        >
          <FormattedMessage id="canvas-style.background-pattern" defaultMessage="Pattern" />
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Background Color Picker */}
          <Tooltip
            title={
              <FormattedMessage
                id="canvas-style.background-color"
                defaultMessage="Background Color"
              />
            }
            arrow
          >
            <Box
              ref={backgroundColorButtonRef}
              sx={{
                width: '40px',
                height: '40px',
                backgroundColor: style.backgroundColor,
                border: `2px solid ${theme.palette.divider}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                boxShadow:
                  theme.palette.mode === 'dark'
                    ? '0 2px 4px rgba(0,0,0,0.3)'
                    : '0 2px 4px rgba(0,0,0,0.1)',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  boxShadow:
                    theme.palette.mode === 'dark'
                      ? '0 4px 8px rgba(0,0,0,0.4)'
                      : '0 4px 8px rgba(0,0,0,0.15)',
                  transform: 'scale(1.05)',
                },
              }}
              onClick={() => setShowBackgroundColorPicker(!showBackgroundColorPicker)}
            />
          </Tooltip>

          <ButtonGroup
            variant="outlined"
            aria-label="background pattern selection"
            sx={{ flex: 1 }}
          >
            <Button
              variant={style.backgroundPattern === 'solid' ? 'contained' : 'outlined'}
              onClick={(event) => handlePatternChange(event, 'solid')}
              sx={{ flex: 1 }}
            >
              <FormattedMessage id="canvas-style.pattern-solid" defaultMessage="Solid" />
            </Button>
            <Button
              variant={style.backgroundPattern === 'grid' ? 'contained' : 'outlined'}
              onClick={(event) => handlePatternChange(event, 'grid')}
              sx={{
                flex: 1,
                backgroundImage:
                  style.backgroundPattern === 'grid'
                    ? 'none'
                    : `linear-gradient(90deg, #ccc 1px, transparent 1px), linear-gradient(0deg, #ccc 1px, transparent 1px)`,
                backgroundSize: '8px 8px',
              }}
            >
              <FormattedMessage id="canvas-style.pattern-grid" defaultMessage="Grid" />
            </Button>
            <Button
              variant={style.backgroundPattern === 'dots' ? 'contained' : 'outlined'}
              onClick={(event) => handlePatternChange(event, 'dots')}
              sx={{
                flex: 1,
                backgroundImage:
                  style.backgroundPattern === 'dots'
                    ? 'none'
                    : `radial-gradient(circle, #ccc 1px, transparent 1px)`,
                backgroundSize: '8px 8px',
              }}
            >
              <FormattedMessage id="canvas-style.pattern-dots" defaultMessage="Dots" />
            </Button>
            <Button
              variant={style.backgroundPattern === 'none' ? 'contained' : 'outlined'}
              onClick={(event) => handlePatternChange(event, 'none')}
              sx={{ flex: 1 }}
            >
              <FormattedMessage id="canvas-style.pattern-none" defaultMessage="None" />
            </Button>
          </ButtonGroup>
        </Box>

        <Popover
          open={showBackgroundColorPicker}
          anchorEl={backgroundColorButtonRef.current}
          onClose={() => setShowBackgroundColorPicker(false)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          sx={{ zIndex: 1400 }}
        >
          <Box
            sx={{
              p: 2,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <ReactColorPicker
              color={style.backgroundColor}
              onChangeComplete={(color: { hex: string }) => {
                const newStyle = { ...style, backgroundColor: color.hex };
                setStyle(newStyle);
                props.onStyleChange(newStyle);
                setShowBackgroundColorPicker(false);
              }}
              colors={colors}
              width={280}
              circleSpacing={12}
              circleSize={24}
            />
          </Box>
        </Popover>
      </Box>

      {/* Grid Style (only shown for grid and dots) */}
      {(style.backgroundPattern === 'grid' || style.backgroundPattern === 'dots') && (
        <Box
          component="fieldset"
          sx={{
            mb: 2,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '8px',
            p: 1.5,
            backgroundColor: theme.palette.background.default,
            position: 'relative',
          }}
        >
          <Typography
            component="legend"
            sx={{
              px: 1,
              backgroundColor: theme.palette.background.default,
            }}
          >
            <FormattedMessage id="canvas-style.grid-style" defaultMessage="Grid Style" />
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Grid Color Picker */}
            <Tooltip
              title={<FormattedMessage id="canvas-style.grid-color" defaultMessage="Grid Color" />}
              arrow
            >
              <Box
                ref={gridColorButtonRef}
                sx={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: style.gridColor,
                  border: `2px solid ${theme.palette.divider}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  boxShadow:
                    theme.palette.mode === 'dark'
                      ? '0 2px 4px rgba(0,0,0,0.3)'
                      : '0 2px 4px rgba(0,0,0,0.1)',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    boxShadow:
                      theme.palette.mode === 'dark'
                        ? '0 4px 8px rgba(0,0,0,0.4)'
                        : '0 4px 8px rgba(0,0,0,0.15)',
                    transform: 'scale(1.05)',
                  },
                }}
                onClick={() => setShowGridColorPicker(!showGridColorPicker)}
              />
            </Tooltip>

            <ButtonGroup variant="outlined" aria-label="grid style selection" sx={{ flex: 1 }}>
              <Button
                variant={style.gridSize === 15 ? 'contained' : 'outlined'}
                onClick={(event) => handleGridSizeChange(event, 15)}
                sx={{ flex: 1 }}
              >
                XS
              </Button>
              <Button
                variant={style.gridSize === 25 ? 'contained' : 'outlined'}
                onClick={(event) => handleGridSizeChange(event, 25)}
                sx={{ flex: 1 }}
              >
                S
              </Button>
              <Button
                variant={style.gridSize === 50 ? 'contained' : 'outlined'}
                onClick={(event) => handleGridSizeChange(event, 50)}
                sx={{ flex: 1 }}
              >
                M
              </Button>
              <Button
                variant={style.gridSize === 75 ? 'contained' : 'outlined'}
                onClick={(event) => handleGridSizeChange(event, 75)}
                sx={{ flex: 1 }}
              >
                L
              </Button>
              <Button
                variant={style.gridSize === 100 ? 'contained' : 'outlined'}
                onClick={(event) => handleGridSizeChange(event, 100)}
                sx={{ flex: 1 }}
              >
                XL
              </Button>
            </ButtonGroup>
          </Box>
        </Box>
      )}

      <Popover
        open={showGridColorPicker}
        anchorEl={gridColorButtonRef.current}
        onClose={() => setShowGridColorPicker(false)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{ zIndex: 1400 }}
      >
        <Box
          sx={{
            p: 2,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <ReactColorPicker
            color={style.gridColor}
            onChangeComplete={(color: { hex: string }) => {
              const newStyle = { ...style, gridColor: color.hex };
              setStyle(newStyle);
              props.onStyleChange(newStyle);
              setShowGridColorPicker(false);
            }}
            colors={colors}
            width={280}
            circleSpacing={12}
            circleSize={24}
          />
        </Box>
      </Popover>

      {/* Actions */}
      <Box component="span" justifyContent="flex-end" display="flex" sx={{ pt: 1 }}>
        <Button color="primary" variant="outlined" onClick={applyStyle} sx={{ mr: 1 }} size="small">
          <FormattedMessage id="action.accept" defaultMessage="Accept" />
        </Button>
        <Button color="secondary" variant="outlined" onClick={resetToDefault} size="small">
          <FormattedMessage id="action.delete" defaultMessage="Delete" />
        </Button>
      </Box>
    </Box>
  );
};

export default CanvasStyleEditor;
