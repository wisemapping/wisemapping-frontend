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
import Box from '@mui/material/Box';
import { KeyCap } from './key-cap';

/**
 * A compact keyboard, with the keys the selected category uses lit up.
 *
 * Not a faithful layout -- rows are trimmed to the keys the editor actually
 * binds, so the shape stays readable inside a popover. The point is to answer
 * "which part of the keyboard does this category live on" before the reader
 * starts down the table.
 */

/** `width` is in cap units; omitted means 1. */
type Cap = { label: string; width?: number };

const ROWS: Cap[][] = [
  [
    { label: 'Esc' },
    { label: 'F2' },
    { label: '-' },
    { label: '=' },
    { label: '0' },
    { label: 'Insert' },
    { label: 'Delete' },
  ],
  [
    { label: 'Tab', width: 1.6 },
    { label: 'E' },
    { label: 'I' },
    { label: 'O' },
    { label: 'Enter', width: 1.8 },
  ],
  [{ label: 'A' }, { label: 'S' }, { label: 'F' }, { label: 'K' }, { label: 'L' }],
  [{ label: 'Shift', width: 1.9 }, { label: 'Z' }, { label: 'C' }, { label: 'V' }, { label: 'B' }],
  [
    { label: 'Ctrl', width: 1.6 },
    { label: 'Alt', width: 1.3 },
    { label: 'Space', width: 4 },
  ],
];

const ARROW_CLUSTER: Cap[][] = [
  [{ label: 'Up' }],
  [{ label: 'Left' }, { label: 'Down' }, { label: 'Right' }],
];

const ARROW_GLYPH: Record<string, string> = {
  Up: '↑',
  Down: '↓',
  Left: '←',
  Right: '→',
};

const Row = ({ caps, used }: { caps: Cap[]; used: Set<string> }): ReactElement => (
  <Box sx={{ display: 'flex', gap: 0.4, justifyContent: 'center' }}>
    {caps.map((cap) => (
      <Box key={cap.label} sx={{ width: `${(cap.width ?? 1) * 2.1}em`, display: 'flex' }}>
        <Box sx={{ width: '100%', '& > kbd': { width: '100%', minWidth: 0 } }}>
          <KeyCap highlighted={used.has(cap.label)}>{ARROW_GLYPH[cap.label] ?? cap.label}</KeyCap>
        </Box>
      </Box>
    ))}
  </Box>
);

const KeyboardDiagram = ({ used }: { used: Set<string> }): ReactElement => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: 1.5,
      py: 1,
      px: 1,
      mb: 1,
      backgroundColor: 'action.hover',
      borderRadius: '6px',
      border: '1px solid',
      borderColor: 'divider',
      overflowX: 'auto',
    }}
  >
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
      {ROWS.map((caps, index) => (
        // Rows are fixed data; the index is a stable identity.
        <Row key={index} caps={caps} used={used} />
      ))}
    </Box>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
      {ARROW_CLUSTER.map((caps, index) => (
        <Row key={index} caps={caps} used={used} />
      ))}
    </Box>
  </Box>
);

export default KeyboardDiagram;
