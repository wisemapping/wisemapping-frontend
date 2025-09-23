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
 * Security configuration for preventing various web security vulnerabilities
 * including XSS, clickjacking, iframe injection, and other attacks.
 */
export class SecurityConfig {
  /**
   * Content Security Policy (CSP) configuration
   * Prevents XSS attacks by controlling which resources can be loaded
   */
  static readonly CSP_HEADER = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Note: unsafe-eval needed for some libraries
    "style-src 'self' 'unsafe-inline'", // unsafe-inline needed for dynamic styles
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https: wss:",
    "media-src 'self'",
    "object-src 'none'", // Block all plugins
    "frame-src 'none'", // Block all frames/iframes
    "frame-ancestors 'none'", // Prevent embedding in frames
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ].join('; ');

  /**
   * X-Frame-Options header to prevent clickjacking
   * DENY prevents the page from being displayed in any frame
   */
  static readonly X_FRAME_OPTIONS = 'DENY';

  /**
   * X-Content-Type-Options header to prevent MIME type sniffing
   */
  static readonly X_CONTENT_TYPE_OPTIONS = 'nosniff';

  /**
   * X-XSS-Protection header (legacy, but still useful for older browsers)
   */
  static readonly X_XSS_PROTECTION = '1; mode=block';

  /**
   * Referrer-Policy header to control referrer information
   */
  static readonly REFERRER_POLICY = 'strict-origin-when-cross-origin';

  /**
   * Permissions-Policy header to control browser features
   */
  static readonly PERMISSIONS_POLICY = [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
    'ambient-light-sensor=()',
    'autoplay=()',
    'fullscreen=(self)',
    'picture-in-picture=()',
  ].join(', ');

  /**
   * Maximum file size for imports (in bytes)
   * Prevents DoS attacks through large file uploads
   */
  static readonly MAX_IMPORT_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  /**
   * Maximum HTML content length for rich text (in characters)
   * Prevents DoS attacks through large HTML content
   */
  static readonly MAX_HTML_CONTENT_LENGTH = 100000; // 100KB

  /**
   * Maximum depth for XML parsing to prevent XML bomb attacks
   */
  static readonly MAX_XML_DEPTH = 100;

  /**
   * Maximum number of nodes in a mindmap to prevent DoS
   */
  static readonly MAX_MINDMAP_NODES = 10000;

  /**
   * Allowed file extensions for imports
   */
  static readonly ALLOWED_IMPORT_EXTENSIONS = [
    '.wxml',
    '.mm',
    '.mmx',
    '.xmind',
    '.mmap',
    '.opml',
    '.txt',
    '.md',
  ];

  /**
   * Allowed MIME types for imports
   */
  static readonly ALLOWED_IMPORT_MIME_TYPES = [
    'application/xml',
    'text/xml',
    'text/plain',
    'text/markdown',
    'application/octet-stream',
  ];

  /**
   * Dangerous file extensions that should be blocked
   */
  static readonly BLOCKED_EXTENSIONS = [
    '.exe',
    '.bat',
    '.cmd',
    '.com',
    '.pif',
    '.scr',
    '.vbs',
    '.js',
    '.jar',
    '.php',
    '.asp',
    '.aspx',
    '.jsp',
    '.py',
    '.rb',
    '.pl',
    '.sh',
    '.ps1',
    '.psm1',
    '.psd1',
    '.ps1xml',
    '.psc1',
    '.pssc',
  ];

  /**
   * Apply security headers to a response
   * @param headers - Headers object to modify
   */
  static applySecurityHeaders(headers: Record<string, string>): void {
    headers['Content-Security-Policy'] = this.CSP_HEADER;
    headers['X-Frame-Options'] = this.X_FRAME_OPTIONS;
    headers['X-Content-Type-Options'] = this.X_CONTENT_TYPE_OPTIONS;
    headers['X-XSS-Protection'] = this.X_XSS_PROTECTION;
    headers['Referrer-Policy'] = this.REFERRER_POLICY;
    headers['Permissions-Policy'] = this.PERMISSIONS_POLICY;
  }

  /**
   * Validate file upload for security
   * @param file - File to validate
   * @returns true if file is safe, false otherwise
   */
  static validateFileUpload(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.MAX_IMPORT_FILE_SIZE) {
      return { valid: false, error: 'File too large' };
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    const hasBlockedExtension = this.BLOCKED_EXTENSIONS.some((ext) => fileName.endsWith(ext));

    if (hasBlockedExtension) {
      return { valid: false, error: 'File type not allowed' };
    }

    // Check MIME type
    if (file.type && !this.ALLOWED_IMPORT_MIME_TYPES.includes(file.type)) {
      // Allow empty MIME type as some systems don't set it correctly
      if (file.type !== '') {
        return { valid: false, error: 'MIME type not allowed' };
      }
    }

    return { valid: true };
  }

  /**
   * Validate HTML content for security
   * @param content - HTML content to validate
   * @returns true if content is safe, false otherwise
   */
  static validateHtmlContent(content: string): { valid: boolean; error?: string } {
    if (!content || typeof content !== 'string') {
      return { valid: true };
    }

    // Check content length
    if (content.length > this.MAX_HTML_CONTENT_LENGTH) {
      return { valid: false, error: 'HTML content too large' };
    }

    // Check for dangerous patterns
    const dangerousPatterns = [
      /<script[^>]*>/gi,
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi,
      /<link[^>]*>/gi,
      /<meta[^>]*>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /data:text\/html/gi,
      /on\w+\s*=/gi,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(content)) {
        return { valid: false, error: 'Dangerous HTML content detected' };
      }
    }

    return { valid: true };
  }

  /**
   * Validate XML content for security
   * @param content - XML content to validate
   * @returns true if content is safe, false otherwise
   */
  static validateXmlContent(content: string): { valid: boolean; error?: string } {
    if (!content || typeof content !== 'string') {
      return { valid: true };
    }

    // Check content length
    if (content.length > this.MAX_IMPORT_FILE_SIZE) {
      return { valid: false, error: 'XML content too large' };
    }

    // Check for XXE attacks
    const xxePatterns = [
      /<!DOCTYPE[^>]*\[[^\]]*ENTITY[^\]]*\]/gi,
      /<!ENTITY[^>]*>/gi,
      /&[a-zA-Z][a-zA-Z0-9]*;/g,
    ];

    for (const pattern of xxePatterns) {
      if (pattern.test(content)) {
        return { valid: false, error: 'Potential XXE attack detected' };
      }
    }

    // Check for XML bomb patterns
    const bombPatterns = [
      /<[^>]{1000,}>/g, // Very long tags
      /<!\[CDATA\[[\s\S]*?\]\]>/g, // CDATA sections (using [\s\S] instead of . with s flag)
    ];

    for (const pattern of bombPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches) {
          if (match.length > 10000) {
            // 10KB limit per CDATA section
            return { valid: false, error: 'Potential XML bomb detected' };
          }
        }
      }
    }

    return { valid: true };
  }
}

export default SecurityConfig;
