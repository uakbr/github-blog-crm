import React, { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const Analytics = ({ 
  debug = false,
  sampleRate = 100, // Percentage of sessions to track
  excludePaths = [], // Paths to exclude from tracking
  // Optional tracking IDs
  googleAnalyticsId,
  mixpanelToken,
  plausibleDomain,
  appId,
}) => {
  const location = useLocation();

  // Initialize analytics services
  useEffect(() => {
    if (shouldInitialize()) {
      initializeAnalytics();
    }
  }, []);

  // Check if we should initialize analytics
  const shouldInitialize = useCallback(() => {
    // Don't track in development unless debug mode is on
    if (process.env.NODE_ENV === 'development' && !debug) {
      return false;
    }

    // Check if user has opted out
    if (localStorage.getItem('analytics-opt-out') === 'true') {
      return false;
    }

    // Apply sampling rate
    if (Math.random() * 100 > sampleRate) {
      return false;
    }

    return true;
  }, [debug, sampleRate]);

  // Initialize analytics services
  const initializeAnalytics = useCallback(() => {
    // Google Analytics
    if (googleAnalyticsId) {
      initializeGoogleAnalytics(googleAnalyticsId);
    }

    // Mixpanel
    if (mixpanelToken) {
      initializeMixpanel(mixpanelToken);
    }

    // Plausible
    if (plausibleDomain) {
      initializePlausible(plausibleDomain);
    }

    // Log initialization in debug mode
    if (debug) {
      console.log('Analytics initialized with:', {
        googleAnalyticsId,
        mixpanelToken,
        plausibleDomain,
        sampleRate,
        excludePaths,
      });
    }
  }, [googleAnalyticsId, mixpanelToken, plausibleDomain, debug, sampleRate, excludePaths]);

  // Track page views
  useEffect(() => {
    if (shouldTrackPath(location.pathname)) {
      trackPageView(location);
    }
  }, [location]);

  // Check if path should be tracked
  const shouldTrackPath = useCallback((path) => {
    return !excludePaths.some(excludePath => 
      typeof excludePath === 'string' 
        ? path.startsWith(excludePath)
        : excludePath.test(path)
    );
  }, [excludePaths]);

  // Track page view across services
  const trackPageView = useCallback((location) => {
    const pageData = {
      path: location.pathname,
      title: document.title,
      url: window.location.href,
      referrer: document.referrer,
      search: location.search,
      timestamp: new Date().toISOString(),
    };

    // Google Analytics
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: pageData.path,
        page_title: pageData.title,
        page_location: pageData.url,
      });
    }

    // Mixpanel
    if (window.mixpanel) {
      window.mixpanel.track('Page View', pageData);
    }

    // Plausible
    if (window.plausible) {
      window.plausible('pageview', { props: pageData });
    }

    // Debug logging
    if (debug) {
      console.log('Page view tracked:', pageData);
    }
  }, [debug]);

  // Utility function to track custom events
  const trackEvent = useCallback((eventName, eventData = {}) => {
    if (!shouldInitialize()) return;

    const enrichedData = {
      ...eventData,
      timestamp: new Date().toISOString(),
      path: location.pathname,
      url: window.location.href,
    };

    // Google Analytics
    if (window.gtag) {
      window.gtag('event', eventName, enrichedData);
    }

    // Mixpanel
    if (window.mixpanel) {
      window.mixpanel.track(eventName, enrichedData);
    }

    // Plausible
    if (window.plausible) {
      window.plausible(eventName, { props: enrichedData });
    }

    // Debug logging
    if (debug) {
      console.log('Event tracked:', eventName, enrichedData);
    }
  }, [debug, location]);

  // Initialize Google Analytics
  const initializeGoogleAnalytics = (id) => {
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', id, {
      send_page_view: false, // We'll track page views manually
    });
  };

  // Initialize Mixpanel
  const initializeMixpanel = (token) => {
    (function(f,b){if(!b.__SV){var e,g,i,h;window.mixpanel=b;b._i=[];b.init=function(e,f,c){function g(a,d){var b=d.split(".");2==b.length&&(a=a[b[0]],d=b[1]);a[d]=function(){a.push([d].concat(Array.prototype.slice.call(arguments,0)))}}var a=b;"undefined"!==typeof c?a=b[c]=[]:c="mixpanel";a.people=a.people||[];a.toString=function(a){var d="mixpanel";"mixpanel"!==c&&(d+="."+c);a||(d+=" (stub)");return d};a.people.toString=function(){return a.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");
    for(h=0;h<i.length;h++)g(a,i[h]);var j="set set_once union unset remove delete".split(" ");a.get_group=function(){function b(c){d[c]=function(){call2_args=arguments;call2=[c].concat(Array.prototype.slice.call(call2_args,0));a.push([e,call2])}}for(var d={},e=["get_group"].concat(Array.prototype.slice.call(arguments,0)),c=0;c<j.length;c++)b(j[c]);return d};b._i.push([e,f,c])};b.__SV=1.2;e=f.createElement("script");e.type="text/javascript";e.async=!0;e.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?
    MIXPANEL_CUSTOM_LIB_URL:"file:"===f.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";g=f.getElementsByTagName("script")[0];g.parentNode.insertBefore(e,g)}})(document,window.mixpanel||[]);
    
    window.mixpanel.init(token);
  };

  // Initialize Plausible
  const initializePlausible = (domain) => {
    const script = document.createElement('script');
    script.src = 'https://plausible.io/js/script.js';
    script.setAttribute('data-domain', domain);
    script.defer = true;
    document.head.appendChild(script);
  };

  // Expose tracking function to window for external use
  useEffect(() => {
    if (shouldInitialize()) {
      window.trackAnalyticsEvent = trackEvent;
    }
    return () => {
      delete window.trackAnalyticsEvent;
    };
  }, [trackEvent, shouldInitialize]);

  return null; // This component doesn't render anything
};

// PropTypes for development
if (process.env.NODE_ENV === 'development') {
  const PropTypes = require('prop-types');
  
  Analytics.propTypes = {
    debug: PropTypes.bool,
    sampleRate: PropTypes.number,
    excludePaths: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(RegExp)])
    ),
    googleAnalyticsId: PropTypes.string,
    mixpanelToken: PropTypes.string,
    plausibleDomain: PropTypes.string,
    appId: PropTypes.string,
  };
}

export default Analytics;