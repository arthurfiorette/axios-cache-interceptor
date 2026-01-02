import path from 'node:path';
import { defineConfig, mergeConfig, type UserConfig } from 'tsdown';
import { analyzer, unstableRolldownAdapter } from 'vite-bundle-analyzer';
import pkg from './package.json' with { type: 'json' };

const banner = `

/*!
 * Axios Cache Interceptor ${pkg.version}
 * (c) 2021-present Arthur Fiorette & Contributors
 * Released under the MIT License.
 */

`.trim();

function buildConfig(overrides: UserConfig) {
  return mergeConfig(
    {
      entry: 'src/index.ts',
      tsconfig: 'tsconfig.build.json',
      clean: true,
      format: {
        esm: {
          platform: 'neutral',
          target: ['esnext'],
          sourcemap: true,
          minify: !!process.env.MINIFY
        },
        cjs: {
          platform: 'node',
          target: ['esnext'],
          sourcemap: true,
          minify: !!process.env.MINIFY
        },
        umd: {
          plugins: [!!process.env.BUNDLE && unstableRolldownAdapter(analyzer())],
          platform: 'browser',
          sourcemap: true,
          minify: true, // Always minify UMD
          noExternal: () => true,
          banner,
          globalName: 'AxiosCacheInterceptor',

          // Parse dependencies source code to better tree shake them
          alias: {
            'object-code': import.meta.resolve('object-code/src/index.ts'),
            'http-vary': import.meta.resolve('http-vary/src/index.ts'),
            'cache-parser': import.meta.resolve('cache-parser/src/index.ts'),
            'fast-defer': import.meta.resolve('fast-defer/src/index.ts')
          },

          // Keep previous output file structure
          outputOptions: {
            file: path.join(overrides.outDir ?? '', 'index.bundle.js')
          }
        }
      }
    },
    overrides
  );
}

export default defineConfig([
  // Dev build with __ACI_DEV__=true
  buildConfig({
    outDir: 'dev',
    dts: false,
    define: {
      __ACI_DEV__: 'true'
    }
  }),

  // Dist build with __ACI_DEV__=false and types
  buildConfig({
    outDir: 'dist',
    dts: true,
    define: {
      __ACI_DEV__: 'false'
    }
  })
]);
