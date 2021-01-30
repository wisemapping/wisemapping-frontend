import { createMuiTheme } from '@material-ui/core';
import { createGlobalStyle } from 'styled-components';


const GlobalStyle = createGlobalStyle`

@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;600&display=swap');
* {
    box-sizing: border-box;
}
`;

const theme = createMuiTheme({
    overrides: {
        MuiCssBaseline: {
            '@global': {
                body: {
                    backgroundColor: 'white',
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
                }
            },
        },
        MuiInputLabel: {
            root: {
                color: '#f9a826'
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
                width: '136px'
            },
            containedPrimary: {
                color: 'white',
                '&:hover': {
                    backgroundColor: 'rgba(249, 168, 38, 0.91)'
                }
            },
            textPrimary: {
            }
        }
    },
    typography: {
        fontFamily: [
            'Montserrat'
        ].join(','),
        h4: {
            color: '#ffa800',
            fontWeight: 600
        },
        h6: {
            fontSize: '25px',
            fontWeight: 'bold'
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

    }
});

export { GlobalStyle, theme };

