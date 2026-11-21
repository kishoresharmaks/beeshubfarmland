'use client';

import Script from 'next/script';

export default function ImpactAnalytics() {
  return (
    <Script
      id="impact-analytics"
      src="https://utt.impactcdn.com/P-A7805805-7b0f-4744-b530-9e416581216c1.js"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      onLoad={() => {
        try {
          if (typeof (window as any).impactStat === 'function') {
            (window as any).impactStat('transformLinks');
            (window as any).impactStat('trackImpression');
          }
        } catch (err) {
          console.warn('Impact CDN analytics initialization handled:', err);
        }
      }}
      onError={(err) => {
        console.warn('Impact CDN script failed to load (isolated):', err);
      }}
    />
  );
}
