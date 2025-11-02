import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./content/**/*.{md,mdx}"],
  theme: {
    extend: {
      colors: {
        bronze: {
          50: "var(--bronze-50)",
          100: "var(--bronze-100)",
          200: "var(--bronze-200)",
          300: "var(--bronze-300)",
          400: "var(--bronze-400)",
          500: "var(--bronze-500)",
          600: "var(--bronze-600)",
          700: "var(--bronze-700)",
          800: "var(--bronze-800)",
          900: "var(--bronze-900)"
        },
        parchment: "var(--parchment)"
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"]
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)"
      },
      animation: {
        "spin-slow": "spin 20s linear infinite",
        "spin-slow-reverse": "spin 15s linear infinite reverse",
      }
    }
  },
  plugins: []
} satisfies Config;
