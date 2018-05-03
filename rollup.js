import babel from "rollup-plugin-babel";
import rootImport from "rollup-plugin-root-import";
import eslint from "rollup-plugin-eslint";
import resolve from "rollup-plugin-node-resolve";
import uglify from 'rollup-plugin-uglify';


export default {
  input: "src/range.js",
  plugins: [
    eslint({
      exclude: [
        "src/styles/**"
      ]}),
    babel({ babelrc: false,
      presets: ["es2015-rollup"],
      exclude: "node_modules/**"
    }),
    rootImport({
      root: `${__dirname}/src`,
      useEntry: "prepend",
      extensions: ".js"
    }),
    resolve({
      browser: true
    })

  ],
  output: [
    {
      name: "app",
      file: "./demo/range.js",
      format: "iife"
    }
  ]
};
