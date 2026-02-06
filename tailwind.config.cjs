/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#FCD34D', // Yellow/Amber for Buttons/Logo
                'primary-hover': '#F59E0B',
                'brand-dark': '#4338CA', // Deep Indigo/Purple for Right Sidebar
                'brand-red': '#EF4444', // Red for specific text
                secondary: '#64748B',
                accent: '#06B6D4',
                background: '#F8FAFC',
                surface: '#FFFFFF',
                'ink-950': '#0b0b12',
                'ink-900': '#11111c',
                'ink-800': '#171726',
                'panel-500': '#1b1b2c',
                'panel-400': '#202033',
                'panel-300': '#26263a',
                'accent-pink': '#ff6aa7',
                'accent-blue': '#7c9bff',
                'accent-purple': '#9d6bff',
            },
            fontFamily: {
                sans: ['Manrope', 'system-ui', 'sans-serif'],
                display: ['Space Grotesk', 'Manrope', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
