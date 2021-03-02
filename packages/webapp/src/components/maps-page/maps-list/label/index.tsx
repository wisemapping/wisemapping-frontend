import React from 'react';
import { Color, StyledLabel, Name } from './styled';

type Props = { name: string, color: string };

export function Label({ name, color }: Props): React.ReactElement<Props> {
  return (
    <StyledLabel>
      <Color color={color} />
      <Name>{name}</Name>
    </StyledLabel>
  );
}
