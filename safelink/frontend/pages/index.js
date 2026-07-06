import { useState } from 'react';
import Link from 'next/link';
import StatusStamp from '../components/StatusStamp';
import { api } from '../lib/api';

export default function Home() {
  const [imei, setImei] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const data = await api.verifyImei(imei.trim());
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Hero: the verification check itself, not a headline+button template */}
      <section className="border-b border-line bg-panel">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-inkmuted">
            Registry lookup &middot; free &middot; no account required
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
            Check an IMEI before you buy.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-inkmuted">
            SafeLink is a community registry for reporting and recovering stolen phones.
            Enter a 15-digit IMEI to see if a device has been reported lost or stolen.
          </p>

          <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-md gap-2">
            <input
              type="text"
              inputMode="numeric"
              placeholder="e.g. 490154203237518"
              value={imei}
              onChange={(e) => setImei(e.target.value)}
              maxLength={17}
              className="w-full rounded-stamp border border-line bg-white px-4 py-3 font-mono text-ink placeholder:text-inkmuted/60"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="whitespace-nowrap rounded-stamp bg-ink px-5 py-3 font-medium text-paper hover:bg-inkmuted disabled:opacity-60"
            >
              {loading ? 'Checking…' : 'Verify'}
            </button>
          </form>

          <p className="mt-2 text-xs text-inkmuted">
            Find the IMEI by dialing *#06# on the device, or in Settings &rsaquo; About.
          </p>

          {error && (
            <p className="mt-6 rounded-stamp border border-stolen/30 bg-stolen/5 px-4 py-3 text-sm text-stolen">
              {error}
            </p>
          )}

          {result && (
            <div className="mx-auto mt-8 flex max-w-md items-center gap-5 rounded-stamp border border-line bg-white p-6 text-left">
              <StatusStamp status={result.status} size="lg" />
              <div>
                <p className="font-mono text-xs text-inkmuted">{result.imei}</p>
                {result.brand && (
                  <p className="mt-1 font-display font-semibold text-ink">
                    {result.brand} {result.model}
                  </p>
                )}
                <p className="mt-1 text-sm text-inkmuted">{result.message}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* What SafeLink does — three real jobs, not decorative numbered steps */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-3">
          <Feature
            title="Register your phone"
            body="Attach your IMEI to your account in under a minute. It's your proof of ownership if the device is ever lost."
          />
          <Feature
            title="Report it missing"
            body="Lost or stolen, one report flips the device's public status instantly — visible to anyone who checks it."
          />
          <Feature
            title="Recover it"
            body="Mark a device recovered the moment it's back in your hands, and its record clears for future buyers."
          />
        </div>

        <div className="mt-16 rounded-stamp border border-line bg-panel p-8 text-center">
          <h2 className="font-display text-2xl font-bold text-ink">Own a phone? Get it on the registry.</h2>
          <p className="mx-auto mt-2 max-w-md text-inkmuted">
            Registration takes a minute and is the only way we can help recover it if it's ever lost or stolen.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-block rounded-stamp bg-ink px-6 py-3 font-medium text-paper hover:bg-inkmuted"
          >
            Create your account
          </Link>
        </div>
      </section>
    </div>
  );
}

function Feature({ title, body }) {
  return (
    <div className="border-l-2 border-line pl-5">
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-inkmuted">{body}</p>
    </div>
  );
}
