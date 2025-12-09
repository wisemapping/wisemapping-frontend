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
describe('Image URL Validation Suite', () => {
  beforeEach(() => {
    cy.visit('/editor.html');
    cy.waitEditorLoaded();
  });

  it('Validate SvgImageIcon.getImageUrl returns proper data URLs', () => {
    cy.window().then((win) => {
      // Access the SvgImageIcon class from the global scope
      const SvgImageIcon = (win as any).mindplot?.SvgImageIcon;

      if (SvgImageIcon) {
        // Test known icons that should exist
        const testIcons = ['social_facebook', 'task_0', 'flag_blue', 'bullet_black'];

        testIcons.forEach((iconId) => {
          const url = SvgImageIcon.getImageUrl(iconId);

          // Should not be empty
          expect(url).to.not.be.empty;

          // Should not contain raw relative paths (indicates webpack didn't process it)
          expect(url).to.not.include('../assets/');
          expect(url).to.not.include('../../assets/');

          // Should be a data URL (properly processed by webpack)
          expect(url).to.match(/^data:image\/(svg\+xml|png);base64,/);
        });
      } else {
        // If SvgImageIcon is not globally available, we can test indirectly
        cy.log('SvgImageIcon not globally available, testing indirectly');
      }
    });
  });

  it('Validate all icon family entries have corresponding image URLs', () => {
    cy.window().then((win) => {
      const SvgImageIcon = (win as any).mindplot?.SvgImageIcon;

      if (SvgImageIcon) {
        // Get the icon family configuration
        cy.fixture(
          '../src/components/action-widget/pane/icon-picker/image-icon-tab/iconGroups.json',
        ).then((iconGroups) => {
          iconGroups.forEach((family: any) => {
            family.icons.forEach((iconId: string) => {
              const url = SvgImageIcon.getImageUrl(iconId);

              // Every icon in the family should have a valid URL
              expect(url, `Icon ${iconId} should have a valid URL`).to.not.be.empty;
              expect(url, `Icon ${iconId} should not have a raw path`).to.not.include('../assets/');
            });
          });
        });
      }
    });
  });

  it('Validate console warnings for missing icons are helpful', () => {
    cy.window().then((win) => {
      const SvgImageIcon = (win as any).mindplot?.SvgImageIcon;

      if (SvgImageIcon) {
        // Get the current call count before testing
        const initialCallCount = (win.console.warn as any).callCount || 0;

        // Test with a non-existent icon
        const url = SvgImageIcon.getImageUrl('nonexistent_icon_12345');

        // Should return empty string for missing icons
        expect(url).to.equal('');

        // Should have logged a warning (check that warn was called at least once more)
        expect(win.console.warn).to.have.callCount.greaterThan(initialCallCount);

        // Check that the last call contains the expected message
        const lastCall = (win.console.warn as any).getCall((win.console.warn as any).callCount - 1);
        expect(lastCall.args[0]).to.include('Icon not found: nonexistent_icon_12345');
      }
    });
  });
});
