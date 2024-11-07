/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0A3A7A",
        "gray-1": "#F6F6F6",
        "gray-l-1": "#F6F6F6",
        "gray-l-2": "#E6E6E6",
        "gray-l-3": "#D6D6D6",
        "gray-d-2": "#747474",
        "gray-d-3": "#ADADAD",
        "blue-d-1": "#1C1F2E",
        "blue-d-2": "#0A3A7A",
        "Blue-d-3": "#1A4C99",
        "Blue-d-4": "#2B61B8",
        "Blue-l-1": "#A1B9D9",
        "blue-l-2": "#B3C8E0",
        "blue-l-3": "#C4D5EB",
        "blue-l-4": "#D6E3F4",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      height: {
        page: "calc(100vh - 4rem)",
      },
      lineHeight: {
        4.5: "1.112rem",
      },
      animation: {
        "spin-slow": "spin 5s linear infinite",
      },
      borderRadius: {
        base: "10px",
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  important: true,
};
