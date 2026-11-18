# Third-party licenses

Original Baran's Scoreboard application code: MIT, Copyright (c) 2026 Baran Ahmedov. See [LICENSE](LICENSE). Third-party components retain their own licences and copyright notices; this inventory does not relicense them.

## Distributed browser code and assets

[THIRD-PARTY-NOTICES.txt](THIRD-PARTY-NOTICES.txt) and its identical public copy contain the original notices for the emitted browser modules, copied fonts, and Next.js's legacy polyfills. The production Webpack build records the emitted module resources before pages are rendered; **npm run licenses** regenerates from that manifest and rejects a changed lockfile or polyfill. Native image tooling, server libraries, type definitions and build-only dependencies are not presented as browser distributions. No network licence lookup is needed during builds.

Inter and Inter Tight are copied byte-for-byte from Fontsource's OFL-1.1 files. Their copyright and OFL text travel with the website; using them in raster graphics does not require a font credit on those graphics. Lucide's complete licence file includes both its ISC terms and the Feather-derived icons' MIT terms. Tailwind's MIT notice covers the base styles copied into the emitted CSS. MIT, ISC, BSD and Apache notices must accompany relevant redistributed code; none requires a promotional footer. Apache NOTICE files must also be retained where supplied. The existing project credit and MIT footer are presentation choices, not additional third-party licence conditions.

The owner confirmed that the Baran's Scoreboard wordmark and S favicon are original artwork they designed. The WebP wordmarks and product-view images are repository assets; no stock-image or template provider is referenced. The social preview remains covered by the existing project licence. System fallback fonts are not distributed. The optional Cloudflare analytics beacon is loaded from the provider after consent, not copied into this repository or the static export; no Cloudflare software licence text is bundled here.

## Dependency inventory

This table audits every package entry in package-lock.json, including optional packages for other platforms, deduplicated by name and version. “Not browser-delivered” is an inventory classification, not a claim that a dependency has no licence. Installing a tool does not itself redistribute that tool in the website. Redistributing node_modules or a build-tool image requires a separate inventory of those artifacts and their bundled libraries, including any LGPL source/relinking obligations.

