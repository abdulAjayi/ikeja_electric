/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#B91C1C",
          hover: "#991B1B",
          active: "#7F1D1D",
        },
        offwhite: "#F7F7F5",
        nearblack: "#1A1A1A",
        grey: "#6B6B6B",
        charcoal: "#1F2937",
        white: "#FFFFFF",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
