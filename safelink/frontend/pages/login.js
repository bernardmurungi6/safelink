import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../lib/authContext';

export default function Login() {
  const auth = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await auth.login(email, password);
      router.push(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-display text-2xl font-bold text-ink">Log in</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-stamp border border-line bg-white px-4 py-2.5 text-ink"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-stamp border border-line bg-white px-4 py-2.5 text-ink"
          />
        </label>

        {error && <p className="text-sm text-stolen">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-stamp bg-ink py-3 font-medium text-paper hover:bg-inkmuted disabled:opacity-60"
        >
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="mt-6 text-sm text-inkmuted">
        New to SafeLink?{' '}
        <Link href="/register" className="font-medium text-ink underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
