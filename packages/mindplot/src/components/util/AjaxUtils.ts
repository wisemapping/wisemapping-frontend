/**
 * AJAX utility class to replace jQuery AJAX methods with native fetch API
 */
export interface AjaxOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: unknown;
  headers?: { [key: string]: string };
  dataType?: 'json' | 'text' | 'xml' | 'html';
  contentType?: string;
  timeout?: number;
}

export class AjaxUtils {
  /**
   * Make AJAX request
   * Replaces: $.ajax(options)
   */
  static async ajax(options: AjaxOptions): Promise<unknown> {
    const {
      url,
      method = 'GET',
      data,
      headers = {},
      dataType = 'json',
      contentType,
      timeout = 30000,
    } = options;

    // Set up request configuration
    const config: RequestInit = {
      method,
      headers: { ...headers },
    };

    // Add content-type header if specified
    if (contentType) {
      (config.headers as Record<string, string>)['Content-Type'] = contentType;
    }

    // Handle request body for POST/PUT/PATCH
    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      if (typeof data === 'object') {
        if (!contentType || contentType.includes('application/json')) {
          config.body = JSON.stringify(data);
          (config.headers as Record<string, string>)['Content-Type'] = 'application/json';
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          config.body = new URLSearchParams(data as Record<string, string>).toString();
        } else {
          config.body = data as BodyInit;
        }
      } else {
        config.body = data as BodyInit;
      }
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    config.signal = controller.signal;

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse response based on dataType
      switch (dataType) {
        case 'json':
          return await response.json();
        case 'text':
        case 'html':
          return await response.text();
        case 'xml': {
          const xmlText = await response.text();
          return this.parseXML(xmlText);
        }
        default:
          return response;
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  /**
   * Make GET request
   * Replaces: $.get(url, data, callback, dataType)
   */
  static async get(
    url: string,
    data?: unknown,
    dataType: 'json' | 'text' | 'xml' = 'json',
  ): Promise<unknown> {
    let fullUrl = url;

    if (data && typeof data === 'object') {
      const params = new URLSearchParams(data as Record<string, string>);
      fullUrl += (url.includes('?') ? '&' : '?') + params.toString();
    }

    return this.ajax({ url: fullUrl, method: 'GET', dataType });
  }

  /**
   * Make POST request
   * Replaces: $.post(url, data, callback, dataType)
   */
  static async post(
    url: string,
    data?: unknown,
    dataType: 'json' | 'text' | 'xml' = 'json',
  ): Promise<unknown> {
    return this.ajax({ url, method: 'POST', data, dataType });
  }

  /**
   * Load JSON data
   * Replaces: $.getJSON(url, data, callback)
   */
  static async getJSON(url: string, data?: unknown): Promise<unknown> {
    return this.get(url, data, 'json');
  }

  /**
   * Parse XML string to Document
   * Replaces: $.parseXML(xmlString)
   */
  static parseXML(xmlString: string): Document {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    // Check for parsing errors
    const parseError = xmlDoc.getElementsByTagName('parsererror');
    if (parseError.length > 0) {
      throw new Error(`XML parsing error: ${parseError[0].textContent}`);
    }

    return xmlDoc;
  }

  /**
   * Load external script
   * Replaces: $.getScript(url, callback)
   */
  static async loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
      document.head.appendChild(script);
    });
  }

  /**
   * Serialize form data
   * Replaces: $(form).serialize()
   */
  static serialize(form: HTMLFormElement): string {
    const formData = new FormData(form);
    return new URLSearchParams(formData as unknown as Record<string, string>).toString();
  }

  /**
   * Serialize form data to object
   * Replaces: $(form).serializeArray()
   */
  static serializeObject(form: HTMLFormElement): { [key: string]: unknown } {
    const formData = new FormData(form);
    const result: { [key: string]: unknown } = {};

    formData.forEach((value, key) => {
      if (result[key]) {
        // Handle multiple values for same key
        if (Array.isArray(result[key])) {
          result[key].push(value);
        } else {
          result[key] = [result[key], value];
        }
      } else {
        result[key] = value;
      }
    });

    return result;
  }
}
