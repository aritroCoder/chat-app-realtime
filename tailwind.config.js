/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic':
                    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
            colors: {
                'color-surface-100': '#19231a',
                'color-surface-200': '#2e382f',
                'color-surface-300': '#454d45',
                'color-surface-400': '#5d645d',
                'color-surface-500': '#767c76',
                'color-surface-600': '#8f9590',
                'color-primary-100': '#25d366',
                'color-primary-200': '#51d977',
                'color-primary-300': '#6ede88',
                'color-primary-400': '#86e399',
                'color-primary-500': '#9ce8aa',
                'color-primary-600': '#b1edbb',
            },
        },
    },
    plugins: [],
}
