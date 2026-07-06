import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../lib/authContext';

export default function Register() {
  const auth = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', phoneNumber: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await auth.register(form);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-display text-2xl font-bold text-ink">Create your account</h1>
      <p className="mt-1 text-sm text-inkmuted">
        Register your phones and keep a recovery record of ownership.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Field label="Full name" value={form.name} onChange={update('name')} required />
        <Field label="Email" type="email" value={form.email} onChange={update('email')} required />
        <Field
          label="Password"
          type="password"
          value={form.password}
          onChange={update('password')}
          required
          hint="At least 8 characters."
        />
        <Field
          label="Phone number (optional)"
          value={form.phoneNumber}
          onChange={update('phoneNumber')}
        />

        {error && <p className="text-sm text-stolen">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-stamp bg-ink py-3 font-medium text-paper hover:bg-inkmuted disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-sm text-inkmuted">
        Already registered?{' '}
        <Link href="/login" className="font-medium text-ink underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

function Field({ label, hint, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      <input
        {...props}
        className="w-full rounded-stamp border border-line bg-white px-4 py-2.5 text-ink"
      />
      {hint && <span className="mt-1 block text-xs text-inkmuted">{hint}</span>}
    </label>
  );
}
