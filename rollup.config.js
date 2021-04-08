import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
    {
        input: "src/main.js",
        output: {
            file: "dist/js/bundle.js",
            format: "iife",
            sourceMap: 'inline',
        },
        plugins: [
            serve({
                contentBase:'dist',
                port:3000
            }),
            livereload('dist'),
        ]
    },
    {
        input: "src/HoudiniPaint/Crossed.js",
        output: {
            file: "dist/js/Crossed.js",
            format: "es",
            sourceMap: 'inline',
        }
    },
    {
        input: "src/Earth/Earth.js",
        output: {
            file: "dist/js/Earth.js",
            format: "es",
            sourceMap: 'inline',
        },
        plugins: [
          nodeResolve()
        ]
    }

]