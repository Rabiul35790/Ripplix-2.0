/**
 * Complete Analytics Service
 * Integrates: Google Analytics, Amplitude, and Microsoft Clarity
 */

import * as amplitude from '@amplitude/analytics-browser';
import ReactGA from 'react-ga4';

// TypeScript declarations
declare global {
  interface Window {
    clarity: any;
    dataLayer: any[];
  }
}

class AnalyticsService {
  private isInitialized = false;
  private gaInitialized = false;
  private amplitudeInitialized = false;
  private clarityInitialized = false;

  /**
   * Initialize all analytics services
   * Call this once when app starts
   */
  initialize() {
    if (this.isInitialized) {
      console.log('⚠️ Analytics already initialized');
      return;
    }

    console.log('🚀 Initializing Analytics Services...');

    // 1. Initialize Google Analytics
    this.initGoogleAnalytics();

    // 2. Initialize Amplitude
    this.initAmplitude();

    // 3. Initialize Microsoft Clarity (Session Replay)
    this.initClarity();

    this.isInitialized = true;
    console.log('✅ All Analytics Services Initialized');
  }

  /**
   * Initialize Google Analytics (GA4)
   */
  private initGoogleAnalytics() {
    const gaId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;

    if (!gaId) {
      console.warn('⚠️ Google Analytics ID not found in environment variables');
      return;
    }

    try {
      ReactGA.initialize(gaId, {
        gaOptions: {
          send_page_view: false, // We'll manually track page views
        },
      });

      this.gaInitialized = true;
      console.log('✅ Google Analytics initialized:', gaId);
    } catch (error) {
      console.error('❌ Google Analytics initialization failed:', error);
    }
  }

  /**
   * Initialize Amplitude
   */
  private initAmplitude() {
    const amplitudeKey = import.meta.env.VITE_AMPLITUDE_API_KEY;

    if (!amplitudeKey) {
      console.warn('⚠️ Amplitude API Key not found in environment variables');
      return;
    }

    try {
      amplitude.init(amplitudeKey, undefined, {
        defaultTracking: {
          sessions: true,
          pageViews: true,
          formInteractions: true,
          fileDownloads: true,
        },
        // Add app version if you have it
        appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
      });

      this.amplitudeInitialized = true;
      console.log('✅ Amplitude initialized:', amplitudeKey.substring(0, 10) + '...');
    } catch (error) {
      console.error('❌ Amplitude initialization failed:', error);
    }
  }

  /**
   * Initialize Microsoft Clarity (Session Replay)
   */
  private initClarity() {
    const clarityId = import.meta.env.VITE_CLARITY_PROJECT_ID;

    if (!clarityId) {
      console.warn('⚠️ Clarity Project ID not found in environment variables');
      return;
    }

    try {
      (function(c: any, l: any, a: string, r: string, i: string, t?: any, y?: any) {
        c[a] = c[a] || function() { (c[a].q = c[a].q || []).push(arguments); };
        t = l.createElement(r);
        t.async = 1;
        t.src = "https://www.clarity.ms/tag/" + i;
        y = l.getElementsByTagName(r)[0];
        y.parentNode.insertBefore(t, y);
      })(window, document, "clarity", "script", clarityId);

      this.clarityInitialized = true;
      console.log('✅ Microsoft Clarity initialized (Session Recording Active)');
    } catch (error) {
      console.error('❌ Clarity initialization failed:', error);
    }
  }

  /**
   * Track page views across all platforms
   */
  trackPageView(path: string, title?: string) {
    const pageTitle = title || document.title;

    // Google Analytics
    if (this.gaInitialized) {
      ReactGA.send({
        hitType: 'pageview',
        page: path,
        title: pageTitle
      });
    }

    // Amplitude
    if (this.amplitudeInitialized) {
      amplitude.track('Page Viewed', {
        path,
        title: pageTitle,
        url: window.location.href,
        referrer: document.referrer
      });
    }

    console.log('📄 Page view tracked:', path);
  }

  /**
   * Identify user across all platforms
   */
  identifyUser(userId: string | number, userProperties?: Record<string, any>) {
    const userIdStr = String(userId);

    // Google Analytics
    if (this.gaInitialized) {
      ReactGA.set({ userId: userIdStr });
    }

    // Amplitude - Set user properties
    if (this.amplitudeInitialized) {
      const identifyEvent = new amplitude.Identify();

      if (userProperties) {
        Object.entries(userProperties).forEach(([key, value]) => {
          identifyEvent.set(key, value);
        });
      }

      amplitude.setUserId(userIdStr);
      amplitude.identify(identifyEvent);
    }

    // Microsoft Clarity - Tag user in session recordings
    if (this.clarityInitialized && typeof window !== 'undefined' && window.clarity) {
      window.clarity("identify", userIdStr, {
        email: userProperties?.email,
        name: userProperties?.name,
        plan: userProperties?.plan,
      });
    }

    console.log('👤 User identified:', userIdStr);
  }

