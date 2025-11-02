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
            ssr: 'resources/js/ssr.tsx',


            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },

    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['laravel-vite-plugin'],
                    seo: ['resources/js/seo-widget.ts']
                }
            }
        }
    },
});