| Package | Version | License | Distribution | Upstream |
| --- | --- | --- | --- | --- |
| @alloc/quick-lru | 5.3.0 | MIT | Not browser-delivered | https://github.com/aleclarson/quick-lru |
| @babel/code-frame | 7.29.7 | MIT | Not browser-delivered | https://github.com/babel/babel |
| @babel/compat-data | 7.29.7 | MIT | Not browser-delivered | https://github.com/babel/babel |
| @babel/core | 7.29.13 | MIT | Not browser-delivered | https://github.com/babel/babel |
| @babel/generator | 7.29.13 | MIT | Not browser-delivered | https://github.com/babel/babel |
| @babel/helper-compilation-targets | 7.29.13 | MIT | Not browser-delivered | https://github.com/babel/babel |
| @babel/helper-globals | 7.29.7 | MIT | Not browser-delivered | https://github.com/babel/babel |
| @babel/helper-module-imports | 7.29.7 | MIT | Not browser-delivered | https://github.com/babel/babel |
| @babel/helper-module-transforms | 7.29.13 | MIT | Not browser-delivered | https://github.com/babel/babel |
| @babel/helper-string-parser | 7.29.13 | MIT | Not browser-delivered | https://github.com/babel/babel |
| @babel/helper-validator-identifier | 7.29.7 | MIT | Not browser-delivered | https://github.com/babel/babel |
| @babel/helper-validator-option | 7.29.7 | MIT | Not browser-delivered | https://github.com/babel/babel |
| @babel/helpers | 7.29.13 | MIT | Not browser-delivered | https://github.com/babel/babel |
| @babel/parser | 7.29.13 | MIT | Not browser-delivered | https://github.com/babel/babel |
| @babel/template | 7.29.7 | MIT | Not browser-delivered | https://github.com/babel/babel |
| @babel/traverse | 7.29.13 | MIT | Not browser-delivered | https://github.com/babel/babel |
| @babel/types | 7.29.11 | MIT | Not browser-delivered | https://github.com/babel/babel |
| @cacheable/memory | 2.2.0 | MIT | Not browser-delivered | https://github.com/jaredwray/cacheable |
| @cacheable/utils | 2.5.0 | MIT | Not browser-delivered | https://github.com/jaredwray/cacheable |
| @emnapi/runtime | 1.11.3 | MIT | Not browser-delivered | https://www.npmjs.com/package/@emnapi/runtime |
| @eslint-community/eslint-utils | 4.10.1 | MIT | Not browser-delivered | https://github.com/eslint-community/eslint-utils |
| @eslint-community/eslint-utils | 4.9.1 | MIT | Not browser-delivered | https://github.com/eslint-community/eslint-utils |
| @eslint-community/regexpp | 4.12.2 | MIT | Not browser-delivered | https://github.com/eslint-community/regexpp |
| @eslint/config-array | 0.23.5 | Apache-2.0 | Not browser-delivered | https://github.com/eslint/rewrite |
| @eslint/config-helpers | 0.7.0 | Apache-2.0 | Not browser-delivered | https://github.com/eslint/rewrite |
| @eslint/core | 1.2.1 | Apache-2.0 | Not browser-delivered | https://github.com/eslint/rewrite |
| @eslint/object-schema | 3.0.5 | Apache-2.0 | Not browser-delivered | https://github.com/eslint/rewrite |
| @eslint/plugin-kit | 0.7.3 | Apache-2.0 | Not browser-delivered | https://github.com/eslint/rewrite |
| @fontsource/inter | 5.3.0 | OFL-1.1 | Browser / copied asset | https://github.com/fontsource/font-files |
| @fontsource/inter-tight | 5.3.0 | OFL-1.1 | Browser / copied asset | https://github.com/fontsource/font-files |
| @humanfs/core | 0.19.2 | Apache-2.0 | Not browser-delivered | https://github.com/humanwhocodes/humanfs |
| @humanfs/node | 0.16.8 | Apache-2.0 | Not browser-delivered | https://github.com/humanwhocodes/humanfs |
| @humanfs/types | 0.15.0 | Apache-2.0 | Not browser-delivered | https://github.com/humanwhocodes/humanfs |
| @humanwhocodes/module-importer | 1.0.1 | Apache-2.0 | Not browser-delivered | https://github.com/humanwhocodes/module-importer |
| @humanwhocodes/retry | 0.4.3 | Apache-2.0 | Not browser-delivered | https://github.com/humanwhocodes/retry |
| @img/colour | 1.1.0 | MIT | Not browser-delivered | https://github.com/lovell/colour |
| @img/sharp-darwin-arm64 | 0.35.5 | Apache-2.0 | Not browser-delivered | https://www.npmjs.com/package/@img/sharp-darwin-arm64 |
| @img/sharp-darwin-x64 | 0.35.5 | Apache-2.0 | Not browser-delivered | https://www.npmjs.com/package/@img/sharp-darwin-x64 |
| @img/sharp-freebsd-wasm32 | 0.35.5 | Apache-2.0 | Not browser-delivered | https://www.npmjs.com/package/@img/sharp-freebsd-wasm32 |
| @img/sharp-libvips-darwin-arm64 | 1.3.4 | LGPL-3.0-or-later | Not browser-delivered | https://www.npmjs.com/package/@img/sharp-libvips-darwin-arm64 |
| @img/sharp-libvips-darwin-x64 | 1.3.4 | LGPL-3.0-or-later | Not browser-delivered | https://www.npmjs.com/package/@img/sharp-libvips-darwin-x64 |
| @img/sharp-libvips-linux-arm | 1.3.4 | LGPL-3.0-or-later | Not browser-delivered | https://www.npmjs.com/package/@img/sharp-libvips-linux-arm |
| @img/sharp-libvips-linux-arm64 | 1.3.4 | LGPL-3.0-or-later | Not browser-delivered | https://www.npmjs.com/package/@img/sharp-libvips-linux-arm64 |
| @img/sharp-libvips-linux-ppc64 | 1.3.4 | LGPL-3.0-or-later | Not browser-delivered | https://www.npmjs.com/package/@img/sharp-libvips-linux-ppc64 |
| @img/sharp-libvips-linux-riscv64 | 1.3.4 | LGPL-3.0-or-later | Not browser-delivered | https://www.npmjs.com/package/@img/sharp-libvips-linux-riscv64 |
| @img/sharp-libvips-linux-s390x | 1.3.4 | LGPL-3.0-or-later | Not browser-delivered | https://www.npmjs.com/package/@img/sharp-libvips-linux-s390x |
| @img/sharp-libvips-linux-x64 | 1.3.4 | LGPL-3.0-or-later | Not browser-delivered | https://github.com/lovell/sharp-libvips |
| @img/sharp-libvips-linuxmusl-arm64 | 1.3.4 | LGPL-3.0-or-later | Not browser-delivered | https://www.npmjs.com/package/@img/sharp-libvips-linuxmusl-arm64 |
| @img/sharp-libvips-linuxmusl-x64 | 1.3.4 | LGPL-3.0-or-later | Not browser-delivered | https://www.npmjs.com/package/@img/sharp-libvips-linuxmusl-x64 |
| @img/sharp-linux-arm | 0.35.5 | Apache-2.0 | Not browser-delivered | https://www.npmjs.com/package/@img/sharp-linux-arm |
| @img/sharp-linux-arm64 | 0.35.5 | Apache-2.0 | Not browser-delivered | https://www.npmjs.com/package/@img/sharp-linux-arm64 |
| @img/sharp-linux-ppc64 | 0.35.5 | Apache-2.0 | Not browser-delivered | https://www.npmjs.com/package/@img/sharp-linux-ppc64 |
| @img/sharp-linux-riscv64 | 0.35.5 | Apache-2.0 | Not browser-delivered | https://www.npmjs.com/package/@img/sharp-linux-riscv64 |
| @img/sharp-linux-s390x | 0.35.5 | Apache-2.0 | Not browser-delivered | https://www.npmjs.com/package/@img/sharp-linux-s390x |
| @img/sharp-linux-x64 | 0.35.5 | Apache-2.0 | Not browser-delivered | https://github.com/lovell/sharp |
| @img/sharp-linuxmusl-arm64 | 0.35.5 | Apache-2.0 | Not browser-delivered | https://www.npmjs.com/package/@img/sharp-linuxmusl-arm64 |
| @img/sharp-linuxmusl-x64 | 0.35.5 | Apache-2.0 | Not browser-delivered | https://www.npmjs.com/package/@img/sharp-linuxmusl-x64 |
| @img/sharp-wasm32 | 0.35.5 | Apache-2.0 AND LGPL-3.0-or-later AND MIT | Not browser-delivered | https://www.npmjs.com/package/@img/sharp-wasm32 |
| @img/sharp-webcontainers-wasm32 | 0.35.5 | Apache-2.0 | Not browser-delivered | https://www.npmjs.com/package/@img/sharp-webcontainers-wasm32 |
| @img/sharp-win32-arm64 | 0.35.5 | Apache-2.0 AND LGPL-3.0-or-later | Not browser-delivered | https://www.npmjs.com/package/@img/sharp-win32-arm64 |
| @img/sharp-win32-ia32 | 0.35.5 | Apache-2.0 AND LGPL-3.0-or-later | Not browser-delivered | https://www.npmjs.com/package/@img/sharp-win32-ia32 |
| @img/sharp-win32-x64 | 0.35.5 | Apache-2.0 AND LGPL-3.0-or-later | Not browser-delivered | https://www.npmjs.com/package/@img/sharp-win32-x64 |
| @isaacs/nonrecursive-glob-match | 1.0.3 | BlueOak-1.0.0 | Not browser-delivered | https://www.npmjs.com/package/@isaacs/nonrecursive-glob-match |
| @jridgewell/gen-mapping | 0.3.13 | MIT | Not browser-delivered | https://github.com/jridgewell/sourcemaps |
| @jridgewell/remapping | 2.3.5 | MIT | Not browser-delivered | https://github.com/jridgewell/sourcemaps |
| @jridgewell/resolve-uri | 3.1.2 | MIT | Not browser-delivered | https://github.com/jridgewell/resolve-uri |
| @jridgewell/sourcemap-codec | 1.6.0 | MIT | Not browser-delivered | https://github.com/jridgewell/sourcemaps |
| @jridgewell/trace-mapping | 0.3.31 | MIT | Not browser-delivered | https://github.com/jridgewell/sourcemaps |
| @keyv/bigmap | 1.3.1 | MIT | Not browser-delivered | https://github.com/jaredwray/keyv |
| @keyv/serialize | 1.1.1 | MIT | Not browser-delivered | https://github.com/jaredwray/keyv |
| @next/env | 16.4.6 | MIT | Not browser-delivered | https://github.com/vercel/next.js |
| @next/eslint-plugin-next | 16.4.6 | MIT | Not browser-delivered | https://github.com/vercel/next.js |
| @next/swc-darwin-arm64 | 16.4.6 | MIT | Not browser-delivered | https://www.npmjs.com/package/@next/swc-darwin-arm64 |
| @next/swc-darwin-x64 | 16.4.6 | MIT | Not browser-delivered | https://www.npmjs.com/package/@next/swc-darwin-x64 |
| @next/swc-linux-arm64-gnu | 16.4.6 | MIT | Not browser-delivered | https://www.npmjs.com/package/@next/swc-linux-arm64-gnu |
| @next/swc-linux-arm64-musl | 16.4.6 | MIT | Not browser-delivered | https://www.npmjs.com/package/@next/swc-linux-arm64-musl |
| @next/swc-linux-x64-gnu | 16.4.6 | MIT | Not browser-delivered | https://github.com/vercel/next.js |
| @next/swc-linux-x64-musl | 16.4.6 | MIT | Not browser-delivered | https://www.npmjs.com/package/@next/swc-linux-x64-musl |
| @next/swc-win32-arm64-msvc | 16.4.6 | MIT | Not browser-delivered | https://www.npmjs.com/package/@next/swc-win32-arm64-msvc |
| @next/swc-win32-x64-msvc | 16.4.6 | MIT | Not browser-delivered | https://www.npmjs.com/package/@next/swc-win32-x64-msvc |
| @nodelib/fs.scandir | 2.1.5 | MIT | Not browser-delivered | https://github.com/nodelib/nodelib/tree/master/packages/fs/fs.scandir |
| @nodelib/fs.stat | 2.0.5 | MIT | Not browser-delivered | https://github.com/nodelib/nodelib/tree/master/packages/fs/fs.stat |
| @nodelib/fs.walk | 1.2.8 | MIT | Not browser-delivered | https://github.com/nodelib/nodelib/tree/master/packages/fs/fs.walk |
| @nolyfill/is-core-module | 1.0.39 | MIT | Not browser-delivered | https://github.com/SukkaW/nolyfill |
| @rtsao/scc | 1.1.0 | MIT | Not browser-delivered | https://github.com/rtsao/scc |
| @swc/helpers | 0.5.23 | Apache-2.0 | Browser / copied asset | https://github.com/swc-project/swc |
| @tailwindcss/node | 4.3.3 | MIT | Not browser-delivered | https://github.com/tailwindlabs/tailwindcss |
| @tailwindcss/oxide | 4.3.3 | MIT | Not browser-delivered | https://github.com/tailwindlabs/tailwindcss |
| @tailwindcss/oxide-android-arm64 | 4.3.3 | MIT | Not browser-delivered | https://www.npmjs.com/package/@tailwindcss/oxide-android-arm64 |
| @tailwindcss/oxide-darwin-arm64 | 4.3.3 | MIT | Not browser-delivered | https://www.npmjs.com/package/@tailwindcss/oxide-darwin-arm64 |
| @tailwindcss/oxide-darwin-x64 | 4.3.3 | MIT | Not browser-delivered | https://www.npmjs.com/package/@tailwindcss/oxide-darwin-x64 |
| @tailwindcss/oxide-freebsd-x64 | 4.3.3 | MIT | Not browser-delivered | https://www.npmjs.com/package/@tailwindcss/oxide-freebsd-x64 |
| @tailwindcss/oxide-linux-arm-gnueabihf | 4.3.3 | MIT | Not browser-delivered | https://www.npmjs.com/package/@tailwindcss/oxide-linux-arm-gnueabihf |
| @tailwindcss/oxide-linux-arm64-gnu | 4.3.3 | MIT | Not browser-delivered | https://www.npmjs.com/package/@tailwindcss/oxide-linux-arm64-gnu |
| @tailwindcss/oxide-linux-arm64-musl | 4.3.3 | MIT | Not browser-delivered | https://www.npmjs.com/package/@tailwindcss/oxide-linux-arm64-musl |
| @tailwindcss/oxide-linux-x64-gnu | 4.3.3 | MIT | Not browser-delivered | https://github.com/tailwindlabs/tailwindcss |
| @tailwindcss/oxide-linux-x64-musl | 4.3.3 | MIT | Not browser-delivered | https://www.npmjs.com/package/@tailwindcss/oxide-linux-x64-musl |
| @tailwindcss/oxide-wasm32-wasi | 4.3.3 | MIT | Not browser-delivered | https://www.npmjs.com/package/@tailwindcss/oxide-wasm32-wasi |
| @tailwindcss/oxide-win32-arm64-msvc | 4.3.3 | MIT | Not browser-delivered | https://www.npmjs.com/package/@tailwindcss/oxide-win32-arm64-msvc |
| @tailwindcss/oxide-win32-x64-msvc | 4.3.3 | MIT | Not browser-delivered | https://www.npmjs.com/package/@tailwindcss/oxide-win32-x64-msvc |
| @tailwindcss/postcss | 4.3.3 | MIT | Not browser-delivered | https://github.com/tailwindlabs/tailwindcss |
| @types/esrecurse | 4.3.1 | MIT | Not browser-delivered | https://github.com/DefinitelyTyped/DefinitelyTyped |
| @types/estree | 1.0.10 | MIT | Not browser-delivered | https://github.com/DefinitelyTyped/DefinitelyTyped |
| @types/json-schema | 7.0.15 | MIT | Not browser-delivered | https://github.com/DefinitelyTyped/DefinitelyTyped |
| @types/json5 | 0.0.29 | MIT | Not browser-delivered | https://www.github.com/DefinitelyTyped/DefinitelyTyped |
| @types/node | 24.19.2 | MIT | Not browser-delivered | https://github.com/DefinitelyTyped/DefinitelyTyped |
| @types/react | 19.3.0 | MIT | Not browser-delivered | https://github.com/DefinitelyTyped/DefinitelyTyped |
| @types/react-dom | 19.3.0 | MIT | Not browser-delivered | https://github.com/DefinitelyTyped/DefinitelyTyped |
| @typescript-eslint/eslint-plugin | 8.72.1 | MIT | Not browser-delivered | https://github.com/typescript-eslint/typescript-eslint |
| @typescript-eslint/parser | 8.72.1 | MIT | Not browser-delivered | https://github.com/typescript-eslint/typescript-eslint |
| @typescript-eslint/project-service | 8.72.1 | MIT | Not browser-delivered | https://github.com/typescript-eslint/typescript-eslint |
| @typescript-eslint/scope-manager | 8.72.1 | MIT | Not browser-delivered | https://github.com/typescript-eslint/typescript-eslint |
| @typescript-eslint/tsconfig-utils | 8.72.1 | MIT | Not browser-delivered | https://github.com/typescript-eslint/typescript-eslint |
| @typescript-eslint/type-utils | 8.72.1 | MIT | Not browser-delivered | https://github.com/typescript-eslint/typescript-eslint |
| @typescript-eslint/types | 8.72.1 | MIT | Not browser-delivered | https://github.com/typescript-eslint/typescript-eslint |
| @typescript-eslint/typescript-estree | 8.72.1 | MIT | Not browser-delivered | https://github.com/typescript-eslint/typescript-eslint |
| @typescript-eslint/utils | 8.72.1 | MIT | Not browser-delivered | https://github.com/typescript-eslint/typescript-eslint |
| @typescript-eslint/visitor-keys | 8.72.1 | MIT | Not browser-delivered | https://github.com/typescript-eslint/typescript-eslint |
| @unrs/resolver-binding-android-arm-eabi | 1.13.0 | MIT | Not browser-delivered | https://www.npmjs.com/package/@unrs/resolver-binding-android-arm-eabi |
| @unrs/resolver-binding-android-arm64 | 1.13.0 | MIT | Not browser-delivered | https://www.npmjs.com/package/@unrs/resolver-binding-android-arm64 |
| @unrs/resolver-binding-darwin-arm64 | 1.13.0 | MIT | Not browser-delivered | https://www.npmjs.com/package/@unrs/resolver-binding-darwin-arm64 |
| @unrs/resolver-binding-darwin-x64 | 1.13.0 | MIT | Not browser-delivered | https://www.npmjs.com/package/@unrs/resolver-binding-darwin-x64 |
| @unrs/resolver-binding-freebsd-x64 | 1.13.0 | MIT | Not browser-delivered | https://www.npmjs.com/package/@unrs/resolver-binding-freebsd-x64 |
| @unrs/resolver-binding-linux-arm-gnueabihf | 1.13.0 | MIT | Not browser-delivered | https://www.npmjs.com/package/@unrs/resolver-binding-linux-arm-gnueabihf |
| @unrs/resolver-binding-linux-arm-musleabihf | 1.13.0 | MIT | Not browser-delivered | https://www.npmjs.com/package/@unrs/resolver-binding-linux-arm-musleabihf |
| @unrs/resolver-binding-linux-arm64-gnu | 1.13.0 | MIT | Not browser-delivered | https://www.npmjs.com/package/@unrs/resolver-binding-linux-arm64-gnu |
| @unrs/resolver-binding-linux-arm64-musl | 1.13.0 | MIT | Not browser-delivered | https://www.npmjs.com/package/@unrs/resolver-binding-linux-arm64-musl |
| @unrs/resolver-binding-linux-loong64-gnu | 1.13.0 | MIT | Not browser-delivered | https://www.npmjs.com/package/@unrs/resolver-binding-linux-loong64-gnu |
| @unrs/resolver-binding-linux-loong64-musl | 1.13.0 | MIT | Not browser-delivered | https://www.npmjs.com/package/@unrs/resolver-binding-linux-loong64-musl |
| @unrs/resolver-binding-linux-ppc64-gnu | 1.13.0 | MIT | Not browser-delivered | https://www.npmjs.com/package/@unrs/resolver-binding-linux-ppc64-gnu |
| @unrs/resolver-binding-linux-riscv64-gnu | 1.13.0 | MIT | Not browser-delivered | https://www.npmjs.com/package/@unrs/resolver-binding-linux-riscv64-gnu |
| @unrs/resolver-binding-linux-riscv64-musl | 1.13.0 | MIT | Not browser-delivered | https://www.npmjs.com/package/@unrs/resolver-binding-linux-riscv64-musl |
| @unrs/resolver-binding-linux-s390x-gnu | 1.13.0 | MIT | Not browser-delivered | https://www.npmjs.com/package/@unrs/resolver-binding-linux-s390x-gnu |
| @unrs/resolver-binding-linux-x64-gnu | 1.13.0 | MIT | Not browser-delivered | https://github.com/unrs/unrs-resolver |
| @unrs/resolver-binding-linux-x64-musl | 1.13.0 | MIT | Not browser-delivered | https://www.npmjs.com/package/@unrs/resolver-binding-linux-x64-musl |
| @unrs/resolver-binding-openharmony-arm64 | 1.13.0 | MIT | Not browser-delivered | https://www.npmjs.com/package/@unrs/resolver-binding-openharmony-arm64 |
| @unrs/resolver-binding-win32-arm64-msvc | 1.13.0 | MIT | Not browser-delivered | https://www.npmjs.com/package/@unrs/resolver-binding-win32-arm64-msvc |
| @unrs/resolver-binding-win32-ia32-msvc | 1.13.0 | MIT | Not browser-delivered | https://www.npmjs.com/package/@unrs/resolver-binding-win32-ia32-msvc |
| @unrs/resolver-binding-win32-x64-msvc | 1.13.0 | MIT | Not browser-delivered | https://www.npmjs.com/package/@unrs/resolver-binding-win32-x64-msvc |
| acorn | 8.19.0 | MIT | Not browser-delivered | https://github.com/acornjs/acorn |
| acorn-jsx | 5.3.2 | MIT | Not browser-delivered | https://github.com/acornjs/acorn-jsx |
| ajv | 6.15.0 | MIT | Not browser-delivered | https://github.com/ajv-validator/ajv |
| aria-query | 5.3.2 | Apache-2.0 | Not browser-delivered | https://github.com/A11yance/aria-query |
| array-buffer-byte-length | 1.0.2 | MIT | Not browser-delivered | https://github.com/inspect-js/array-buffer-byte-length |
| array-includes | 3.2.0 | MIT | Not browser-delivered | https://github.com/es-shims/array-includes |
| array.prototype.findlast | 1.2.5 | MIT | Not browser-delivered | https://github.com/es-shims/Array.prototype.findLast |
| array.prototype.findlastindex | 1.2.6 | MIT | Not browser-delivered | https://github.com/es-shims/Array.prototype.findLastIndex |
| array.prototype.flat | 1.3.3 | MIT | Not browser-delivered | https://github.com/es-shims/Array.prototype.flat |
| array.prototype.flatmap | 1.3.3 | MIT | Not browser-delivered | https://github.com/es-shims/Array.prototype.flatMap |
| array.prototype.tosorted | 1.1.4 | MIT | Not browser-delivered | https://github.com/es-shims/Array.prototype.toSorted |
| arraybuffer.prototype.slice | 1.0.4 | MIT | Not browser-delivered | https://github.com/es-shims/ArrayBuffer.prototype.slice |
| ast-types-flow | 0.0.8 | MIT | Not browser-delivered | https://github.com/kyldvs/ast-types-flow |
| async-function | 1.0.0 | MIT | Not browser-delivered | https://github.com/ljharb/async-function |
| available-typed-arrays | 1.0.7 | MIT | Not browser-delivered | https://github.com/inspect-js/available-typed-arrays |
| axe-core | 4.14.0 | MPL-2.0 | Not browser-delivered | https://github.com/dequelabs/axe-core |
| axobject-query | 4.1.0 | Apache-2.0 | Not browser-delivered | https://github.com/A11yance/axobject-query |
| balanced-match | 1.0.2 | MIT | Not browser-delivered | https://github.com/juliangruber/balanced-match |
| balanced-match | 4.0.4 | MIT | Not browser-delivered | https://github.com/juliangruber/balanced-match |
| baseline-browser-mapping | 2.11.34 | Apache-2.0 | Not browser-delivered | https://github.com/web-platform-dx/baseline-browser-mapping |
| brace-expansion | 1.1.21 | MIT | Not browser-delivered | https://github.com/juliangruber/brace-expansion |
| brace-expansion | 5.0.12 | MIT | Not browser-delivered | https://github.com/juliangruber/brace-expansion |
| braces | 3.0.3 | MIT | Not browser-delivered | https://github.com/micromatch/braces |
| browserslist | 4.29.5 | MIT | Not browser-delivered | https://github.com/browserslist/browserslist |
| cacheable | 2.5.0 | MIT | Not browser-delivered | https://github.com/jaredwray/cacheable |
| call-bind | 1.0.9 | MIT | Not browser-delivered | https://github.com/ljharb/call-bind |
| call-bind-apply-helpers | 1.0.2 | MIT | Not browser-delivered | https://github.com/ljharb/call-bind-apply-helpers |
| call-bound | 1.0.4 | MIT | Not browser-delivered | https://github.com/ljharb/call-bound |
| caniuse-lite | 1.0.30001820 | CC-BY-4.0 | Not browser-delivered | https://github.com/browserslist/caniuse-lite |
| client-only | 0.0.1 | MIT | Not browser-delivered | https://reactjs.org/ |
| concat-map | 0.0.1 | MIT | Not browser-delivered | https://github.com/substack/node-concat-map |
| convert-source-map | 2.0.0 | MIT | Not browser-delivered | https://github.com/thlorenz/convert-source-map |
| core-js | 3.38.1 | MIT | Browser / copied asset | https://github.com/zloirock/core-js/blob/v3.38.1/LICENSE |
| cross-spawn | 7.0.6 | MIT | Not browser-delivered | https://www.npmjs.com/package/cross-spawn |
| csstype | 3.2.3 | MIT | Not browser-delivered | https://github.com/frenic/csstype |
| damerau-levenshtein | 1.0.8 | BSD-2-Clause | Not browser-delivered | https://github.com/tad-lispy/node-damerau-levenshtein |
| data-view-buffer | 1.0.2 | MIT | Not browser-delivered | https://github.com/inspect-js/data-view-buffer |
| data-view-byte-length | 1.0.2 | MIT | Not browser-delivered | https://github.com/inspect-js/data-view-byte-length |
| data-view-byte-offset | 1.0.1 | MIT | Not browser-delivered | https://github.com/inspect-js/data-view-byte-offset |
| debug | 3.2.7 | MIT | Not browser-delivered | https://github.com/visionmedia/debug |
| debug | 4.4.3 | MIT | Not browser-delivered | https://github.com/debug-js/debug |
| deep-is | 0.1.4 | MIT | Not browser-delivered | https://www.npmjs.com/package/deep-is |
| define-data-property | 1.1.4 | MIT | Not browser-delivered | https://github.com/ljharb/define-data-property |
| define-properties | 1.2.1 | MIT | Not browser-delivered | https://github.com/ljharb/define-properties |
| detect-libc | 2.1.2 | Apache-2.0 | Not browser-delivered | https://github.com/lovell/detect-libc |
| doctrine | 2.1.0 | Apache-2.0 | Not browser-delivered | https://github.com/eslint/doctrine |
| dunder-proto | 1.0.1 | MIT | Not browser-delivered | https://github.com/es-shims/dunder-proto |
| electron-to-chromium | 1.5.476 | ISC | Not browser-delivered | https://github.com/Kilian/electron-to-chromium |
| emoji-regex | 9.2.2 | MIT | Not browser-delivered | https://github.com/mathiasbynens/emoji-regex |
| enhanced-resolve | 5.26.0 | MIT | Not browser-delivered | https://github.com/webpack/enhanced-resolve |
| es-abstract | 1.24.2 | MIT | Not browser-delivered | https://github.com/ljharb/es-abstract |
| es-abstract-get | 1.0.0 | MIT | Not browser-delivered | https://github.com/ljharb/es-abstract-get |
| es-define-property | 1.0.1 | MIT | Not browser-delivered | https://github.com/ljharb/es-define-property |
| es-errors | 1.3.0 | MIT | Not browser-delivered | https://github.com/ljharb/es-errors |
| es-iterator-helpers | 1.4.0 | MIT | Not browser-delivered | https://github.com/es-shims/iterator-helpers |
| es-object-atoms | 1.1.2 | MIT | Not browser-delivered | https://github.com/ljharb/es-object-atoms |
| es-set-tostringtag | 2.1.0 | MIT | Not browser-delivered | https://github.com/es-shims/es-set-tostringtag |
| es-shim-unscopables | 1.1.0 | MIT | Not browser-delivered | https://github.com/ljharb/es-shim-unscopables |
| es-to-primitive | 1.3.4 | MIT | Not browser-delivered | https://github.com/ljharb/es-to-primitive |
| escalade | 3.2.0 | MIT | Not browser-delivered | https://github.com/lukeed/escalade |
| escape-string-regexp | 4.0.0 | MIT | Not browser-delivered | https://github.com/sindresorhus/escape-string-regexp |
| eslint | 10.14.0 | MIT | Not browser-delivered | https://github.com/eslint/eslint |
| eslint-config-next | 16.4.6 | MIT | Not browser-delivered | https://github.com/vercel/next.js |
| eslint-config-prettier | 10.1.8 | MIT | Not browser-delivered | https://github.com/prettier/eslint-config-prettier |
| eslint-import-resolver-node | 0.3.10 | MIT | Not browser-delivered | https://github.com/import-js/eslint-plugin-import |
| eslint-import-resolver-typescript | 3.10.1 | ISC | Not browser-delivered | https://github.com/import-js/eslint-import-resolver-typescript |
| eslint-module-utils | 2.14.0 | MIT | Not browser-delivered | https://github.com/import-js/eslint-plugin-import |
| eslint-plugin-import | 2.32.0 | MIT | Not browser-delivered | https://github.com/import-js/eslint-plugin-import |
| eslint-plugin-jsx-a11y | 6.10.2 | MIT | Not browser-delivered | https://github.com/jsx-eslint/eslint-plugin-jsx-a11y |
| eslint-plugin-react | 7.37.5 | MIT | Not browser-delivered | https://github.com/jsx-eslint/eslint-plugin-react |
| eslint-plugin-react-hooks | 7.1.1 | MIT | Not browser-delivered | https://github.com/facebook/react |
| eslint-scope | 9.1.2 | BSD-2-Clause | Not browser-delivered | https://github.com/eslint/js |
| eslint-visitor-keys | 3.4.3 | Apache-2.0 | Not browser-delivered | https://github.com/eslint/eslint-visitor-keys |
| eslint-visitor-keys | 5.0.1 | Apache-2.0 | Not browser-delivered | https://github.com/eslint/js |
| espree | 11.2.0 | BSD-2-Clause | Not browser-delivered | https://github.com/eslint/js |
| esquery | 1.7.0 | BSD-3-Clause | Not browser-delivered | https://github.com/estools/esquery |
| esrecurse | 4.3.0 | BSD-2-Clause | Not browser-delivered | https://github.com/estools/esrecurse |
| estraverse | 5.3.0 | BSD-2-Clause | Not browser-delivered | https://www.npmjs.com/package/estraverse |
| esutils | 2.0.3 | BSD-2-Clause | Not browser-delivered | https://www.npmjs.com/package/esutils |
| fake-indexeddb | 6.2.7 | Apache-2.0 | Not browser-delivered | https://github.com/dumbmatter/fakeIndexedDB |
| fast-deep-equal | 3.1.3 | MIT | Not browser-delivered | https://github.com/epoberezkin/fast-deep-equal |
| fast-glob | 3.3.1 | MIT | Not browser-delivered | https://github.com/mrmlnc/fast-glob |
| fast-json-stable-stringify | 2.1.0 | MIT | Not browser-delivered | https://github.com/epoberezkin/fast-json-stable-stringify |
| fast-levenshtein | 2.0.6 | MIT | Not browser-delivered | https://github.com/hiddentao/fast-levenshtein |
| fastq | 1.20.3 | ISC | Not browser-delivered | https://github.com/mcollina/fastq |
| fdir | 6.5.0 | MIT | Not browser-delivered | https://github.com/thecodrr/fdir |
| file-entry-cache | 11.1.5 | MIT | Not browser-delivered | https://github.com/jaredwray/cacheable |
| fill-range | 7.1.1 | MIT | Not browser-delivered | https://github.com/jonschlinkert/fill-range |
| find-up | 5.0.0 | MIT | Not browser-delivered | https://github.com/sindresorhus/find-up |
| flat-cache | 6.1.23 | MIT | Not browser-delivered | https://github.com/jaredwray/cacheable |
| flatted | 3.4.4 | ISC | Not browser-delivered | https://github.com/WebReflection/flatted |
| for-each | 0.3.5 | MIT | Not browser-delivered | https://github.com/Raynos/for-each |
| function-bind | 1.1.2 | MIT | Not browser-delivered | https://github.com/Raynos/function-bind |
| function.prototype.name | 1.2.0 | MIT | Not browser-delivered | https://github.com/es-shims/Function.prototype.name |
| functions-have-names | 1.2.3 | MIT | Not browser-delivered | https://github.com/inspect-js/functions-have-names |
| generator-function | 2.0.1 | MIT | Not browser-delivered | https://github.com/TimothyGu/generator-function |
| gensync | 1.0.0-beta.2 | MIT | Not browser-delivered | https://github.com/loganfsmyth/gensync |
| get-intrinsic | 1.3.0 | MIT | Not browser-delivered | https://github.com/ljharb/get-intrinsic |
| get-proto | 1.0.1 | MIT | Not browser-delivered | https://github.com/ljharb/get-proto |
| get-symbol-description | 1.1.0 | MIT | Not browser-delivered | https://github.com/inspect-js/get-symbol-description |
| get-tsconfig | 4.14.3 | MIT | Not browser-delivered | https://github.com/privatenumber/get-tsconfig |
| glob-parent | 5.1.2 | ISC | Not browser-delivered | https://github.com/gulpjs/glob-parent |
| glob-parent | 6.0.2 | ISC | Not browser-delivered | https://github.com/gulpjs/glob-parent |
| globals | 16.4.0 | MIT | Not browser-delivered | https://github.com/sindresorhus/globals |
| globalthis | 1.0.4 | MIT | Not browser-delivered | https://github.com/ljharb/System.global |
| gopd | 1.2.0 | MIT | Not browser-delivered | https://github.com/ljharb/gopd |
| graceful-fs | 4.2.11 | ISC | Not browser-delivered | https://github.com/isaacs/node-graceful-fs |
| has-bigints | 1.1.0 | MIT | Not browser-delivered | https://github.com/ljharb/has-bigints |
| has-property-descriptors | 1.0.2 | MIT | Not browser-delivered | https://github.com/inspect-js/has-property-descriptors |
| has-proto | 1.2.0 | MIT | Not browser-delivered | https://github.com/inspect-js/has-proto |
| has-symbols | 1.1.0 | MIT | Not browser-delivered | https://github.com/inspect-js/has-symbols |
| has-tostringtag | 1.0.2 | MIT | Not browser-delivered | https://github.com/inspect-js/has-tostringtag |
| hashery | 1.5.1 | MIT | Not browser-delivered | https://github.com/jaredwray/hashery |
| hasown | 2.0.4 | MIT | Not browser-delivered | https://github.com/inspect-js/hasOwn |
| hermes-estree | 0.25.1 | MIT | Not browser-delivered | https://www.npmjs.com/package/hermes-estree |
| hermes-parser | 0.25.1 | MIT | Not browser-delivered | https://www.npmjs.com/package/hermes-parser |
| hookified | 1.15.1 | MIT | Not browser-delivered | https://github.com/jaredwray/hookified |
| hookified | 2.2.0 | MIT | Not browser-delivered | https://github.com/jaredwray/hookified |
| ignore | 5.3.2 | MIT | Not browser-delivered | https://www.npmjs.com/package/ignore |
| ignore | 7.0.14 | MIT | Not browser-delivered | https://github.com/kaelzhang/node-ignore |
| imurmurhash | 0.1.4 | MIT | Not browser-delivered | https://github.com/jensyt/imurmurhash-js |
| internal-slot | 1.1.0 | MIT | Not browser-delivered | https://github.com/ljharb/internal-slot |
| is-array-buffer | 3.0.5 | MIT | Not browser-delivered | https://github.com/inspect-js/is-array-buffer |
| is-async-function | 2.1.1 | MIT | Not browser-delivered | https://github.com/inspect-js/is-async-function |
| is-bigint | 1.1.0 | MIT | Not browser-delivered | https://github.com/inspect-js/is-bigint |
| is-boolean-object | 1.2.2 | MIT | Not browser-delivered | https://github.com/inspect-js/is-boolean-object |
| is-bun-module | 2.0.0 | MIT | Not browser-delivered | https://github.com/SunsetTechuila/is-bun-module |
| is-callable | 1.2.7 | MIT | Not browser-delivered | https://github.com/inspect-js/is-callable |
| is-core-module | 2.18.0 | MIT | Not browser-delivered | https://github.com/inspect-js/is-core-module |
| is-data-view | 1.0.2 | MIT | Not browser-delivered | https://github.com/inspect-js/is-data-view |
| is-date-object | 1.1.0 | MIT | Not browser-delivered | https://github.com/inspect-js/is-date-object |
| is-document.all | 1.0.0 | MIT | Not browser-delivered | https://github.com/inspect-js/is-document.all |
| is-extglob | 2.1.1 | MIT | Not browser-delivered | https://github.com/jonschlinkert/is-extglob |
| is-finalizationregistry | 1.1.1 | MIT | Not browser-delivered | https://github.com/inspect-js/is-finalizationregistry |
| is-generator-function | 1.1.2 | MIT | Not browser-delivered | https://github.com/inspect-js/is-generator-function |
| is-glob | 4.0.3 | MIT | Not browser-delivered | https://github.com/micromatch/is-glob |
| is-map | 2.0.3 | MIT | Not browser-delivered | https://github.com/inspect-js/is-map |
| is-negative-zero | 2.0.3 | MIT | Not browser-delivered | https://github.com/inspect-js/is-negative-zero |
| is-number | 7.0.0 | MIT | Not browser-delivered | https://github.com/jonschlinkert/is-number |
| is-number-object | 1.1.1 | MIT | Not browser-delivered | https://github.com/inspect-js/is-number-object |
| is-regex | 1.2.1 | MIT | Not browser-delivered | https://github.com/inspect-js/is-regex |
| is-set | 2.0.3 | MIT | Not browser-delivered | https://github.com/inspect-js/is-set |
| is-shared-array-buffer | 1.0.4 | MIT | Not browser-delivered | https://github.com/inspect-js/is-shared-array-buffer |
| is-string | 1.1.1 | MIT | Not browser-delivered | https://github.com/inspect-js/is-string |
| is-symbol | 1.1.1 | MIT | Not browser-delivered | https://github.com/inspect-js/is-symbol |
| is-typed-array | 1.1.15 | MIT | Not browser-delivered | https://github.com/inspect-js/is-typed-array |
| is-weakmap | 2.0.2 | MIT | Not browser-delivered | https://github.com/inspect-js/is-weakmap |
| is-weakref | 1.1.1 | MIT | Not browser-delivered | https://github.com/inspect-js/is-weakref |
| is-weakset | 2.0.4 | MIT | Not browser-delivered | https://github.com/inspect-js/is-weakset |
| isarray | 2.0.5 | MIT | Not browser-delivered | https://github.com/juliangruber/isarray |
| isexe | 2.0.0 | ISC | Not browser-delivered | https://github.com/isaacs/isexe |
| iterator.prototype | 1.1.5 | MIT | Not browser-delivered | https://github.com/ljharb/Iterator.prototype |
| jiti | 2.7.0 | MIT | Not browser-delivered | https://github.com/unjs/jiti |
| js-tokens | 4.0.0 | MIT | Not browser-delivered | https://github.com/lydell/js-tokens |
| jsesc | 3.1.0 | MIT | Not browser-delivered | https://github.com/mathiasbynens/jsesc |
| json-schema-traverse | 0.4.1 | MIT | Not browser-delivered | https://github.com/epoberezkin/json-schema-traverse |
| json-stable-stringify-without-jsonify | 1.0.1 | MIT | Not browser-delivered | https://github.com/samn/json-stable-stringify |
| json5 | 1.0.2 | MIT | Not browser-delivered | https://github.com/json5/json5 |
| json5 | 2.2.3 | MIT | Not browser-delivered | https://github.com/json5/json5 |
| jsx-ast-utils | 3.3.5 | MIT | Not browser-delivered | https://github.com/jsx-eslint/jsx-ast-utils |
| keyv | 5.6.0 | MIT | Not browser-delivered | https://github.com/jaredwray/keyv |
| language-subtag-registry | 0.3.23 | CC0-1.0 | Not browser-delivered | https://github.com/mattcg/language-subtag-registry |
| language-tags | 1.0.9 | MIT | Not browser-delivered | https://github.com/mattcg/language-tags |
| levn | 0.4.1 | MIT | Not browser-delivered | https://github.com/gkz/levn |
| lightningcss | 1.32.0 | MPL-2.0 | Not browser-delivered | https://github.com/parcel-bundler/lightningcss |
| lightningcss-android-arm64 | 1.32.0 | MPL-2.0 | Not browser-delivered | https://www.npmjs.com/package/lightningcss-android-arm64 |
| lightningcss-darwin-arm64 | 1.32.0 | MPL-2.0 | Not browser-delivered | https://www.npmjs.com/package/lightningcss-darwin-arm64 |
| lightningcss-darwin-x64 | 1.32.0 | MPL-2.0 | Not browser-delivered | https://www.npmjs.com/package/lightningcss-darwin-x64 |
| lightningcss-freebsd-x64 | 1.32.0 | MPL-2.0 | Not browser-delivered | https://www.npmjs.com/package/lightningcss-freebsd-x64 |
| lightningcss-linux-arm-gnueabihf | 1.32.0 | MPL-2.0 | Not browser-delivered | https://www.npmjs.com/package/lightningcss-linux-arm-gnueabihf |
| lightningcss-linux-arm64-gnu | 1.32.0 | MPL-2.0 | Not browser-delivered | https://www.npmjs.com/package/lightningcss-linux-arm64-gnu |
| lightningcss-linux-arm64-musl | 1.32.0 | MPL-2.0 | Not browser-delivered | https://www.npmjs.com/package/lightningcss-linux-arm64-musl |
| lightningcss-linux-x64-gnu | 1.32.0 | MPL-2.0 | Not browser-delivered | https://github.com/parcel-bundler/lightningcss |
| lightningcss-linux-x64-musl | 1.32.0 | MPL-2.0 | Not browser-delivered | https://www.npmjs.com/package/lightningcss-linux-x64-musl |
| lightningcss-win32-arm64-msvc | 1.32.0 | MPL-2.0 | Not browser-delivered | https://www.npmjs.com/package/lightningcss-win32-arm64-msvc |
| lightningcss-win32-x64-msvc | 1.32.0 | MPL-2.0 | Not browser-delivered | https://www.npmjs.com/package/lightningcss-win32-x64-msvc |
| locate-path | 6.0.0 | MIT | Not browser-delivered | https://github.com/sindresorhus/locate-path |
| loose-envify | 1.4.0 | MIT | Not browser-delivered | https://github.com/zertosh/loose-envify |
| lru-cache | 5.1.1 | ISC | Not browser-delivered | https://github.com/isaacs/node-lru-cache |
| lucide-react | 1.66.0 | ISC AND MIT | Browser / copied asset | https://github.com/lucide-icons/lucide |
| magic-string | 0.30.21 | MIT | Not browser-delivered | https://github.com/Rich-Harris/magic-string |
| math-intrinsics | 1.1.0 | MIT | Not browser-delivered | https://github.com/es-shims/math-intrinsics |
| merge2 | 1.4.1 | MIT | Not browser-delivered | https://www.npmjs.com/package/merge2 |
| micromatch | 4.0.8 | MIT | Not browser-delivered | https://github.com/micromatch/micromatch |
| minimatch | 11.0.1 | BlueOak-1.0.0 | Not browser-delivered | https://www.npmjs.com/package/minimatch |
| minimatch | 3.1.5 | ISC | Not browser-delivered | https://github.com/isaacs/minimatch |
| minimist | 1.2.8 | MIT | Not browser-delivered | https://github.com/minimistjs/minimist |
| ms | 2.1.3 | MIT | Not browser-delivered | https://github.com/vercel/ms |
| nanoid | 3.3.20 | MIT | Not browser-delivered | https://github.com/ai/nanoid |
| napi-postinstall | 0.3.8 | MIT | Not browser-delivered | https://github.com/un-ts/napi-postinstall |
| natural-compare | 1.4.0 | MIT | Not browser-delivered | https://github.com/litejs/natural-compare-lite |
| next | 16.4.6 | MIT | Browser / copied asset | https://github.com/vercel/next.js |
| node-exports-info | 1.6.2 | MIT | Not browser-delivered | https://github.com/inspect-js/node-exports-info |
| node-releases | 2.0.63 | MIT | Not browser-delivered | https://github.com/chicoxyzzy/node-releases |
| object-assign | 4.1.1 | MIT | Browser / copied asset | https://github.com/sindresorhus/object-assign |
| object-inspect | 1.13.4 | MIT | Not browser-delivered | https://github.com/inspect-js/object-inspect |
| object-keys | 1.1.1 | MIT | Not browser-delivered | https://github.com/ljharb/object-keys |
| object.assign | 4.1.7 | MIT | Not browser-delivered | https://github.com/ljharb/object.assign |
| object.entries | 1.1.9 | MIT | Not browser-delivered | https://github.com/es-shims/Object.entries |
| object.fromentries | 2.0.8 | MIT | Not browser-delivered | https://github.com/es-shims/Object.fromEntries |
| object.groupby | 1.0.3 | MIT | Not browser-delivered | https://github.com/es-shims/Object.groupBy |
| object.values | 1.2.1 | MIT | Not browser-delivered | https://github.com/es-shims/Object.values |
| optionator | 0.9.4 | MIT | Not browser-delivered | https://github.com/gkz/optionator |
| own-keys | 1.0.2 | MIT | Not browser-delivered | https://github.com/ljharb/own-keys |
| p-limit | 3.1.0 | MIT | Not browser-delivered | https://github.com/sindresorhus/p-limit |
| p-locate | 5.0.0 | MIT | Not browser-delivered | https://github.com/sindresorhus/p-locate |
| path-exists | 4.0.0 | MIT | Not browser-delivered | https://github.com/sindresorhus/path-exists |
| path-key | 3.1.1 | MIT | Not browser-delivered | https://github.com/sindresorhus/path-key |
| path-parse | 1.0.7 | MIT | Not browser-delivered | https://github.com/jbgutierrez/path-parse |
| picocolors | 1.1.1 | ISC | Not browser-delivered | https://github.com/alexeyraspopov/picocolors |
| picomatch | 2.3.2 | MIT | Not browser-delivered | https://github.com/micromatch/picomatch |
| picomatch | 4.0.7 | MIT | Not browser-delivered | https://github.com/micromatch/picomatch |
| possible-typed-array-names | 1.1.0 | MIT | Not browser-delivered | https://github.com/ljharb/possible-typed-array-names |
| postcss | 8.5.23 | MIT | Not browser-delivered | https://github.com/postcss/postcss |
| postcss | 8.5.32 | MIT | Not browser-delivered | https://github.com/postcss/postcss |
| prelude-ls | 1.2.1 | MIT | Not browser-delivered | https://github.com/gkz/prelude-ls |
| prettier | 3.9.10 | MIT | Not browser-delivered | https://github.com/prettier/prettier |
| prettier-plugin-tailwindcss | 0.8.1 | MIT | Not browser-delivered | https://github.com/tailwindlabs/prettier-plugin-tailwindcss |
| prop-types | 15.8.1 | MIT | Not browser-delivered | https://github.com/facebook/prop-types |
| punycode | 2.3.1 | MIT | Not browser-delivered | https://github.com/mathiasbynens/punycode.js |
| qified | 0.10.1 | MIT | Not browser-delivered | https://github.com/jaredwray/qified |
| queue-microtask | 1.2.3 | MIT | Not browser-delivered | https://github.com/feross/queue-microtask |
| react | 19.3.1 | MIT | Browser / copied asset | https://github.com/react/react |
| react-dom | 19.3.1 | MIT | Browser / copied asset | https://github.com/react/react |
| react-is | 16.13.1 | MIT | Not browser-delivered | https://github.com/facebook/react |
| reflect.getprototypeof | 1.0.10 | MIT | Not browser-delivered | https://github.com/es-shims/Reflect.getPrototypeOf |
| regexp.prototype.flags | 1.5.4 | MIT | Not browser-delivered | https://github.com/es-shims/RegExp.prototype.flags |
| resolve | 2.0.0-next.7 | MIT | Not browser-delivered | https://www.npmjs.com/package/resolve |
| resolve-pkg-maps | 1.0.0 | MIT | Not browser-delivered | https://github.com/privatenumber/resolve-pkg-maps |
| reusify | 1.1.0 | MIT | Not browser-delivered | https://github.com/mcollina/reusify |
| run-parallel | 1.2.0 | MIT | Not browser-delivered | https://github.com/feross/run-parallel |
| safe-array-concat | 1.1.4 | MIT | Not browser-delivered | https://github.com/ljharb/safe-array-concat |
| safe-push-apply | 1.0.0 | MIT | Not browser-delivered | https://github.com/ljharb/safe-push-apply |
| safe-regex-test | 1.1.0 | MIT | Not browser-delivered | https://github.com/ljharb/safe-regex-test |
| scheduler | 0.28.0 | MIT | Browser / copied asset | https://github.com/react/react |
| semver | 6.3.2 | ISC | Not browser-delivered | https://github.com/npm/node-semver |
| semver | 7.8.5 | ISC | Not browser-delivered | https://github.com/npm/node-semver |
| set-function-length | 1.2.2 | MIT | Not browser-delivered | https://github.com/ljharb/set-function-length |
| set-function-name | 2.0.2 | MIT | Not browser-delivered | https://github.com/ljharb/set-function-name |
| set-proto | 1.0.0 | MIT | Not browser-delivered | https://github.com/ljharb/set-proto |
| sharp | 0.35.5 | Apache-2.0 | Not browser-delivered | https://github.com/lovell/sharp |
| shebang-command | 2.0.0 | MIT | Not browser-delivered | https://github.com/kevva/shebang-command |
| shebang-regex | 3.0.0 | MIT | Not browser-delivered | https://github.com/sindresorhus/shebang-regex |
| side-channel | 1.1.1 | MIT | Not browser-delivered | https://github.com/ljharb/side-channel |
| side-channel-list | 1.0.1 | MIT | Not browser-delivered | https://github.com/ljharb/side-channel-list |
| side-channel-map | 1.0.1 | MIT | Not browser-delivered | https://github.com/ljharb/side-channel-map |
| side-channel-weakmap | 1.0.2 | MIT | Not browser-delivered | https://github.com/ljharb/side-channel-weakmap |
| source-map-js | 1.2.2 | BSD-3-Clause | Not browser-delivered | https://github.com/7rulnik/source-map-js |
| stable-hash | 0.0.5 | MIT | Not browser-delivered | https://github.com/shuding/stable-hash |
| stop-iteration-iterator | 1.1.0 | MIT | Not browser-delivered | https://github.com/ljharb/stop-iteration-iterator |
| string.prototype.includes | 2.0.1 | MIT | Not browser-delivered | https://github.com/mathiasbynens/String.prototype.includes |
| string.prototype.matchall | 4.1.0 | MIT | Not browser-delivered | https://github.com/es-shims/String.prototype.matchAll |
| string.prototype.repeat | 1.0.0 | MIT | Not browser-delivered | https://github.com/mathiasbynens/String.prototype.repeat |
| string.prototype.trim | 1.2.11 | MIT | Not browser-delivered | https://github.com/es-shims/String.prototype.trim |
| string.prototype.trimend | 1.0.10 | MIT | Not browser-delivered | https://github.com/es-shims/String.prototype.trimEnd |
| string.prototype.trimstart | 1.0.8 | MIT | Not browser-delivered | https://github.com/es-shims/String.prototype.trimStart |
| strip-bom | 3.0.0 | MIT | Not browser-delivered | https://github.com/sindresorhus/strip-bom |
| styled-jsx | 5.1.6 | MIT | Not browser-delivered | https://github.com/vercel/styled-jsx |
| supports-preserve-symlinks-flag | 1.0.0 | MIT | Not browser-delivered | https://github.com/inspect-js/node-supports-preserve-symlinks-flag |
| tailwindcss | 4.3.3 | MIT | Browser / copied asset | https://github.com/tailwindlabs/tailwindcss |
| tapable | 2.3.3 | MIT | Not browser-delivered | https://www.npmjs.com/package/tapable |
| tinyglobby | 0.2.17 | MIT | Not browser-delivered | https://github.com/SuperchupuDev/tinyglobby |
| to-regex-range | 5.0.1 | MIT | Not browser-delivered | https://github.com/micromatch/to-regex-range |
| ts-api-utils | 2.5.0 | MIT | Not browser-delivered | https://github.com/JoshuaKGoldberg/ts-api-utils |
| tsconfig-paths | 3.15.0 | MIT | Not browser-delivered | https://github.com/dividab/tsconfig-paths |
| tslib | 2.9.1 | 0BSD | Not browser-delivered | https://github.com/Microsoft/tslib |
| type-check | 0.4.0 | MIT | Not browser-delivered | https://github.com/gkz/type-check |
| typed-array-buffer | 1.0.3 | MIT | Not browser-delivered | https://github.com/inspect-js/typed-array-buffer |
| typed-array-byte-length | 1.0.3 | MIT | Not browser-delivered | https://github.com/inspect-js/typed-array-byte-length |
| typed-array-byte-offset | 1.0.5 | MIT | Not browser-delivered | https://github.com/inspect-js/typed-array-byte-offset |
| typed-array-length | 1.0.8 | MIT | Not browser-delivered | https://github.com/inspect-js/typed-array-length |
| typescript | 5.9.3 | Apache-2.0 | Not browser-delivered | https://github.com/microsoft/TypeScript |
| typescript-eslint | 8.72.1 | MIT | Not browser-delivered | https://github.com/typescript-eslint/typescript-eslint |
| unbox-primitive | 1.1.0 | MIT | Not browser-delivered | https://github.com/ljharb/unbox-primitive |
| undici-types | 7.24.6 | MIT | Not browser-delivered | https://github.com/nodejs/undici |
| unrs-resolver | 1.13.0 | MIT | Not browser-delivered | https://github.com/unrs/unrs-resolver |
| update-browserslist-db | 1.3.4 | MIT | Not browser-delivered | https://github.com/browserslist/update-db |
| uri-js | 4.4.1 | BSD-2-Clause | Not browser-delivered | https://www.npmjs.com/package/uri-js |
| whatwg-fetch | 3.0.0 | MIT | Browser / copied asset | https://github.com/github/fetch/blob/v3.0.0/LICENSE |
| which | 2.0.2 | ISC | Not browser-delivered | https://github.com/isaacs/node-which |
| which-boxed-primitive | 1.1.1 | MIT | Not browser-delivered | https://github.com/inspect-js/which-boxed-primitive |
| which-builtin-type | 1.2.1 | MIT | Not browser-delivered | https://github.com/inspect-js/which-builtin-type |
| which-collection | 1.0.2 | MIT | Not browser-delivered | https://github.com/inspect-js/which-collection |
| which-typed-array | 1.1.24 | MIT | Not browser-delivered | https://github.com/inspect-js/which-typed-array |
| word-wrap | 1.2.5 | MIT | Not browser-delivered | https://github.com/jonschlinkert/word-wrap |
| yallist | 3.1.1 | ISC | Not browser-delivered | https://github.com/isaacs/yallist |
| yocto-queue | 0.1.0 | MIT | Not browser-delivered | https://github.com/sindresorhus/yocto-queue |
| zod | 4.6.7 | MIT | Not browser-delivered | https://github.com/colinhacks/zod |
| zod-validation-error | 4.0.2 | MIT | Not browser-delivered | https://github.com/causaly/zod-validation-error |

