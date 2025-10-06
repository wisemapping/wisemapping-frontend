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
import { Tabs, Tab, Box, Typography, ButtonGroup, Button, IconButton } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { styled } from '@mui/material/styles';

// Icons
import SquareOutlinedIcon from '@mui/icons-material/SquareOutlined';
import CheckBoxOutlineBlankOutlinedIcon from '@mui/icons-material/CheckBoxOutlineBlankOutlined';
import HorizontalRuleOutlinedIcon from '@mui/icons-material/HorizontalRuleOutlined';
import RadioButtonUncheckedOutlinedIcon from '@mui/icons-material/RadioButtonUncheckedOutlined';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import NotInterestedOutlined from '@mui/icons-material/NotInterestedOutlined';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import GestureOutlined from '@mui/icons-material/GestureOutlined';
import ShortcutIconOutlined from '@mui/icons-material/ShortcutOutlined';
import SwapCallsOutlined from '@mui/icons-material/SwapCallsOutlined';
import PolylineOutlined from '@mui/icons-material/PolylineOutlined';
import TimelineOutined from '@mui/icons-material/TimelineOutlined';
import ShareOutlined from '@mui/icons-material/ShareOutlined';

import NodeProperty from '../../../../classes/model/node-property';
import { TopicShapeType } from '@wisemapping/mindplot/src/components/model/INodeModel';
import { LineType } from '@wisemapping/mindplot/src/components/ConnectionLine';
import colors from '../color-picker/colors.json';

// Styled components

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: '1px solid #e0e0e0',
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 500,
    minHeight: '32px',
    fontSize: '0.8rem',
    '&.Mui-selected': {
      color: theme.palette.primary.main,
    },
  },
  '& .MuiTabs-indicator': {
    height: '2px',
    borderRadius: '1px',
  },
}));

const ColorGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gap: '2px',
  marginBottom: '8px',
});

const ColorSwatch = styled(Box)<{ color?: string; selected?: boolean }>(
  ({ color, selected, theme }) => ({
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: color,
    border: selected ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    '&:hover': {
      transform: 'scale(1.1)',
      transition: 'transform 0.2s ease',
    },
  }),
);

const ShapeGrid = styled(Box)({
  display: 'flex',
  gap: '6px',
  marginTop: '8px',
});

const ShapeButton = styled(IconButton)<{ selected?: boolean }>(({ selected, theme }) => ({
  width: '24px',
  height: '24px',
  border: selected ? `2px solid ${theme.palette.primary.main}` : '2px solid #e0e0e0',
  borderRadius: '4px',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
}));

const ConnectionGrid = styled(Box)({
  display: 'flex',
  gap: '6px',
});

const ConnectionButton = styled(Button)<{ selected?: boolean }>(({ selected, theme }) => ({
  justifyContent: 'flex-start',
  padding: '6px 8px',
  border: selected ? `2px solid ${theme.palette.primary.main}` : '2px solid #e0e0e0',
  borderRadius: '4px',
  textTransform: 'none',
  minHeight: '24px',
  fontSize: '0.7rem',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
}));

