import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'

export default {
    input:"src/main.js",
    output:{
        file: "dist/js/bundle.js",
        format:"iife",
        sourceMap: 'inline',
    },
    plugins: [
        serve('dist'),
        livereload('dist'),
    ]
}