import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/js/app.tsx',
                'resources/css/app.css',
                'resources/js/seo-widget.ts'
            ],
            //ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
    ],

    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        hmr: {
            host: 'www.ripplix.com',
            port: 5173,
            clientPort: 443,
            protocol: 'wss'
        },
        cors: {
            origin: ['https://www.ripplix.com', 'http://www.ripplix.com'],
            credentials: true,
        }
    },

    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },

    build: {
        manifest: true,
        outDir: 'public/build',
        emptyOutDir: true,
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: undefined,
            }
        }
    }
});
