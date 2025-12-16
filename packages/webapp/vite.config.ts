import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';
import { createHtmlPlugin } from 'vite-plugin-html';
import { buildStaticUrls, generateSitemapXml } from './src/components/sitemap/utils';

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

const sitemapMiddleware = () => ({
    name: 'sitemap-dev-middleware',
    configureServer(server) {
        server.middlewares.use('/sitemap.xml', (req, res, next) => {
            if (req.method && req.method !== 'GET') {
                return next();
            }

            try {
                const forwardedProto = req.headers['x-forwarded-proto'];
                const forwardedValue = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto;
                const protocol =
                    forwardedValue ||
                    ((req.socket as any)?.encrypted ? 'https' : 'http');
                const host = req.headers.host;

                if (!host) {
                    return next();
                }

                const baseUrl = `${protocol}://${host}`;
                const urls = buildStaticUrls({ baseUrl });
                const xml = generateSitemapXml(urls);

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/xml');
                res.end(xml);
            } catch (error) {
                console.error('Failed to generate sitemap.xml in dev server', error);
                next(error);
            }
        });
    },
});

export default defineConfig(({ mode }) => {
    // env loading is not typically needed if we are just using process.env, but loadEnv makes .env files available
    const env = loadEnv(mode, process.cwd(), '');

    let bootstrapConfig;
    const configType = process.env.APP_CONFIG_TYPE || 'file:mock';

    switch (configType) {
        case 'file:mock':
            bootstrapConfig = require('./config.mock.json');
            break;
        case 'file:prod':
            bootstrapConfig = require('./config.prod.json');
            break;
        case 'file:dev':
            bootstrapConfig = require('./config.dev.json');
            break;
        case 'remote':
            bootstrapConfig = process.env.APP_CONFIG_JSON ? JSON.parse(process.env.APP_CONFIG_JSON) : {};
            break;
        default:
            bootstrapConfig = require('./config.mock.json');
            break;
    }

    return {
        plugins: [
            react(),
            tsconfigPaths(),
            wxmlLoader(),
            sitemapMiddleware(),
            createHtmlPlugin({
                inject: {
                    data: {
                        GOOGLE_ADDS_ENABLED: process.env.GOOGLE_ADDS_ENABLED || false,
                        NEW_RELIC_ENABLED: process.env.NEW_RELIC_ENABLED || false,
                        base: process.env.PUBLIC_URL || '',
                    },
                },
            }),
        ],
        resolve: {
            alias: [
                { find: /^@wisemapping\/editor\/src\/(.*)/, replacement: path.resolve(__dirname, '../editor/src/$1') },
                { find: /^@wisemapping\/editor$/, replacement: path.resolve(__dirname, '../editor/src/index.ts') },
                { find: /^@wisemapping\/mindplot\/src\/(.*)/, replacement: path.resolve(__dirname, '../mindplot/src/$1') },
                { find: /^@wisemapping\/mindplot$/, replacement: path.resolve(__dirname, '../mindplot/src/index.ts') },
                { find: /^@wisemapping\/web2d\/src\/(.*)/, replacement: path.resolve(__dirname, '../web2d/src/$1') },
                { find: /^@wisemapping\/web2d$/, replacement: path.resolve(__dirname, '../web2d/src/index.ts') },
            ]
        },
        define: {
            VITE_BOOTSTRAP_CONFIG: JSON.stringify(bootstrapConfig),
        },
        server: {
            port: 3000,
            proxy: {
                '/api': {
                    target: 'http://localhost:8080',
                    changeOrigin: true,
                }
            },
        },
        build: {
            outDir: 'dist',
            sourcemap: true,
            minify: 'esbuild', // Vite uses esbuild by default which is faster, but we can be explicit
            chunkSizeWarningLimit: 2000, // Adjust as needed based on webpack performance hints
        },
        // Mimic webpack's production mode optimization where appropriate
        // Vite handles minification and tree-shaking automatically in build mode
    };
});
