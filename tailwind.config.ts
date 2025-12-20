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
                // Ambient dark theme palette
                background: {
                    DEFAULT: "#0B0E11", // near-black
                    elevated: "#12161C", // soft dark gray
                    surface: "#1A1F28", // elevated surface
                },
                border: {
                    DEFAULT: "rgba(255, 255, 255, 0.08)", // subtle hairline
                    hover: "rgba(255, 255, 255, 0.12)",
                },
                text: {
                    primary: "#E8EAED", // high contrast
                    secondary: "#9AA0A6", // muted
                    tertiary: "#5F6368", // subtle
                },
                accent: {
                    DEFAULT: "#6B7AB8", // muted indigo
                    hover: "#7B8AC8",
                    muted: "#4A5578",
                },
                success: {
                    DEFAULT: "#5E9B8A", // soft emerald
                    muted: "#3E6B5A",
                },
                danger: {
                    DEFAULT: "#B85E6B", // desaturated crimson
                    muted: "#884552",
                },
            },
            fontFamily: {
                sans: [
                    "Inter",
                    "-apple-system",
                    "BlinkMacSystemFont",
                    "Segoe UI",
                    "sans-serif",
                ],
            },
            fontSize: {
                xs: ["0.75rem", { lineHeight: "1.5" }],
                sm: ["0.875rem", { lineHeight: "1.6" }],
                base: ["1rem", { lineHeight: "1.6" }],
                lg: ["1.125rem", { lineHeight: "1.6" }],
                xl: ["1.25rem", { lineHeight: "1.5" }],
                "2xl": ["1.5rem", { lineHeight: "1.4" }],
                "3xl": ["1.875rem", { lineHeight: "1.3" }],
            },
            spacing: {
                18: "4.5rem",
                22: "5.5rem",
            },
            borderRadius: {
                lg: "0.75rem",
                xl: "1rem",
            },
            backdropBlur: {
                xs: "2px",
            },
            transitionDuration: {
                250: "250ms",
            },
            transitionTimingFunction: {
                smooth: "cubic-bezier(0.4, 0.0, 0.2, 1)",
            },
        },
    },
    plugins: [],
};

export default config;
