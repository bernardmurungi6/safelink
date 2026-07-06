import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/authContext';
import { api } from '../lib/api';
import PhoneCard from '../components/PhoneCard';

export default function Dashboard() {
  const auth = useAuth();
  const router = useRouter();
  const [phones, setPhones] = useState([]);
  const [loadingPhones, setLoadingPhones] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ imei: '', brand: '', model: '', color: '', purchaseDate: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth?.loading && !auth?.user) router.push('/login');
  }, [auth?.loading, auth?.user, router]);

  useEffect(() => {
    if (auth?.user) loadPhones();
  }, [auth?.user]);

  async function loadPhones() {
    setLoadingPhones(true);
    try {
      const data = await api.listPhones();
      setPhones(data.phones);
    } finally {
      setLoadingPhones(false);
    }
  }

  async function handleAddPhone(e) {
    e.preventDefault();
    setError('');
    try {
      await api.registerPhone(form);
      setForm({ imei: '', brand: '', model: '', color: '', purchaseDate: '' });
      setFormOpen(false);
      loadPhones();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleReport(phoneId, payload) {
    await api.createReport({ phoneId, ...payload });
    loadPhones();
  }

  async function handleRecover(phoneId) {
    await api.markRecovered(phoneId);
    loadPhones();
  }

  async function handleDelete(phoneId) {
    if (!confirm('Remove this phone from your registry?')) return;
    await api.deletePhone(phoneId);
    loadPhones();
  }

  if (!auth?.user) return null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Your phones</h1>
          <p className="text-sm text-inkmuted">Signed in as {auth.user.email}</p>
        </div>
        <button
          onClick={() => setFormOpen((v) => !v)}
          className="rounded-stamp bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-inkmuted"
        >
          {formOpen ? 'Cancel' : '+ Register a phone'}
        </button>
      </div>

      {formOpen && (
        <form
          onSubmit={handleAddPhone}
          className="mt-6 grid gap-3 rounded-stamp border border-line bg-white p-6 sm:grid-cols-2"
        >
          <input
            placeholder="IMEI (15 digits)"
            value={form.imei}
            onChange={(e) => setForm({ ...form, imei: e.target.value })}
            className="rounded-stamp border border-line px-3 py-2 font-mono text-sm sm:col-span-2"
            required
          />
          <input
            placeholder="Brand (e.g. Samsung)"
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
            className="rounded-stamp border border-line px-3 py-2 text-sm"
            required
          />
          <input
            placeholder="Model (e.g. Galaxy S24)"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
            className="rounded-stamp border border-line px-3 py-2 text-sm"
            required
          />
          <input
            placeholder="Color (optional)"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="rounded-stamp border border-line px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={form.purchaseDate}
            onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
            className="rounded-stamp border border-line px-3 py-2 text-sm"
          />
          {error && <p className="text-sm text-stolen sm:col-span-2">{error}</p>}
          <button
            type="submit"
            className="rounded-stamp bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-inkmuted sm:col-span-2"
          >
            Save phone
          </button>
        </form>
      )}

      <div className="mt-8 space-y-4">
        {loadingPhones && <p className="text-sm text-inkmuted">Loading your phones…</p>}
        {!loadingPhones && phones.length === 0 && (
          <p className="rounded-stamp border border-dashed border-line p-8 text-center text-sm text-inkmuted">
            No phones registered yet. Add your first one above.
          </p>
        )}
        {phones.map((phone) => (
          <PhoneCard
            key={phone.id}
            phone={phone}
            onReport={handleReport}
            onRecover={handleRecover}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
