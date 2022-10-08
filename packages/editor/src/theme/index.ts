/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import { createTheme, Theme } from '@mui/material/styles';

const theme: Theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      light: '#ffa800',
      main: '#ffa800',
      dark: '#ffa800',
      contrastText: '#FFFFFF',
    },
    secondary: {
      light: '#a19f9f',
      main: '#5a5a5a',
      dark: '#000000',
      contrastText: '#FFFFFF',
    },
    background: {
      paper: '#fff',
      default: '#fff',
    },
    text: {
      primary: '#313131',
    },
  },
});

export { theme };
