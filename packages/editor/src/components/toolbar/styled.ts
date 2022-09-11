import styled from 'styled-components';

export const HeaderContainer = styled.div`
  width: 100%;
  height: 0px;
  background: #202020;
  z-index: 1000;
  position: absolute;
  top: 0;
  display: flex;
`;

export const ToolbarContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const ToolbarButton = styled.div`
  width: 28px;
  height: 28px;
  text-align: center;
  z-index: 4;
  margin-top: 3px;
  padding-top: 2px;
  padding-left: 2px;
  margin-left: 3px;
  display: inline-block;
`;

export const ToolbarButtonExt = styled(ToolbarButton)`
  width: 40px;
  text-align: left;
  padding-left: 5px;
`;

export const AccountButton = styled.div`
  display: inline-block;
  margin-top: 3px;
`;

export const ToolbarRightContainer = styled.div`
  flex-shrink: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  overflow: hidden;
`;
