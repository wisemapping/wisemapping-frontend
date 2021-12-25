/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import { $assert } from '@wisemapping/core-js';
import $ from 'jquery';
import { $msg } from '../Messages';
import FloatingTip from './FloatingTip';

class LinkIconTooltip extends FloatingTip {
  constructor(linkIcon) {
    $assert(linkIcon, 'linkIcon can not be null');
    const nativeElement = $(linkIcon.getImage().peer._native);
    super(nativeElement, {
      // Content can also be a function of the target element!
      content: LinkIconTooltip._buildContent(linkIcon),
      html: true,
      placement: 'bottom',
      container: 'body',
      title: $msg('LINK'),
      trigger: 'manual',
      template: '<div id="linkPopover" class="popover" onmouseover="$(this).mouseleave(function() {$(this).fadeOut(200); });" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
    });
  }

  static _buildContent(linkIcon) {
    const result = $('<div></div>').css({
      padding: '5px',
      width: '100%',
    });

    const text = $('<div></div>').text(`URL: ${linkIcon.getModel().getUrl()}`)
      .css({
        'white-space': 'pre-wrap',
        'word-wrap': 'break-word',
      });
    result.append(text);

    const imgContainer = $('<div></div>')
      .css({
        width: '100%',
        textAlign: 'right',
        'padding-bottom': '5px',
        'padding-top': '5px',
      });

    const img = $('<img>')
      .prop('src', `http://free.pagepeeker.com/v2/thumbs.php?size=m&url=${linkIcon.getModel().getUrl()}`)
      .prop('img', linkIcon.getModel().getUrl())
      .prop('alt', linkIcon.getModel().getUrl());

    img.css('padding', '5px');

    const link = $('<a></a>').attr({
      href: linkIcon.getModel().getUrl(),
      alt: 'Open in new window ...',
      target: '_blank',
    });

    link.append(img);
    imgContainer.append(link);
    result.append(imgContainer);
    return result;
  }
}

export default LinkIconTooltip;
