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
      inlineOnly: false, // Suppress bundling warnings for all formats
      format: {
        esm: {
          platform: 'neutral',
          target: ['esnext'],
          sourcemap: true,
          minify: !!process.env.MINIFY,
          skipNodeModulesBundle: true // Don't bundle dependencies
        },
        cjs: {
          platform: 'node',
          target: ['esnext'],
          sourcemap: true,
          minify: !!process.env.MINIFY,
          skipNodeModulesBundle: true // Don't bundle dependencies
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
          resolve: {
            alias: {
              'object-code': path.resolve('./node_modules/object-code/src/index.ts'),
              'http-vary': path.resolve('./node_modules/http-vary/src/index.ts'),
              'cache-parser': path.resolve('./node_modules/cache-parser/src/index.ts'),
              'fast-defer': path.resolve('./node_modules/fast-defer/src/index.ts')
            }
          },

          // Keep previous output file structure
          outputOptions: (options) => {
            const { dir, ...rest } = options;
            return {
              ...rest,
              file: path.join(overrides.outDir ?? '', 'index.bundle.js')
            };
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
