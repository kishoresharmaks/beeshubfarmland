'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductClientRedirect({ id }: { id: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/?product=${id}`);
  }, [id, router]);

  return (
    <div className="min-h-screen bg-[#FFFCFB] flex flex-col items-center justify-center space-y-4 p-4 text-[#163B5C]">
      <div className="w-10 h-10 border-4 border-[#ED3500] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-bold animate-pulse">Loading BeesHub Farmland Product...</p>
    </div>
  );
}
