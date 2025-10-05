/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
    safelist: [
        { pattern: /bg-base-(dark|purple|blue|orange|yellow|teal)/ },
        { pattern: /text-base-(dark|purple|blue|orange|yellow|teal)/ },
        { pattern: /border-base-(dark|purple|blue|orange|yellow|teal)/ }
    ],
    theme: {
        extend: {
            colors: {
                base: {
                    dark: "#120C24",
                    purple: "#472268",
                    blue: "#406496",
                    orange: "#EE4A24",
                    yellow: "#F59023",
                    teal: "#02B08E"
                }
            }
        }
    },
    plugins: []
};
