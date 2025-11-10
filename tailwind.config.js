/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          900: "#0B1220",
          700: "#0F2A5F",
          600: "#123273",
          500: "#1C3FA1",
          300: "#A7B8E1",
        },
      },
      boxShadow: { card: "0 6px 24px rgba(0,0,0,0.08)" },
      borderRadius: { xl: "0.75rem", "2xl": "1rem" },
    },
  },
  plugins: [],
};
