import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const files = [
  "src/app/(app)/invention/[id]/evidence/page.tsx",
  "src/app/(app)/support/page.tsx",
  "src/app/(public)/respond/[token]/page.tsx",
];

describe("Convex dynamic query subscription stability", () => {
  it("memoizes every useQueries request object to prevent render-phase update loops", () => {
    for (const file of files) {
      const source = ts.createSourceFile(file, fs.readFileSync(path.join(process.cwd(), file), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const declarations = new Map<string, ts.Expression>();
      const calls: ts.CallExpression[] = [];

      const visit = (node: ts.Node) => {
        if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
          declarations.set(node.name.text, node.initializer);
        }
        if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "useQueries") {
          calls.push(node);
        }
        ts.forEachChild(node, visit);
      };
      visit(source);

      expect(calls.length, `${file} should use Convex queries`).toBeGreaterThan(0);
      for (const call of calls) {
        const argument = call.arguments[0];
        expect(argument && ts.isIdentifier(argument), `${file}: useQueries must receive a memoized variable`).toBe(true);
        if (!argument || !ts.isIdentifier(argument)) continue;
        const initializer = declarations.get(argument.text);
        expect(initializer && ts.isCallExpression(initializer) && ts.isIdentifier(initializer.expression) && initializer.expression.text === "useMemo", `${file}: ${argument.text} must be created by useMemo`).toBe(true);
      }
    }
  });
});
