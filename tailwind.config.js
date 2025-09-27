/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./stories/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Muted sage green palette - inspired by nature
        primary: {
          50: "#f4f6f4",
          100: "#e8eae7",
          200: "#d1d6cd",
          300: "#b3baa8",
          400: "#8f9780",
          500: "#6b7c5d", // Soft sage green
          600: "#586548",
          700: "#46513a",
          800: "#384130",
          900: "#2d3428",
        },
        // Muted warm neutral palette
        secondary: {
          50: "#f8f7f5",
          100: "#f0ede7",
          200: "#e0dbd0",
          300: "#cbc2b0",
          400: "#b2a389",
          500: "#9a8669", // Soft warm brown
          600: "#826f55",
          700: "#6b5a46",
          800: "#564a3b",
          900: "#473d32",
        },
        // Softer neumorphism background colors
        neu: {
          50: "#fafbfa",
          100: "#f5f6f5",
          200: "#eff0ef",
          300: "#e4e6e4",
          400: "#d1d4d1",
          500: "#a8ada8",
          600: "#8a908a",
          700: "#6f756f",
          800: "#4a504a",
          900: "#353a35",
        },
        // Muted success green
        success: {
          50: "#f3f6f3",
          100: "#e6ede6",
          200: "#c8d6c8",
          300: "#a3b8a3",
          400: "#7a947a",
          500: "#5a7a5a", // Muted forest green
          600: "#4a644a",
          700: "#3d523d",
          800: "#334233",
          900: "#2a362a",
        },
        // Muted warning orange
        warning: {
          50: "#fdf8f3",
          100: "#faf0e6",
          200: "#f3dcc8",
          300: "#e8c2a3",
          400: "#d9a077",
          500: "#c8825a", // Soft terracotta
          600: "#b06d48",
          700: "#92583c",
          800: "#774833",
          900: "#623c2c",
        },
        // Muted error red
        error: {
          50: "#fdf4f4",
          100: "#fae8e8",
          200: "#f2d0d0",
          300: "#e6abab",
          400: "#d67e7e",
          500: "#c45a5a", // Soft dusty red
          600: "#a84848",
          700: "#8b3c3c",
          800: "#733333",
          900: "#602c2c",
        },
      },
      boxShadow: {
        "neu-sm":
          "4px 4px 8px rgba(168, 173, 168, 0.25), -4px -4px 8px rgba(255, 255, 255, 0.8)",
        neu: "8px 8px 16px rgba(168, 173, 168, 0.3), -8px -8px 16px rgba(255, 255, 255, 0.85)",
        "neu-lg":
          "12px 12px 24px rgba(168, 173, 168, 0.35), -12px -12px 24px rgba(255, 255, 255, 0.9)",
        "neu-inset":
          "inset 4px 4px 8px rgba(168, 173, 168, 0.3), inset -4px -4px 8px rgba(255, 255, 255, 0.7)",
        "neu-inset-lg":
          "inset 8px 8px 16px rgba(168, 173, 168, 0.35), inset -8px -8px 16px rgba(255, 255, 255, 0.75)",
      },
    },
  },
  plugins: [],
};
