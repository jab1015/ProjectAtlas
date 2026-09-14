from pathlib import Path

root = Path('docs/STAGE_BLUEPRINTS')
for path in sorted(root.glob('STAGE_*.md')):
    text = path.read_text(encoding='utf-8')
    text = text.replace('Atlas', 'InventSmith')
    text = text.replace('ATLAS', 'INVENTSMITH')
    path.write_text(text, encoding='utf-8')

# Current product-facing release-plan filenames/content are documentation, not runtime identifiers.
release = Path('docs/RELEASE_MANAGEMENT')
for old in [release/'ATLAS_RELEASE_MASTER_PLAN_v1.0', release/'ATLAS_RELEASE_MASTER_PLAN_v1.1.md']:
    if old.exists():
        new = old.with_name(old.name.replace('ATLAS_', 'INVENTSMITH_'))
        text = old.read_text(encoding='utf-8').replace('Atlas', 'InventSmith').replace('ATLAS', 'INVENTSMITH')
        new.write_text(text, encoding='utf-8')
        old.unlink()
