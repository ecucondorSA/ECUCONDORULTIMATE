/**
 * Analytics and Performance Monitoring Configuration
 * Optimized for Vercel deployment
 */

// Vercel Analytics
export const analytics = {
  // Enable Web Vitals tracking
  webVitals: true,
  // Custom events for business metrics
  trackEvents: {
    // Calculator usage
    CALCULATOR_USED: 'calculator_used',
    EXCHANGE_RATE_VIEWED: 'exchange_rate_viewed',
    TRANSACTION_STARTED: 'transaction_started',
    TRANSACTION_COMPLETED: 'transaction_completed',
    
    // User flow
    USER_REGISTERED: 'user_registered',
    USER_LOGGED_IN: 'user_logged_in',
    DASHBOARD_ACCESSED: 'dashboard_accessed',
    
    // Performance
    PAGE_LOAD_SLOW: 'page_load_slow',
    ERROR_OCCURRED: 'error_occurred',
  }
}

// Performance monitoring configuration
export const performance = {
  // Core Web Vitals thresholds
  thresholds: {
    LCP: 2500, // Largest Contentful Paint
    FID: 100,  // First Input Delay
    CLS: 0.1,  // Cumulative Layout Shift
    FCP: 1800, // First Contentful Paint
    TTFB: 800, // Time to First Byte
  },
  
  // Custom performance metrics
  customMetrics: {
    CALCULATOR_RENDER_TIME: 'calculator_render_time',
    API_RESPONSE_TIME: 'api_response_time',
    IMAGE_LOAD_TIME: 'image_load_time',
  }
}

// Error tracking configuration
export const errorTracking = {
  // Categories of errors to track
  categories: {
    API_ERROR: 'api_error',
    NETWORK_ERROR: 'network_error',
    UI_ERROR: 'ui_error',
    AUTH_ERROR: 'auth_error',
    PAYMENT_ERROR: 'payment_error',
  },
  
  // Error severity levels
  severity: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
  }
}

// Extend window type for analytics
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// Track custom event (for use throughout the app)
export function trackEvent(eventName: string, properties?: Record<string, string | number>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      custom_map: properties,
      timestamp: Date.now(),
    })
  }
  
  // Also send to Vercel Analytics if available
  if (typeof window !== 'undefined' && (window as unknown as { va?: (event: string) => void }).va) {
    (window as unknown as { va: (event: string) => void }).va(eventName)
  }
}

// Track performance metric
export function trackPerformance(metricName: string, value: number, unit: string = 'ms') {
  if (typeof window !== 'undefined') {
    // Send to Performance API
    if (window.performance && window.performance.mark) {
      window.performance.mark(metricName)
    }
    
    // Track as custom event
    trackEvent('performance_metric', {
      metric: metricName,
      value,
      unit,
    })
  }
}

// Track error
export function trackError(error: Error, category: string, severity: string = 'medium') {
  console.error(`[${category}] ${severity}:`, error)
  
  trackEvent('error_occurred', {
    category,
    severity,
    message: error.message,
    stack: error.stack || 'No stack trace available',
    timestamp: Date.now(),
  })
}

// Web Vitals reporter (for use with Next.js reportWebVitals)
export function reportWebVitals(metric: { name: string; value: number; id: string }) {
  const { name, value, id } = metric
  
  // Check if value exceeds threshold
  const thresholds = performance.thresholds;
  const threshold = thresholds[name as keyof typeof thresholds]
  const isSlowMetric = threshold && value > threshold
  
  // Track the metric
  trackPerformance(`web_vitals_${name.toLowerCase()}`, value)
  
  // Alert if performance is poor
  if (isSlowMetric) {
    trackEvent(analytics.trackEvents.PAGE_LOAD_SLOW, {
      metric: name,
      value,
      threshold,
      id,
    })
  }
  
  // Send to external analytics (Google Analytics, etc.)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, {
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      event_category: 'Web Vitals',
      event_label: id,
      non_interaction: true,
    })
  }
}

// Initialize analytics (call this in _app.tsx or layout.tsx)
export function initializeAnalytics() {
  if (typeof window === 'undefined') return
  
  // Initialize Vercel Analytics
  if (process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID) {
    import('@vercel/analytics').then(({ inject }) => {
      inject()
    })
  }
  
  // Initialize Vercel Speed Insights
  if (process.env.NEXT_PUBLIC_VERCEL_SPEED_INSIGHTS) {
    import('@vercel/speed-insights/next').then(() => {
      // Speed Insights will be automatically injected
    })
  }
  
  console.log('🚀 Analytics initialized for EcuCondor')
}