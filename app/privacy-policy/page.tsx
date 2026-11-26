import type { Metadata } from 'next';
import PolicyPageShell from '@/components/theme-v2/PolicyPageShell';
import { getCompanyConfig } from '@/lib/companyConfig';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How BEES HUB FARMLAND PRIVATE LIMITED collects and uses order, enquiry, and payment information.',
  alternates: { canonical: 'https://beeshubfarmland.com/privacy-policy' },
};

export default function PrivacyPolicyPage() {
  const company = getCompanyConfig();

  return (
    <PolicyPageShell
      title="Privacy Policy"
      subtitle={`How ${company.name} handles customer order and B2B enquiry information.`}
      canonicalPath="/privacy-policy"
    >
      <div className="space-y-2">
        <h2 className="font-serif font-bold text-xl text-[#173F2B]">1. Information We Collect</h2>
        <p className="text-[#6B756B]">
          When you place a retail order or submit a wholesale/private-label enquiry, we collect the contact, delivery address, and business details you provide (such as name, phone number, email address, shipping address, pincode, and optional GSTIN) solely to fulfill orders and respond to commercial requests.
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="font-serif font-bold text-xl text-[#173F2B]">2. Payment Processing</h2>
        <p className="text-[#6B756B]">
          Online payments are processed through Razorpay&apos;s encrypted checkout gateway. Bees Hub Farmland does not store your full card numbers, UPI PINs, or banking passwords on its servers.
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="font-serif font-bold text-xl text-[#173F2B]">3. Order Tracking &amp; Data Inquiries</h2>
        <p className="text-[#6B756B]">
          Order status lookup masks sensitive personal details while confirming fulfillment progress. For data correction or deletion requests, email{' '}
          <a href={`mailto:${company.email}`} className="text-[#173F2B] font-semibold underline">
            {company.email}
          </a>
          .
        </p>
      </div>
    </PolicyPageShell>
  );
}
