const STATUS_CONFIG = {
  active: { label: 'Clear', color: 'text-verified', border: 'border-verified' },
  not_found: { label: 'Unregistered', color: 'text-inkmuted', border: 'border-inkmuted' },
  lost: { label: 'Lost', color: 'text-lost', border: 'border-lost' },
  stolen: { label: 'Stolen', color: 'text-stolen', border: 'border-stolen' },
  recovered: { label: 'Recovered', color: 'text-recovered', border: 'border-recovered' },
};

/**
 * The site's signature element: a notary-style verification stamp.
 * It doubles as the visual language for phone status everywhere
 * (verify results, dashboard cards, admin tables) so a glance at the
 * stamp always tells you the same thing a real evidence tag would.
 */
export default function StatusStamp({ status = 'not_found', size = 'md' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.not_found;
  const dims = size === 'lg' ? 'h-28 w-28 text-sm' : 'h-16 w-16 text-[10px]';

  return (
    <div
      className={`relative flex ${dims} flex-shrink-0 items-center justify-center rounded-full border-[3px] ${config.border} ${config.color} font-display font-bold uppercase tracking-wide`}
      style={{
        borderStyle: 'double',
      }}
      role="img"
      aria-label={`Verification status: ${config.label}`}
    >
      <span className="rotate-[-8deg] text-center leading-tight">{config.label}</span>
    </div>
  );
}
