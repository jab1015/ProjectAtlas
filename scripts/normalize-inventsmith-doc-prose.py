from pathlib import Path
import re

ROOT = Path("docs")

# Active InventSmith documentation only. Historical evidence/reference documents are deliberately excluded.
targets = []
targets.extend(ROOT.glob("INVENTSMITH_*.md"))
targets.extend([ROOT / "BRAND_IDENTITY.md", ROOT / "ENGINEERING_TEST_STANDARDS.md"])
targets.extend((ROOT / "STAGE_BLUEPRINTS").glob("*.md"))
targets.extend((ROOT / "RELEASE_MANAGEMENT").glob("INVENTSMITH*"))
for directory in ROOT.glob("inventsmith-*"):
    if directory.is_dir():
        targets.extend(directory.rglob("*.md"))

changed = []
for path in sorted(set(targets)):
    if not path.exists() or not path.is_file():
        continue
    text = path.read_text(encoding="utf-8")
    original = text
    # Replace only standalone former product-name words. This intentionally preserves
    # technical identifiers such as ProjectAtlas, atlasWorkOrchestration.ts, ATLAS_*,
    # lowercase atlas-* compatibility paths, URLs, hashes, and exact code symbols.
    text = re.sub(r"\bATLAS\b", "INVENTSMITH", text)
    text = re.sub(r"\bAtlas\b", "InventSmith", text)
    if text != original:
        path.write_text(text, encoding="utf-8")
        changed.append(str(path))

print(f"Updated {len(changed)} active InventSmith documentation files")
for path in changed:
    print(path)
