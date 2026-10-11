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

/**
 * Walks the static imports from a module, as the bundler does, and returns the chain of modules
 * that leads to the first value import of one of `forbidden`, or undefined.
 *
 * Dynamic `import()` starts another chunk and `import type` disappears in the build, so neither is
 * followed. Only the webapp's and the editor's own sources are walked: an npm package is a leaf.
 */
const ROOT = path.resolve(__dirname, '../../..');
const EDITOR_SRC = path.resolve(ROOT, '../editor/src');
const EXTENSIONS = ['.ts', '.tsx', '/index.ts', '/index.tsx'];

const resolveFile = (base: string): string | undefined =>
  [base, ...EXTENSIONS.map((ext) => base + ext)].find(
    (file) => fs.existsSync(file) && fs.statSync(file).isFile(),
  );

const resolveImport = (from: string, specifier: string): string | undefined => {
  if (specifier.startsWith('.')) {
    return resolveFile(path.resolve(path.dirname(from), specifier));
  }
  const editorPath = specifier.match(/^@wisemapping\/editor\/(.+)$/);
  return editorPath ? resolveFile(path.resolve(EDITOR_SRC, editorPath[1])) : undefined;
};

// `import ... from 'x'`, `import 'x'` and `export ... from 'x'`, without the type-only ones.
const STATIC_IMPORT = /^\s*(import|export)\s+(?!type\s)([^'";]*?\s+from\s+)?['"]([^'"]+)['"]/gm;

const isTypeOnly = (clause: string | undefined): boolean => {
  const named = clause?.match(/^\s*\{([^}]*)\}\s*from\s+$/);
  return !!named && named[1].split(',').every((name) => /^\s*(type\s|$)/.test(name));
};

export const findStaticImportChain = (entry: string, forbidden: string[]): string[] | undefined => {
  const seen = new Set<string>();
  const walk = (file: string, chain: string[]): string[] | undefined => {
    if (seen.has(file)) return undefined;
    seen.add(file);
    const source = fs.readFileSync(file, 'utf8');
    for (const [, , clause, specifier] of source.matchAll(STATIC_IMPORT)) {
      if (isTypeOnly(clause)) continue;
      if (forbidden.includes(specifier)) return [...chain, specifier];
      const next = resolveImport(file, specifier);
      const found = next && walk(next, [...chain, path.relative(ROOT, next)]);
      if (found) return found;
    }
    return undefined;
  };
  return walk(entry, [path.relative(ROOT, entry)]);
};

describe('the entry bundle', () => {
  // The editor and mindplot barrels can not be tree-shaken: a value import of either, from any
  // module the entry loads, puts the whole editor (about 1.3 MB) in every page.
  test('does not reach the editor or mindplot barrel', () => {
    const chain = findStaticImportChain(path.resolve(ROOT, 'src/index.tsx'), [
      '@wisemapping/editor',
      '@wisemapping/mindplot',
    ]);
    expect(chain).toBeUndefined();
  });

  test('the walk finds a barrel import when there is one', () => {
    expect(
      findStaticImportChain(path.resolve(ROOT, 'src/components/editor-page/index.tsx'), [
        '@wisemapping/editor',
      ]),
    ).toEqual(['src/components/editor-page/index.tsx', '@wisemapping/editor']);
  });
});
