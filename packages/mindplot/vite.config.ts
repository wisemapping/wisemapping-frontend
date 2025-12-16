import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
    plugins: [tsconfigPaths()],
    resolve: {
        alias: [
            { find: /^@wisemapping\/web2d\/src\/(.*)/, replacement: path.resolve(__dirname, '../web2d/src/$1') },
            { find: /^@wisemapping\/web2d$/, replacement: path.resolve(__dirname, '../web2d/src/index.ts') },
        ],
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'mindplot',
            fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
        },
        rollupOptions: {
            external: [
                'react',
                'react-dom',
                'jquery',
                '@wisemapping/web2d',
                'jspdf',
                'xml-formatter',
                'lodash',
                'html2canvas',
            ],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    jquery: '$',
                    '@wisemapping/web2d': 'web2d',
                },
            },
        },
        outDir: 'dist',
        sourcemap: true,
    },
});
