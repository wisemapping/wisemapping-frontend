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

import fs from 'fs';
import path from 'path';

describe('Icon Mapping Validation', () => {
  let materialIconsMapping: { [key: string]: string } = {};
  let iconPickerIcons: string[] = [];

  beforeAll(() => {
    // Read and parse ImageSVGFeature.ts to extract Material Icons mapping
    const imageSVGFeaturePath = path.join(
      __dirname,
      '../../src/components/ImageSVGFeature.ts'
    );
    const imageSVGFeatureContent = fs.readFileSync(imageSVGFeaturePath, 'utf8');

    // Extract the materialIcons object
    const materialIconsMatch = imageSVGFeatureContent.match(
      /const materialIcons: \{ \[key: string\]: string \} = \{([\s\S]*?)\n    \};/
    );

    if (materialIconsMatch) {
      const mappingContent = materialIconsMatch[1];
      // Parse each icon mapping line
      const iconMappingRegex = /(\w+|-\w+|'[\w-]+'): '\\u[0-9a-f]{4}'/g;
      let match;

      while ((match = iconMappingRegex.exec(mappingContent)) !== null) {
        const iconName = match[1].replace(/'/g, ''); // Remove quotes if present
        materialIconsMapping[iconName] = 'mapped';
      }
    }

    // Read and parse image-icon-tab/index.tsx to extract icon names
    const iconTabPath = path.join(
      __dirname,
      '../../../editor/src/components/action-widget/pane/topic-image-picker/image-icon-tab/index.tsx'
    );
    const iconTabContent = fs.readFileSync(iconTabPath, 'utf8');

    // Extract all icon names from the iconMapping array
    const iconNameRegex = /name: '([\w-]+)'/g;
    let iconMatch;

    while ((iconMatch = iconNameRegex.exec(iconTabContent)) !== null) {
      const iconName = iconMatch[1];
      if (!iconPickerIcons.includes(iconName)) {
        iconPickerIcons.push(iconName);
      }
    }
  });

  test('should have Material Icons Unicode mapping for all icon picker icons', () => {
    const missingMappings: string[] = [];

    iconPickerIcons.forEach((iconName) => {
      if (!materialIconsMapping[iconName]) {
        missingMappings.push(iconName);
      }
    });

    if (missingMappings.length > 0) {
      console.error('\n❌ Missing Material Icons Unicode mappings:');
      missingMappings.forEach((icon) => {
        console.error(`  - ${icon}`);
      });
      console.error(
        '\nPlease add these icons to the materialIcons object in ImageSVGFeature.ts'
      );
    }

    expect(missingMappings).toEqual([]);
  });

  test('should have extracted icon mappings from ImageSVGFeature.ts', () => {
    expect(Object.keys(materialIconsMapping).length).toBeGreaterThan(100);
  });

  test('should have extracted icon names from icon picker', () => {
    expect(iconPickerIcons.length).toBeGreaterThan(100);
  });

  test('all icons should have valid Unicode codepoints format', () => {
    const imageSVGFeaturePath = path.join(
      __dirname,
      '../../src/components/ImageSVGFeature.ts'
    );
    const imageSVGFeatureContent = fs.readFileSync(imageSVGFeaturePath, 'utf8');

    // Check that all Unicode codepoints follow the correct format
    const invalidCodepoints: string[] = [];
    const codepointRegex = /([\w-]+|'[\w-]+'): '(\\u[0-9a-f]{4})'/g;
    let match;

    while ((match = codepointRegex.exec(imageSVGFeatureContent)) !== null) {
      const iconName = match[1].replace(/'/g, '');
      const codepoint = match[2];

      // Validate codepoint format
      if (!/^\\u[0-9a-f]{4}$/i.test(codepoint)) {
        invalidCodepoints.push(`${iconName}: ${codepoint}`);
      }
    }

    if (invalidCodepoints.length > 0) {
      console.error('\n❌ Invalid Unicode codepoints:');
      invalidCodepoints.forEach((item) => {
        console.error(`  - ${item}`);
      });
    }

    expect(invalidCodepoints).toEqual([]);
  });

  test('should not have duplicate icon mappings', () => {
    const imageSVGFeaturePath = path.join(
      __dirname,
      '../../src/components/ImageSVGFeature.ts'
    );
    const imageSVGFeatureContent = fs.readFileSync(imageSVGFeaturePath, 'utf8');

    const iconNames: string[] = [];
    const duplicates: string[] = [];
    const iconNameRegex = /([\w-]+|'[\w-]+'): '\\u[0-9a-f]{4}'/g;
    let match;

    while ((match = iconNameRegex.exec(imageSVGFeatureContent)) !== null) {
      const iconName = match[1].replace(/'/g, '');
      if (iconNames.includes(iconName)) {
        duplicates.push(iconName);
      } else {
        iconNames.push(iconName);
      }
    }

    if (duplicates.length > 0) {
      console.error('\n❌ Duplicate icon mappings found:');
      duplicates.forEach((icon) => {
        console.error(`  - ${icon}`);
      });
    }

    expect(duplicates).toEqual([]);
  });

  test('flash icon should be mapped (regression test)', () => {
    // This is a specific test for the bug we just fixed
    expect(materialIconsMapping['flash']).toBeDefined();
    expect(materialIconsMapping['flash-on']).toBeDefined();
  });

  test('common Material UI icons should be mapped', () => {
    const commonIcons = [
      'home',
      'star',
      'favorite',
      'settings',
      'search',
      'help',
      'info',
      'warning',
      'error',
    ];

    const missing = commonIcons.filter((icon) => !materialIconsMapping[icon]);

    if (missing.length > 0) {
      console.error('\n❌ Missing common Material UI icons:');
      missing.forEach((icon) => {
        console.error(`  - ${icon}`);
      });
    }

    expect(missing).toEqual([]);
  });
});

