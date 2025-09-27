/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./stories/**/*.{js,jsx,ts,tsx}"],
  // Tailwind v4 uses CSS-based configuration (@theme) instead of JS config
  // Custom colors and styles are now defined in globals.css
  plugins: [],
};
