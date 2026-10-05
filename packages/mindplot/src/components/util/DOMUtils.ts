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

/**
 * Utility class to replace jQuery DOM manipulation methods with native DOM APIs
 */
/* eslint-disable consistent-return */
class DOMUtils {
  /**
   * Set a CSS style on an element
   * Replaces: $(element).css(property, value)
   */
  static css(element: HTMLElement, property: string, value: string): void {
    (element.style as unknown as Record<string, string>)[property] = value;
  }

  /**
   * Set the HTML content of an element
   * Replaces: $(element).html(content)
   */
  static html(element: HTMLElement, content: string): void {
    element.innerHTML = content;
  }

  /**
   * Set the text content of an element
   * Replaces: $(element).text(content)
   */
  static text(element: HTMLElement, content: string): void {
    element.textContent = content;
  }

  /**
   * Set an attribute value
   * Replaces: $(element).attr(name, value)
   */
  static attr(element: HTMLElement, name: string, value: string): void {
    element.setAttribute(name, value);
  }

  /**
   * Set or get form input value
   * Replaces: $(input).val(value) or $(input).val()
   */
  static val(element: HTMLInputElement | HTMLTextAreaElement, value: string): void;

  static val(element: HTMLInputElement | HTMLTextAreaElement): string;

  static val(element: HTMLInputElement | HTMLTextAreaElement, value?: string): string | void {
    if (value !== undefined) {
      element.value = value;
      return;
    }
    return element.value;
  }

  /**
   * Show an element
   * Replaces: $(element).show()
   */
  static show(element: HTMLElement): void {
    element.style.display = 'block';
  }

  /**
   * Hide an element
   * Replaces: $(element).hide()
   */
  static hide(element: HTMLElement): void {
    element.style.display = 'none';
  }

  /**
   * Get element width
   * Replaces: $(element).width()
   */
  static width(element: HTMLElement): number {
    return element.offsetWidth;
  }

  /**
   * Get element height
   * Replaces: $(element).height()
   */
  static height(element: HTMLElement): number {
    return element.offsetHeight;
  }

  /**
   * Get window width
   * Replaces: $(window).width()
   */
  static windowWidth(): number {
    return window.innerWidth;
  }

  /**
   * Append child element
   * Replaces: $(parent).append(child)
   */
  static append(parent: HTMLElement, child: HTMLElement): void {
    parent.appendChild(child);
  }

  /**
   * Remove element from DOM
   * Replaces: $(element).remove()
   */
  static remove(element: HTMLElement): void {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }

  /**
   * Find child elements by selector
   * Replaces: $(element).find(selector)
   */
  static find(element: HTMLElement, selector: string): HTMLElement[] {
    return Array.from(element.querySelectorAll(selector));
  }

  /**
   * Create DOM element
   * Replaces: $('<div></div>')
   */
  static createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
  ): HTMLElementTagNameMap[K] {
    return document.createElement(tagName);
  }

  /**
   * Create a new XML Document instance
   */
  static createDocument(): Document {
    const doc: Document | null =
      window.document.implementation?.createDocument('', '', null) ?? null;

    if (!doc) {
      throw new Error('Document could not be initialized');
    }

    return doc;
  }
}

export default DOMUtils;

// Named export for convenience
export const { createDocument } = DOMUtils;
