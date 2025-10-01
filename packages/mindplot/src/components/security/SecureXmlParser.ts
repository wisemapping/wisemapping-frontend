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
 * Secure XML parser that prevents XXE (XML External Entity) attacks
 * and other XML-based security vulnerabilities.
 */
class SecureXmlParser {
  // Maximum file size for XML parsing (10MB)
  private static readonly MAX_XML_SIZE = 10 * 1024 * 1024;

  // Maximum depth for XML parsing to prevent XML bomb attacks
  private static readonly MAX_XML_DEPTH = 100;

  // Maximum number of nodes to prevent DoS
  private static readonly MAX_XML_NODES = 10000;

  /**
   * Safely parse XML content with security protections
   * @param xmlContent - The XML content to parse
   * @returns Parsed XML document or null if parsing fails
   */
  static parseSecureXml(xmlContent: string): Document | null {
    try {
      // Validate input
      if (!xmlContent || typeof xmlContent !== 'string') {
        throw new Error('Invalid XML content');
      }

      // Check content size
      if (xmlContent.length > this.MAX_XML_SIZE) {
        throw new Error('XML content too large');
      }

      // Remove potential XXE attacks before parsing
      const sanitizedXml = this.sanitizeXmlContent(xmlContent);

      // Create parser with security restrictions
      const parser = new DOMParser();

      // Parse with 'text/xml' to avoid external entity resolution
      const doc = parser.parseFromString(sanitizedXml, 'text/xml');

      // Check for parsing errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        throw new Error('XML parsing error');
      }

      // Validate document structure
      this.validateXmlDocument(doc);

      return doc;
    } catch (error) {
      console.error('Secure XML parsing failed:', error);
      return null;
    }
  }

  /**
   * Sanitize XML content to remove potential XXE attacks
   * @param xmlContent - The XML content to sanitize
   * @returns Sanitized XML content
   */
  private static sanitizeXmlContent(xmlContent: string): string {
    let sanitized = xmlContent;

    // Remove DOCTYPE declarations that could contain external entities
    sanitized = sanitized.replace(/<!DOCTYPE[^>]*>/gi, '');

    // Remove any remaining ENTITY declarations
    sanitized = sanitized.replace(/<!ENTITY[^>]*>/gi, '');

    // Remove external entity references
    sanitized = sanitized.replace(/&[a-zA-Z][a-zA-Z0-9]*;/g, '');

    // Remove processing instructions that could be dangerous
    sanitized = sanitized.replace(/<\?[^>]*\?>/g, '');

    // Remove comments that might contain malicious content
    sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, '');

    return sanitized;
  }

  /**
   * Validate XML document structure to prevent DoS attacks
   * @param doc - The XML document to validate
   */
  private static validateXmlDocument(doc: Document): void {
    // Count total nodes to prevent DoS
    const allNodes = doc.querySelectorAll('*');
    if (allNodes.length > this.MAX_XML_NODES) {
      throw new Error('Too many XML nodes');
    }

    // Check for excessive nesting depth
    const maxDepth = this.calculateMaxDepth(doc.documentElement);
    if (maxDepth > this.MAX_XML_DEPTH) {
      throw new Error('XML nesting too deep');
    }

    // Check for extremely long attribute values
    const allElements = doc.querySelectorAll('*');
    allElements.forEach((element) => {
      const { attributes } = element;
      Array.from(attributes).forEach((attr) => {
        if (attr.value && attr.value.length > 10000) {
          // 10KB limit per attribute
          throw new Error('Attribute value too long');
        }
      });
    });
  }

  /**
   * Calculate maximum nesting depth of XML document
   * @param element - Root element to analyze
   * @returns Maximum depth
   */
  private static calculateMaxDepth(element: Element): number {
    let maxDepth = 0;

    const calculateDepth = (el: Element, currentDepth: number): void => {
      maxDepth = Math.max(maxDepth, currentDepth);

      const { children } = el;
      Array.from(children).forEach((child) => {
        calculateDepth(child, currentDepth + 1);
      });
    };

    calculateDepth(element, 0);
    return maxDepth;
  }

  /**
   * Safely extract text content from XML element
   * @param element - XML element to extract text from
   * @returns Extracted text content
   */
  static extractTextContent(element: Element): string {
    if (!element) {
      return '';
    }

    // Get text content safely
    const textContent = element.textContent || '';

    // Limit text content length
    if (textContent.length > 50000) {
      // 50KB limit
      return textContent.substring(0, 50000);
    }

    return textContent;
  }

  /**
   * Safely extract attribute value from XML element
   * @param element - XML element
   * @param attributeName - Name of the attribute
   * @returns Attribute value or empty string
   */
  static extractAttributeValue(element: Element, attributeName: string): string {
    if (!element || !attributeName) {
      return '';
    }

    const value = element.getAttribute(attributeName);
    if (!value) {
      return '';
    }

    // Limit attribute value length
    if (value.length > 10000) {
      // 10KB limit
      return value.substring(0, 10000);
    }

    return value;
  }

  /**
   * Check if XML content contains potentially dangerous patterns
   * @param xmlContent - XML content to check
   * @returns true if content appears safe, false otherwise
   */
  static isXmlContentSafe(xmlContent: string): boolean {
    if (!xmlContent || typeof xmlContent !== 'string') {
      return false;
    }

    // Check for dangerous patterns
    const dangerousPatterns = [
      /<!DOCTYPE[^>]*\[[^\]]*ENTITY[^\]]*\]/gi,
      /<!ENTITY[^>]*>/gi,
      /&[a-zA-Z][a-zA-Z0-9]*;/g,
      /<\?xml-stylesheet[^>]*>/gi,
      /<\?xml-stylesheet[^>]*>/gi,
      /<script[^>]*>/gi,
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi,
    ];

    const hasDangerousPattern = dangerousPatterns.some((pattern) => pattern.test(xmlContent));
    if (hasDangerousPattern) {
      return false;
    }

    // Check for XML bomb patterns
    const bombPatterns = [
      /<[^>]{1000,}>/g, // Very long tags
      /<!\[CDATA\[[\s\S]*?\]\]>/g, // CDATA sections (using [\s\S] instead of . with s flag)
    ];

    const hasBombPattern = bombPatterns.some((pattern) => {
      const matches = xmlContent.match(pattern);
      if (matches) {
        return matches.some((match) => match.length > 10000);
      }
      return false;
    });

    if (hasBombPattern) {
      return false;
    }

    return true;
  }
}

export default SecureXmlParser;
