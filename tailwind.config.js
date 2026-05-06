/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: "#171D1B",      // primary button, CTA
        accent: "#1AB64A",     // accent green
        mint: "#F4FBF8",       // background highlight
        input: "#EFEFEF",      // input field background
        ink: "#2E2E2E",        // primary text
        muted: "#999999",      // secondary text
        divider: "#EFEFEF",    // dividers
        dark: {
          DEFAULT: "#0E0E0E",  // dark mode background
          card: "#1F1F1F",     // dark mode card
        },
      },
    },
  },
  plugins: [],
};
