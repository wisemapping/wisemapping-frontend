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
import { FormattedMessage } from 'react-intl';
import Box from '@mui/material/Box';
import type { Combo } from './shortcuts';

/**
 * One key drawn as a cap rather than as monospace text.
 *
 * The table used to render 'Ctrl + Shift + V' as a single string, which left
 * the reader parsing where one key ended and the next began. Caps make the
 * count obvious at a glance.
 */
const KeyCap = ({ children }: { children: React.ReactNode }): ReactElement => (
  <Box
    component="kbd"
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '1.6em',
      px: 0.6,
      py: 0.15,
      fontFamily: 'inherit',
      fontSize: '0.68rem',
      fontWeight: 600,
      lineHeight: 1.5,
      whiteSpace: 'nowrap',
      color: 'text.primary',
      backgroundColor: 'action.hover',
      border: '1px solid',
      borderColor: 'divider',
      borderBottomWidth: '2px',
      borderRadius: '4px',
    }}
  >
    {children}
  </Box>
);

/** A '+' or '/' set between caps, dimmer than the caps themselves. */
const Joiner = ({ children }: { children: string }): ReactElement => (
  <Box component="span" sx={{ mx: 0.4, color: 'text.disabled', fontSize: '0.68rem' }}>
    {children}
  </Box>
);

/**
 * Renders the alternatives for one platform: caps joined by '+' within a
 * combination, combinations joined by '/'.
 */
const ComboList = ({ combos }: { combos: Combo[] }): ReactElement => (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', rowGap: 0.5 }}>
    {combos.map((combo, comboIndex) => (
      // Index keys are safe here: the list is static data, never reordered.
      <React.Fragment key={comboIndex}>
        {comboIndex > 0 && <Joiner>/</Joiner>}
        {combo.keys?.map((key, keyIndex) => (
          <React.Fragment key={key}>
            {keyIndex > 0 && <Joiner>+</Joiner>}
            <KeyCap>{key}</KeyCap>
          </React.Fragment>
        ))}
        {combo.noteId && (
          <>
            {combo.keys && combo.keys.length > 0 && <Joiner>+</Joiner>}
            <Box component="span" sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>
              <FormattedMessage id={combo.noteId} defaultMessage={combo.noteDefault} />
            </Box>
          </>
        )}
      </React.Fragment>
    ))}
  </Box>
);

export default ComboList;
