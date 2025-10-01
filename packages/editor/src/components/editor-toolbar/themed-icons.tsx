/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

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
