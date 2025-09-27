import { createTheme, PaletteMode, Theme } from '@mui/material/styles';

const createAppTheme = (mode: PaletteMode): Theme => {
  const isLight = mode === 'light';

  return createTheme({
    palette: {
      mode,
      primary: {
        light: '#ffb74d',
        main: '#ffa800',
        dark: '#ffcc80',
        contrastText: isLight ? '#FFFFFF' : '#000000',
      },
      secondary: {
        light: '#a19f9f',
        main: '#5a5a5a',
        dark: '#424242',
        contrastText: '#FFFFFF',
      },
      background: {
        default: isLight ? '#fafafa' : '#2a2a2a',
        paper: isLight ? '#ffffff' : '#1e1e1e',
      },
      text: {
        primary: isLight ? '#333333' : '#ffffff',
        secondary: isLight ? '#666666' : '#b3b3b3',
      },
    },
    components: {
      MuiFormControl: {
        styleOverrides: {
          root: {
            '& fieldset': {
              border: 'none',
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: '9px',
            fontSize: '14px',
            '& fieldset': {
              border: `solid 1px ${isLight ? '#ffcb66' : theme.palette.primary.main}`,
            },
            '&:hover:not(.Mui-disabled):not(.Mui-focused):not(.Mui-error) fieldset': {
              borderColor: theme.palette.primary.main,
            },
            '&.Mui-focused fieldset': {
              borderColor: theme.palette.primary.main,
            },
          }),
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: theme.palette.primary.main,
          }),
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
          containedPrimary: ({ theme }) => ({
            color: theme.palette.primary.contrastText,
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          }),
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: `${theme.palette.background.paper} !important`,
            color: `${theme.palette.text.primary} !important`,
            boxShadow: `0 1px 3px ${isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)'}`,
            '&.MuiAppBar-colorDefault': {
              backgroundColor: `${theme.palette.background.paper} !important`,
              color: `${theme.palette.text.primary} !important`,
            },
          }),
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
          }),
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: theme.palette.text.primary,
            '&:hover': {
              backgroundColor: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.08)',
            },
            '& svg': {
              color: 'inherit',
            },
          }),
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }),
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }),
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }),
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }),
        },
      },
    },
    typography: {
      fontFamily: ['Montserrat'].join(','),
      h4: {
        color: '#ffa800',
        fontWeight: 600,
        marginBottom: '10px',
      },
      h6: {
        fontSize: '25px',
        fontWeight: 'bold',
      },
    },
  });
};

export { createAppTheme };
