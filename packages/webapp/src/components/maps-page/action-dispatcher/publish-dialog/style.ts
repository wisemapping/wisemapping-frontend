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
    textarea: {
      width: '100%',
      padding: '12px 16px',
      margin: '12px 0px',
      fontSize: '13px',
      fontFamily: "'Courier New', Consolas, Monaco, monospace",
      lineHeight: '1.6',
      border: '1px solid rgba(0, 0, 0, 0.23)',
      borderRadius: '4px',
      backgroundColor: '#f5f5f5',
      color: '#2c3e50',
      resize: 'none' as const,
      whiteSpace: 'pre' as const,
      overflowWrap: 'normal' as const,
      overflowX: 'auto' as const,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:focus': {
        outline: 'none',
        borderColor: useTheme().palette.primary.main,
        backgroundColor: '#fff',
        boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)',
      },
      '&:hover': {
        borderColor: useTheme().palette.primary.main,
        backgroundColor: '#fff',
        boxShadow: '0 0 0 1px rgba(25, 118, 210, 0.2)',
      },
    },
    paper: {
      maxWidth: '600px',
      minWidth: '500px',
      margin: 'auto',
      [useTheme().breakpoints.down('md')]: {
        maxWidth: '90vw',
        minWidth: 'auto',
      },
      [useTheme().breakpoints.down('sm')]: {
        maxWidth: '100%',
        minWidth: 'auto',
      },
    },
    checkboxContainer: {
      marginBottom: '16px',
      padding: '8px',
      borderRadius: '4px',
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
      },
    },
    tabPanel: {
      padding: '16px 0px',
    },
    label: {
      marginBottom: '8px',
      fontWeight: 500,
    },
    tab: {
      textTransform: 'none' as const,
      fontWeight: 500,
      fontSize: '14px',
    },
    urlInput: {
      marginTop: '12px',
      cursor: 'pointer',
      '& .MuiInputBase-root': {
        backgroundColor: '#f0f7ff',
        fontFamily: "'Courier New', Consolas, Monaco, monospace",
        fontSize: '14px',
        color: '#1976d2',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: '#e3f2fd',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: useTheme().palette.primary.main,
          },
        },
        '&.Mui-focused': {
          backgroundColor: '#fff',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: useTheme().palette.primary.main,
            borderWidth: '2px',
          },
        },
      },
      '& .MuiInputBase-input': {
        cursor: 'pointer',
        userSelect: 'all' as const,
      },
    },
  });
