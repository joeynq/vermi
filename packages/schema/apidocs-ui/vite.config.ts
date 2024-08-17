import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	define: {
		global: "window",
	},
	ssr: {
		noExternal: ["remix-utils"],
	},
	build: {
		rollupOptions: {
			external: [
				"fs",
				"node:fs",
				"path",
				"node:path",
				"stream",
				"node:stream",
				"zlib",
				"node:zlib",
				"http",
				"node:http",
				"https",
				"node:https",
			],
		},
	},
	plugins: [
		// nodePolyfills(),
		remix({
			future: {
				v3_fetcherPersist: true,
				v3_relativeSplatPath: true,
				v3_throwAbortReason: true,
			},
		}),
		tsconfigPaths(),
	],
});
