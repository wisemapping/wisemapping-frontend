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

declare global {
  interface Window {
    newrelic: { noticeError: (error: string) => void };
  }
}

import { ErrorInfo } from './classes/client';

export const getCsrfToken = (): string | null => {
  const meta = document.head.querySelector('meta[name="_csrf"]');
  if (!meta) {
    return '';
  }
  return meta.getAttribute('content');
};

export const getCsrfTokenParameter = (): string | null => {
  const meta = document.head.querySelector('meta[name="_csrf_parameter"]');
  if (!meta) {
    return '';
  }
  return meta.getAttribute('content');
};

export const logCriticalError = (msg: string, exception: unknown): void => {
  // Serialize exception properly for logging
  let serializedException: string;
  if (exception instanceof Error) {
    try {
      serializedException = JSON.stringify({
        name: exception.name,
        message: exception.message,
        stack: exception.stack,
      });
    } catch {
      serializedException = `Error: ${exception.name} - ${exception.message}`;
    }
  } else if (typeof exception === 'object' && exception !== null) {
    try {
      // Handle debug info object with errorInfo and context
      if (
        'errorInfo' in exception &&
        'context' in exception &&
        typeof exception.errorInfo === 'object' &&
        exception.errorInfo !== null
      ) {
        const debugInfo = exception as {
          errorInfo: ErrorInfo;
          context: Record<string, unknown>;
        };
        // Safely serialize context by converting values to strings if needed
        const safeContext: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(debugInfo.context)) {
          try {
            // Try to serialize each value individually
            if (value === null || value === undefined) {
              safeContext[key] = value;
            } else if (
              typeof value === 'string' ||
              typeof value === 'number' ||
              typeof value === 'boolean'
            ) {
              safeContext[key] = value;
            } else {
              // For complex objects, try JSON.stringify, fallback to String
              try {
                JSON.stringify(value);
                safeContext[key] = value;
              } catch {
                safeContext[key] = String(value);
              }
            }
          } catch {
            safeContext[key] = '[Unable to serialize]';
          }
        }
        const serialized: Record<string, unknown> = {
          errorInfo: {
            isAuth: debugInfo.errorInfo.isAuth,
            msg: debugInfo.errorInfo.msg,
            status: debugInfo.errorInfo.status,
            fields: debugInfo.errorInfo.fields
              ? Object.fromEntries(debugInfo.errorInfo.fields)
              : undefined,
          },
          context: safeContext,
        };
        serializedException = JSON.stringify(serialized);
      } else if (
        ('msg' in exception || 'isAuth' in exception || 'status' in exception) &&
        typeof exception === 'object'
      ) {
        // This is an ErrorInfo object
        const errorInfo = exception as ErrorInfo;
        const serialized: Record<string, unknown> = {
          isAuth: errorInfo.isAuth,
          msg: errorInfo.msg,
          status: errorInfo.status,
          fields: errorInfo.fields ? Object.fromEntries(errorInfo.fields) : undefined,
        };
        serializedException = JSON.stringify(serialized);
      } else {
        // Generic object serialization with better error handling
        try {
          serializedException = JSON.stringify(exception);
        } catch {
          // If JSON.stringify fails, try to extract useful info
          const keys = Object.keys(exception);
          const partialInfo: Record<string, unknown> = {};
          for (const key of keys) {
            try {
              const value = (exception as Record<string, unknown>)[key];
              if (value === null || value === undefined) {
                partialInfo[key] = value;
              } else if (
                typeof value === 'string' ||
                typeof value === 'number' ||
                typeof value === 'boolean'
              ) {
                partialInfo[key] = value;
              } else {
                try {
                  JSON.stringify(value);
                  partialInfo[key] = value;
                } catch {
                  partialInfo[key] = `[${typeof value}]`;
                }
              }
            } catch {
              partialInfo[key] = '[Unable to serialize]';
            }
          }
          serializedException = JSON.stringify(partialInfo);
        }
      }
    } catch {
      // Last resort: provide meaningful information
      if (typeof exception === 'object' && exception !== null) {
        const keys = Object.keys(exception);
        serializedException = `[Object with keys: ${keys.join(', ')}]`;
      } else {
        serializedException = String(exception);
      }
    }
  } else {
    serializedException = String(exception);
  }

  const errorMessage = `${msg}. Exception: ${serializedException}`;
  window.newrelic?.noticeError(errorMessage);

  console.error(errorMessage);
  console.error('Exception details:', exception);
};
