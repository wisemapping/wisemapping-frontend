import styled from 'styled-components';

const ActionButton = styled.div`
  cursor: pointer;
  margin: 0px 10px;
  font-family: Arial, Helvetica, sans-serif;
  user-select: none;
  vertical-align: middle;
  justify-content: center;
  padding: 10px 25px;
  font-size: 15px;
  min-width: 64px;
  box-sizing: border-box;
  font-weight: 600;
  border-radius: 9px;
  color: white;
  background-color: #ffa800;
  display: inline-block;

  &:hover {
    transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
      box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
      border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  }
`;

export default ActionButton;