## Docker and separately installed services

The following are primary components, not blanket licences for entire container images. Dockerfile and compose.yaml reference upstream images; the repository does not contain their binaries. Running a service is different from conveying an image to someone else. Commercial use of these components is permitted under their respective terms, and their use as separate services does not relicense the application under the GPL.

| Image/component | Role | Primary licence and source |
| --- | --- | --- |
| node:24-bookworm-slim | Build stage only; Node and node_modules are not copied into the runtime | [Node.js MIT and bundled notices](https://github.com/nodejs/node/blob/v24.x/LICENSE); Debian packages have separate terms |
| php:8.4.27-apache-bookworm | Runtime base | [PHP-3.01](https://github.com/php/php-src/blob/php-8.4.27/LICENSE), [Zend-2.0](https://github.com/php/php-src/blob/php-8.4.27/Zend/LICENSE), [Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0) and the base image's library/package licences |
| mbstring / libmbfl | Built from the PHP source archive | [LGPL-2.1](https://github.com/php/php-src/blob/php-8.4.27/ext/mbstring/libmbfl/LICENSE); preserve corresponding source and relinking rights when redistributing binaries |
| libonig-dev / Oniguruma | Runtime image package and mbstring dependency | [BSD-2-Clause](https://github.com/kkos/oniguruma/blob/master/COPYING); retain the installed package copyright files |
| mariadb:11.4 | Separate database service | [GPL-2.0](https://github.com/MariaDB/server/blob/11.4/COPYING); source obligations apply when conveying binaries, not merely communicating with the server |
| caddy:2-alpine | Optional separate HTTPS proxy | [Apache-2.0](https://github.com/caddyserver/caddy/blob/master/LICENSE); preserve notices for Caddy, its compiled modules and Alpine packages if redistributing the image |

The PHP image retains /usr/src/php.tar.xz, including its original licence files and bundled-library source; the application Dockerfile checks that the archive remains present. Debian package notices under /usr/share/doc are not removed. Caddy and MariaDB are fetched as separate upstream images, so their licence texts do not belong in the standalone website notice download. See [SELF_HOSTING.md](SELF_HOSTING.md#redistributing-container-images) before publishing images. Mutable image tags do not establish an exact image-wide software inventory.

## CI actions

The referenced build-only actions are not copied into the website: [actions/checkout](https://github.com/actions/checkout/blob/d23441a48e516b6c34aea4fa41551a30e30af803/LICENSE) and [actions/setup-node](https://github.com/actions/setup-node/blob/249970729cb0ef3589644e2896645e5dc5ba9c38/LICENSE) are MIT-licensed. Their own distributions retain their notices.
