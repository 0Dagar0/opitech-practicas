/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#4C1D95',      // purple-900
        'brand-secondary': '#F59E0B',    // amber-500
        'brand-dark': '#1E1B4B',         // indigo-950
        'brand-light': '#F9FAFB',        // gray-50
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};

