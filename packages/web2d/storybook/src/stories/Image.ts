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
/* eslint-disable import/prefer-default-export */
// eslint-disable-next-line import/prefer-default-export
import Image from '../../../src/components/Image';
import Workspace from '../../../src/components/Workspace';
import { addReferencePoints } from './Reference';

/** [x, y, width, height] */
export type ImageBox = [number, number, number, number];

export type ImageArgs = {
  images: ImageBox[];
  coordSize?: number;
};

// An inline image, so the story does not depend on the network or on asset paths.
export const IMAGE_HREF: string = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">' +
    '<rect width="40" height="40" fill="#ffd54f"/>' +
    '<circle cx="20" cy="20" r="12" fill="#e64a19"/>' +
    '<rect x="0" y="0" width="20" height="20" fill="#1e88e5"/>' +
    '</svg>',
)}`;

// Each image is [x, y, width, height]; the top-left corner gets a reference dot.
export const createImage = ({ images, coordSize = 400 }: ImageArgs): HTMLDivElement => {
  const divElem = document.createElement('div');
  const workspace = new Workspace();
  workspace.setSize('400px', '400px');
  workspace.setCoordSize(coordSize, coordSize);
  workspace.setCoordOrigin(0, 0);

  images.forEach(([x, y, width, height]) => {
    const image = new Image();
    image.setHref(IMAGE_HREF);
    image.setPosition(x, y);
    image.setSize(width, height);
    workspace.append(image);
  });

  addReferencePoints(
    workspace,
    images.map(([x, y]) => [x, y]),
  );
  workspace.addItAsChildTo(divElem);
  return divElem;
};
