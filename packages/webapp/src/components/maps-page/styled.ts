import { Button, Dialog, MenuItem, TableCell } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import styled from 'styled-components';

export const PageContainer = styled.div`
display: grid;
height: 100vh;
width: 100vw;
grid-template-areas: "nav header header"
                     "nav  main ads"
                     "nav  main ads";
grid-template-columns: 240px 1fr 240px;
grid-template-rows: 60px 1fr 30px;
`

export const MapsListArea = styled.div`
grid-area: main;
background-color: #ffff64;
`

export const NavArea = styled.div` 
grid-area: nav;
background-color: red;
`

export const HeaderArea = styled.div`
grid-area: header;
background-color: blue;
`

export const StyledTableCell = withStyles({
    root: {
        color: 'black',
        padding: '0px',
        cursor: 'pointer'
    }
})(TableCell);

export const StyledMenuItem = withStyles({
    root: {
        width: '300px',
        padding: '10px 20px',
        marging: '0px 20px'
    }
})(MenuItem)
