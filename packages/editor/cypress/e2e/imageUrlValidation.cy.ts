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

// A module, so that the types and helpers below stay local to this spec.
export {};

// What the spec uses of the designer the playground pages expose as `window.designer`.
type DesignerHandle = {
  addIconType(type: 'image' | 'emoji', iconType: string): void;
  getMindmap(): { getId(): string | undefined };
  getModel(): { getTopics(): { getModel(): { getFeatures(): { getType(): string }[] } }[] };
};

const designerOf = (win: Cypress.AUTWindow): DesignerHandle | undefined =>
  (win as unknown as { designer?: DesignerHandle }).designer;

type IconGroup = { id: string; icons: string[] };

const ICON_GROUPS = 'src/components/action-widget/pane/icon-picker/image-icon-tab/iconGroups.json';

/**
 * The topic icons (SvgImageIcon) on the canvas. Link and note icons are <image> elements too,
 * but they carry a test-id.
 */
const canvasIcons = (selector = '') =>
  cy.get('mindplot-component').shadow().find(`${selector} image:not([test-id])`.trim());

const hrefOf = (image: Element): string => (image as SVGImageElement).href.baseVal;

/**
 * Asserts that `url` is an icon URL the bundler produced (an asset URL or a data URL, never the
 * raw relative path from the source) and that the browser decodes it into an image.
 */
const assertIconUrlLoads = (url: string, iconName: string): void => {
  expect(url, `${iconName} URL`).to.not.equal('');
  expect(url, `${iconName} URL`).to.not.include('undefined');
  expect(url, `${iconName} URL`).to.not.match(/^\.\.?\//);
  cy.window({ log: false }).then((win) => {
    const image = new win.Image();
    image.src = url;
    return image.decode().catch(() => {
      throw new Error(`${iconName}: the image at ${url} does not load`);
    });
  });
};

describe('Image URL Validation Suite', () => {
  it('Every image icon of a map renders with a loadable URL', () => {
    const mapId = 'icon-sample';
    cy.visit(`/map-render/html/viewmode.html?id=${mapId}`);

    cy.readFile(`test/playground/map-render/samples/${mapId}.wxml`).then((xml: string) => {
      const iconsInFile = (xml.match(/<icon\s/g) || []).length;
      const topicsInFile = (xml.match(/<topic[\s>]/g) || []).length;
      expect(iconsInFile, `icons in ${mapId}.wxml`).to.be.greaterThan(0);

      // Wait for the whole map to load.
      cy.window({ timeout: 120000 })
        .should((win) => {
          const designer = designerOf(win);
          expect(designer, 'designer').to.not.equal(undefined);
          expect(designer?.getMindmap().getId(), 'loaded map').to.equal(mapId);
          expect(designer?.getModel().getTopics(), 'topics').to.have.length(topicsInFile);
        })
        .then((win) => {
          // On load, an icon with an emoji equivalent becomes an emoji icon (eicon, drawn as
          // text, see XMLSerializerTango); the others stay image icons, drawn as <image>.
          const featureTypes = designerOf(win)!
            .getModel()
            .getTopics()
            .flatMap((topic) =>
              topic
                .getModel()
                .getFeatures()
                .map((feature) => feature.getType()),
            );
          const imageIcons = featureTypes.filter((type) => type === 'icon').length;
          const emojiIcons = featureTypes.filter((type) => type === 'eicon').length;
          expect(imageIcons + emojiIcons, 'icons loaded from the file').to.equal(iconsInFile);
          expect(imageIcons, 'image icons').to.be.greaterThan(0);
          canvasIcons().should('have.length', imageIcons);
        });
    });
    canvasIcons().each(($image, index) => {
      assertIconUrlLoads(hrefOf($image[0]), `canvas icon #${index}`);
    });
  });

  it('The Icons Gallery shows every icon of iconGroups.json with a loadable URL', () => {
    cy.visit('/map-render/html/editor.html');
    cy.waitEditorLoaded();

    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Icon');
    cy.contains('Icons Gallery').should('be.visible').click();

    cy.readFile(ICON_GROUPS).then((iconGroups: IconGroup[]) => {
      const icons = iconGroups.flatMap((group) => group.icons);
      expect(icons, 'icons in iconGroups.json').to.have.length.greaterThan(0);

      // The gallery: the search field and, below it, one <img> per icon, in iconGroups order
      // (no "Frequently Used" row, since Cypress clears local storage before each test).
      cy.get('input[placeholder="Search icons..."]')
        .closest('.MuiTextField-root')
        .parent()
        .find('img')
        .should('have.length', icons.length)
        .each(($img, index) => {
          assertIconUrlLoads($img.attr('src') ?? '', icons[index]);
        });
    });
  });

  // Skipped on a mindplot bug: SvgImageIcon.getImageUrl warns and returns '' for an unknown
  // icon, but the ImageIcon constructor then fails its $assert(url) ("image url can not be
  // null"), so adding the icon throws (Topic.buildIconGroup takes the same path for a loaded
  // map with one). Enable it once an unknown icon renders as an empty image.
  it.skip('An unknown icon renders without an image and warns', () => {
    const iconName = 'nonexistent_icon_12345';
    cy.visit('/map-render/html/editor.html');
    cy.waitEditorLoaded();

    cy.focusTopicById(3);
    cy.window().then((win) => {
      // The warning is the expected outcome here: keep it from the check for unexpected warnings
      // in cypress/support/e2e.ts, and pass any other warning on to it.
      const warn = win.console.warn;
      cy.stub(win.console, 'warn')
        .callsFake((...args: unknown[]) => {
          if (args[0] !== `Icon not found: ${iconName}`) {
            warn.apply(win.console, args);
          }
        })
        .as('warn');
      (win as unknown as { designer: DesignerHandle }).designer.addIconType('image', iconName);
    });

    cy.get('@warn').should('have.been.calledWith', `Icon not found: ${iconName}`);
    canvasIcons('[test-id="3"]').should(($images) => {
      const hrefs = $images.toArray().map(hrefOf);
      expect(hrefs, 'icon URLs of topic 3').to.include('');
    });
  });
});
