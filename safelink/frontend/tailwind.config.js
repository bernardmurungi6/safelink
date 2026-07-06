/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // SafeLink design tokens — grounded in the "verification stamp / evidence
        // tag" concept: a cool, official paper tone with status colors that carry
        // real meaning (clear / lost / stolen), not decorative accents.
        ink: '#101827',       // primary text, headers
        inkmuted: '#4B5468',  // secondary text
        paper: '#F1F1ED',     // page background — cool off-white, not cream
        panel: '#FFFFFF',     // card backgrounds
        line: '#D8D8D2',      // hairline borders on stamps/tags
        verified: '#1C6E5B',  // status: active / clear
        lost: '#B8862E',      // status: lost (amber)
        stolen: '#B23A2E',    // status: stolen (brick red, not terracotta)
        recovered: '#2E5FB2', // status: recovered (steel blue)
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        stamp: '2px',
      },
    },
  },
  plugins: [],
};
