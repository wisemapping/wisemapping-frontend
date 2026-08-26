import styled from 'styled-components';
import { Theme } from '@mui/material/styles';

interface ThemedProps {
  theme?: Theme;
}

export const InspectorContainer = styled.aside<ThemedProps & { $open?: boolean }>`
  position: absolute;
  top: 56px;
  right: 0;
  bottom: 0;
  width: ${({ $open = true }) => ($open ? '320px' : '48px')};
  max-width: 90vw;
  background-color: ${({ theme }) => theme?.palette?.background?.paper || '#fff'};
  border-left: 1px solid ${({ theme }) => theme?.palette?.divider || 'rgba(0,0,0,0.12)'};
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  z-index: 10;
  overflow: hidden;
  transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;

  @media (max-width: 600px) {
    top: auto;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    max-height: ${({ $open = true }) => ($open ? '60vh' : '0px')};
    display: ${({ $open = true }) => ($open ? 'flex' : 'none')};
    border-left: none;
    border-top: ${({ $open = true, theme }) =>
      $open ? `1px solid ${theme?.palette?.divider || 'rgba(0,0,0,0.12)'}` : 'none'};
    border-radius: 16px 16px 0 0;
  }
`;

export const CollapsedRail = styled.div<ThemedProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
  gap: 6px;
  width: 48px;
  height: 100%;
`;

export const CollapsedRailButton = styled.button<ThemedProps & { $active?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ $active, theme }) =>
    $active
      ? theme?.palette?.mode === 'dark'
        ? 'rgba(198, 113, 57, 0.2)'
        : 'rgba(198, 113, 57, 0.12)'
      : 'transparent'};
  border: none;
  color: ${({ $active, theme }) =>
    $active
      ? theme?.palette?.primary?.main || '#c67139'
      : theme?.palette?.text?.secondary || '#78716c'};
  cursor: pointer;
  outline: none;
  transition: all 0.15s ease;

  &:hover {
    background-color: ${({ theme }) =>
      theme?.palette?.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'};
    color: ${({ theme }) => theme?.palette?.text?.primary || '#1c1917'};
  }
`;

export const InspectorHeader = styled.header<ThemedProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme?.palette?.divider || 'rgba(0,0,0,0.12)'};
  font-weight: 600;
  font-size: 15px;
  color: ${({ theme }) => theme?.palette?.text?.primary || '#1c1917'};
`;

export const InspectorTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const InspectorTabs = styled.nav<ThemedProps>`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme?.palette?.divider || 'rgba(0,0,0,0.12)'};
  background-color: ${({ theme }) =>
    theme?.palette?.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'};
`;

export const InspectorTab = styled.button<ThemedProps & { $active?: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 8px;
  background: none;
  border: none;
  border-bottom: 2px solid
    ${({ $active, theme }) => ($active ? theme?.palette?.primary?.main || '#c67139' : 'transparent')};
  color: ${({ $active, theme }) => ($active ? theme?.palette?.primary?.main || '#c67139' : theme?.palette?.text?.secondary || '#78716c')};
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  font-size: 13px;
  cursor: pointer;
  outline: none;
  transition: all 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme?.palette?.text?.primary || '#1c1917'};
    background-color: ${({ theme }) =>
      theme?.palette?.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)'};
  }
`;

export const InspectorBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const SectionCard = styled.section<ThemedProps>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-radius: 12px;
  background-color: ${({ theme }) =>
    theme?.palette?.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'};
  border: 1px solid ${({ theme }) => theme?.palette?.divider || 'rgba(0,0,0,0.12)'};
`;

export const SectionTitle = styled.h4<ThemedProps>`
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme?.palette?.text?.primary || '#1c1917'};
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const EmptySelectionState = styled.div<ThemedProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  text-align: center;
  color: ${({ theme }) => theme?.palette?.text?.secondary || '#78716c'};
  gap: 12px;
  font-size: 13px;
`;
