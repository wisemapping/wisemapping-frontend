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

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { useTheme } from '@mui/material/styles';
import useClasses from '../../../../theme/useStyles';

export const useStyles = () =>
  useClasses({
    actionContainer: {
      padding: '10px 0px',
      border: '1px solid rgba(0, 0, 0, 0.12)',
      borderRadius: '8px 8px 0px 0px',
      textAlign: 'center',
    },
    fullWidthInMobile: {
      [useTheme().breakpoints.down('sm')]: {
        minWidth: '99%',
        marginBottom: 5,
      },
    },
    email: {
      [useTheme().breakpoints.up('sm')]: {
        width: '300px',
      },
    },
    role: {
      [useTheme().breakpoints.up('sm')]: {
        margin: '0px 10px',
      },
    },
    textArea: {
      [useTheme().breakpoints.up('sm')]: {
        width: '730px',
        margin: '5px 0px',
        padding: '10px',
      },
    },
    listPaper: {
      maxHeight: 200,
      overflowY: 'scroll',
    },
    paper: {
      width: '850px',
      minWidth: '850px',
      [useTheme().breakpoints.down('sm')]: {
        minWidth: '100%',
      },
    },
    listItemText: {
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      '& span': {
        display: 'inline',
      },
    },
  });
