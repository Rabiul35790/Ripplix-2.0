import '../css/app.css';
import './bootstrap';
import '../css/seo.css';
import '../css/search-modal-styles.css';
import '../css/scrollbar.css';

import { createInertiaApp, router } from '@inertiajs/react';
import axios from 'axios';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot, hydrateRoot } from 'react-dom/client';
import CookieManager from './Pages/CookieManager';


const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const token = document.head.querySelector('meta[name="csrf-token"]');

createInertiaApp({
    title: (title) => `${appName} - ${title}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const AppWithCookies = () => (
            <>
                <App {...props} />
                <CookieManager />
            </>
        );

        if (import.meta.env.SSR) {
            hydrateRoot(el, <AppWithCookies />);
            return;
        }

        createRoot(el).render(<AppWithCookies />);
    },
    progress: {
        color: 'rgba(0,0,0,0)',
    },
});

if (token) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = token.getAttribute('content');
} else {
    console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

// Set default headers
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.headers.common['Accept'] = 'application/json';
