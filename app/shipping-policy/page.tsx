import type { Metadata } from 'next';
import PolicyPageShell from '@/components/theme-v2/PolicyPageShell';
import { getCompanyConfig } from '@/lib/companyConfig';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Shipping Policy',
  description:
    'Shipping charges, dispatch origin, order tracking, and bulk freight details for Bees Hub Farmland Private Limited.',
  alternates: { canonical: 'https://beeshubfarmland.com/shipping-policy' },
};

export default function ShippingPolicyPage() {
  const company = getCompanyConfig();

  return (
    <PolicyPageShell
      title="Shipping Policy"
      subtitle="Retail parcel shipping and commercial bulk freight guidelines for Bees Hub Farmland."
      canonicalPath="/shipping-policy"
    >
      <div className="space-y-2">
        <h2 className="font-serif font-bold text-xl text-[#173F2B]">1. Retail Shipping Charges</h2>
        <p className="text-[#6B756B]">
          Retail orders placed on the Bees Hub Farmland online storefront currently qualify for free shipping across India, as reflected in the shopping cart and checkout summary.
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="font-serif font-bold text-xl text-[#173F2B]">2. Dispatch Location &amp; Order Tracking</h2>
        <p className="text-[#6B756B]">
          Orders are dispatched from our processing facility in Nagercoil, Kanyakumari District, Tamil Nadu (PIN 629501). Once your order is placed, you can monitor its status (Pending, Confirmed, Shipped, Delivered) using the Track Order tool with your Order ID, registered mobile number, or email address.
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="font-serif font-bold text-xl text-[#173F2B]">3. Wholesale &amp; Bulk Freight</h2>
        <p className="text-[#6B756B]">
          Commercial bulk drums, 25kg powder consignments, private-label cartons, and event hampers are shipped via commercial freight carriers based on order volume, destination pincode, and quotation terms agreed with our trade desk.
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="font-serif font-bold text-xl text-[#173F2B]">4. Delivery Support</h2>
        <p className="text-[#6B756B]">
          For dispatch updates or delivery address assistance, contact {company.name} on{' '}
          <a href={`tel:+91${company.phone.replace(/\D/g, '')}`} className="text-[#173F2B] font-semibold underline">
            +91 {company.phone}
          </a>{' '}
          or{' '}
          <a href={`mailto:${company.email}`} className="text-[#173F2B] font-semibold underline">
            {company.email}
          </a>
          .
        </p>
      </div>
    </PolicyPageShell>
  );
}
