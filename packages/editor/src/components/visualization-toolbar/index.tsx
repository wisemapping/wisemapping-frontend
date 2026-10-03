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
import React, { ReactElement, useState, useEffect, useMemo } from 'react';
import { IntlShape, useIntl } from 'react-intl';
import ActionConfig from '../../classes/action/action-config';
import Capability from '../../classes/action/capability';
import Editor from '../../classes/model/editor';
import Model from '../../classes/model/editor';
import KeyboardShorcutsHelp from '../action-widget/pane/keyboard-shortcut-help';
import OutlineViewDialog from '../action-widget/pane/outline-view-dialog';
import FindInMapPanel from '../action-widget/pane/find-in-map';
import { DesignerKeyboard, isMacPlatform } from '@wisemapping/mindplot';
import LayoutSelector from '../action-widget/pane/layout-selector';
import NodePropertyValueModelBuilder from '../../classes/model/node-property-builder';
import Toolbar from '../toolbar';
import ZoomOutOutlinedIcon from '@mui/icons-material/ZoomOutOutlined';
import ZoomInOutlinedIcon from '@mui/icons-material/ZoomInOutlined';
import CenterFocusStrongOutlinedIcon from '@mui/icons-material/CenterFocusStrongOutlined';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import TocOutlinedIcon from '@mui/icons-material/TocOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { trackEditorInteraction } from '../../utils/analytics';
import { handleExpandByLevel, buildExpandByLevelConfig } from './expand-by-level-icon';
import { formatTooltip } from './utils';
import { EDITOR_LAYOUT, EDITOR_Z_INDEX } from '../../theme/layout';
import ZoomDisplay from './zoom-display';
import { useTheme } from '../../contexts/ThemeContext';

// Helper function to check if any nodes are currently collapsed
const areNodesCollapsed = (model: Editor): boolean => {
  if (!model?.isMapLoadded()) return false;
  const allTopics = model.getDesigner().getModel().getTopics();
  return allTopics.some(
    (topic) => topic.getType() !== 'CentralTopic' && topic.areChildrenShrunken(),
  );
};

export type FindInMapState = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export function buildVisualizationToolbarConfig(
  model: Editor,
  capability: Capability,
  intl: IntlShape,
  currentExpandLevel: number,
  setExpandLevel: (level: number) => void,
  themeMode?: 'light' | 'dark',
  toggleTheme?: () => void,
  findInMap?: FindInMapState,
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

  const nodesCollapsed = areNodesCollapsed(model);

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
      render: () => <ZoomDisplay model={model} />,
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
      icon: <SearchOutlinedIcon />,
      tooltip: formatTooltip(
        intl.formatMessage({
          id: 'visualization-toolbar.tooltip-find-in-map',
          defaultMessage: 'Find in Map',
        }),
        'F',
      ),
      ariaLabel: intl.formatMessage({
        id: 'visualization-toolbar.tooltip-find-in-map',
        defaultMessage: 'Find in Map',
      }),
      'data-testid': 'find-in-map-button',
      onClick: () => trackEditorInteraction('find_in_map'),
      open: findInMap?.open,
      onOpenChange: findInMap?.setOpen,
      options: [
        {
          render: (closeModal) => (
            <FindInMapPanel designer={model.getDesigner()} closeModal={closeModal} />
          ),
        },
      ],
      disabled: () => !model?.isMapLoadded(),
    },
    // Separator between find and outline view
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
      icon: nodesCollapsed ? <UnfoldMoreIcon /> : <UnfoldLessIcon />,
      tooltip: formatTooltip(
        nodesCollapsed
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
      ariaLabel: nodesCollapsed
        ? intl.formatMessage({
            id: 'visualization-toolbar.tooltip-expand-all',
            defaultMessage: 'Expand All Nodes',
          })
        : intl.formatMessage({
            id: 'visualization-toolbar.tooltip-collapse-all',
            defaultMessage: 'Collapse All Nodes',
          }),
      onClick: () => {
        if (nodesCollapsed) {
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
                      model={model}
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
  const [findInMapOpen, setFindInMapOpen] = useState(false);
  const { mode, toggleMode } = useTheme();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Checked here (not as an effect-attach guard) because `isMapLoadded()`
      // reads mutable state on the designer, not a React-tracked value: the
      // map finishing loading never changes `model`/`expandLevel`, so an
      // attach-time guard would leave every shortcut in this handler
      // permanently dead once the map loaded after the first render.
      if (!model?.isMapLoadded()) return;

      // Share the pause that suppresses canvas shortcuts while a dialog is
      // open -- this listener sits on `document` and used to fire regardless.
      if (DesignerKeyboard.isDisabled()) return;

      const isModifier = isMacPlatform() ? event.metaKey : event.ctrlKey;

      if (!isModifier) return;

      // Zoom (ctrl/meta with 0, -, =) is owned by DesignerKeyboard, not here.
      switch (event.key.toLowerCase()) {
        case 'f':
          event.preventDefault();
          trackEditorInteraction('find_in_map_keyboard');
          setFindInMapOpen(true);
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

  const config = useMemo(
    () =>
      buildVisualizationToolbarConfig(
        model,
        capability,
        intl,
        expandLevel,
        setExpandLevel,
        mode,
        toggleMode,
        { open: findInMapOpen, setOpen: setFindInMapOpen },
      ),
    [model, capability, intl, expandLevel, mode, toggleMode, findInMapOpen],
  );

  // Check if we're in public or embedded view
  const isPublicOrEmbedded =
    capability.mode === 'viewonly-public' || capability.mode === 'viewonly-private';

  return (
    <Toolbar
      configurations={config}
      position={{
        position: {
          right: isPublicOrEmbedded
            ? EDITOR_LAYOUT.zoomToolbar.rightCompact
            : EDITOR_LAYOUT.zoomToolbar.right,
          top: EDITOR_LAYOUT.zoomToolbar.top,
        },
        vertical: false,
        zIndex: EDITOR_Z_INDEX.canvasChrome,
      }}
    />
  );
};
export default VisualizationToolbar;
