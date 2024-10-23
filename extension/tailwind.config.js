/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./public/scripts/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            height: {
                ext: "600px",
            },
            width: {
                ext: "400px",
            },
            fontFamily: {
                logo: ['"Echo Station"'],
            },
        },
    },
    plugins: [],
};