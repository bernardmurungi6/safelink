import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-line bg-panel">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-inkmuted sm:flex-row">
        <p className="font-mono">&copy; {new Date().getFullYear()} SafeLink. Registry no. 000001.</p>
        <div className="flex gap-6">
          <Link href="/contact" className="hover:text-ink">Contact</Link>
          <Link href="/" className="hover:text-ink">Verify a phone</Link>
        </div>
      </div>
    </footer>
  );
}
