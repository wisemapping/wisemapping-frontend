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
import { FormattedMessage } from 'react-intl';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Paper from '@mui/material/Paper';
import CloseIcon from '@mui/icons-material/Close';
import type { Theme } from '@mui/material/styles';
import { isMacPlatform } from '@wisemapping/mindplot';
import ComboList from './key-cap';
import NavigationDiagram from './navigation-diagram';
import { SHORTCUT_CATEGORIES } from './shortcuts';

type KeyboardShorcutsHelpProps = {
  closeModal?: () => void;
};

/**
 * The sticky header's cells.
 *
 * `action.hover` is a ~4% alpha tint, which was the header's only background:
 * with `stickyHeader` the rows scrolled visibly through it. The tint now sits
 * on an opaque base, layered the way MUI paints its own Paper overlays, and a
 * bottom border separates it from the first row it covers.
 */
const HEADER_CELL_SX = {
  fontWeight: 600,
  backgroundColor: 'background.paper',
  backgroundImage: (theme: Theme) =>
    `linear-gradient(${theme.palette.action.hover}, ${theme.palette.action.hover})`,
  borderBottom: '1px solid',
  borderBottomColor: 'divider',
  textTransform: 'uppercase',
  fontSize: '0.65rem',
  letterSpacing: '0.5px',
} as const;

/**
 * The keyboard shortcut reference.
 *
 * All 35 shortcuts used to arrive as one flat table in a 60vh scroll, which
 * made the pane a list to search rather than one to read. They are now grouped
 * into tabs, and the navigation tab opens with a map showing what each arrow
 * key does -- the one group whose key names genuinely do not explain it.
 *
 * Only the running platform's column is rendered -- the table used to show
 * Windows/Linux and Mac side by side, so half of it was always noise.
 *
 * The rows themselves come from `shortcuts.ts`; this file is layout only.
 */
const KeyboardShorcutsHelp = ({ closeModal }: KeyboardShorcutsHelpProps): ReactElement => {
  const [tab, setTab] = useState(0);
  // One column, not two: the reader only has one keyboard. isMacPlatform is the
  // same check the visualization toolbar uses to label its tooltips.
  const isMac = isMacPlatform();
  const category = SHORTCUT_CATEGORIES[tab];

  return (
    <Box
      sx={{
        pt: 1.5,
        px: 1.5,
        pb: 1,
        width: '470px',
        maxWidth: '92vw',
        maxHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.paper',
        borderRadius: '8px',
        border: '1px solid',
        borderColor: 'divider',
        position: 'relative',
      }}
    >
      {closeModal && (
        <IconButton
          onClick={closeModal}
          aria-label="close"
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
      )}

      <Tabs
        value={tab}
        onChange={(_event, value: number) => setTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 32,
          mr: 3,
          mb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          '& .MuiTab-root': {
            minHeight: 32,
            minWidth: 0,
            px: 1.5,
            py: 0.5,
            fontSize: '0.7rem',
            textTransform: 'none',
          },
        }}
      >
        {SHORTCUT_CATEGORIES.map((entry) => (
          <Tab key={entry.key} label={<FormattedMessage {...entry.label} />} />
        ))}
      </Tabs>

      {/* Navigation is the one group the key names alone do not explain. */}
      {category.key === 'navigation' && <NavigationDiagram />}

      <TableContainer
        component={Paper}
        sx={{ boxShadow: 'none', border: 'none', overflowY: 'auto', flex: 1 }}
      >
        <Table size="small" stickyHeader sx={{ width: '100%', fontSize: '0.75rem' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...HEADER_CELL_SX, width: '55%' }}>
                <FormattedMessage id="shortcut-help-pane.action" defaultMessage="Action" />
              </TableCell>
              <TableCell sx={{ ...HEADER_CELL_SX, width: '45%' }}>
                {isMac ? 'Mac OS X' : 'Windows - Linux'}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {category.shortcuts.map((shortcut) => (
              <TableRow hover key={shortcut.message.id}>
                <TableCell sx={{ fontSize: '0.72rem' }}>
                  <FormattedMessage {...shortcut.message} />
                </TableCell>
                <TableCell>
                  <ComboList combos={isMac ? shortcut.mac : shortcut.win} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default KeyboardShorcutsHelp;
