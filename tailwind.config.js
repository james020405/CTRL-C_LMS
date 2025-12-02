/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                blue: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    600: '#2563eb',
                    700: '#1d4ed8',
                },
                emerald: {
                    50: '#ecfdf5',
                    600: '#10b981',
                    700: '#059669',
                },
                slate: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    500: '#64748b',
                    700: '#334155',
                    900: '#0f172a',
                },
                red: {
                    600: '#dc2626',
                },
                amber: {
                    600: '#d97706',
                },
                purple: {
                    600: '#9333ea',
                },
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}
