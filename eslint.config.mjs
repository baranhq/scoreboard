import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    files: ["src/app/page.tsx", "src/app/not-found.tsx"],
    rules: {
      // Keep the language redirect and theme active before paint in the static export.
      "@next/next/no-sync-scripts": "off",
    },
  },
  {
    files: ["src/components/layout/frame.tsx"],
    rules: {
      // This compressed, fixed-size logo is simpler and smaller than a client image component.
      "@next/next/no-img-element": "off",
    },
  },
  {
    files: [
      "src/components/layout/language-suggestion.tsx",
      "src/components/layout/privacy-controls.tsx",
      "src/components/scoreboard/game-timer.tsx",
      "src/components/scoreboard/scoreboard.tsx",
      "src/components/scoreboard/use-fullscreen-controls.ts",
    ],
    rules: {
      // These effects synchronize browser storage, network state, timers, and fullscreen controls.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  prettier,
  globalIgnores([".next/**", ".next-preview/**", "out/**", "node_modules/**", "next-env.d.ts"]),
]);
