import { defineConfig } from 'umi'

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
      from: 'src/assets/imgs/logo',
      to: 'dist/logo'
    }
  ],
  chainWebpack(memo) {
    memo
    .entry('content')
      .add('./src/assets/js/content.js')
      .end()
    .entry('background')
      .add('./src/assets/js/background.js')
      .end()
    return memo
  },
})
