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
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { FormattedMessage } from 'react-intl';
import { StyledEditorsTabs } from '../shared/StyledTabs';
import { StyledEditorContainer } from '../shared/StyledEditorContainer';

// Icons
import SquareOutlinedIcon from '@mui/icons-material/SquareOutlined';
import CheckBoxOutlineBlankOutlinedIcon from '@mui/icons-material/CheckBoxOutlineBlankOutlined';
import HorizontalRuleOutlinedIcon from '@mui/icons-material/HorizontalRuleOutlined';
import RadioButtonUncheckedOutlinedIcon from '@mui/icons-material/RadioButtonUncheckedOutlined';
import NotInterestedOutlined from '@mui/icons-material/NotInterestedOutlined';
import BorderClearOutlinedIcon from '@mui/icons-material/BorderClearOutlined';

import NodeProperty from '../../../../classes/model/node-property';
import { TopicShapeType } from '@wisemapping/mindplot/src/components/model/INodeModel';
import { LineType } from '@wisemapping/mindplot/src/components/ConnectionLine';
import { StrokeStyle } from '@wisemapping/mindplot/src/components/model/RelationshipModel';
import ColorPicker from '../color-picker';
import IconCollection from './IconCollection';

// Custom SVG icons for connection styles
const ThickCurvedIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 12 Q 8 6, 12 12 T 21 12"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const OrganicCurvedIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 14 Q 8 4, 12 12 Q 16 20, 21 10"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const ArcIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 16 Q 12 4, 21 16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const ThinCurvedIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 12 Q 8 8, 12 12 T 21 12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const StraightLineIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <line
      x1="3"
      y1="12"
      x2="21"
      y2="12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const CurvedPolylineIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 12 L 8 12 Q 10 12, 10 10 L 10 8 Q 10 6, 12 6 L 14 6 Q 16 6, 16 8 L 16 12 L 21 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

interface TopicStyleEditorProps {
  closeModal: () => void;
  // Topic styling models
  shapeModel: NodeProperty<TopicShapeType | undefined>;
  fillColorModel: NodeProperty<string | undefined>;
  borderColorModel: NodeProperty<string | undefined>;
  borderStyleModel: NodeProperty<StrokeStyle | undefined>;
  // Connection styling models
  connectionStyleModel: NodeProperty<LineType | undefined>;
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
      {value === index && (
        <Box
          sx={{
            pt: 1,
            pb: 1,
            px: 0,
            width: '100%',
          }}
        >
          {children}
        </Box>
      )}
    </div>
  );
}

const borderStyles = [
  {
    type: undefined,
    icon: <NotInterestedOutlined />,
    label: <FormattedMessage id="icon-collection.border.default" defaultMessage="Default" />,
    tooltip: (
      <FormattedMessage
        id="icon-collection.default-tooltip"
        defaultMessage="Default - Colors will be automatically taken based on the selected theme"
      />
    ),
  },
  {
    type: StrokeStyle.SOLID,
    icon: <HorizontalRuleOutlinedIcon />,
    label: <FormattedMessage id="icon-collection.border.solid" defaultMessage="Solid" />,
  },
  {
    type: StrokeStyle.DASHED,
    icon: <Box sx={{ fontSize: '10px', fontWeight: 700, lineHeight: 1 }}>- -</Box>,
    label: <FormattedMessage id="icon-collection.border.dashed" defaultMessage="Dashed" />,
  },
  {
    type: StrokeStyle.DOTTED,
    icon: <Box sx={{ fontSize: '10px', fontWeight: 700, lineHeight: 1 }}>· ·</Box>,
    label: <FormattedMessage id="icon-collection.border.dotted" defaultMessage="Dotted" />,
  },
];

