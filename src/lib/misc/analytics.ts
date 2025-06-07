export function trackEvent(event: string, parameters?: {[key: string]: any}) {
  if (typeof (window as any).gtag !== 'undefined') {
    (window as any).gtag('event', event, parameters);
  }
}