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

/**
 * HTML Sanitizer for preventing XSS attacks and other security vulnerabilities
 * in rich text content imported from external sources.
 */
class HtmlSanitizer {
  // Allowed HTML tags for rich text formatting
  private static readonly ALLOWED_TAGS = new Set([
    'p',
    'br',
    'strong',
    'b',
    'em',
    'i',
    'u',
    's',
    'strike',
    'del',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'blockquote',
    'div',
    'span',
    'a',
    'img',
    'code',
    'pre',
  ]);

  // Allowed attributes for specific tags
  private static readonly ALLOWED_ATTRIBUTES = new Map([
    ['a', new Set(['href', 'title', 'target'])],
    ['img', new Set(['src', 'alt', 'title', 'width', 'height'])],
    ['div', new Set(['class', 'style'])],
    ['span', new Set(['class', 'style'])],
    ['p', new Set(['class', 'style'])],
    ['h1', new Set(['class', 'style'])],
    ['h2', new Set(['class', 'style'])],
    ['h3', new Set(['class', 'style'])],
    ['h4', new Set(['class', 'style'])],
    ['h5', new Set(['class', 'style'])],
    ['h6', new Set(['class', 'style'])],
  ]);

  // Dangerous tags that should be completely removed
  private static readonly DANGEROUS_TAGS = new Set([
    'script',
    'style',
    'iframe',
    'object',
    'embed',
    'link',
    'meta',
    'form',
    'input',
    'button',
    'select',
    'textarea',
    'option',
    'applet',
    'base',
    'frame',
    'frameset',
    'noframes',
    'noscript',
    'template',
    'video',
    'audio',
    'source',
    'track',
    'canvas',
    'svg',
    'math',
    'webview',
    'portal',
    'details',
    'summary',
  ]);

  // Dangerous attributes that should be removed
  private static readonly DANGEROUS_ATTRIBUTES = new Set([
    'onload',
    'onerror',
    'onclick',
    'onmouseover',
    'onmouseout',
    'onfocus',
    'onblur',
    'onchange',
    'onsubmit',
    'onreset',
    'onkeydown',
    'onkeyup',
    'onkeypress',
    'onmousedown',
    'onmouseup',
    'onmousemove',
    'onmouseenter',
    'onmouseleave',
    'ondblclick',
    'oncontextmenu',
    'onwheel',
    'ontouchstart',
    'ontouchend',
    'ontouchmove',
    'ontouchcancel',
    'onabort',
    'oncanplay',
    'oncanplaythrough',
    'ondurationchange',
    'onemptied',
    'onended',
    'onerror',
    'onloadeddata',
    'onloadedmetadata',
    'onloadstart',
    'onpause',
    'onplay',
    'onplaying',
    'onprogress',
    'onratechange',
    'onseeked',
    'onseeking',
    'onstalled',
    'onsuspend',
    'ontimeupdate',
    'onvolumechange',
    'onwaiting',
    'onbeforeunload',
    'onhashchange',
    'onpagehide',
    'onpageshow',
    'onpopstate',
    'onresize',
    'onstorage',
    'onunload',
    'onmessage',
    'onmessageerror',
    'onoffline',
    'ononline',
  ]);

  // Dangerous URL schemes
  private static readonly DANGEROUS_PROTOCOLS = new Set([
    'javascript:', // eslint-disable-line no-script-url
    'vbscript:',
    'data:',
    'file:',
    'ftp:',
    'jar:',
    'chrome:',
    'chrome-extension:',
    'moz-extension:',
    'ms-appx:',
    'ms-appx-web:',
    'safari-extension:',
  ]);

  /**
   * Sanitizes HTML content to prevent XSS attacks and other security vulnerabilities
   * @param htmlContent - The HTML content to sanitize
   * @returns Sanitized HTML content safe for display
   */
  static sanitize(htmlContent: string): string {
    if (!htmlContent || typeof htmlContent !== 'string') {
      return '';
    }

    // Limit content length to prevent DoS attacks
    if (htmlContent.length > 100000) {
      // 100KB limit
      throw new Error('HTML content too large');
    }

    try {
      // Create a temporary DOM element to parse and clean the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;

      // Sanitize the DOM tree
      this.sanitizeNode(tempDiv);

      return tempDiv.innerHTML;
    } catch (error) {
      console.warn('HTML sanitization failed:', error);
      // Return plain text if sanitization fails
      return this.stripHtmlTags(htmlContent);
    }
  }

