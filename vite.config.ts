import { defineConfig, searchForWorkspaceRoot, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
// import copy from "rollup-plugin-copy";

// noinspection JSUnusedGlobalSymbols
export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, "env");
    return {
        plugins: [
            createHtmlPlugin({
                inject: {
                    ...env,
                },

            }),
            // copy({
            //   targets: [ { src: '../../kioskfilemakerworkstationplugin/static/kioskfilemakerworkstation.css',
            //     dest:'./kioskfilemakerworkstation/static'
            //   }, {
            //     src: '../../kioskfilemakerworkstationplugin/static/scripts',
            //     dest:'./kioskfilemakerworkstation/static'
            //   }],
            //   hook: 'buildStart'
            // }),
        ],
        optimizeDeps: {
            exclude: ["DateTime"]
        },
        esbuild:
            command == "build"
                ? {
                      //No console.logs in the distribution
                      // drop: ["console", "debugger"]
                }
                : {},
        build: {
            outDir: "./dist",
            lib: {
                entry: "./kioskjslib.ts",
                formats: ["es"],
            },
            // rollupOptions: {
            //   external: /^luxon/,
            // },
        },
        server: {
            fs: {
                strict: true,
                allow: [searchForWorkspaceRoot(process.cwd()), "../server/kiosk/kiosk/static/scripts/kioskapplib",
                        searchForWorkspaceRoot(process.cwd()), "../server/kiosk/kiosk/static/scripts"],
            },
        },
        publicDir: "/static"
    };
});
