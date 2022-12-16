import React from 'react';
import { css } from '@emotion/react';
import { Button } from '@mui/material';
import GoogleIcon from '../google-icon';

const googleButtonStyle = css({
  color: '#000000',
  fontWeight: '300',
  border: '1px solid black',
  '&:hover': {
    border: '1px solid black',
  },
});

type GoogleButtonProps = {
  text: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
};

const GoogleButton: React.FunctionComponent<GoogleButtonProps> = ({
  text,
  onClick,
}: GoogleButtonProps) => {
  return (
    <Button variant="outlined" css={googleButtonStyle} startIcon={GoogleIcon} onClick={onClick}>
      {text}
    </Button>
  );
};

export default GoogleButton;
