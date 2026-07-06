import { useState } from 'react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  // MVP: no backend endpoint yet — this is a placeholder that can be wired
  // to a /api/contact route or a transactional email service later.
  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-display text-2xl font-bold text-ink">Contact us</h1>
      <p className="mt-1 text-sm text-inkmuted">
        Questions, partnership inquiries, or a report that needs urgent attention.
      </p>

      {submitted ? (
        <p className="mt-8 rounded-stamp border border-verified/30 bg-verified/5 px-4 py-3 text-sm text-verified">
          Thanks — we've received your message and will respond soon.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">Name</span>
            <input required className="w-full rounded-stamp border border-line px-4 py-2.5" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">Email</span>
            <input type="email" required className="w-full rounded-stamp border border-line px-4 py-2.5" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">Message</span>
            <textarea required rows={5} className="w-full rounded-stamp border border-line px-4 py-2.5" />
          </label>
          <button
            type="submit"
            className="w-full rounded-stamp bg-ink py-3 font-medium text-paper hover:bg-inkmuted"
          >
            Send message
          </button>
        </form>
      )}
    </div>
  );
}
