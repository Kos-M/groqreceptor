import daisyui from "daisyui";

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      fontSize: {
        xs: ["12px", "16px"], // Smallest text
        sm: ["14px", "20px"], // Body text
        base: ["16px", "24px"], // Default size
        lg: ["18px", "28px"], // Headings
        xl: ["20px", "32px"], // Section titles
        "2xl": ["24px", "36px"], // Large headings
        "3xl": ["30px", "42px"],
        "4xl": ["36px", "48px"],
        linear: ["21px", "28px"], // Custom size
      },
      letterSpacing: {
        tight: "-0.015em", // Linear uses slightly tighter text
        normal: "0em",
        wide: "0.025em",
        tightest: "-0.37px", // Custom letter spacing
      },
      lineHeight: {
        snug: "1.25",
        normal: "1.5",
        relaxed: "1.625",
      },
    },
  },
  plugins: [daisyui],
};
