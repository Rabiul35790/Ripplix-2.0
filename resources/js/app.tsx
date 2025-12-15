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
import { analytics } from './services/analytics';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const token = document.head.querySelector('meta[name="csrf-token"]');

// Initialize analytics when app starts
console.log('🚀 Initializing application...');
analytics.initialize();

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
        color: 'white',
    },
});

// Track page views on navigation
router.on('navigate', (event) => {
    const page = event.detail.page;

    // Track page view
    analytics.trackPageView(
        page.url as string,
        (page.props?.title || page.component) as string
    );

    console.log('Navigation:', page.url);
});

// Track navigation start (loading)
router.on('start', (event) => {
    console.log('Navigation started...');
});

// Track navigation errors
router.on('error', (event) => {
    const errors = event.detail.errors;
    analytics.trackError('Navigation Error', { errors });
    console.error('Navigation error:', errors);
});

// Configure axios defaults
if (token) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = token.getAttribute('content');
} else {
    console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.headers.common['Accept'] = 'application/json';

// Log analytics status
console.log('Analytics Status:', analytics.getStatus());
