import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <h2 className="text-2xl font-bold text-[#163B5C]">Page Not Found</h2>
      <p className="text-sm text-[#64748B]">Could not find requested resource</p>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-full bg-[#ED3500] text-white text-xs font-semibold hover:bg-[#D02E00] transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
