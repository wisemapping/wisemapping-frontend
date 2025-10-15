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
import Typography from '@mui/material/Typography';
import React, { ReactElement, useState, useEffect } from 'react';
import { IntlShape, useIntl } from 'react-intl';
import ActionConfig from '../../classes/action/action-config';
import Capability from '../../classes/action/capability';
import Editor from '../../classes/model/editor';
import Model from '../../classes/model/editor';
import KeyboardShorcutsHelp from '../action-widget/pane/keyboard-shortcut-help';
import OutlineViewDialog from '../action-widget/pane/outline-view-dialog';
import Toolbar from '../toolbar';
import ZoomOutOutlinedIcon from '@mui/icons-material/ZoomOutOutlined';
import ZoomInOutlinedIcon from '@mui/icons-material/ZoomInOutlined';
import CenterFocusStrongOutlinedIcon from '@mui/icons-material/CenterFocusStrongOutlined';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import TocOutlinedIcon from '@mui/icons-material/TocOutlined';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import Box from '@mui/material/Box';
import { trackEditorInteraction } from '../../utils/analytics';
import { Topic } from '@wisemapping/mindplot';

// Helper function to check if any nodes are currently collapsed
const areNodesCollapsed = (model: Editor): boolean => {
  if (!model?.isMapLoadded()) return false;
  const allTopics = model.getDesigner().getModel().getTopics();
  return allTopics.some(
    (topic) => topic.getType() !== 'CentralTopic' && topic.areChildrenShrunken(),
  );
};

// Helper function to get topic depth/level
const getTopicDepth = (topic: Topic): number => {
  let depth = 0;
  let current: Topic | null = topic;
  while (current && current.getParent() !== null) {
    depth++;
    current = current.getParent();
  }
  return depth;
};

// Helper function to expand nodes up to a specific level
const expandToLevel = (model: Editor, targetLevel: number): void => {
  if (!model?.isMapLoadded()) return;
  const allTopics = model.getDesigner().getModel().getTopics();
  const topicsToExpand: number[] = [];

  allTopics.forEach((topic) => {
    if (topic.getType() !== 'CentralTopic') {
      const depth = getTopicDepth(topic);
      // Expand topics that are at or below the target level and are currently collapsed
      if (depth < targetLevel && topic.areChildrenShrunken()) {
        topicsToExpand.push(topic.getId());
      }
    }
  });

  if (topicsToExpand.length > 0) {
    model.getDesigner().getActionDispatcher().shrinkBranch(topicsToExpand, false);
  }
};

// Helper function to format tooltip with keyboard shortcut
const formatTooltip = (message: string, shortcut: string): string => {
  const isMac =
    typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifierKey = isMac ? '⌘' : 'Ctrl';
  return `${message} (${modifierKey}+${shortcut})`;
};

export function buildVisualizationToolbarConfig(
  model: Editor,
  capability: Capability,
  intl: IntlShape,
  currentExpandLevel: number,
  setExpandLevel: (level: number) => void,
): ActionConfig[] {
  const zoomToFitLabel = intl.formatMessage({
    id: 'visualization-toolbar.tooltip-zoom-to-fit',
    defaultMessage: 'Zoom to Fit',
  });
  const zoomOutLabel = intl.formatMessage({
    id: 'visualization-toolbar.tooltip-zoom-out',
    defaultMessage: 'Zoom Out',
  });

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
          setExpandLevel(999); // Reset to max level
        } else {
          trackEditorInteraction('collapse_all_nodes');
          model.getDesigner().collapseAllNodes();
          setExpandLevel(0); // Reset to collapsed
        }
      },
      disabled: () => !model?.isMapLoadded(),
    },
    {
      icon: <LowPriorityIcon />,
      tooltip: formatTooltip(
        intl.formatMessage({
          id: 'visualization-toolbar.tooltip-expand-level',
          defaultMessage: `Expand by Level (${currentExpandLevel})`,
        }),
        'E',
      ),
      ariaLabel: intl.formatMessage({
        id: 'visualization-toolbar.tooltip-expand-level',
        defaultMessage: 'Expand by Level',
      }),
      onClick: () => {
        const nextLevel = currentExpandLevel + 1;
        setExpandLevel(nextLevel);
        trackEditorInteraction('expand_by_level');
        expandToLevel(model, nextLevel);
      },
      disabled: () => !model?.isMapLoadded(),
    },
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
  ];
}

type VisualizationToolbarProps = {
  model: Model;
  capability: Capability;
};

const VisualizationToolbar = ({ model, capability }: VisualizationToolbarProps): ReactElement => {
  const intl = useIntl();
  const [expandLevel, setExpandLevel] = useState(0);

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
              setExpandLevel(999);
              trackEditorInteraction('expand_all_keyboard');
            } else {
              model.getDesigner().collapseAllNodes();
              setExpandLevel(0);
              trackEditorInteraction('collapse_all_keyboard');
            }
          } else {
            // Expand by level
            const nextLevel = expandLevel + 1;
            setExpandLevel(nextLevel);
            expandToLevel(model, nextLevel);
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
  );
  return (
    <Toolbar
      configurations={config}
      position={{
        position: {
          right: '7px',
          top: 'calc(100% - 50px)',
        },
        vertical: false,
      }}
    />
  );
};
export default VisualizationToolbar;
