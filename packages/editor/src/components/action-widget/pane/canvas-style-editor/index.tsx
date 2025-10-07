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
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import GridOnIcon from '@mui/icons-material/GridOn';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import NotInterestedOutlined from '@mui/icons-material/NotInterestedOutlined';
import { FormattedMessage } from 'react-intl';
import { styled } from '@mui/material/styles';
import ColorPicker from '../color-picker';
import NodeProperty from '../../../../classes/model/node-property';

export interface CanvasStyle {
  backgroundColor?: string;
  backgroundPattern: 'solid' | 'grid' | 'dots' | 'none';
  gridSize: number;
  gridColor?: string;
}

type CanvasStyleEditorProps = {
  closeModal: () => void;
  initialStyle?: Partial<CanvasStyle>;
  onStyleChange: (style: Partial<CanvasStyle>) => void;
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
  const defaultStyle: CanvasStyle = {
    backgroundColor: '#f2f2f2',
    backgroundPattern: 'solid',
    gridSize: 50,
    gridColor: '#ebe9e7',
  };

  const [style, setStyle] = useState<CanvasStyle>({
    ...defaultStyle,
    ...(props.initialStyle || {}),
  });

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
    getValue: () => style.gridColor,
    setValue: (color: string | undefined) => {
      const newStyle = { ...style, gridColor: color };
      setStyle(newStyle);
      props.onStyleChange(newStyle);
    },
  };

  const preventClose = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
  };

  const handlePatternChange = (newPattern: CanvasStyle['backgroundPattern']) => {
    const newStyle = { ...style, backgroundPattern: newPattern };
    setStyle(newStyle);
    props.onStyleChange(newStyle);
  };

  const handleGridSizeChange = (newGridSize: number) => {
    const newStyle = { ...style, gridSize: newGridSize };
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

      {/* Background Color */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.75rem', mb: 1 }}>
          <FormattedMessage id="canvas-style.background-color" defaultMessage="Background Color" />
        </Typography>
        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
          <ColorPicker closeModal={preventClose} colorModel={backgroundColorModel} />
        </Box>
      </Box>

      {/* Background Pattern */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.75rem', mb: 1 }}>
          <FormattedMessage
            id="canvas-style.background-pattern"
            defaultMessage="Background Pattern"
          />
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
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
              <MoreHorizIcon />
            </ActionButton>
          </Tooltip>
          <Tooltip
            title={<FormattedMessage id="canvas-style.pattern-none" defaultMessage="None" />}
          >
            <ActionButton
              selected={style.backgroundPattern === 'none'}
              onClick={() => handlePatternChange('none')}
            >
              <NotInterestedOutlined />
            </ActionButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Grid Settings - Only shown for grid and dots */}
      {(style.backgroundPattern === 'grid' || style.backgroundPattern === 'dots') && (
        <>
          {/* Grid Color */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.75rem', mb: 1 }}>
              <FormattedMessage id="canvas-style.grid-color" defaultMessage="Grid Color" />
            </Typography>
            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
              <ColorPicker closeModal={preventClose} colorModel={gridColorModel} />
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
                  <FormattedMessage id="canvas-style.grid-size-xs" defaultMessage="Extra Small" />
                }
              >
                <GridSizeButton
                  selected={style.gridSize === 15}
                  onClick={() => handleGridSizeChange(15)}
                >
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 600 }}>XS</Typography>
                </GridSizeButton>
              </Tooltip>
              <Tooltip
                title={<FormattedMessage id="canvas-style.grid-size-s" defaultMessage="Small" />}
              >
                <GridSizeButton
                  selected={style.gridSize === 25}
                  onClick={() => handleGridSizeChange(25)}
                >
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 600 }}>S</Typography>
                </GridSizeButton>
              </Tooltip>
              <Tooltip
                title={<FormattedMessage id="canvas-style.grid-size-m" defaultMessage="Medium" />}
              >
                <GridSizeButton
                  selected={style.gridSize === 50}
                  onClick={() => handleGridSizeChange(50)}
                >
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 600 }}>M</Typography>
                </GridSizeButton>
              </Tooltip>
              <Tooltip
                title={<FormattedMessage id="canvas-style.grid-size-l" defaultMessage="Large" />}
              >
                <GridSizeButton
                  selected={style.gridSize === 75}
                  onClick={() => handleGridSizeChange(75)}
                >
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 600 }}>L</Typography>
                </GridSizeButton>
              </Tooltip>
              <Tooltip
                title={
                  <FormattedMessage id="canvas-style.grid-size-xl" defaultMessage="Extra Large" />
                }
              >
                <GridSizeButton
                  selected={style.gridSize === 100}
                  onClick={() => handleGridSizeChange(100)}
                >
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 600 }}>XL</Typography>
                </GridSizeButton>
              </Tooltip>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default CanvasStyleEditor;
