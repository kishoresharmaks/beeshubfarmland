import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] bg-[#F7F4EB]/40 flex flex-col items-center justify-center p-6 text-center space-y-4">
      <h1 className="font-serif font-bold text-3xl text-[#173F2B]">Page Not Found</h1>
      <p className="text-sm text-[#6B756B] max-w-md">
        The page you requested could not be found. Browse our storefront or return to the homepage.
      </p>
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="px-6 py-2.5 rounded-full bg-[#173F2B] text-white text-xs font-semibold hover:bg-[#102E20] transition-colors"
        >
          Return Home
        </Link>
        <Link
          href="/shop"
          className="px-6 py-2.5 rounded-full border border-[#E4E7E1] bg-white text-[#202820] text-xs font-semibold hover:border-[#173F2B] transition-colors"
        >
          Visit Shop
        </Link>
      </div>
    </div>
  );
}
