export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { 500: "#0ea5e9", 600: "#0284c7", 700: "#0369a1" },
        success: { 500: "#22c55e", 600: "#16a34a" },
        warning: { 500: "#eab308", 600: "#ca8a04" },
        danger: { 500: "#ef4444", 600: "#dc2626" },
      },
    },
  },
  plugins: [],
}
