import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '9px',
          fontSize: '14px',
          '& fieldset': {
            border: 'solid 1px #ffcb66',
          },
          '&:hover:not($disabled):not($focused):not($error) $notchedOutline': {
            borderColor: '#f9a826',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#f9a826',
        },

        outlined: {
          zIndex: 'inherit',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: '15px',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          textTransform: 'none',
          borderRadius: '9px',
          padding: '6px 20px 6px 20px',
        },
        containedPrimary: {
          color: 'white',
          '&:hover': {
            backgroundColor: 'rgba(249, 168, 38, 0.91)',
          },
        },
      },
    },
  },
  typography: {
    fontFamily: ['Montserrat'].join(','),
    h4: {
      color: '#ffa800',
      fontWeight: 600,
    },
    h6: {
      fontSize: '25px',
      fontWeight: 'bold',
    },
  },
  palette: {
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
  },
});

export { theme };
