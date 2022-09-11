import styled from 'styled-components';
import IconButton from '@mui/material/IconButton';
import LabelTwoTone from '@mui/icons-material/LabelTwoTone';

export const StyledButton = styled(IconButton)`
  margin: 4px;
`;

export const NewLabelContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const NewLabelColor = styled(LabelTwoTone)`
  margin-right: 12px;
  cursor: pointer;
`;

export const CreateLabel = styled.div`
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;
