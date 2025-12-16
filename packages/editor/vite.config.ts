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
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const wxmlLoader = () => {
    return {
        name: 'wxml-loader',
        transform(code: string, id: string) {
            if (id.endsWith('.wxml')) {
                return {
                    code: `export default ${JSON.stringify(code)};`,
                    map: null,
                };
            }
        },
    };
};

export default defineConfig(({ command }) => {
    const config = {
        plugins: [react(), wxmlLoader()],
        define: {
            'process.env': {},
            global: 'window',
        },
        resolve: {
            alias: [
                { find: /^@wisemapping\/editor\/src\/(.*)/, replacement: path.resolve(__dirname, 'src/$1') },
                { find: /^@wisemapping\/editor$/, replacement: path.resolve(__dirname, 'src/index.ts') },
                { find: /^@wisemapping\/mindplot\/src\/(.*)/, replacement: path.resolve(__dirname, '../mindplot/src/$1') },
                { find: /^@wisemapping\/mindplot$/, replacement: path.resolve(__dirname, '../mindplot/src/index.ts') },
                { find: /^@wisemapping\/web2d\/src\/(.*)/, replacement: path.resolve(__dirname, '../web2d/src/$1') },
                { find: /^@wisemapping\/web2d$/, replacement: path.resolve(__dirname, '../web2d/src/index.ts') },
            ]
        },
        assetsInclude: ['**/*.wxml'],  // Include .wxml files as assets
        preview: {
            port: 8081,
        },
    };

    if (command === 'build') {
        // Library build configuration
        return {
            ...config,
            build: {
                lib: {
                    entry: path.resolve(__dirname, 'src/index.ts'),
                    name: 'Editor',
                    fileName: (format) => `editor.${format}.js`,
                },
                rollupOptions: {
                    external: ['react', 'react-dom', '@wisemapping/mindplot'],
                    output: {
                        globals: {
                            react: 'React',
                            'react-dom': 'ReactDOM',
                            '@wisemapping/mindplot': 'Mindplot',
                        },
                    },
                },
                outDir: 'dist',
                sourcemap: true,
            },
        };
    }

    // Dev/Preview config - no build options needed for dev server
    return {
        ...config,
        root: 'test/playground',
    };
});
