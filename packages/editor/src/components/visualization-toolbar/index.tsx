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
import KeyboardOutlined from '@mui/icons-material/KeyboardOutlined';
import Brightness4 from '@mui/icons-material/Brightness4';
import Brightness7 from '@mui/icons-material/Brightness7';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import Typography from '@mui/material/Typography';
import React, { ReactElement, useState, useEffect } from 'react';
import { IntlShape, useIntl } from 'react-intl';
import ActionConfig from '../../classes/action/action-config';
import Capability from '../../classes/action/capability';
import Editor from '../../classes/model/editor';
import Model from '../../classes/model/editor';
import KeyboardShorcutsHelp from '../action-widget/pane/keyboard-shortcut-help';
import OutlineViewDialog from '../action-widget/pane/outline-view-dialog';
import LayoutSelector from '../action-widget/pane/layout-selector';
import NodePropertyValueModelBuilder from '../../classes/model/node-property-builder';
import Toolbar from '../toolbar';
import ZoomOutOutlinedIcon from '@mui/icons-material/ZoomOutOutlined';
import ZoomInOutlinedIcon from '@mui/icons-material/ZoomInOutlined';
import CenterFocusStrongOutlinedIcon from '@mui/icons-material/CenterFocusStrongOutlined';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import TocOutlinedIcon from '@mui/icons-material/TocOutlined';
import Box from '@mui/material/Box';
import { trackEditorInteraction } from '../../utils/analytics';
import { handleExpandByLevel, buildExpandByLevelConfig } from './expand-by-level-icon';
import { formatTooltip } from './utils';
import { useTheme } from '../../contexts/ThemeContext';

// Helper function to check if any nodes are currently collapsed
const areNodesCollapsed = (model: Editor): boolean => {
  if (!model?.isMapLoadded()) return false;
  const allTopics = model.getDesigner().getModel().getTopics();
  return allTopics.some(
    (topic) => topic.getType() !== 'CentralTopic' && topic.areChildrenShrunken(),
  );
};

