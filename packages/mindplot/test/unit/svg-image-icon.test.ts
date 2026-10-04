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
import ts from 'typescript';
import { Image } from '@wisemapping/web2d';
import ActionDispatcher from '../../src/components/ActionDispatcher';
import Topic from '../../src/components/Topic';
import SvgIconModel from '../../src/components/model/SvgIconModel';
import type SvgImageIconType from '../../src/components/SvgImageIcon';

const componentsDir = path.resolve(__dirname, '../../src/components');
const iconsDir = path.resolve(__dirname, '../../assets/icons');

/**
 * SvgImageIcon lists its images with Vite's import.meta.glob, which ts-jest (CommonJS) can not
 * compile. Load it with the glob replaced by the icon files on disk.
 */
const loadSvgImageIcon = (): typeof SvgImageIconType => {
  const source = fs
    .readFileSync(path.join(componentsDir, 'SvgImageIcon.ts'), 'utf8')
    .replace(/import\.meta\.glob\([^)]*\)/, '__iconModules');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  });

  const iconModules = Object.fromEntries(
    fs.readdirSync(iconsDir).map((file) => [`../../assets/icons/${file}`, { default: file }]),
  );
  const localRequire = (id: string) =>
    require(id.startsWith('.') ? path.join(componentsDir, id) : id);
  const module = { exports: {} as { default: typeof SvgImageIconType } };
  new Function('require', 'module', 'exports', '__iconModules', outputText)(
    localRequire,
    module,
    module.exports,
    iconModules,
  );
  return module.exports.default;
};

const SvgImageIcon = loadSvgImageIcon();

const topic = { getId: () => 7 } as unknown as Topic;

const click = (icon: SvgImageIconType) => icon.getElement().trigger('click', {});
const href = (icon: SvgImageIconType) => (icon.getElement() as Image).getHref();

describe('SvgImageIcon', () => {
  let changeFeatureToTopic: jest.Mock;

  beforeEach(() => {
    changeFeatureToTopic = jest.fn();
    ActionDispatcher.setInstance({ changeFeatureToTopic } as unknown as ActionDispatcher);
  });

  it('changes the icon type through the action dispatcher, so it can be undone', () => {
    const model = new SvgIconModel({ id: 'flag_blue' });
    const icon = new SvgImageIcon(topic, model, false);

    click(icon);

    expect(changeFeatureToTopic).toHaveBeenCalledWith(7, model.getId(), { id: 'flag_green' });
    // The command changes the model, not the icon.
    expect(model.getIconType()).toBe('flag_blue');
  });

  it('shows the icon type the model has after a change, e.g. an undo', () => {
    const model = new SvgIconModel({ id: 'flag_blue' });
    const icon = new SvgImageIcon(topic, model, false);
    expect(href(icon)).toBe('flag_blue.svg');

    model.setAttributes({ id: 'flag_orange' });

    expect(href(icon)).toBe('flag_orange.svg');
  });

  it('cycles an icon stored with a descriptive name', () => {
    // 'home' is shown as things_address_book.
    const model = new SvgIconModel({ id: 'home' });
    const icon = new SvgImageIcon(topic, model, false);
    expect(href(icon)).toBe('things_address_book.svg');

    click(icon);

    expect(changeFeatureToTopic).toHaveBeenCalledWith(7, model.getId(), { id: 'things_wrench' });
  });
});
