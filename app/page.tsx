'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { StoreProvider, useStore } from '@/context/StoreContext';
import StoreThemeV2 from '@/components/theme-v2/StoreThemeV2';
import StoreThemeV1 from '@/components/theme-v1/StoreThemeV1';

/**
 * Theme Router
 * Dynamically resolves active theme from database settings or optional URL override (?theme=v1 / ?theme=v2)
 */
function ThemeRouter() {
  const { settings } = useStore();
  const searchParams = useSearchParams();
  const queryTheme = searchParams.get('theme');

  // Query parameter ?theme=v1 or ?theme=v2 allows instantaneous preview
  const activeTheme =
    queryTheme === 'v1' || queryTheme === 'v2'
      ? queryTheme
      : settings.activeTheme || 'v2';

  if (activeTheme === 'v1') {
    return <StoreThemeV1 />;
  }

  return <StoreThemeV2 />;
}

export default function HomePage() {
  return (
    <StoreProvider>
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#FFFCFB] flex flex-col items-center justify-center space-y-4 p-4 text-[#163B5C]">
            <div className="w-10 h-10 border-4 border-[#ED3500] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold animate-pulse">Loading BeesHub Farmland Store...</p>
          </div>
        }
      >
        <ThemeRouter />
      </Suspense>
    </StoreProvider>
  );
}
