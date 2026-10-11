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
import Tooltip from '@mui/material/Tooltip';
import Tab from '@mui/material/Tab';
import CloseIcon from '@mui/icons-material/Close';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import GridOnIcon from '@mui/icons-material/GridOn';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import NotInterestedOutlined from '@mui/icons-material/NotInterestedOutlined';
import { FormattedMessage } from 'react-intl';
import ColorPicker from '../color-picker';
import {
  PaneButtonRow,
  PaneCard,
  PaneCenteredRow,
  PaneCloseButton,
  PaneSection,
  PaneSectionTitle,
} from '../shared/StyledPane';
import { ActionButton, CanvasTabs, GridSizeButton, GridSizeLabel } from './styled';
import NodeProperty from '../../../../classes/model/node-property';
import type { CanvasStyleType, BackgroundPatternType } from '@wisemapping/mindplot';

export type { CanvasStyleType as CanvasStyle, BackgroundPatternType };

type CanvasStyleEditorProps = {
  closeModal: () => void;
  initialStyle?: Partial<CanvasStyleType>;
  onStyleChange: (style: Partial<CanvasStyleType>) => void;
};

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
    // Only grid and dots have a Grid Color tab; leave it before it becomes disabled.
    if (newPattern !== 'grid' && newPattern !== 'dots') {
      setActiveTab(0);
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
    <PaneCard>
      <PaneCloseButton onClick={props.closeModal}>
        <CloseIcon />
      </PaneCloseButton>

      {/* Background Style - Always visible */}
      <PaneSection>
        <PaneSectionTitle variant="subtitle2" gutterBottom>
          <FormattedMessage id="canvas-style.background-style" defaultMessage="Background Style" />
        </PaneSectionTitle>
        <PaneButtonRow>
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
            title={
              <FormattedMessage id="canvas-style.pattern-solid" defaultMessage="Solid Color" />
            }
          >
            <ActionButton
              selected={style.backgroundPattern === 'solid'}
              onClick={() => handlePatternChange('solid')}
            >
              <CheckBoxOutlineBlankIcon />
            </ActionButton>
          </Tooltip>
          <Tooltip
            title={<FormattedMessage id="canvas-style.pattern-grid" defaultMessage="Grid Lines" />}
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
        </PaneButtonRow>
      </PaneSection>

      {/* Tabs - Only shown when pattern is not default */}
      {style.backgroundPattern !== undefined && (
        <>
          <CanvasTabs value={activeTab} onChange={handleTabChange}>
            <Tab label={<FormattedMessage id="canvas-style.tab-color" defaultMessage="Color" />} />
            <Tab
              label={<FormattedMessage id="canvas-style.tab-grid" defaultMessage="Grid Color" />}
              disabled={style.backgroundPattern !== 'grid' && style.backgroundPattern !== 'dots'}
            />
          </CanvasTabs>

          {/* Tab 0: Background Color */}
          {activeTab === 0 && (
            <PaneSection>
              <PaneSectionTitle variant="subtitle2" gutterBottom>
                <FormattedMessage
                  id="canvas-style.background-color"
                  defaultMessage="Background Color"
                />
              </PaneSectionTitle>
              <PaneCenteredRow>
                <ColorPicker
                  closeModal={preventClose}
                  colorModel={backgroundColorModel}
                  hideNoneOption={true}
                />
              </PaneCenteredRow>
            </PaneSection>
          )}

          {/* Tab 1: Grid Color */}
          {activeTab === 1 &&
            (style.backgroundPattern === 'grid' || style.backgroundPattern === 'dots') && (
              <>
                {/* Grid Color */}
                <PaneSection>
                  <PaneSectionTitle variant="subtitle2" gutterBottom>
                    <FormattedMessage id="canvas-style.grid-color" defaultMessage="Grid Color" />
                  </PaneSectionTitle>
                  <PaneCenteredRow>
                    <ColorPicker
                      closeModal={preventClose}
                      colorModel={gridColorModel}
                      hideNoneOption={true}
                    />
                  </PaneCenteredRow>
                </PaneSection>

                {/* Grid Size */}
                <PaneSection>
                  <PaneSectionTitle variant="subtitle2" gutterBottom>
                    <FormattedMessage id="canvas-style.grid-style" defaultMessage="Grid Size" />
                  </PaneSectionTitle>
                  <PaneButtonRow>
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
                        <GridSizeLabel>XS</GridSizeLabel>
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
                        <GridSizeLabel>S</GridSizeLabel>
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
                        <GridSizeLabel>M</GridSizeLabel>
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
                        <GridSizeLabel>L</GridSizeLabel>
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
                        <GridSizeLabel>XL</GridSizeLabel>
                      </GridSizeButton>
                    </Tooltip>
                  </PaneButtonRow>
                </PaneSection>
              </>
            )}
        </>
      )}
    </PaneCard>
  );
};

export default CanvasStyleEditor;
