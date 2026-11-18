import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

export class ClientLicensesPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap("ClientLicenses", (compilation) => {
      const resources = new Set();
      const seen = new Set();
      const visit = (entry) => {
        if (seen.has(entry)) return;
        seen.add(entry);
        if (entry.resource?.includes(`${path.sep}node_modules${path.sep}`))
          resources.add(path.relative(compiler.context, entry.resource.split("?")[0]));
        if (entry.modules) for (const child of entry.modules) visit(child);
      };
      for (const chunk of compilation.chunks)
        for (const entry of compilation.chunkGraph.getChunkModulesIterable(chunk)) visit(entry);
      writeFileSync(
        path.join(compiler.context, ".next/client-license-modules.json"),
        JSON.stringify(
          {
            lockHash: createHash("sha256")
              .update(readFileSync(path.join(compiler.context, "package-lock.json")))
              .digest("hex"),
            resources: [...resources].sort(),
          },
          null,
          2,
        ) + "\n",
      );
      execFileSync(process.execPath, ["scripts/licenses.mjs"], {
        cwd: compiler.context,
        stdio: "inherit",
      });
    });
  }
}
