import { styled } from '@mui/material/styles';
/* Footer */

export const StyledFooter = styled('footer')(({ theme }) => ({
  height: '250px',
  marginTop: '80px',
  padding: '30px 40px 10px 50px',
  backgroundColor: theme.palette.primary.main,
  display: 'grid',
  gridTemplateColumns: '200px 1fr 1fr 1fr 3fr',
  overflow: 'hidden',

  '& a': {
    fontSize: '14px',
    color: 'white',
    wordWrap: 'nowrap',
  },

  '& h4': {
    fontSize: '14px',
    color: 'white',
    wordWrap: 'nowrap',
    fontWeight: '500px',
    margin: '0px',
  },

  '& > svg': {
    gridColumn: '1',
  },

  '& div:nth-of-type(1)': {
    gridColumn: '2',
  },

  '& div:nth-of-type(2)': {
    gridColumn: '3',
  },

  '& div:nth-of-type(3)': {
    gridColumn: '4',
  },

  '& div:nth-of-type(4)': {
    gridColumn: '5',
    textAlign: 'right',
    display: 'inline-block',
    visibility: 'visible',
  },
}));
