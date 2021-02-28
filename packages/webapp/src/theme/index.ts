import createMuiTheme from '@material-ui/core/styles/createMuiTheme';

const theme = createMuiTheme({
    overrides: {
        MuiCssBaseline: {
            '@global': {
                body: {
                    backgroundColor: 'white',
                    minWidth: '800px'
                },
            },
        },
        MuiOutlinedInput: {
            root: {
                height: '53px',
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
        MuiInputLabel: {
            root: {
                color: '#f9a826',
            },
            outlined:{
                zIndex: 'inherit'
            }
        },
        MuiButton: {
            root: {
                fontSize: '15px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                textTransform: 'none',
                borderRadius: '9px',
                padding: '6px 54px 6px 54px',
                width: '136px',
            },
            containedPrimary: {
                color: 'white',
                '&:hover': {
                    backgroundColor: 'rgba(249, 168, 38, 0.91)',
                },
            }
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
            light: '#FFFFFF',
            main: '#FFFFFF',
            dark: '#FFFFFF',
            contrastText: '#FFFFFF',
        },
    },
});

export { theme };
