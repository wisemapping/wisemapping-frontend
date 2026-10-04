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
import React, { ReactElement } from 'react';
import { useIntl } from 'react-intl';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

/**
 * What the arrow keys mean on a map, drawn rather than described.
 *
 * 'Arrow keys' was the entire documentation for navigation, which says nothing
 * about the part that actually surprises people: left and right move between
 * levels while up and down move between siblings, so the same key does
 * different things depending on which side of the central topic you are on.
 *
 * Drawn for the right-hand side of a horizontal map.
 *
 * Colours are read off the theme and passed as SVG presentation attributes
 * rather than through `sx`: MUI only resolves palette paths for a fixed set of
 * colour properties (color, backgroundColor, borderColor and a few more), so
 * `sx={{ fill: 'background.paper' }}` would emit 'background.paper' as a
 * literal and the shape would fall back to black.
 */
const NavigationDiagram = (): ReactElement => {
  const intl = useIntl();
  const theme = useTheme();

  const nodeFill = theme.palette.background.paper;
  const nodeStroke = theme.palette.text.disabled;
  const labelColor = theme.palette.text.secondary;
  const accent = theme.palette.primary.main;
  const accentText = theme.palette.primary.contrastText;
  const connector = theme.palette.divider;

  const label = (id: string, defaultMessage: string) => intl.formatMessage({ id, defaultMessage });

  const siblingLabel = label('shortcut-help-pane.diagram-sibling', 'Sibling');

  return (
    <Box
      sx={{
        py: 1,
        mb: 1,
        backgroundColor: 'action.hover',
        borderRadius: '6px',
        border: '1px solid',
        borderColor: 'divider',
        overflowX: 'auto',
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 420 150"
        role="img"
        aria-label={label(
          'shortcut-help-pane.diagram-aria',
          'Left arrow moves to the parent topic, right arrow to a child, up and down between siblings.',
        )}
        sx={{ display: 'block', width: '100%', minWidth: '380px', height: 'auto' }}
        style={{ color: accent }}
      >
        <defs>
          <marker
            id="nav-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
          </marker>
        </defs>

        {/* Connectors first, so the nodes paint over their ends. */}
        <g stroke={connector} strokeWidth={1.2} fill="none">
          <path d="M 86 75 C 110 75, 110 36, 134 36" />
          <path d="M 86 75 L 134 75" />
          <path d="M 86 75 C 110 75, 110 114, 134 114" />
          <path d="M 226 75 L 274 75" />
        </g>

        {/* Parent */}
        <g>
          <rect x="16" y="61" width="70" height="28" rx="6" fill={nodeFill} stroke={nodeStroke} />
          <text x="51" y="79" textAnchor="middle" fontSize="9" fill={labelColor}>
            {label('shortcut-help-pane.diagram-parent', 'Parent')}
          </text>
        </g>

        {/* Siblings above and below the selection */}
        {[22, 100].map((y) => (
          <g key={y}>
            <rect x="134" y={y} width="92" height="28" rx="6" fill={nodeFill} stroke={nodeStroke} />
            <text x="180" y={y + 18} textAnchor="middle" fontSize="9" fill={labelColor}>
              {siblingLabel}
            </text>
          </g>
        ))}

        {/* The selected topic */}
        <g>
          <rect
            x="134"
            y="61"
            width="92"
            height="28"
            rx="6"
            fill={accent}
            stroke={accent}
            strokeWidth={1.5}
          />
          <text x="180" y="79" textAnchor="middle" fontSize="9" fontWeight="600" fill={accentText}>
            {label('shortcut-help-pane.diagram-selected', 'Selected')}
          </text>
        </g>

        {/* Child */}
        <g>
          <rect x="274" y="61" width="70" height="28" rx="6" fill={nodeFill} stroke={nodeStroke} />
          <text x="309" y="79" textAnchor="middle" fontSize="9" fill={labelColor}>
            {label('shortcut-help-pane.diagram-child', 'Child')}
          </text>
        </g>

        {/* Arrow-key annotations */}
        <g stroke={accent} strokeWidth={1.4}>
          <line x1="130" y1="68" x2="94" y2="68" markerEnd="url(#nav-arrow)" />
          <line x1="230" y1="68" x2="266" y2="68" markerEnd="url(#nav-arrow)" />
          <line x1="180" y1="58" x2="180" y2="53" markerEnd="url(#nav-arrow)" />
          <line x1="180" y1="92" x2="180" y2="97" markerEnd="url(#nav-arrow)" />
        </g>
        <g fill={accent} fontSize="11" fontWeight="700">
          <text x="112" y="62" textAnchor="middle">
            ←
          </text>
          <text x="248" y="62" textAnchor="middle">
            →
          </text>
          <text x="193" y="52" textAnchor="middle">
            ↑
          </text>
          <text x="193" y="108" textAnchor="middle">
            ↓
          </text>
        </g>

        <text
          x="210"
          y="141"
          textAnchor="middle"
          fontSize="9"
          fontStyle="italic"
          fill={theme.palette.text.disabled}
        >
          {label(
            'shortcut-help-pane.diagram-caption',
            'On the left half of the map, ← and → swap roles.',
          )}
        </text>
      </Box>
    </Box>
  );
};

export default NavigationDiagram;
