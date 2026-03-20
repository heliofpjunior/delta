import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": {
                    DEFAULT: "var(--color-primary)",
                    foreground: "var(--color-on-primary)",
                    soft: "var(--color-primary-soft)",
                    'on-soft': "var(--color-on-primary-soft)",
                },
                "surface": {
                    DEFAULT: "var(--color-surface)",
                    ground: "var(--color-surface-ground)",
                    variant: "var(--color-surface-variant)",
                    'on': "var(--color-on-surface)",
                    'on-variant': "var(--color-on-surface-variant)",
                },
                "background": "var(--background)",
                "foreground": "var(--foreground)",
                "sidebar": {
                    DEFAULT: "var(--color-sidebar-dark)",
                }
            },
            fontFamily: {
                "display": ["Outfit", "Inter", "sans-serif"],
                "sans": ["Inter", "sans-serif"],
            },
            borderRadius: {
                "none": "0",
                "xs": "0.375rem",
                "sm": "0.5rem",
                "DEFAULT": "0.75rem",
                "md": "0.75rem",
                "lg": "1rem",
                "xl": "1.25rem",
                "2xl": "1.5rem",
                "3xl": "2rem",
                "full": "9999px"
            },
            boxShadow: {
                "premium-sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                "premium": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                "premium-lg": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                "glow-primary": "0 0 20px -5px var(--color-primary)",
                "m3-1": "0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)",
                "m3-2": "0px 2px 6px 2px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)",
                "m3-3": "0px 1px 3px 0px rgba(0, 0, 0, 0.30), 0px 4px 8px 3px rgba(0, 0, 0, 0.15)",
                "m3-4": "0px 2px 3px 0px rgba(0, 0, 0, 0.30), 0px 6px 10px 4px rgba(0, 0, 0, 0.15)",
                "m3-5": "0px 4px 4px 0px rgba(0, 0, 0, 0.30), 0px 8px 12px 6px rgba(0, 0, 0, 0.15)",
            },
        },
    },
    plugins: [],
};
export default config;
