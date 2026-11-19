'use client';

import React, { useState } from 'react';
import { Share2, Check, MessageCircle, Copy } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  slug: string;
}

export default function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return `https://beeshubfarmland.com/blog/${slug}`;
  };

  const handleCopyLink = () => {
    const url = getUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareText = encodeURIComponent(`${title} - Read more on BeesHub Farmland:\n${getUrl()}`);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${shareText}`;

  return (
    <div className="flex flex-wrap items-center gap-2.5 py-4 my-6 border-y border-[#E8EDF2]">
      <span className="text-xs font-bold text-[#64748B] flex items-center gap-1.5 mr-2">
        <Share2 className="w-3.5 h-3.5" /> Share Story:
      </span>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-xs font-bold transition-colors"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        <span>WhatsApp</span>
      </a>

      <button
        onClick={handleCopyLink}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#163B5C] text-xs font-bold transition-colors cursor-pointer"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-700">Link Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Link</span>
          </>
        )}
      </button>
    </div>
  );
}
