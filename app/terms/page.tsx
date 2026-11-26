import type { Metadata } from 'next';
import PolicyPageShell from '@/components/theme-v2/PolicyPageShell';
import { getCompanyConfig } from '@/lib/companyConfig';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description:
    'Terms governing retail purchases, wholesale quotations, and private-label enquiries with BEES HUB FARMLAND PRIVATE LIMITED.',
  alternates: { canonical: 'https://beeshubfarmland.com/terms' },
};

export default function TermsPage() {
  const company = getCompanyConfig();

  return (
    <PolicyPageShell
      title="Terms and Conditions"
      subtitle={`Commercial and storefront terms for ${company.name}.`}
      canonicalPath="/terms"
    >
      <div className="space-y-2">
        <h2 className="font-serif font-bold text-xl text-[#173F2B]">1. Storefront Orders &amp; Pricing</h2>
        <p className="text-[#6B756B]">
          All retail prices are displayed in Indian Rupees (INR) with applicable GST calculated transparently in the shopping cart and checkout summary. Order confirmation is subject to product stock availability and payment verification.
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="font-serif font-bold text-xl text-[#173F2B]">2. Wholesale &amp; Private Label Agreements</h2>
        <p className="text-[#6B756B]">
          Wholesale quotations, custom bottling, and bulk drum supplies are governed by mutually confirmed batch specifications, MOQs, payment terms, and GST invoicing issued by {company.name} (GSTIN: {company.gstin}).
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="font-serif font-bold text-xl text-[#173F2B]">3. Jurisdiction &amp; Contact</h2>
        <p className="text-[#6B756B]">
          Registered office &amp; processing facility: {company.address} For any legal or commercial questions, contact{' '}
          <a href={`mailto:${company.email}`} className="text-[#173F2B] font-semibold underline">
            {company.email}
          </a>
          .
        </p>
      </div>
    </PolicyPageShell>
  );
}
