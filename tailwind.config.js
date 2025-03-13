/** @type {import('tailwindcss').Config} */
export default {
  prefix: '', // Prefijo opcional para evitar colisiones
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    fontFamily: {
      sans: ['Lato', 'system-ui', '-apple-system', 'sans-serif'],
    },
    extend: {
    },
  },
  corePlugins: {
    preflight: false, // Evita conflictos con Bootstrap
  },
  plugins: [],
}
