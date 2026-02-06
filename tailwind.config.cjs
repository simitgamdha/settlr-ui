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
            },
            fontFamily: {
                sans: ['Manrope', 'system-ui', 'sans-serif'],
                display: ['Space Grotesk', 'Manrope', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