export function buildVisualizationToolbarConfig(
  model: Editor,
  capability: Capability,
  intl: IntlShape,
  currentExpandLevel: number,
  setExpandLevel: (level: number) => void,
  themeMode?: 'light' | 'dark',
  toggleTheme?: () => void,
): (ActionConfig | undefined)[] {
  const zoomToFitLabel = intl.formatMessage({
    id: 'visualization-toolbar.tooltip-zoom-to-fit',
    defaultMessage: 'Zoom to Fit',
  });
  const zoomOutLabel = intl.formatMessage({
    id: 'visualization-toolbar.tooltip-zoom-out',
    defaultMessage: 'Zoom Out',
  });

  // Check if we're in public or embedded view
  const isPublicOrEmbedded =
    capability.mode === 'viewonly-public' || capability.mode === 'viewonly-private';

  return [
    {
      icon: <CenterFocusStrongOutlinedIcon />,
      tooltip: formatTooltip(zoomToFitLabel, '0'),
      ariaLabel: zoomToFitLabel,
      onClick: () => {
        trackEditorInteraction('zoom_to_fit');
        model.getDesigner().zoomToFit();
      },
      disabled: () => !model?.isMapLoadded(),
    },
    {
      icon: <ZoomOutOutlinedIcon />,
      tooltip: formatTooltip(zoomOutLabel, '-'),
      ariaLabel: zoomOutLabel,
      onClick: () => {
        trackEditorInteraction('zoom_out');
        model.getDesigner().zoomOut();
      },
      disabled: () => !model?.isMapLoadded(),
    },
    {
      // visualization value candidate, needs to fix it
      render: () => (
        <Box sx={{ p: 0.5 }}>
          <Typography variant="overline" color="gray">
            {!model?.isMapLoadded()
              ? 100
              : Math.floor((1 / model.getDesigner().getWorkSpace()?.getZoom()) * 100)}
            %
          </Typography>
        </Box>
      ),
      disabled: () => !model?.isMapLoadded(),
    },
    {
      icon: <ZoomInOutlinedIcon />,
      tooltip: formatTooltip(
        intl.formatMessage({
          id: 'visualization-toolbar.tooltip-zoom-in',
          defaultMessage: 'Zoom In',
        }),
        '=',
      ),
      ariaLabel: intl.formatMessage({
        id: 'visualization-toolbar.tooltip-zoom-in',
        defaultMessage: 'Zoom In',
      }),
      onClick: () => {
        trackEditorInteraction('zoom_in');
        model.getDesigner().zoomIn();
      },
      disabled: () => !model?.isMapLoadded(),
    },
    // Separator between zoom controls and outline view
    undefined as ActionConfig | undefined,
    {
      icon: <TocOutlinedIcon />,
      tooltip: formatTooltip(
        intl.formatMessage({
          id: 'visualization-toolbar.tooltip-outline-view',
          defaultMessage: 'Outline View',
        }),
        'O',
      ),
      ariaLabel: intl.formatMessage({
        id: 'visualization-toolbar.tooltip-outline-view',
        defaultMessage: 'Outline View',
      }),
      onClick: () => trackEditorInteraction('outline_view'),
      options: [
        {
          render: (closeModal) => (
            <OutlineViewDialog
              open={true}
              onClose={closeModal}
              mindmap={model.getDesigner()?.getMindmap()}
            />
          ),
        },
      ],
      disabled: () => !model?.isMapLoadded(),
    },
    // Separator between outline view and expand/collapse controls
    undefined as ActionConfig | undefined,
    {
      icon: areNodesCollapsed(model) ? <UnfoldMoreIcon /> : <UnfoldLessIcon />,
      tooltip: formatTooltip(
        areNodesCollapsed(model)
          ? intl.formatMessage({
              id: 'visualization-toolbar.tooltip-expand-all',
              defaultMessage: 'Expand All Nodes',
            })
          : intl.formatMessage({
              id: 'visualization-toolbar.tooltip-collapse-all',
              defaultMessage: 'Collapse All Nodes',
            }),
        'Shift+E',
      ),
      ariaLabel: areNodesCollapsed(model)
        ? intl.formatMessage({
            id: 'visualization-toolbar.tooltip-expand-all',
            defaultMessage: 'Expand All Nodes',
          })
        : intl.formatMessage({
            id: 'visualization-toolbar.tooltip-collapse-all',
            defaultMessage: 'Collapse All Nodes',
          }),
      onClick: () => {
        if (areNodesCollapsed(model)) {
          trackEditorInteraction('expand_all_nodes');
          model.getDesigner().expandAllNodes();
          const maxDepth = model.getDesigner().getMindmap().getMaxDepth();
          setExpandLevel(maxDepth);
        } else {
          trackEditorInteraction('collapse_all_nodes');
          model.getDesigner().collapseAllNodes();
          setExpandLevel(0); // Reset to collapsed
        }
      },
      disabled: () => !model?.isMapLoadded(),
    },
    buildExpandByLevelConfig(model, intl, currentExpandLevel, setExpandLevel, () =>
      trackEditorInteraction('expand_by_level'),
    ),
    // Separator between expand controls and keyboard shortcuts
    undefined as ActionConfig | undefined,
    {
      icon: <KeyboardOutlined />,
      tooltip: intl.formatMessage({
        id: 'visualization-toolbar.tooltip-keyboard',
        defaultMessage: 'Keyboard Shortcuts',
      }),
      visible: !capability.isHidden('keyboard-shortcuts'),
      onClick: () => trackEditorInteraction('keyboard_shortcuts'),
      options: [
        {
          render: (closeModal) => <KeyboardShorcutsHelp closeModal={closeModal} />,
        },
      ],
    },
    // Layout selector - only for showcase mode
    ...(capability.mode === 'showcase'
      ? [
          {
            icon: <AccountTreeIcon />,
            tooltip: intl.formatMessage({
              id: 'visualization-toolbar.tooltip-layout',
              defaultMessage: 'Change Layout',
            }),
            onClick: () => trackEditorInteraction('layout_selector'),
            options: [
              {
                render: (closeModal: () => void) => {
                  const modelBuilder = new NodePropertyValueModelBuilder(model.getDesigner());
                  return (
                    <LayoutSelector
                      closeModal={closeModal}
                      layoutModel={modelBuilder.getLayoutModel()}
                    />
                  );
                },
              },
            ],
            disabled: () => !model?.isMapLoadded(),
          } as ActionConfig,
        ]
      : []),
    // Separator before theme toggle - only if theme toggle will be shown
    ...(isPublicOrEmbedded && toggleTheme ? [undefined as ActionConfig | undefined] : []),
    // Theme toggle - only for public and embedded views
    ...(isPublicOrEmbedded && toggleTheme
      ? [
          {
            icon: themeMode === 'light' ? <Brightness4 /> : <Brightness7 />,
            tooltip: intl.formatMessage(
              themeMode === 'light'
                ? {
                    id: 'visualization-toolbar.tooltip-switch-to-dark',
                    defaultMessage: 'Switch to dark mode',
                  }
                : {
                    id: 'visualization-toolbar.tooltip-switch-to-light',
                    defaultMessage: 'Switch to light mode',
                  },
            ),
            ariaLabel: intl.formatMessage({
              id: 'visualization-toolbar.tooltip-theme-toggle',
              defaultMessage: 'Toggle theme',
            }),
            onClick: () => {
              trackEditorInteraction('theme_toggle');
              toggleTheme();
            },
          } as ActionConfig,
        ]
      : []),
  ];
}

