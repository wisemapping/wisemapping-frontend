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
   * Set or get CSS styles on an element
   * Replaces: $(element).css(property, value) or $(element).css(property)
   */
  static css(element: HTMLElement, property: string, value: string): void;

  static css(element: HTMLElement, property: string): string;

  static css(element: HTMLElement, property: string, value?: string): string | void {
    if (value !== undefined) {
      // Set CSS property
      (element.style as unknown as Record<string, string>)[property] = value;
      return;
    }
    // Get CSS property
    return getComputedStyle(element).getPropertyValue(property);
  }

  /**
   * Set or get HTML content of an element
   * Replaces: $(element).html(content) or $(element).html()
   */
  static html(element: HTMLElement, content: string): void;

  static html(element: HTMLElement): string;

  static html(element: HTMLElement, content?: string): string | void {
    if (content !== undefined) {
      element.innerHTML = content;
      return;
    }
    return element.innerHTML;
  }

  /**
   * Set or get text content of an element
   * Replaces: $(element).text(content) or $(element).text()
   */
  static text(element: HTMLElement, content: string): void;

  static text(element: HTMLElement): string;

  static text(element: HTMLElement, content?: string): string | void {
    if (content !== undefined) {
      element.textContent = content;
      return;
    }
    return element.textContent || '';
  }

  /**
   * Set or get attribute value
   * Replaces: $(element).attr(name, value) or $(element).attr(name)
   */
  static attr(element: HTMLElement, name: string, value: string): void;

  static attr(element: HTMLElement, name: string): string;

  static attr(element: HTMLElement, name: string, value?: string): string | void {
    if (value !== undefined) {
      element.setAttribute(name, value);
      return;
    }
    return element.getAttribute(name) || '';
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
   * Get window height
   * Replaces: $(window).height()
   */
  static windowHeight(): number {
    return window.innerHeight;
  }

  /**
   * Get element position relative to document
   * Replaces: $(element).offset()
   */
  static offset(element: HTMLElement, coords: { top: number; left: number }): void;

  static offset(element: HTMLElement): { top: number; left: number };

  static offset(
    element: HTMLElement,
    coords?: { top: number; left: number },
  ): { top: number; left: number } | void {
    if (coords !== undefined) {
      // Set position
      element.style.position = 'absolute';
      element.style.top = `${coords.top}px`;
      element.style.left = `${coords.left}px`;
      return;
    }
    // Get position
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top + window.pageYOffset,
      left: rect.left + window.pageXOffset,
    };
  }

  /**
   * Get element position relative to parent
   * Replaces: $(element).position()
   */
  static position(element: HTMLElement): { top: number; left: number } {
    return {
      top: element.offsetTop,
      left: element.offsetLeft,
    };
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
   * Get parent element
   * Replaces: $(element).parent()
   */
  static parent(element: HTMLElement): HTMLElement | null {
    return element.parentElement;
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
   * Simple fade out effect
   * Replaces: $(element).fadeOut(duration)
   */
  static fadeOut(element: HTMLElement, duration: number = 400): void {
    element.style.transition = `opacity ${duration}ms`;
    element.style.opacity = '0';

    setTimeout(() => {
      element.style.display = 'none';
      element.style.transition = '';
      element.style.opacity = '';
    }, duration);
  }
}

export default DOMUtils;
