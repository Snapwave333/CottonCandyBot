import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "deep-void": "#050511",
        "midnight-blue": "#0B1026",
        "cotton-pink": "#FF99C8",
        "cotton-blue": "#A9DEF9",
        "cotton-pink-soft": "#FFB7B2",
        "cotton-blue-soft": "#AEC6CF",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      borderColor: {
        "glass-border": "var(--glass-border-color)",
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};
export default config;