const connectionStyles = [
  {
    type: undefined,
    icon: <NotInterestedOutlined />,
    label: <FormattedMessage id="icon-collection.connection.default" defaultMessage="Default" />,
    tooltip: (
      <FormattedMessage
        id="icon-collection.connection.default-tooltip"
        defaultMessage="Default - Connection style will be automatically selected based on the theme"
      />
    ),
  },
  {
    type: LineType.ARC,
    icon: <ArcIcon />,
    label: <FormattedMessage id="icon-collection.connection.arc" defaultMessage="Arc" />,
    tooltip: (
      <FormattedMessage
        id="icon-collection.connection.arc-tooltip"
        defaultMessage="Circular arc connection - Perfect for radial layouts and organic flow"
      />
    ),
  },
  {
    type: LineType.POLYLINE_CURVED,
    icon: <CurvedPolylineIcon />,
    label: (
      <FormattedMessage
        id="icon-collection.connection.curved-polyline"
        defaultMessage="Curved Polyline"
      />
    ),
    tooltip: (
      <FormattedMessage
        id="icon-collection.connection.curved-polyline-tooltip"
        defaultMessage="Multi-segment line with smooth corners - Best for structured layouts and clear paths"
      />
    ),
  },
  {
    type: LineType.THICK_CURVED_ORGANIC,
    icon: <OrganicCurvedIcon />,
    label: (
      <FormattedMessage
        id="icon-collection.connection.organic-curved"
        defaultMessage="Organic Curved"
      />
    ),
    tooltip: (
      <FormattedMessage
        id="icon-collection.connection.organic-curved-tooltip"
        defaultMessage="Hand-drawn style with dramatic curves - Perfect for creative and expressive mind maps"
      />
    ),
  },
  {
    type: LineType.THICK_CURVED,
    icon: <ThickCurvedIcon />,
    label: (
      <FormattedMessage
        id="icon-collection.connection.thick-curved"
        defaultMessage="Thick Curved"
      />
    ),
    tooltip: (
      <FormattedMessage
        id="icon-collection.connection.thick-curved-tooltip"
        defaultMessage="Thick curved line with smooth bezier curves - Great for emphasizing main branches"
      />
    ),
  },
  {
    type: LineType.THIN_CURVED,
    icon: <ThinCurvedIcon />,
    label: (
      <FormattedMessage id="icon-collection.connection.thin-curved" defaultMessage="Thin Curved" />
    ),
    tooltip: (
      <FormattedMessage
        id="icon-collection.connection.thin-curved-tooltip"
        defaultMessage="Thin curved line with elegant bezier curves - Ideal for detailed or dense mind maps"
      />
    ),
  },
  {
    type: LineType.POLYLINE_STRAIGHT,
    icon: <StraightLineIcon />,
    label: (
      <FormattedMessage
        id="icon-collection.connection.straight-line"
        defaultMessage="Straight Line"
      />
    ),
    tooltip: (
      <FormattedMessage
        id="icon-collection.connection.straight-line-tooltip"
        defaultMessage="Direct straight line connection - Clean and minimalist style for simple relationships"
      />
    ),
  },
];

