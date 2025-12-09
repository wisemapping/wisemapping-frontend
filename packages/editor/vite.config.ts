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
        root: 'test/playground',
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
    return config;
});
