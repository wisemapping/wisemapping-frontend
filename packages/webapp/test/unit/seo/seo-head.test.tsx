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

import React from 'react';
import { render } from '@testing-library/react';
import SEOHead from '../../../src/components/seo/SEOHead';

const head = (selector: string) => document.head.querySelector(selector);

describe('SEOHead', () => {
  beforeEach(() => {
    // index.html ships a static title, as the deployed page does.
    document.head.innerHTML = '<title>WiseMapping - Free &amp; Open-Source Mind Mapping</title>';
    document.documentElement.lang = '';
  });

  test("puts the page's tags in the head, and its title wins over the static one", () => {
    render(
      <SEOHead
        title="My Maps | WiseMapping"
        description="All your maps"
        canonicalUrl="/c/maps"
        alternateLanguages={[{ hreflang: 'es', href: 'https://app.test/es/c/login' }]}
        language="es"
      />,
    );

    expect(document.title).toBe('My Maps | WiseMapping');
    expect(head('meta[name="description"]')?.getAttribute('content')).toBe('All your maps');
    expect(head('meta[property="og:title"]')?.getAttribute('content')).toBe(
      'My Maps | WiseMapping',
    );
    expect(head('link[rel="canonical"]')?.getAttribute('href')).toBe(
      `${window.location.origin}/c/maps`,
    );
    expect(head('link[rel="alternate"][hreflang="es"]')?.getAttribute('href')).toBe(
      'https://app.test/es/c/login',
    );
    expect(document.documentElement.lang).toBe('es');
  });

  test('removes its tags when the page goes away', () => {
    const { unmount } = render(<SEOHead title="Login | WiseMapping" description="Sign in" />);
    expect(head('meta[name="description"]')).not.toBeNull();

    unmount();

    expect(head('meta[name="description"]')).toBeNull();
    expect(document.title).toBe('WiseMapping - Free & Open-Source Mind Mapping');
  });

  test('renders the structured data as JSON-LD', () => {
    render(<SEOHead structuredData={{ '@type': 'WebApplication', name: 'WiseMapping' }} />);

    const script = document.querySelector('script[type="application/ld+json"]');
    expect(JSON.parse(script?.textContent ?? '{}')).toEqual({
      '@type': 'WebApplication',
      name: 'WiseMapping',
    });
  });
});
