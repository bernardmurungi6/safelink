import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/authContext';
import { api } from '../lib/api';
import StatusStamp from '../components/StatusStamp';

export default function Admin() {
  const auth = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth?.loading && (!auth?.user || auth.user.role !== 'admin')) {
      router.push('/login');
    }
  }, [auth?.loading, auth?.user, router]);

  useEffect(() => {
    if (auth?.user?.role === 'admin') loadAll();
  }, [auth?.user, filter]);

  async function loadAll() {
    setLoading(true);
    try {
      const [statsData, reportsData] = await Promise.all([
        api.adminStats(),
        api.adminListReports(filter || undefined),
      ]);
      setStats(statsData);
      setReports(reportsData.reports);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    await api.adminUpdateReport(id, { status });
    loadAll();
  }

  if (!auth?.user || auth.user.role !== 'admin') return null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-2xl font-bold text-ink">Admin dashboard</h1>

      {stats && (
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <StatCard label="Total users" value={stats.totalUsers} />
          <StatCard label="Active phones" value={stats.phonesByStatus.active || 0} accent="verified" />
          <StatCard
            label="Lost / stolen"
            value={(stats.phonesByStatus.lost || 0) + (stats.phonesByStatus.stolen || 0)}
            accent="stolen"
          />
          <StatCard label="Lookups (30d)" value={stats.lookupsLast30Days} />
        </div>
      )}

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ink">Reports</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-stamp border border-line px-3 py-1.5 text-sm"
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
          <option value="disputed">Disputed</option>
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-stamp border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-paper text-xs uppercase tracking-wide text-inkmuted">
            <tr>
              <th className="px-4 py-3">Device</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Reporter</th>
              <th className="px-4 py-3">Filed</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-inkmuted">Loading…</td>
              </tr>
            )}
            {!loading && reports.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-inkmuted">No reports found.</td>
              </tr>
            )}
            {reports.map((r) => (
              <tr key={r.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <StatusStamp status={r.type} />
                    <div>
                      <p className="font-medium text-ink">{r.brand} {r.model}</p>
                      <p className="font-mono text-xs text-inkmuted">{r.imei}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 capitalize">{r.type}</td>
                <td className="px-4 py-3">
                  <p>{r.reporter_name}</p>
                  <p className="text-xs text-inkmuted">{r.reporter_email}</p>
                </td>
                <td className="px-4 py-3 text-inkmuted">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 capitalize">{r.status}</td>
                <td className="px-4 py-3">
                  {r.status === 'open' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(r.id, 'resolved')}
                        className="rounded-stamp border border-verified px-2 py-1 text-xs text-verified hover:bg-verified/10"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => updateStatus(r.id, 'disputed')}
                        className="rounded-stamp border border-line px-2 py-1 text-xs text-inkmuted hover:bg-paper"
                      >
                        Dispute
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Tailwind can't resolve dynamically interpolated class names at build time,
// so accent colors are spelled out fully here rather than templated.
const ACCENT_CLASSES = {
  verified: 'text-verified',
  stolen: 'text-stolen',
  lost: 'text-lost',
};

function StatCard({ label, value, accent }) {
  const color = ACCENT_CLASSES[accent] || 'text-ink';
  return (
    <div className="rounded-stamp border border-line bg-white p-5">
      <p className="text-xs uppercase tracking-wide text-inkmuted">{label}</p>
      <p className={`mt-1 font-display text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
