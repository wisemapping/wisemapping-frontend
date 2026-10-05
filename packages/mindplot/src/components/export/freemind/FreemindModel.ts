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

/*
 * The elements of a FreeMind map (.mm), as plain data. Attributes keep their XML names, and the
 * attribute lists give the order in which they are written.
 */

export const NODE_ATTRIBUTES = [
  'ID',
  'POSITION',
  'STYLE',
  'BACKGROUND_COLOR',
  'COLOR',
  'TEXT',
  'LINK',
  'FOLDED',
  'CREATED',
  'MODIFIED',
  'HGAP',
  'VGAP',
  'WCOORDS',
  'WORDER',
  'VSHIFT',
  'ENCRYPTED_CONTENT',
] as const;

export const FONT_ATTRIBUTES = ['SIZE', 'BOLD', 'ITALIC', 'NAME'] as const;

export const EDGE_ATTRIBUTES = ['COLOR', 'STYLE', 'WIDTH'] as const;

export const ARROWLINK_ATTRIBUTES = [
  'DESTINATION',
  'STARTARROW',
  'COLOR',
  'ENDINCLINATION',
  'ENDARROW',
  'ID',
  'STARTINCLINATION',
] as const;

export const CLOUD_ATTRIBUTES = ['COLOR'] as const;

export const ICON_ATTRIBUTES = ['BUILTIN'] as const;

export type Attributes<T extends readonly string[]> = { [name in T[number]]?: string };

export interface FreemindNode extends Attributes<typeof NODE_ATTRIBUTES> {
  kind: 'node';
  children: FreemindElement[];
}

export interface FreemindFont extends Attributes<typeof FONT_ATTRIBUTES> {
  kind: 'font';
}

export interface FreemindEdge extends Attributes<typeof EDGE_ATTRIBUTES> {
  kind: 'edge';
}

export interface FreemindArrowlink extends Attributes<typeof ARROWLINK_ATTRIBUTES> {
  kind: 'arrowlink';
  // Freeplane only: the dash pattern, its lengths separated by spaces. It is written, not read.
  DASH?: string;
}

export interface FreemindCloud extends Attributes<typeof CLOUD_ATTRIBUTES> {
  kind: 'cloud';
}

export interface FreemindIcon extends Attributes<typeof ICON_ATTRIBUTES> {
  kind: 'icon';
}

// A plugin. FreeMind 0.7 stored notes as hooks with a <text> child.
export interface FreemindHook {
  kind: 'hook';
  NAME?: string;
  text?: string;
}

// A rich text (an <html> document) of TYPE NODE (the node text) or NOTE.
export interface FreemindRichcontent {
  kind: 'richcontent';
  TYPE?: string;
  html?: string;
}

export type FreemindElement =
  | FreemindNode
  | FreemindFont
  | FreemindEdge
  | FreemindArrowlink
  | FreemindCloud
  | FreemindIcon
  | FreemindHook
  | FreemindRichcontent;

export interface FreemindMap {
  version?: string;
  node?: FreemindNode;
}

export const createFreemindNode = (): FreemindNode => ({ kind: 'node', children: [] });

// For the default case of a switch on the kind: the element is never, so a kind that is not
// handled fails to compile. At runtime, an element of an unknown kind is skipped.
export const unknownFreemindElement = (_element: never): null => null;
