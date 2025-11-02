// Make sure your tailwind.config.js includes this:

import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class', // This is CRITICAL for dark mode to work

    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/**/*.js',
        './resources/**/*.ts',
        './resources/**/*.jsx',
        './resources/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
                roboto: ['Roboto', 'sans-serif'],
                bricolage: ['Bricolage Grotesque', 'sans-serif'],
                sora: ['Sora',  'sans-serif'],
                poppins: ['Poppins'],
                kalam: ["Kalam"],
            },
        },
    },

    plugins: [forms],
};
