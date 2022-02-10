import styled, { css } from 'styled-components';
import Button from '@mui/material/Button';

export const StyledButton = styled(Button)`
  margin: 4px;
`;

export const NewLabelContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 15px 0 5px 0 ;
`;

const SIZE = 25;
export const NewLabelColor = styled.div`
  width: ${SIZE}px;
  height: ${SIZE}px;
  border-radius: ${SIZE * 0.25}px;
  border: 1px solid black;
  margin: 1px ${SIZE * 0.5}px 1px 0px;
  ${props => props.color && css`
    background-color: ${props.color};
  `}
  cursor: pointer;
`;

export const CreateLabel = styled.div`
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;
