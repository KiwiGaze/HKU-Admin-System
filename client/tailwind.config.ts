// client/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}", // Scan Vue and TS/JS files
  ],
  theme: {
    extend: {
      // Add your custom theme extensions here
    },
  },
  plugins: [
    // Add any Tailwind plugins here
  ],
}