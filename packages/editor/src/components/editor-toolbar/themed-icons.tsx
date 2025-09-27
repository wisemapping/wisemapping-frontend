import React from 'react';
import { styled } from '@mui/material/styles';
import SquareOutlined from '@mui/icons-material/SquareOutlined';
import Palette from '@mui/icons-material/Square';

// Theme-aware styled icons that use the model values internally
const ThemedSquareOutlined = styled(SquareOutlined, {
  shouldForwardProp: (prop) => prop !== 'modelValue',
})<{ modelValue?: string }>(({ theme, modelValue }) => ({
  color: modelValue || theme.palette.text.primary,
}));

const ThemedPalette = styled(Palette, {
  shouldForwardProp: (prop) => prop !== 'modelValue',
})<{ modelValue?: string }>(({ theme, modelValue }) => ({
  color: modelValue || theme.palette.text.primary,
}));

interface ThemedIconProps {
  modelValue?: string;
}

export const BorderColorIcon: React.FC<ThemedIconProps> = ({ modelValue }) => (
  <ThemedSquareOutlined modelValue={modelValue} />
);

export const FillColorIcon: React.FC<ThemedIconProps> = ({ modelValue }) => (
  <ThemedPalette modelValue={modelValue} />
);

export const ConnectionColorIcon: React.FC<ThemedIconProps> = ({ modelValue }) => (
  <ThemedPalette modelValue={modelValue} />
);

export const RelationshipColorIcon: React.FC<ThemedIconProps> = ({ modelValue }) => (
  <ThemedPalette modelValue={modelValue} />
);

export const FontColorIcon: React.FC<ThemedIconProps> = ({ modelValue }) => (
  <ThemedPalette modelValue={modelValue} />
);
