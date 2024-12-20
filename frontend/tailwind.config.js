/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class', // Ensure this is 'class' to use dark mode classes
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {},
    },
    plugins: [],
};
