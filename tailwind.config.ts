import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        butcher: ["var(--butcher-font)", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
