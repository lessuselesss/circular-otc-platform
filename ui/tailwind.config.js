/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    extend: {
      colors: {
        'circular-primary': '#09be8b',
        'circular-primary-hover': '#07ab7d',
        'circular-purple': '#9333ea',
        'circular-bg-primary': '#1d1d1d',
        'circular-bg-secondary': '#313131'
      }
    },
  },
  plugins: [],
}