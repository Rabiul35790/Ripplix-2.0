import React from 'react';
import { Head, usePage } from '@inertiajs/react';

type SeoMeta = {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    twitterTitle: string;
    twitterDescription: string;
};

type LibrarySeoData = {
    title?: string;
    slug?: string;
    description?: string;
    seo_title?: string;
    meta_description?: string;
    og_title?: string;
    og_description?: string;
    og_image?: string;
    og_type?: string;
    canonical_url?: string;
    keywords?: string[];
    structured_data?: Record<string, unknown> | string | null;
};

type AdminSeoProfile = {
    page_key?: string;
    title?: string;
    description?: string;
    canonical_url?: string;
    og_title?: string;
    og_description?: string;
    og_image?: string;
    og_type?: string;
    og_url?: string;
    og_site_name?: string;
    twitter_card?: string;
    twitter_url?: string;
    twitter_title?: string;
    twitter_description?: string;
    twitter_image?: string;
};

const DEFAULT_IMAGE = '/images/og/og-default.png';
const DEFAULT_TITLE = 'Ripplix – Motion & Animation Library for Modern UI';
const DEFAULT_DESCRIPTION =
    'Ripplix is a modern motion and animation library that helps developers build smooth, high-performance UI experiences for modern web applications.';

function humanizeComponent(component: string): string {
    if (!component) return 'Ripplix';
    const tail = component.includes('/') ? component.split('/').pop() || component : component;
    return tail
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .trim();
}

function getBaseUrl(pageProps: any): string {
    const ziggyUrl = pageProps?.ziggy?.url;
    if (typeof ziggyUrl === 'string' && ziggyUrl.length > 0) {
        return ziggyUrl.replace(/\/+$/, '');
    }

    if (typeof window !== 'undefined' && window.location?.origin) {
        return window.location.origin.replace(/\/+$/, '');
    }

    const envUrl = (import.meta as any)?.env?.VITE_APP_URL;
    if (typeof envUrl === 'string' && envUrl.length > 0) {
        return envUrl.replace(/\/+$/, '');
    }

    return 'https://www.ripplix.com';
}

function replaceTokens(value: string, tokens: Record<string, string>): string {
    if (!value) return value;

    return value.replace(/\{(url|siteName|filterName|blogTitle|legalTitle)\}/g, (_match, key) => {
        return tokens[key] ?? '';
    });
}

function findAdminProfile(profiles: AdminSeoProfile[], component: string, key: string): AdminSeoProfile | undefined {
    return profiles.find((profile) => {
        const pageKey = (profile?.page_key || '').trim();
        return pageKey === key || pageKey === component;
    });
}

function buildSeoMeta(component: string, pageProps: any): SeoMeta {
    if (component === 'Browse') {
        const filterName = pageProps?.filterName as string | undefined;
        const suffix = filterName ? ` – ${filterName}` : '';

        return {
            title: `Ripplix${suffix} – Browse UI Animations for AR/VR, Mobile, Web & Smartwatches`,
            description: filterName
                ? `Explore ${filterName} UI animations on Ripplix for AR/VR, mobile, web, and smartwatch experiences.`
                : DEFAULT_DESCRIPTION,
            ogTitle: `Ripplix${suffix} – Browse UI Animations for AR/VR, Mobile, Web & Smartwatches`,
            ogDescription: filterName
                ? `Explore ${filterName} UI animations on Ripplix for AR/VR, mobile, web, and smartwatch experiences.`
                : DEFAULT_DESCRIPTION,
            twitterTitle: `Ripplix${suffix} – Motion & Animation Library`,
            twitterDescription: filterName
                ? `Explore ${filterName} UI animations on Ripplix for AR/VR, mobile, web, and smartwatch experiences.`
                : DEFAULT_DESCRIPTION,
        };
    }

    if (component === 'BlogShow' && pageProps?.blog) {
        const blogTitle = pageProps.blog.meta_title || pageProps.blog.title || 'Blog';
        const blogDescription = pageProps.blog.meta_description || DEFAULT_DESCRIPTION;

        return {
            title: `${blogTitle} | Ripplix Blog`,
            description: blogDescription,
            ogTitle: blogTitle,
            ogDescription: blogDescription,
            twitterTitle: blogTitle,
            twitterDescription: blogDescription,
        };
    }

    if (component === 'LegalShow' && pageProps?.legal) {
        const legalTitle = pageProps.legal.title || 'Legal';
        const legalDescription = `${pageProps.legal.type_label || 'Legal'} - ${legalTitle}`;

        return {
            title: `${legalTitle} | Ripplix`,
            description: legalDescription,
            ogTitle: legalTitle,
            ogDescription: legalDescription,
            twitterTitle: legalTitle,
            twitterDescription: legalDescription,
        };
    }

    if (component === 'Home') {
        return {
            title: DEFAULT_TITLE,
            description: DEFAULT_DESCRIPTION,
            ogTitle: 'Ripplix – Browse UI Animations for AR/VR, Mobile, Web & Smartwatches',
            ogDescription: DEFAULT_DESCRIPTION,
            twitterTitle: 'Ripplix – Motion & Animation Library',
            twitterDescription: DEFAULT_DESCRIPTION,
        };
    }

    const pageLabel = humanizeComponent(component);
    const genericTitle = `${pageLabel} | Ripplix`;

    return {
        title: genericTitle,
        description: DEFAULT_DESCRIPTION,
        ogTitle: genericTitle,
        ogDescription: DEFAULT_DESCRIPTION,
        twitterTitle: genericTitle,
        twitterDescription: DEFAULT_DESCRIPTION,
    };
}

