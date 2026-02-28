/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0f172a',
        clinical: '#2563eb'
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui']
      }
    }
  },
  plugins: []
};
