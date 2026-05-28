import { defineConfig } from "vite";

export default defineConfig({
  define: {
    process: JSON.stringify({
      env: {
        NODE_ENV: "production"
      }
    })
  },
  build: {
    emptyOutDir: false,
    minify: true,
    outDir: "app/vendor",
    lib: {
      entry: "app/wysiwyg-entry.js",
      name: "MarkNoteWysiwygBundle",
      formats: ["iife"],
      fileName: () => "wysiwyg-editor.js"
    },
    rollupOptions: {
      output: {
        banner: "var process = globalThis.process || { env: { NODE_ENV: 'production' } };",
        assetFileNames: "wysiwyg-editor.css"
      }
    }
  }
});
