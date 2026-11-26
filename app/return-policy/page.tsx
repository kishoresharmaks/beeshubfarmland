import type { Metadata } from 'next';
import PolicyPageShell from '@/components/theme-v2/PolicyPageShell';
import { getCompanyConfig } from '@/lib/companyConfig';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Return & Refund Policy',
  description:
    'Guidelines for damaged, leaked, or incorrect product deliveries and refund requests at Bees Hub Farmland.',
  alternates: { canonical: 'https://beeshubfarmland.com/return-policy' },
};

export default function ReturnPolicyPage() {
  const company = getCompanyConfig();

  return (
    <PolicyPageShell
      title="Return & Refund Policy"
      subtitle="Support procedures for damaged, leaked, or incorrect deliveries."
      canonicalPath="/return-policy"
    >
      <div className="space-y-2">
        <h2 className="font-serif font-bold text-xl text-[#173F2B]">1. Damaged or Incorrect Items</h2>
        <p className="text-[#6B756B]">
          Because our products are consumable food and agricultural items, returns are handled specifically for items that arrive damaged, leaking, tampered with in transit, or different from the item ordered.
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="font-serif font-bold text-xl text-[#173F2B]">2. How to Request Support</h2>
        <p className="text-[#6B756B]">
          Please reach out to our customer support team with your Order ID and clear photos of the outer packaging and product condition via email at{' '}
          <a href={`mailto:${company.email}`} className="text-[#173F2B] font-semibold underline">
            {company.email}
          </a>{' '}
          or phone/WhatsApp at{' '}
          <a href={`tel:+91${company.phone.replace(/\D/g, '')}`} className="text-[#173F2B] font-semibold underline">
            +91 {company.phone}
          </a>
          .
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="font-serif font-bold text-xl text-[#173F2B]">3. Replacements &amp; Refunds</h2>
        <p className="text-[#6B756B]">
          After reviewing your order details and supporting photos, our team will coordinate a replacement dispatch or process an eligible refund to your original payment method (for online Razorpay orders) or as agreed for COD orders.
        </p>
      </div>
    </PolicyPageShell>
  );
}