interface TopicStyleEditorProps {
  closeModal: () => void;
  // Topic styling models
  topicShapeModel: NodeProperty<TopicShapeType>;
  topicFillColorModel: NodeProperty<string | undefined>;
  topicBorderColorModel: NodeProperty<string | undefined>;
  // Connection styling models
  connectionStyleModel: NodeProperty<LineType>;
  connectionColorModel: NodeProperty<string | undefined>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`styling-tabpanel-${index}`}
      aria-labelledby={`styling-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
    </div>
  );
}

const TopicStyleEditor = (props: TopicStyleEditorProps): ReactElement => {
  const [activeTab, setActiveTab] = useState(0);

  const intl = useIntl();

  // Using the existing color palette from the color picker component
  const themeColors = colors;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleShapeChange = (shapeType: TopicShapeType) => {
    const setValue = props.topicShapeModel.setValue;
    if (setValue) {
      setValue(shapeType);
    }
  };

  const handleFillColorChange = (color: string | undefined) => {
    const setValue = props.topicFillColorModel.setValue;
    if (setValue) {
      setValue(color);
    }
  };

  const handleBorderColorChange = (color: string | undefined) => {
    const setValue = props.topicBorderColorModel.setValue;
    if (setValue) {
      setValue(color);
    }
  };

  const handleConnectionStyleChange = (lineType: LineType) => {
    const setValue = props.connectionStyleModel.setValue;
    if (setValue) {
      setValue(lineType);
    }
  };

  const handleConnectionColorChange = (color: string | undefined) => {
    const setValue = props.connectionColorModel.setValue;
    if (setValue) {
      setValue(color);
    }
  };

  const connectionStyles = [
    {
      type: LineType.THICK_CURVED,
      icon: <GestureOutlined />,
      label: 'Thick Curved',
    },
    {
      type: LineType.ARC,
      icon: <ShortcutIconOutlined />,
      label: 'Arc',
    },
    {
      type: LineType.THIN_CURVED,
      icon: <SwapCallsOutlined />,
      label: 'Thin Curved',
    },
    {
      type: LineType.POLYLINE_MIDDLE,
      icon: <PolylineOutlined />,
      label: 'Simple Polyline',
    },
    {
      type: LineType.POLYLINE_CURVED,
      icon: <TimelineOutined />,
      label: 'Curved Polyline',
    },
  ];

  return (
    <Box sx={{ p: 1, minWidth: '150px', maxWidth: '180px', maxHeight: '400px', overflow: 'auto' }}>
      <Typography
        variant="subtitle1"
        gutterBottom
        sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 1 }}
      >
        <FormattedMessage id="unified-styling.title" defaultMessage="Style Topic & Connections" />
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <StyledTabs value={activeTab} onChange={handleTabChange} aria-label="styling tabs">
          <Tab
            label={<FormattedMessage id="unified-styling.tab.shape" defaultMessage="Shape" />}
            id="styling-tab-0"
            aria-controls="styling-tabpanel-0"
          />
          <Tab
            label={<FormattedMessage id="unified-styling.tab.border" defaultMessage="Border" />}
            id="styling-tab-1"
            aria-controls="styling-tabpanel-1"
          />
          <Tab
            label={
              <FormattedMessage id="unified-styling.tab.connector" defaultMessage="Connector" />
            }
            id="styling-tab-2"
            aria-controls="styling-tabpanel-2"
          />
        </StyledTabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        {/* Shape Tab */}
        <Box>
          <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.75rem', mb: 0.5 }}>
            <FormattedMessage id="unified-styling.theme-colors" defaultMessage="Theme Colors" />
          </Typography>
          <ColorGrid>
            {/* No color option */}
            <ColorSwatch
              color="#ffffff"
              selected={props.topicFillColorModel.getValue() === undefined}
              onClick={() => handleFillColorChange(undefined)}
              sx={{
                border: '2px solid #e0e0e0',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '14px',
                  height: '2px',
                  backgroundColor: '#ff4444',
                  transform: 'translate(-50%, -50%) rotate(45deg)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '14px',
                  height: '2px',
                  backgroundColor: '#ff4444',
                  transform: 'translate(-50%, -50%) rotate(-45deg)',
                },
              }}
            />
            {themeColors.map((color, index) => (
              <ColorSwatch
                key={index}
                color={color}
                selected={props.topicFillColorModel.getValue() === color}
                onClick={() => handleFillColorChange(color)}
              />
            ))}
          </ColorGrid>

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 1, fontSize: '0.75rem', mb: 0.5 }}>
            <FormattedMessage
              id="unified-styling.shape-selection"
              defaultMessage="Shape Selection"
            />
          </Typography>
          <ShapeGrid>
            <ShapeButton
              selected={props.topicShapeModel.getValue() === 'none'}
              onClick={() => handleShapeChange('none')}
            >
              <NotInterestedOutlined />
            </ShapeButton>
            <ShapeButton
              selected={props.topicShapeModel.getValue() === 'line'}
              onClick={() => handleShapeChange('line')}
            >
              <HorizontalRuleOutlinedIcon />
            </ShapeButton>
            <ShapeButton
              selected={props.topicShapeModel.getValue() === 'rectangle'}
              onClick={() => handleShapeChange('rectangle')}
            >
              <SquareOutlinedIcon />
            </ShapeButton>
            <ShapeButton
              selected={props.topicShapeModel.getValue() === 'rounded rectangle'}
              onClick={() => handleShapeChange('rounded rectangle')}
            >
              <CheckBoxOutlineBlankOutlinedIcon />
            </ShapeButton>
            <ShapeButton
              selected={props.topicShapeModel.getValue() === 'elipse'}
              onClick={() => handleShapeChange('elipse')}
            >
              <RadioButtonUncheckedOutlinedIcon />
            </ShapeButton>
          </ShapeGrid>
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {/* Border Tab */}
        <Box>
          <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.75rem', mb: 0.5 }}>
            <FormattedMessage id="unified-styling.border-color" defaultMessage="Border Color" />
          </Typography>
          <ColorGrid>
            {/* No color option */}
            <ColorSwatch
              color="#ffffff"
              selected={props.topicBorderColorModel.getValue() === undefined}
              onClick={() => handleBorderColorChange(undefined)}
              sx={{
                border: '2px solid #e0e0e0',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '14px',
                  height: '2px',
                  backgroundColor: '#ff4444',
                  transform: 'translate(-50%, -50%) rotate(45deg)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '14px',
                  height: '2px',
                  backgroundColor: '#ff4444',
                  transform: 'translate(-50%, -50%) rotate(-45deg)',
                },
              }}
            />
            {themeColors.map((color, index) => (
              <ColorSwatch
                key={index}
                color={color}
                selected={props.topicBorderColorModel.getValue() === color}
                onClick={() => handleBorderColorChange(color)}
              />
            ))}
          </ColorGrid>
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {/* Connector Tab */}
        <Box>
          <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.75rem', mb: 0.5 }}>
            <FormattedMessage
              id="unified-styling.connector-color"
              defaultMessage="Connector Color"
            />
          </Typography>
          <ColorGrid>
            {/* No color option */}
            <ColorSwatch
              color="#ffffff"
              selected={props.connectionColorModel.getValue() === undefined}
              onClick={() => handleConnectionColorChange(undefined)}
              sx={{
                border: '2px solid #e0e0e0',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '14px',
                  height: '2px',
                  backgroundColor: '#ff4444',
                  transform: 'translate(-50%, -50%) rotate(45deg)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '14px',
                  height: '2px',
                  backgroundColor: '#ff4444',
                  transform: 'translate(-50%, -50%) rotate(-45deg)',
                },
              }}
            />
            {themeColors.map((color, index) => (
              <ColorSwatch
                key={index}
                color={color}
                selected={props.connectionColorModel.getValue() === color}
                onClick={() => handleConnectionColorChange(color)}
              />
            ))}
          </ColorGrid>

          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{ mt: 1.5, fontSize: '0.75rem', mb: 0.5 }}
          >
            <FormattedMessage
              id="unified-styling.connector-style"
              defaultMessage="Connector Style"
            />
          </Typography>
          <ConnectionGrid>
            {connectionStyles.map((style) => (
              <ShapeButton
                key={style.type}
                selected={props.connectionStyleModel.getValue() === style.type}
                onClick={() => handleConnectionStyleChange(style.type)}
              >
                {style.icon}
              </ShapeButton>
            ))}
          </ConnectionGrid>
        </Box>
      </TabPanel>
    </Box>
  );
};

export default TopicStyleEditor;
