import { css, SerializedStyles } from '@emotion/react';

export const containerStyle = (
  responsive: boolean,
  maxWidth: number,
  breakPointDownMd: string,
): SerializedStyles => {
  return css([
    {
      position: 'relative',
      width: '100%',
      height: '90%',
      top: '5%',
      display: 'inline-block',
    },
    responsive && {
      [breakPointDownMd]: {
        paddingTop: '25px',
        paddingBottom: '25px',
      },
    },
    !responsive && {
      paddingTop: '25px',
      paddingBottom: '25px',
    },
    maxWidth && {
      maxWidth: maxWidth,
    },
  ]);
};

export const lineStyle = (responsive: boolean, breakPointUpMd: string): SerializedStyles => {
  return css([
    {
      backgroundColor: '#dce2e6',
      position: 'absolute',
      left: '50%',
      height: '1px',
      width: '100%',
      transform: 'translateX(-50%)',
    },
    responsive && {
      [breakPointUpMd]: {
        height: '100%',
        width: '1px',
        transform: 'translateX(0%) translateY(0%)',
      },
    },
  ]);
};

export const textStyle = (responsive: boolean, breakPointUpMd: string): SerializedStyles => {
  return css([
    {
      backgroundColor: '#DCE2E6',
      padding: '5px 10px',
      minWidth: '36px',
      borderRadius: '18px',
      fontSize: '18px',
      color: 'white',
      textAlign: 'center',
      display: 'inline-block',
      position: 'absolute',
      transform: 'translateX(-50%) translateY(-50%)',
      left: '50%',
    },
    responsive && {
      [breakPointUpMd]: {
        top: '15%',
      },
    },
  ]);
};
