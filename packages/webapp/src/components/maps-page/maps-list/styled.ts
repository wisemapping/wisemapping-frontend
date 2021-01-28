import { MenuItem, TableCell } from '@material-ui/core';
import { createStyles, makeStyles, Theme, withStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    paper: {
      width: '100%',
      marginBottom: theme.spacing(2),
    },
    table: {
      minWidth: 750,
      border: 0,
      '& tr:nth-child(even)': {
        background: 'white'
      },
      '& tr:nth-child(odd)':
      {
        background: 'rgba(221, 221, 221, 0.35)'
      } 
    },
    headerCell: {
      background: 'white',
      fontWeight: 'bold',
      color: 'rgba(0, 0, 0, 0.44)'
    },
    visuallyHidden: {
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: 1,
      margin: -1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      top: 20,
      width: 1,
    },
  }),
);

// export const StyledTableCell = withStyles({
//   root: {
//     color: 'black',
//     padding: '0px',
//     cursor: 'pointer',
//     border: '0'
//   }
// })(TableCell);