import { defineConfig } from "umi";

export default defineConfig({
  mpa: {
    template: 'index.html',
    layout: '@/layouts/mpa/index.tsx'
  },
  plugins: ['./build.plugin.ts'],
  npmClient: 'yarn',
  copy: [
    {
      from: 'manifest.json',
      to: 'dist'
    },
    {
      from: 'src/assets',
      to: 'dist/assets'
    }
  ]
});
