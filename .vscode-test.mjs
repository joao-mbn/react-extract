import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
  files: 'out/test/**/*.test.js',
  mocha: {
    timeout: 1000000
  },
  launchArgs: ['--disable-extensions']
});
