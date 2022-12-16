import React from 'react';
import { useTheme } from '@mui/material/styles';
import { containerStyle, lineStyle, textStyle } from './style';

type SeparatorProps = {
  responsive: boolean;
  text: string;
  maxWidth?: number;
};

const Separator: React.FunctionComponent<SeparatorProps> = ({
  responsive,
  text,
  maxWidth = undefined,
}: SeparatorProps) => {
  const theme = useTheme();

  return (
    // eslint-disable-next-line react/no-unknown-property
    <div css={containerStyle(responsive, maxWidth, theme.breakpoints.down('md'))}>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <div css={lineStyle(responsive, theme.breakpoints.up('md'))}></div>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <div css={textStyle(responsive, theme.breakpoints.up('md'))}>{text}</div>
    </div>
  );
};

export default Separator;
