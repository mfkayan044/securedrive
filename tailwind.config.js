/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#e30613', // Secure kırmızı
        },
        secondary: {
          DEFAULT: '#bcbec0', // drive gri
        },
      },
    },
  },
  plugins: [],
};