  /**
   * Track custom events
   */
  trackEvent(eventName: string, properties?: Record<string, any>) {
    // Google Analytics
    if (this.gaInitialized) {
      ReactGA.event({
        category: properties?.category || 'User Interaction',
        action: eventName,
        label: properties?.label,
        value: properties?.value,
      });
    }

    // Amplitude
    if (this.amplitudeInitialized) {
      amplitude.track(eventName, properties);
    }

    // Microsoft Clarity - Add custom tags
    if (this.clarityInitialized && typeof window !== 'undefined' && window.clarity) {
      window.clarity("set", eventName, properties?.label || eventName);
    }

    console.log('📊 Event tracked:', eventName, properties);
  }

  /**
   * Track library view
   */
  trackLibraryView(library: { id: number; title: string; slug: string; categories?: any[] }) {
    this.trackEvent('Library Viewed', {
      category: 'Library',
      label: library.title,
      libraryId: library.id,
      libraryTitle: library.title,
      librarySlug: library.slug,
      libraryCategories: library.categories?.map(c => c.name).join(', '),
    });
  }

  /**
   * Track library star/unstar
   */
  trackLibraryStar(library: { id: number; title: string }, isStarred: boolean) {
    this.trackEvent(isStarred ? 'Library Starred' : 'Library Unstarred', {
      category: 'Library',
      label: library.title,
      libraryId: library.id,
      libraryTitle: library.title,
      action: isStarred ? 'star' : 'unstar',
    });
  }

  /**
   * Track external link click
   */
  trackLibraryLinkClick(library: { id: number; title: string; url: string }) {
    this.trackEvent('Library Link Clicked', {
      category: 'Library',
      label: library.url,
      libraryId: library.id,
      libraryTitle: library.title,
      libraryUrl: library.url,
    });
  }

  /**
   * Track search
   */
  trackSearch(query: string, resultsCount: number) {
    this.trackEvent('Search Performed', {
      category: 'Search',
      label: query,
      query,
      resultsCount,
    });
  }

  /**
   * Track filter change
   */
  trackFilterChange(filterType: string, filterValue: string) {
    this.trackEvent('Filter Applied', {
      category: 'Filter',
      label: `${filterType}: ${filterValue}`,
      filterType,
      filterValue,
    });
  }

  /**
   * Track modal open
   */
  trackModalOpen(libraryTitle: string, libraryId: number) {
    this.trackEvent('Modal Opened', {
      category: 'Modal',
      label: libraryTitle,
      libraryId,
      libraryTitle,
    });
  }

  /**
   * Track modal close
   */
  trackModalClose(libraryTitle: string, libraryId: number, timeSpent?: number) {
    this.trackEvent('Modal Closed', {
      category: 'Modal',
      label: libraryTitle,
      libraryId,
      libraryTitle,
      timeSpent,
    });
  }

  /**
   * Track video play
   */
  trackVideoPlay(libraryTitle: string, videoUrl: string) {
    this.trackEvent('Video Played', {
      category: 'Video',
      label: libraryTitle,
      libraryTitle,
      videoUrl,
    });
  }

  /**
   * Track authentication events
   */
  trackLogin(method: string = 'email') {
    this.trackEvent('User Login', {
      category: 'Authentication',
      label: method,
      method,
    });
  }

  trackSignup(method: string = 'email') {
    this.trackEvent('User Signup', {
      category: 'Authentication',
      label: method,
      method,
    });
  }

  trackLogout() {
    this.trackEvent('User Logout', {
      category: 'Authentication',
    });

    // Clear user data from Amplitude
    if (this.amplitudeInitialized) {
      amplitude.reset();
    }
  }

  /**
   * Track errors
   */
  trackError(errorMessage: string, errorContext?: Record<string, any>) {
    this.trackEvent('Error Occurred', {
      category: 'Error',
      label: errorMessage,
      errorMessage,
      ...errorContext,
    });
  }

  /**
   * Track form submission
   */
  trackFormSubmit(formName: string, success: boolean = true) {
    this.trackEvent('Form Submitted', {
      category: 'Form',
      label: formName,
      formName,
      success,
    });
  }

  /**
   * Track button click
   */
  trackButtonClick(buttonName: string, location: string) {
    this.trackEvent('Button Clicked', {
      category: 'Button',
      label: `${buttonName} - ${location}`,
      buttonName,
      location,
    });
  }

  /**
   * Track scroll depth
   */
  trackScrollDepth(depth: number, page: string) {
    this.trackEvent('Scroll Depth', {
      category: 'Engagement',
      label: `${depth}% - ${page}`,
      depth,
      page,
    });
  }

  /**
   * Track time spent on page
   */
  trackTimeOnPage(page: string, seconds: number) {
    this.trackEvent('Time On Page', {
      category: 'Engagement',
      label: page,
      page,
      seconds,
    });
  }

  /**
   * Clear user data (on logout)
   */
  clearUser() {
    if (this.amplitudeInitialized) {
      amplitude.reset();
    }
    console.log('🔄 User data cleared');
  }

  /**
   * Check if analytics is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get initialization status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      googleAnalytics: this.gaInitialized,
      amplitude: this.amplitudeInitialized,
      clarity: this.clarityInitialized,
    };
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Export for debugging
if (typeof window !== 'undefined') {
  (window as any).__analytics__ = analytics;
}
