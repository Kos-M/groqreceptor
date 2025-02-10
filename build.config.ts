import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/types/main.ts',
  ],
  declaration: true,
  clean: true,
  // Change outDir, default is 'dist'
  outDir: 'build',
})
