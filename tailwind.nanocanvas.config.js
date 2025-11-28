/** Tailwind config for building NanoCanvas-only CSS for Shadow DOM injection */
module.exports = {
  content: [
    './submodules/nanocanvas/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  corePlugins: {
    preflight: true,
  },
  plugins: [require('tailwindcss-animate')],
}

