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
      .add('./src/scripts/content')
      .end()
    .entry('background')
      .add('./src/scripts/background')
      .end()
    return memo
  },
})
