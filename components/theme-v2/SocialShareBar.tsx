'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Share2,
  Check,
  Copy,
  MessageCircle,
  Facebook,
  Linkedin,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

interface SocialShareBarProps {
  title: string;
  description?: string;
  path?: string;
  label?: string;
  compact?: boolean;
  dark?: boolean;
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/**
 * Reusable Social Share component for both individual Products and the Website.
 * Supports Web Share API (when available), WhatsApp, Facebook, X, LinkedIn, and Copy Link.
 */
export default function SocialShareBar({
  title,
  description,
  path = '',
  label = 'Share',
  compact = false,
  dark = false,
}: SocialShareBarProps) {
  const { showToast } = useStore();
  const [copied, setCopied] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!popoverOpen) return;
    const onOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPopoverOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    window.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      window.removeEventListener('keydown', onEsc);
    };
  }, [popoverOpen]);

  const getShareUrl = () => {
    const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
    if (typeof window !== 'undefined') {
      if (!path) return window.location.href;
      return `${window.location.origin}${cleanPath}`;
    }
    return `https://beeshubfarmland.com${cleanPath}`;
  };

  const shareUrl = getShareUrl();
  const fullText = description ? `${title} — ${description}` : title;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(fullText);

  const shareLinks = [
    {
      name: 'WhatsApp',
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${fullText}\n${shareUrl}`)}`,
      icon: MessageCircle,
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: Facebook,
    },
    {
      name: 'X',
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      icon: XIcon,
    },
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: Linkedin,
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast('Share link copied to clipboard.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Unable to copy link automatically.');
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title,
          text: description || title,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or native share unsupported in current context -> open popover
      }
    }
    setPopoverOpen((prev) => !prev);
  };

  if (compact) {
    return (
      <div ref={popoverRef} className="relative">
        <button
          type="button"
          onClick={handleNativeShare}
          className="w-8 h-8 rounded-full bg-white/95 hover:bg-[#173F2B] text-[#202820] hover:text-white border border-[#E4E7E1] shadow-xs flex items-center justify-center transition-colors"
          title={`Share ${title}`}
          aria-label={`Share ${title}`}
          aria-expanded={popoverOpen}
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>

        {popoverOpen && (
          <div
            role="menu"
            className="absolute right-0 bottom-10 w-44 bg-white rounded-2xl shadow-xl border border-[#E4E7E1] p-2 z-40 space-y-1"
          >
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#6B756B] border-b border-[#E4E7E1]">
              Share Product
            </div>
            {shareLinks.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setPopoverOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#F7F4EB] text-xs font-medium text-[#202820] hover:text-[#173F2B] transition-colors"
                >
                  <Icon className="w-3.5 h-3.5 text-[#173F2B]" />
                  <span>{item.name}</span>
                </a>
              );
            })}
            <button
              type="button"
              onClick={() => {
                handleCopy();
                setPopoverOpen(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#F7F4EB] text-xs font-medium text-[#202820] hover:text-[#173F2B] transition-colors text-left"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-[#173F2B]" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-[#A97843]" />
              )}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={`text-xs font-semibold flex items-center gap-1.5 mr-1 ${
          dark ? 'text-[#E8EFE6]' : 'text-[#6B756B]'
        }`}
      >
        <Share2 className="w-3.5 h-3.5" />
        <span>{label}:</span>
      </span>

      {shareLinks.map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.name}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${item.name}`}
            title={`Share on ${item.name}`}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              dark
                ? 'bg-white/10 hover:bg-[#A97843] text-white border-white/15'
                : 'bg-[#F7F4EB] hover:bg-[#173F2B] text-[#202820] hover:text-white border-[#E4E7E1]'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{item.name}</span>
          </a>
        );
      })}

      <button
        type="button"
        onClick={handleCopy}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
          dark
            ? 'bg-white/10 hover:bg-white/20 text-white border-white/15'
            : 'bg-white hover:bg-[#E8EFE6] text-[#173F2B] border-[#E4E7E1]'
        }`}
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        <span>{copied ? 'Link Copied' : 'Copy Link'}</span>
      </button>
    </div>
  );
}
