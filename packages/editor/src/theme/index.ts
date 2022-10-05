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