  /**
   * Recursively sanitizes a DOM node and its children
   * @param node - The DOM node to sanitize
   */
  private static sanitizeNode(node: Node): void {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();

      // Remove dangerous tags completely
      if (this.DANGEROUS_TAGS.has(tagName)) {
        element.parentNode?.removeChild(element);
        return;
      }

      // Remove tags not in allowed list
      if (!this.ALLOWED_TAGS.has(tagName)) {
        // Replace with span to preserve text content
        const span = document.createElement('span');
        while (element.firstChild) {
          span.appendChild(element.firstChild);
        }
        element.parentNode?.replaceChild(span, element);
        return;
      }

      // Sanitize attributes
      this.sanitizeAttributes(element);

      // Recursively sanitize children
      const children = Array.from(element.childNodes);
      children.forEach((child) => this.sanitizeNode(child));
    } else if (node.nodeType === Node.TEXT_NODE) {
      // Text nodes are safe, but we could add additional validation here
    } else {
      // Remove other node types (comments, CDATA, etc.)
      node.parentNode?.removeChild(node);
    }
  }

  /**
   * Sanitizes attributes of an element
   * @param element - The element to sanitize attributes for
   */
  private static sanitizeAttributes(element: Element): void {
    const tagName = element.tagName.toLowerCase();
    const allowedAttrs = this.ALLOWED_ATTRIBUTES.get(tagName) || new Set();
    const attributes = Array.from(element.attributes);

    attributes.forEach((attr) => {
      const attrName = attr.name.toLowerCase();

      // Remove dangerous attributes
      if (this.DANGEROUS_ATTRIBUTES.has(attrName)) {
        element.removeAttribute(attr.name);
        return;
      }

      // Remove attributes not in allowed list
      if (!allowedAttrs.has(attrName)) {
        element.removeAttribute(attr.name);
        return;
      }

      // Sanitize specific attributes
      if (attrName === 'href' || attrName === 'src') {
        const sanitizedUrl = this.sanitizeUrl(attr.value);
        if (sanitizedUrl) {
          element.setAttribute(attr.name, sanitizedUrl);
        } else {
          element.removeAttribute(attr.name);
        }
      } else if (attrName === 'style') {
        const sanitizedStyle = this.sanitizeStyle(attr.value);
        if (sanitizedStyle) {
          element.setAttribute(attr.name, sanitizedStyle);
        } else {
          element.removeAttribute(attr.name);
        }
      }
    });
  }

  /**
   * Sanitizes URLs to prevent dangerous protocols
   * @param url - The URL to sanitize
   * @returns Sanitized URL or null if dangerous
   */
  private static sanitizeUrl(url: string): string | null {
    if (!url || typeof url !== 'string') {
      return null;
    }

    // Check for dangerous protocols
    const lowerUrl = url.toLowerCase().trim();
    const isDangerous = Array.from(this.DANGEROUS_PROTOCOLS).some((protocol) =>
      lowerUrl.startsWith(protocol),
    );
    if (isDangerous) {
      return null;
    }

    // Allow relative URLs and safe protocols
    if (
      lowerUrl.startsWith('http://') ||
      lowerUrl.startsWith('https://') ||
      lowerUrl.startsWith('mailto:') ||
      lowerUrl.startsWith('tel:') ||
      lowerUrl.startsWith('/') ||
      lowerUrl.startsWith('#') ||
      !lowerUrl.includes(':')
    ) {
      return url;
    }

    return null;
  }

  /**
   * Sanitizes CSS styles to prevent CSS injection
   * @param style - The CSS style string to sanitize
   * @returns Sanitized CSS style or null if dangerous
   */
  private static sanitizeStyle(style: string): string | null {
    if (!style || typeof style !== 'string') {
      return null;
    }

    // Remove dangerous CSS properties and values
    const dangerousPatterns = [
      /expression\s*\(/gi,
      /javascript\s*:/gi,
      /vbscript\s*:/gi,
      /@import/gi,
      /behavior\s*:/gi,
      /-moz-binding/gi,
      /binding\s*:/gi,
    ];

    const hasDangerousPattern = dangerousPatterns.some((pattern) => pattern.test(style));
    if (hasDangerousPattern) {
      return null;
    }

    return style;
  }

  /**
   * Strips all HTML tags from content as a fallback
   * @param content - The content to strip HTML from
   * @returns Plain text content
   */
  private static stripHtmlTags(content: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    return tempDiv.textContent || tempDiv.innerText || '';
  }
}

export default HtmlSanitizer;
