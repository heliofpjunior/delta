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
                "on-error": "#ffffff",
                "tertiary-fixed": "#ffdbcf",
                "secondary-fixed-dim": "#48d7f9",
                "tertiary-container": "#a33500",
                "on-primary-fixed": "#001848",
                "inverse-primary": "#b2c5ff",
                "on-secondary-container": "#005f71",
                "secondary": "#00687b",
                "inverse-surface": "#1d3054",
                "on-tertiary-container": "#ffc6b2",
                "on-secondary-fixed": "#001f27",
                "on-background": "#051a3e",
                "background": "#faf9ff",
                "secondary-fixed": "#afecff",
                "surface-tint": "#0c56d0",
                "inverse-on-surface": "#edf0ff",
                "surface-container-lowest": "#ffffff",
                "outline-variant": "#c3c6d6",
                "surface-container-low": "#f1f3ff",
                "primary": "#003d9b",
                "surface-dim": "#ccdaff",
                "error-container": "#ffdad6",
                "primary-container": "#0052cc",
                "on-primary-container": "#c4d2ff",
                "tertiary": "#7b2600",
                "surface-container-high": "#e1e8ff",
                "primary-fixed-dim": "#b2c5ff",
                "surface-container-highest": "#d8e2ff",
                "on-tertiary-fixed": "#380d00",
                "on-surface": "#051a3e",
                "surface": "#faf9ff",
                "on-primary-fixed-variant": "#0040a2",
                "outline": "#737685",
                "surface-container": "#e9edff",
                "on-primary": "#ffffff",
                "on-tertiary-fixed-variant": "#812800",
                "on-error-container": "#93000a",
                "on-tertiary": "#ffffff",
                "tertiary-fixed-dim": "#ffb59b",
                "surface-variant": "#d8e2ff",
                "secondary-container": "#50dcff",
                "surface-bright": "#faf9ff",
                "on-surface-variant": "#434654",
                "primary-fixed": "#dae2ff",
                "on-secondary-fixed-variant": "#004e5d",
                "error": "#ba1a1a",
                "on-secondary": "#ffffff"
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
            spacing: {
                "section-padding": "80px",
                "stack-lg": "32px",
                "stack-sm": "8px",
                "gutter": "24px",
                "stack-md": "16px",
                "container-max": "1200px"
            },
            fontFamily: {
                "headline-lg": ["Inter"],
                "headline-md": ["Inter"],
                "body-lg": ["Inter"],
                "display-lg": ["Inter"],
                "body-md": ["Inter"],
                "display-lg-mobile": ["Inter"],
                "label-md": ["Inter"]
            },
            fontSize: {
                "headline-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
                "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
                "body-lg": ["18px", {"lineHeight": "28px", "fontWeight": "400"}],
                "display-lg": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                "body-md": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
                "display-lg-mobile": ["36px", {"lineHeight": "44px", "fontWeight": "700"}],
                "label-md": ["14px", {"lineHeight": "20px", "fontWeight": "500"}]
            }
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/container-queries')
    ],
};
export default config;
