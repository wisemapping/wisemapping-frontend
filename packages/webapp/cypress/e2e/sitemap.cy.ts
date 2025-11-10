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

/// <reference types="cypress" />

const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'de', 'ru', 'uk', 'zh', 'zh-CN', 'ja', 'pt', 'it', 'hi'];
const LOCALIZED_PAGES = ['/c/login', '/c/registration', '/c/forgot-password'];

describe('Sitemap XML', () => {
  let baseUrl: string;

  beforeEach(() => {
    baseUrl = Cypress.config().baseUrl || 'http://localhost:3000';
  });

  it('should return valid XML sitemap', () => {
    cy.request({
      url: '/sitemap.xml',
      headers: {
        Accept: 'application/xml',
      },
    }).then((response) => {
      // Verify response status and content type
      expect(response.status).to.eq(200);
      expect(response.headers['content-type']).to.include('application/xml');

      // Parse XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response.body, 'text/xml');

      // Check for parsing errors
      const parseError = xmlDoc.querySelector('parsererror');
      expect(parseError).to.be.null;

      // Verify root element
      // Use getElementsByTagName for namespace-aware querying
      const urlsetElements = xmlDoc.getElementsByTagName('urlset');
      expect(urlsetElements.length).to.be.greaterThan(0);
      const urlset = urlsetElements[0];
      expect(urlset).to.not.be.null;
      expect(urlset).to.not.be.undefined;
      if (urlset) {
        expect(urlset.getAttribute('xmlns')).to.eq('http://www.sitemaps.org/schemas/sitemap/0.9');
        expect(urlset.getAttribute('xmlns:xhtml')).to.eq('http://www.w3.org/1999/xhtml');
      }

      // Get all URL entries (use getElementsByTagName for namespace-aware querying)
      const urls = xmlDoc.getElementsByTagName('url');
      expect(urls.length).to.be.greaterThan(0);

      // Verify each URL has required elements
      Array.from(urls).forEach((url) => {
        const loc = url.getElementsByTagName('loc')[0];
        const lastmod = url.getElementsByTagName('lastmod')[0];
        const changefreq = url.getElementsByTagName('changefreq')[0];
        const priority = url.getElementsByTagName('priority')[0];

        expect(loc).to.not.be.null;
        expect(loc).to.not.be.undefined;
        expect(lastmod).to.not.be.null;
        expect(lastmod).to.not.be.undefined;
        expect(changefreq).to.not.be.null;
        expect(changefreq).to.not.be.undefined;
        expect(priority).to.not.be.null;
        expect(priority).to.not.be.undefined;

        // Verify URL is valid
        expect(loc?.textContent).to.match(/^https?:\/\//);
      });
    });
  });

  it('should include all localized page versions', () => {
    cy.request({
      url: '/sitemap.xml',
      headers: {
        Accept: 'application/xml',
      },
    }).then((response) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response.body, 'text/xml');
      const locElements = xmlDoc.getElementsByTagName('loc');
      const urls = Array.from(locElements).map((loc) => loc.textContent || '');

      // Check for non-localized versions
      LOCALIZED_PAGES.forEach((page) => {
        const expectedUrl = `${baseUrl}${page}`;
        expect(urls).to.include(expectedUrl);
      });

      // Check for all localized versions
      LOCALIZED_PAGES.forEach((page) => {
        SUPPORTED_LOCALES.forEach((locale) => {
          const expectedUrl = `${baseUrl}/${locale}${page}`;
          expect(urls).to.include(expectedUrl);
        });
      });
    });
  });

  it('should include hreflang links for localized pages', () => {
    cy.request({
      url: '/sitemap.xml',
      headers: {
        Accept: 'application/xml',
      },
    }).then((response) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response.body, 'text/xml');
      const urls = xmlDoc.getElementsByTagName('url');

      // Check each localized page URL has hreflang links
      LOCALIZED_PAGES.forEach((page) => {
        // Check non-localized version
        const nonLocalizedUrl = `${baseUrl}${page}`;
        const nonLocalizedEntry = Array.from(urls).find(
          (url) => url.getElementsByTagName('loc')[0]?.textContent === nonLocalizedUrl,
        );
        expect(nonLocalizedEntry).to.not.be.null;
        expect(nonLocalizedEntry).to.not.be.undefined;

        if (nonLocalizedEntry) {
          // Use getElementsByTagNameNS for namespace-aware querying
          const hreflangLinks = nonLocalizedEntry.getElementsByTagNameNS('http://www.w3.org/1999/xhtml', 'link');
          expect(hreflangLinks.length).to.be.greaterThan(0);

          // Verify x-default exists
          const xDefault = Array.from(hreflangLinks).find(
            (link) => link.getAttribute('hreflang') === 'x-default',
          );
          expect(xDefault).to.not.be.null;
          expect(xDefault).to.not.be.undefined;
          expect(xDefault?.getAttribute('href')).to.eq(nonLocalizedUrl);

          // Verify all locales are present
          SUPPORTED_LOCALES.forEach((locale) => {
            const hreflang = locale === 'zh-CN' || locale === 'zh' ? locale : locale.split('-')[0];
            const localeLink = Array.from(hreflangLinks).find(
              (link) => link.getAttribute('hreflang') === hreflang,
            );
            expect(localeLink).to.not.be.null;
            expect(localeLink).to.not.be.undefined;
            expect(localeLink?.getAttribute('href')).to.eq(`${baseUrl}/${locale}${page}`);
          });
        }

        // Check each localized version
        SUPPORTED_LOCALES.forEach((locale) => {
          const localizedUrl = `${baseUrl}/${locale}${page}`;
          const localizedEntry = Array.from(urls).find(
            (url) => url.getElementsByTagName('loc')[0]?.textContent === localizedUrl,
          );
          expect(localizedEntry).to.not.be.null;
          expect(localizedEntry).to.not.be.undefined;

          if (localizedEntry) {
            const hreflangLinks = localizedEntry.getElementsByTagNameNS('http://www.w3.org/1999/xhtml', 'link');
            expect(hreflangLinks.length).to.be.greaterThan(SUPPORTED_LOCALES.length);

            // Verify x-default exists
            const xDefault = Array.from(hreflangLinks).find(
              (link) => link.getAttribute('hreflang') === 'x-default',
            );
            expect(xDefault).to.not.be.null;
            expect(xDefault).to.not.be.undefined;
            expect(xDefault?.getAttribute('href')).to.eq(`${baseUrl}${page}`);
          }
        });
      });
    });
  });

  it('should have correct priority and changefreq for localized pages', () => {
    cy.request({
      url: '/sitemap.xml',
      headers: {
        Accept: 'application/xml',
      },
    }).then((response) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response.body, 'text/xml');
      const urls = xmlDoc.getElementsByTagName('url');

      const expectedPriorities: Record<string, string> = {
        '/c/login': '0.8',
        '/c/registration': '0.8',
        '/c/forgot-password': '0.7',
      };

      const expectedChangefreq: Record<string, string> = {
        '/c/login': 'monthly',
        '/c/registration': 'monthly',
        '/c/forgot-password': 'monthly',
      };

      LOCALIZED_PAGES.forEach((page) => {
        // Check non-localized version
        const nonLocalizedUrl = `${baseUrl}${page}`;
        const nonLocalizedEntry = Array.from(urls).find(
          (url) => url.getElementsByTagName('loc')[0]?.textContent === nonLocalizedUrl,
        );
        if (nonLocalizedEntry) {
          const priority = nonLocalizedEntry.getElementsByTagName('priority')[0]?.textContent;
          const changefreq = nonLocalizedEntry.getElementsByTagName('changefreq')[0]?.textContent;
          expect(priority).to.eq(expectedPriorities[page]);
          expect(changefreq).to.eq(expectedChangefreq[page]);
        }

        // Check localized versions
        SUPPORTED_LOCALES.forEach((locale) => {
          const localizedUrl = `${baseUrl}/${locale}${page}`;
          const localizedEntry = Array.from(urls).find(
            (url) => url.getElementsByTagName('loc')[0]?.textContent === localizedUrl,
          );
          if (localizedEntry) {
            const priority = localizedEntry.getElementsByTagName('priority')[0]?.textContent;
            const changefreq = localizedEntry.getElementsByTagName('changefreq')[0]?.textContent;
            expect(priority).to.eq(expectedPriorities[page]);
            expect(changefreq).to.eq(expectedChangefreq[page]);
          }
        });
      });
    });
  });

  it('should have valid lastmod dates', () => {
    cy.request({
      url: '/sitemap.xml',
      headers: {
        Accept: 'application/xml',
      },
    }).then((response) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response.body, 'text/xml');
      const urls = xmlDoc.getElementsByTagName('url');

      Array.from(urls).forEach((url) => {
        const lastmod = url.getElementsByTagName('lastmod')[0]?.textContent;
        expect(lastmod).to.not.be.null;
        expect(lastmod).to.not.be.undefined;
        // Verify date format (YYYY-MM-DD or ISO 8601)
        expect(lastmod).to.match(/^\d{4}-\d{2}-\d{2}/);
        // Verify date is valid
        const date = new Date(lastmod || '');
        expect(date.toString()).to.not.eq('Invalid Date');
      });
    });
  });
});

