import { MenuItem, TableCell } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

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