const TopicStyleEditor = (props: TopicStyleEditorProps): ReactElement => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleShapeChange = (shapeType: TopicShapeType | StrokeStyle | LineType | undefined) => {
    const setValue = props.shapeModel.setValue;
    if (setValue) {
      setValue(shapeType as TopicShapeType | undefined);
    }
  };

  const handleBorderStyleChange = (style: TopicShapeType | StrokeStyle | LineType | undefined) => {
    const setValue = props.borderStyleModel.setValue;
    if (setValue) {
      setValue(style as StrokeStyle | undefined);
    }
  };

  const handleConnectionStyleChange = (
    lineType: TopicShapeType | StrokeStyle | LineType | undefined,
  ) => {
    const setValue = props.connectionStyleModel.setValue;
    if (setValue) {
      setValue(lineType as LineType);
    }
  };

  return (
    <StyledEditorContainer>
      <IconButton
        onClick={props.closeModal}
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
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
      <Box sx={{ borderBottom: 1, borderColor: 'divider', p: 0 }}>
        <StyledEditorsTabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="styling tabs"
          centered
        >
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
        </StyledEditorsTabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        {/* Shape Tab */}
        <Box sx={{ px: 1, py: 0, width: '100%' }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.75rem', mb: 1 }}>
            <FormattedMessage id="unified-styling.shape-type" defaultMessage="Shape Type" />
          </Typography>
          <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
            <IconCollection
              styles={[
                {
                  type: undefined,
                  icon: <NotInterestedOutlined />,
                  label: (
                    <FormattedMessage id="icon-collection.shape.default" defaultMessage="Default" />
                  ),
                  tooltip: (
                    <FormattedMessage
                      id="icon-collection.default-tooltip"
                      defaultMessage="Default - All styles will be automatically selected based on the theme"
                    />
                  ),
                },
                {
                  type: 'line',
                  icon: <HorizontalRuleOutlinedIcon />,
                  label: <FormattedMessage id="icon-collection.shape.line" defaultMessage="Line" />,
                },
                {
                  type: 'rectangle',
                  icon: <SquareOutlinedIcon />,
                  label: (
                    <FormattedMessage
                      id="icon-collection.shape.rectangle"
                      defaultMessage="Rectangle"
                    />
                  ),
                },
                {
                  type: 'rounded rectangle',
                  icon: <CheckBoxOutlineBlankOutlinedIcon />,
                  label: (
                    <FormattedMessage id="icon-collection.shape.rounded" defaultMessage="Rounded" />
                  ),
                },
                {
                  type: 'elipse',
                  icon: <RadioButtonUncheckedOutlinedIcon />,
                  label: (
                    <FormattedMessage id="icon-collection.shape.ellipse" defaultMessage="Ellipse" />
                  ),
                },
                {
                  type: 'none',
                  icon: <BorderClearOutlinedIcon />,
                  label: <FormattedMessage id="icon-collection.shape.none" defaultMessage="None" />,
                  tooltip: (
                    <FormattedMessage
                      id="icon-collection.shape.none-tooltip"
                      defaultMessage="None - No visible shape background"
                    />
                  ),
                },
              ]}
              selectedValue={props.shapeModel.getValue()}
              onSelect={handleShapeChange}
              ariaLabelSuffix=" shape"
            />
          </Box>

          {/* Style Topic Color - Only shown when shape is not default, not line, and not none */}
          {props.shapeModel.getValue() !== undefined &&
            props.shapeModel.getValue() !== 'line' &&
            props.shapeModel.getValue() !== 'none' && (
              <>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ mt: 1, fontSize: '0.75rem', mb: 1 }}
                >
                  <FormattedMessage
                    id="unified-styling.background-color"
                    defaultMessage="Background Color"
                  />
                </Typography>
                <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                  <ColorPicker
                    closeModal={() => {}}
                    colorModel={props.fillColorModel}
                    hideNoneOption={true}
                  />
                </Box>
              </>
            )}
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {/* Border Tab */}
        <Box sx={{ px: 1, py: 0, width: '100%' }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.75rem', mb: 1 }}>
            <FormattedMessage id="unified-styling.border-style" defaultMessage="Border Style" />
          </Typography>
          <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
            <IconCollection
              styles={borderStyles}
              selectedValue={props.borderStyleModel.getValue()}
              onSelect={handleBorderStyleChange}
              ariaLabelSuffix=" Line"
            />
          </Box>

          {/* Border Color - Only shown when border style is not default */}
          {props.borderStyleModel.getValue() !== undefined && (
            <>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ mt: 1, fontSize: '0.75rem', mb: 1 }}
              >
                <FormattedMessage id="unified-styling.border-color" defaultMessage="Border Color" />
              </Typography>
              <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                <ColorPicker
                  closeModal={() => {}}
                  colorModel={props.borderColorModel}
                  hideNoneOption={true}
                />
              </Box>
            </>
          )}
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {/* Connector Tab */}
        <Box sx={{ px: 1, py: 0, width: '100%' }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.75rem', mb: 1 }}>
            <FormattedMessage
              id="unified-styling.connector-style"
              defaultMessage="Connector Style"
            />
          </Typography>
          <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
            <IconCollection
              styles={connectionStyles}
              selectedValue={props.connectionStyleModel.getValue()}
              onSelect={handleConnectionStyleChange}
            />
          </Box>

          {/* Connection Color - Only shown when connector style is not default */}
          {props.connectionStyleModel.getValue() !== undefined && (
            <>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ mt: 1, fontSize: '0.75rem', mb: 1 }}
              >
                <FormattedMessage
                  id="unified-styling.connection-style"
                  defaultMessage="Connection Style"
                />
              </Typography>
              <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                <ColorPicker
                  closeModal={() => {}}
                  colorModel={props.connectionColorModel}
                  hideNoneOption={true}
                />
              </Box>
            </>
          )}
        </Box>
      </TabPanel>
    </StyledEditorContainer>
  );
};

export default TopicStyleEditor;