const SeoHead: React.FC = () => {
    const page = usePage<any>();
    const pageUrl = typeof page.url === 'string' ? page.url : '/';
    const cleanUrl = pageUrl.startsWith('/') ? pageUrl : `/${pageUrl}`;
    const baseUrl = getBaseUrl(page.props);
    const canonical = `${baseUrl}${cleanUrl}`;
    const ogImage = `${baseUrl}${DEFAULT_IMAGE}`;

    const adminProfiles = (page.props?.seoSettings?.seo_settings || []) as AdminSeoProfile[];
    const siteName = (page.props?.seoSettings?.site_name || 'Ripplix') as string;

    const globalProfile = findAdminProfile(adminProfiles, page.component, 'global');
    const pageProfile = findAdminProfile(adminProfiles, page.component, page.component);

    const meta = buildSeoMeta(page.component, page.props);
    const isLibraryRoute = cleanUrl.startsWith('/library/');
    const selectedLibrary = (page.props?.selectedLibrary || null) as LibrarySeoData | null;

    const toAbsoluteUrl = (value?: string | null): string => {
        if (!value) return '';
        if (/^https?:\/\//i.test(value)) return value;
        if (value.startsWith('/')) return `${baseUrl}${value}`;
        return `${baseUrl}/${value.replace(/^\/+/, '')}`;
    };

    const toAbsoluteAssetUrl = (value?: string | null): string => {
        if (!value) return '';
        if (/^https?:\/\//i.test(value)) return value;
        if (value.startsWith('/')) return `${baseUrl}${value}`;
        return `${baseUrl}/storage/${value.replace(/^\/+/, '')}`;
    };

    const librarySeo = isLibraryRoute && selectedLibrary
        ? {
            title: selectedLibrary.seo_title || `${selectedLibrary.title || 'Library'} | ${siteName}`,
            description:
                selectedLibrary.meta_description ||
                selectedLibrary.description ||
                DEFAULT_DESCRIPTION,
            canonical: selectedLibrary.canonical_url
                ? toAbsoluteUrl(selectedLibrary.canonical_url)
                : `${baseUrl}/library/${selectedLibrary.slug || ''}`,
            ogTitle: selectedLibrary.og_title || selectedLibrary.seo_title || selectedLibrary.title || `${siteName} Library`,
            ogDescription:
                selectedLibrary.og_description ||
                selectedLibrary.meta_description ||
                selectedLibrary.description ||
                DEFAULT_DESCRIPTION,
            ogType: selectedLibrary.og_type || 'article',
            ogImage: toAbsoluteAssetUrl(selectedLibrary.og_image || DEFAULT_IMAGE),
            twitterCard: 'summary_large_image',
            twitterTitle: selectedLibrary.og_title || selectedLibrary.seo_title || selectedLibrary.title || `${siteName} Library`,
            twitterDescription:
                selectedLibrary.og_description ||
                selectedLibrary.meta_description ||
                selectedLibrary.description ||
                DEFAULT_DESCRIPTION,
            twitterImage: toAbsoluteAssetUrl(selectedLibrary.og_image || DEFAULT_IMAGE),
            keywords: Array.isArray(selectedLibrary.keywords) ? selectedLibrary.keywords.filter(Boolean).join(', ') : '',
            structuredData:
                typeof selectedLibrary.structured_data === 'string'
                    ? selectedLibrary.structured_data
                    : selectedLibrary.structured_data
                        ? JSON.stringify(selectedLibrary.structured_data)
                        : '',
        }
        : null;

    const tokens: Record<string, string> = {
        url: canonical,
        siteName,
        filterName: page.props?.filterName || '',
        blogTitle: page.props?.blog?.title || '',
        legalTitle: page.props?.legal?.title || '',
    };

    const resolvedTitle = replaceTokens(
        librarySeo?.title || pageProfile?.title || globalProfile?.title || meta.title,
        tokens
    );
    const resolvedDescription = replaceTokens(
        librarySeo?.description || pageProfile?.description || globalProfile?.description || meta.description,
        tokens
    );
    const resolvedCanonical = replaceTokens(
        librarySeo?.canonical || pageProfile?.canonical_url || globalProfile?.canonical_url || canonical,
        tokens
    );

    const resolvedOgTitle = replaceTokens(
        librarySeo?.ogTitle || pageProfile?.og_title || globalProfile?.og_title || meta.ogTitle,
        tokens
    );
    const resolvedOgDescription = replaceTokens(
        librarySeo?.ogDescription || pageProfile?.og_description || globalProfile?.og_description || meta.ogDescription,
        tokens
    );
    const resolvedOgType = librarySeo?.ogType || pageProfile?.og_type || globalProfile?.og_type || 'website';
    const resolvedOgImage = replaceTokens(
        librarySeo?.ogImage || pageProfile?.og_image || globalProfile?.og_image || ogImage,
        tokens
    );
    const resolvedOgUrl = replaceTokens(
        pageProfile?.og_url || globalProfile?.og_url || resolvedCanonical,
        tokens
    );
    const resolvedOgSiteName = replaceTokens(
        pageProfile?.og_site_name || globalProfile?.og_site_name || siteName,
        tokens
    );

    const resolvedTwitterCard = librarySeo?.twitterCard || pageProfile?.twitter_card || globalProfile?.twitter_card || 'summary_large_image';
    const resolvedTwitterTitle = replaceTokens(
        librarySeo?.twitterTitle || pageProfile?.twitter_title || globalProfile?.twitter_title || meta.twitterTitle,
        tokens
    );
    const resolvedTwitterDescription = replaceTokens(
        librarySeo?.twitterDescription || pageProfile?.twitter_description || globalProfile?.twitter_description || meta.twitterDescription,
        tokens
    );
    const resolvedTwitterImage = replaceTokens(
        librarySeo?.twitterImage || pageProfile?.twitter_image || globalProfile?.twitter_image || resolvedOgImage,
        tokens
    );
    const resolvedTwitterUrl = replaceTokens(
        pageProfile?.twitter_url || globalProfile?.twitter_url || resolvedCanonical,
        tokens
    );

    return (
        <Head>
            <title head-key="title">{resolvedTitle}</title>
            <meta head-key="description" name="description" content={resolvedDescription} />
            <link head-key="canonical" rel="canonical" href={resolvedCanonical} />

            <meta head-key="og:title" property="og:title" content={resolvedOgTitle} />
            <meta head-key="og:type" property="og:type" content={resolvedOgType} />
            <meta head-key="og:image" property="og:image" content={resolvedOgImage} />
            <meta head-key="og:url" property="og:url" content={resolvedOgUrl} />
            <meta head-key="og:description" property="og:description" content={resolvedOgDescription} />
            <meta head-key="og:site_name" property="og:site_name" content={resolvedOgSiteName} />

            <meta head-key="twitter:card" name="twitter:card" content={resolvedTwitterCard} />
            <meta head-key="twitter:url" name="twitter:url" content={resolvedTwitterUrl} />
            <meta head-key="twitter:title" name="twitter:title" content={resolvedTwitterTitle} />
            <meta head-key="twitter:description" name="twitter:description" content={resolvedTwitterDescription} />
            <meta head-key="twitter:image" name="twitter:image" content={resolvedTwitterImage} />
            {librarySeo?.keywords && <meta head-key="keywords" name="keywords" content={librarySeo.keywords} />}
            {librarySeo?.structuredData && (
                <script
                    head-key="structured-data"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: librarySeo.structuredData }}
                />
            )}
        </Head>
    );
};

export default SeoHead;
