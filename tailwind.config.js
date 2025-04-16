module.exports = {
    content: [
        './pages/**/*.{vue,js,ts,jsx,tsx}',
        './components/**/*.{vue,js,ts,jsx,tsx}',
        './layouts/**/*.{vue,js,ts,jsx,tsx}', // Add more paths if you use other folders
    ],
    theme: {
        extend: {},
    },
    plugins: [require('tailwindcss-primeui')],
}