import styled, { css } from 'styled-components';

const SIZE = 20;

export const Color = styled.div`
  width: ${SIZE}px;
  height: ${SIZE}px;
  border-radius: ${SIZE * 0.25}px;
  border: 1px solid black;
  margin: 1px ${SIZE * 0.5}px 1px 0px;
  ${props => props.color && css`
    background-color: ${props.color};
  `}
`;

export const StyledLabel = styled.div`
  display: flex;
  flex-direction: row;
`;

export const Name = styled.div`
  flex: 1;
`;
