# ATLAS-011_REPOSITORY_STANDARD_v1.0

Version: 1.0 Status: Foundational Standard

## Purpose

This document defines the official repository structure, naming
conventions, and documentation standards for Project Atlas. It ensures
consistency, scalability, and long-term maintainability.

## Repository Structure

ProjectAtlas/ - api/ - app/ - assets/ - database/ - decisions/ - docs/ -
meeting-notes/ - prompts/ - README.md

### docs/

Contains formal specifications.

Recommended folders: - ai-departments/ - atlas-core/ - business/ -
constitution/ - inventor-journey/ - product-bible/ - screen-bible/ -
technical-architecture/ - governance/

### prompts/

Contains runtime AI prompts and behavioral assets.

Examples: - MASTER_PROMPT_v1.0 - SYSTEM_PROMPT_v1.0 -
SESSION_PROMPT_v1.0 - ORCHESTRATION_ENGINE_v1.0 - DECISION_ENGINE_v1.0 -
MEMORY_ENGINE_v1.0 - ANTICIPATORY_ENGINE_v1.0

## Naming Convention

### Documentation

Use numbered filenames: ATLAS-001_CONSTITUTION_v1.0
ATLAS-002_PRODUCT_BIBLE_v1.0 ATLAS-003_AI_SPECIALIST_TEAM_BIBLE_v1.0
ATLAS-004_INVENTOR_JOURNEY_BIBLE_v1.0 ATLAS-005_SCREEN_BIBLE_v1.0
ATLAS-006_BUSINESS_BIBLE_v1.0
ATLAS-007_TECHNICAL_ARCHITECTURE_BIBLE_v1.0 ATLAS-008_ATLAS_CANON_v1.0
ATLAS-009_WHY_ATLAS_EXISTS_v1.0 ATLAS-010_ATLAS_MANIFESTO_v1.0
ATLAS-011_REPOSITORY_STANDARD_v1.0

### Runtime Prompts

Do NOT use document numbers. Use descriptive names only.

## Architecture Decision Records (ADR)

Store in /decisions

Examples: ADR-001_Separate_Docs_and_Runtime_Prompts.md
ADR-002_Document_Numbering_Standard.md
ADR-003_Runtime_Prompts_in_Prompts_Folder.md
ADR-004_Three_Layer_Architecture.md

## Three-Layer Architecture

1.  Governance
2.  Product Knowledge
3.  Runtime Intelligence

## Guiding Principle

Documentation defines what Atlas is. Runtime prompts define how Atlas
behaves.
