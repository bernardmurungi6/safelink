import { useState } from 'react';
import StatusStamp from './StatusStamp';

export default function PhoneCard({ phone, onReport, onRecover, onDelete }) {
  const [reportOpen, setReportOpen] = useState(false);
  const [type, setType] = useState('lost');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [busy, setBusy] = useState(false);

  const canReport = phone.status === 'active';
  const canRecover = phone.status === 'lost' || phone.status === 'stolen';

  async function submitReport(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await onReport(phone.id, { type, description, lastKnownLocation: location });
      setReportOpen(false);
      setDescription('');
      setLocation('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-stamp border border-line bg-white p-5 sm:flex-row sm:items-center">
      <StatusStamp status={phone.status} />

      <div className="flex-1">
        <p className="font-display font-semibold text-ink">
          {phone.brand} {phone.model} {phone.color ? `· ${phone.color}` : ''}
        </p>
        <p className="font-mono text-xs text-inkmuted">IMEI {phone.imei}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {canReport && (
          <button
            onClick={() => setReportOpen((v) => !v)}
            className="rounded-stamp border border-lost px-3 py-1.5 text-xs font-medium text-lost hover:bg-lost/10"
          >
            Report lost/stolen
          </button>
        )}
        {canRecover && (
          <button
            onClick={() => onRecover(phone.id)}
            className="rounded-stamp border border-verified px-3 py-1.5 text-xs font-medium text-verified hover:bg-verified/10"
          >
            Mark recovered
          </button>
        )}
        <button
          onClick={() => onDelete(phone.id)}
          className="rounded-stamp border border-line px-3 py-1.5 text-xs font-medium text-inkmuted hover:bg-paper"
        >
          Remove
        </button>
      </div>

      {reportOpen && (
        <form onSubmit={submitReport} className="w-full space-y-3 border-t border-line pt-4 sm:col-span-full">
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-1.5">
              <input type="radio" checked={type === 'lost'} onChange={() => setType('lost')} />
              Lost
            </label>
            <label className="flex items-center gap-1.5">
              <input type="radio" checked={type === 'stolen'} onChange={() => setType('stolen')} />
              Stolen
            </label>
          </div>
          <input
            placeholder="Last known location (optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-stamp border border-line px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Description (optional) — what happened?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-stamp border border-line px-3 py-2 text-sm"
            rows={2}
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-stamp bg-ink px-4 py-2 text-xs font-medium text-paper hover:bg-inkmuted disabled:opacity-60"
          >
            {busy ? 'Submitting…' : 'Submit report'}
          </button>
        </form>
      )}
    </div>
  );
}
