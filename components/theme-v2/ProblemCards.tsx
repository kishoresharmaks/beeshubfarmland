'use client';

import React from 'react';
import { AlertCircle, HelpCircle, Ban, TrendingDown } from 'lucide-react';

/**
 * Section G: Problem Cards (3)
 * Centered H3.
 * 3 equal cards: icon, H4, 3 bullets written as questions.
 * Uses a "concern" bullet marker (not a check mark).
 */
export default function ProblemCards() {
  const problems = [
    {
      persona: 'Food Brands & FMCG Formulators',
      icon: AlertCircle,
      title: 'Tired of Inconsistent Quality & Synthetic Sugar Adulteration?',
      questions: [
        'Are your bulk powders, carrier oils, or honey consignments failing purity and moisture tests?',
        'Struggling with inconsistent fruit aroma, oxidized oils, or clumping dehydrated powders?',
        'Losing consumer brand trust due to hidden maltodextrin, corn syrup, or mineral oil dilution?',
      ],
      tag: 'Product Quality Risk',
    },
    {
      persona: 'Organic Retailers & Supermarkets',
      icon: TrendingDown,
      title: 'Frustrated by Middlemen Markups & Unreliable Harvest Cycles?',
      questions: [
        'Paying inflated layer-on-layer trader commissions without any direct farmgate visibility?',
        'Experiencing sudden stockouts and broken delivery promises during peak festival seasons?',
        'Receiving unstandardized packaging with poor food-grade sealing and shelf leakage?',
      ],
      tag: 'Supply Chain Friction',
    },
    {
      persona: 'Institutional & Ayurvedic Buyers',
      icon: Ban,
      title: 'Lacking Direct Traceability & Certified Lab Documentation?',
      questions: [
        'Finding it impossible to verify the true geographical bio-reserve origin of your batches?',
        'Waiting weeks to receive certified FSSAI, pesticide residue, and heavy metal test reports?',
        'Unable to secure contracted pre-harvest farm pricing to hedge against seasonal volatility?',
      ],
      tag: 'Compliance & Assurance',
    },
  ];

  return (
    <section className="w-full py-16 sm:py-20 bg-[#FFFCFB] border-b border-[#E8EDF2]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <h3 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-[#163B5C] tracking-tight">
            Procurement challenges we solve
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {problems.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8EDF2] shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <Icon className="w-5 h-5 text-[#163B5C]" />

                  <div>
                    <span className="text-[11px] font-semibold text-[#64748B] block mb-1">
                      {card.persona}
                    </span>
                    <h4 className="font-heading font-bold text-base sm:text-lg text-[#163B5C] leading-snug">
                      {card.title}
                    </h4>
                  </div>

                  <ul className="space-y-3 pt-2">
                    {card.questions.map((q, qIdx) => (
                      <li key={qIdx} className="flex items-start gap-2.5 text-xs text-[#64748B] leading-relaxed">
                        <span className="text-[#ED3500] font-bold select-none shrink-0 mt-0.5">•</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
