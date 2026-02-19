/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: "#0A192F",
        "navy-light": "#112240",
        "navy-lighter": "#1A2F4A",
        electric: "#00BFFF",
        violet: "#A020F0",
        "violet-light": "#B44EF5",
        saffron: "#FF9933",
        "saffron-light": "#F4A261",
        "saffron-dark": "#E88A1A",
        gold: "#FFD700",
        "gold-light": "#FFEAA7",
        accent: {
          blue: "#00BFFF",
          purple: "#A020F0",
          saffron: "#FF9933",
        },
      },
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        body: ["Inter", "sans-serif"],
        serif: ["Playfair Display", "serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-accent": "linear-gradient(135deg, #00BFFF 0%, #A020F0 100%)",
        "gradient-saffron": "linear-gradient(135deg, #FF9933 0%, #F4A261 100%)",
        "gradient-warm":
          "linear-gradient(135deg, #FF9933 0%, #FFD700 50%, #F4A261 100%)",
        "gradient-hero-overlay":
          "linear-gradient(180deg, rgba(10,25,47,0.85) 0%, rgba(10,25,47,0.7) 40%, rgba(10,25,47,0.9) 100%)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "float-delayed": "floatDelayed 7s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite alternate",
        "glow-saffron": "glowSaffron 3s ease-in-out infinite alternate",
        "spin-slow": "spin 20s linear infinite",
        "spin-reverse": "spinReverse 25s linear infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        drift: "drift 12s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        floatDelayed: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-15px) rotate(5deg)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px #00BFFF, 0 0 10px #00BFFF" },
          "100%": { boxShadow: "0 0 20px #00BFFF, 0 0 40px #A020F0" },
        },
        glowSaffron: {
          "0%": { boxShadow: "0 0 5px #FF9933, 0 0 10px #FF9933" },
          "100%": { boxShadow: "0 0 20px #FF9933, 0 0 40px #F4A261" },
        },
        spinReverse: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(-360deg)" },
        },
        drift: {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "25%": { transform: "translate(10px, -10px) rotate(2deg)" },
          "50%": { transform: "translate(-5px, -15px) rotate(-1deg)" },
          "75%": { transform: "translate(-10px, -5px) rotate(1deg)" },
        },
      },
      boxShadow: {
        "neon-blue": "0 0 5px #00BFFF, 0 0 20px #00BFFF",
        "neon-purple": "0 0 5px #A020F0, 0 0 20px #A020F0",
        "neon-saffron": "0 0 5px #FF9933, 0 0 20px #FF9933",
        glass: "0 8px 32px 0 rgba(0, 191, 255, 0.1)",
        "glass-warm": "0 8px 32px 0 rgba(255, 153, 51, 0.1)",
        profile:
          "0 0 30px rgba(255, 153, 51, 0.3), 0 0 60px rgba(255, 153, 51, 0.1)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
