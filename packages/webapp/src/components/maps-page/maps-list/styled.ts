import { createStyles, fade, makeStyles, Theme } from '@material-ui/core/styles';

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
      '& tr:nth-child(even)': {
        background: 'white'
      },
      '& tr:nth-child(odd)':
      {
        background: 'rgba(221, 221, 221, 0.35)'
      },
      // '&:hover tr': {
      //   backgroundColor: 'rgba(150, 150, 150, 0.7)',
      // }
    },
    headerCell: {
      background: 'white',
      fontWeight: 'bold',
      color: 'rgba(0, 0, 0, 0.44)',
      border: 0
    },
    bodyCell: {
      border: '0px'
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
    toolbar: {
      display: 'flex',
      borderBottom: '1px solid #cccccc',
      padding: '0',
      marging: '0'    
    },
    toolbarActions: {
      flexGrow: 1,
    },
    toolbarListActions: {
      flexGrow: 1
    },
    search: {
      borderRadius: 9,
      backgroundColor: fade(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: fade(theme.palette.common.white, 0.25),
      },
      margin: '10px 0px',
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
      },
      float: 'right'
    },
    searchIcon: {
      padding: '6px 0 0 5px',
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      alignItems: 'center',
      justifyContent: 'center',
    },
    searchInputRoot: {
      color: 'inherit',
    }, toolbalLeft: {
      float: 'right'
    },
    searchInputInput: {
      // padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      border: '1px solid #ffa800',
      borderRadius: 4,
      paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
      transition: theme.transitions.create('width'),
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        width: '12ch',
        '&:focus': {
          width: '20ch',
        },
      },
    }
  })
);