type VisualizationToolbarProps = {
  model: Model;
  capability: Capability;
};

const VisualizationToolbar = ({ model, capability }: VisualizationToolbarProps): ReactElement => {
  const intl = useIntl();
  const [expandLevel, setExpandLevel] = useState(0);
  const { mode, toggleMode } = useTheme();

  // Keyboard shortcuts
  useEffect(() => {
    if (!model?.isMapLoadded()) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isModifier = isMac ? event.metaKey : event.ctrlKey;

      if (!isModifier) return;

      switch (event.key.toLowerCase()) {
        case '0':
          event.preventDefault();
          model.getDesigner().zoomToFit();
          trackEditorInteraction('zoom_to_fit_keyboard');
          break;
        case '-':
          event.preventDefault();
          model.getDesigner().zoomOut();
          trackEditorInteraction('zoom_out_keyboard');
          break;
        case '=':
        case '+':
          event.preventDefault();
          model.getDesigner().zoomIn();
          trackEditorInteraction('zoom_in_keyboard');
          break;
        case 'o':
          event.preventDefault();
          trackEditorInteraction('outline_view_keyboard');
          // Outline view will be handled by the toolbar button click
          break;
        case 'e':
          event.preventDefault();
          if (event.shiftKey) {
            // Expand/Collapse All
            if (areNodesCollapsed(model)) {
              model.getDesigner().expandAllNodes();
              const maxDepth = model.getDesigner().getMindmap().getMaxDepth();
              setExpandLevel(maxDepth);
              trackEditorInteraction('expand_all_keyboard');
            } else {
              model.getDesigner().collapseAllNodes();
              setExpandLevel(0);
              trackEditorInteraction('collapse_all_keyboard');
            }
          } else {
            // Expand by level
            handleExpandByLevel(model, expandLevel, setExpandLevel);
            trackEditorInteraction('expand_by_level_keyboard');
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [model, expandLevel]);

  const config = buildVisualizationToolbarConfig(
    model,
    capability,
    intl,
    expandLevel,
    setExpandLevel,
    mode,
    toggleMode,
  );

  // Check if we're in public or embedded view
  const isPublicOrEmbedded =
    capability.mode === 'viewonly-public' || capability.mode === 'viewonly-private';

  return (
    <Toolbar
      configurations={config}
      position={{
        position: {
          right: isPublicOrEmbedded ? '5px' : '47px',
          top: 'calc(100% - 55px)',
        },
        vertical: false,
      }}
    />
  );
};
export default VisualizationToolbar;
