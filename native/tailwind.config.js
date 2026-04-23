/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: { dark: "#080808", anth: "#141418", navy: "#060C18" },
        grade: {
          a: "#22c55e",
          b: "#86efac",
          c: "#eab308",
          d: "#f97316",
          f: "#ef4444",
        },
      },
      fontFamily: {
        bebas: ["Bebas Neue"],
        dm: ["DM Sans"],
        inter: ["Inter"],
      },
    },
  },
};
