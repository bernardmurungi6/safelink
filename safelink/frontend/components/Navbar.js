import Link from 'next/link';
import { useAuth } from '../lib/authContext';

export default function Navbar() {
  const auth = useAuth();
  const user = auth?.user;

  return (
    <header className="border-b border-line bg-panel">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-ink">
          Safe<span className="text-verified">Link</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-inkmuted">
          <Link href="/" className="hover:text-ink">Verify a phone</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="hover:text-ink">Dashboard</Link>
              {user.role === 'admin' && (
                <Link href="/admin" className="hover:text-ink">Admin</Link>
              )}
              <button
                onClick={auth.logout}
                className="rounded-stamp border border-ink px-3 py-1.5 text-ink hover:bg-ink hover:text-paper"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-ink">Log in</Link>
              <Link
                href="/register"
                className="rounded-stamp bg-ink px-3 py-1.5 text-paper hover:bg-inkmuted"
              >
                Register a phone
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
