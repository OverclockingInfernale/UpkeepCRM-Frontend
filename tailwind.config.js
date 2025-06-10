module.exports = {
    darkMode: ['selector', '.app-dark'],
    content: [
        './pages/**/*.{vue,js,ts,jsx,tsx}',
        './components/**/*.{vue,js,ts,jsx,tsx}',
        './layouts/**/*.{vue,js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {},
    },
    plugins: [require('tailwindcss-primeui')],
}