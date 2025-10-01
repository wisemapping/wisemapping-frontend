import { styled } from '@mui/material/styles';
/* Footer */

export const StyledFooter = styled('footer')(({ theme }) => ({
  height: '250px',
  marginTop: '80px',
  padding: '30px 0 10px 0',
  backgroundColor: theme.palette.primary.main,
  display: 'flex',
  justifyContent: 'center',
  overflow: 'hidden',

  '& > div': {
    maxWidth: '950px',
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '200px 1fr 1fr 1fr 3fr',
    padding: '0 20px',

    '& > div:nth-of-type(1)': {
      gridColumn: '1',
    },

    '& > div:nth-of-type(2)': {
      gridColumn: '2',
    },

    '& > div:nth-of-type(3)': {
      gridColumn: '3',
    },

    '& > div:nth-of-type(4)': {
      gridColumn: '4',
    },

    '& > div:nth-of-type(5)': {
      gridColumn: '5',
      textAlign: 'right',
      display: 'inline-block',
      visibility: 'visible',
    },
  },

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
}));
