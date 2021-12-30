import $ from 'jquery';
import svgResource from './resources/logo-icon.svg';
import pngResource from './resources/logo-icon.png';

import {
  Workspace, Image,
} from '../../src';

// URL Based image test ...
const workspace = new Workspace({ fillColor: 'light-gray' });
workspace.setSize('200px', '100px');

// Add SVG Image ...
const svgImage = new Image();
svgImage.setHref(svgResource);
svgImage.setSize(80, 120);
workspace.append(svgImage);

// Add PNG Image ...
const pngImage = new Image();
pngImage.setHref(pngResource);
pngImage.setSize(60, 120);
pngImage.setPosition(80, 0);
workspace.append(pngImage);

workspace.addItAsChildTo($('#urlImage').first());

// Embedded image test ...
