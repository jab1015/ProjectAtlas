/**
 * Atlas Validation Research — Provider Interface
 *
 * Defines the contract that every future ValidationResearch provider must implement.
 * Provider-independent: no OpenAI, Claude, Perplexity, or any external API references.
 *
 * This file contains ONLY types and interfaces — no implementation, no logic.
 */

import type {
  ValidationConfidence,
  ValidationSectionKey,
} from "./validationResearchTypes";

// Re-export for consumers that only import from this module.
export type { ValidationSectionKey };

// ── InventionContext ──────────────────────────────────────────────────────────

/**
 * The invention data passed to a provider when generating a section.
 * Contains all information needed to produce context-aware research output.
 */
export interface InventionContext {
  inventionId: string;
  title: string;
  problemStatement: string;
  inventionDescription: string;
  founderNotes?: string;
  existingResearch?: Record<string, unknown>;
}

// ── SectionGenerationResult ───────────────────────────────────────────────────

/**
 * The result returned by a provider after generating a single section.
 * Uses ValidationConfidence from validationResearchTypes.ts — do not duplicate.
 */
export interface SectionGenerationResult {
  sectionKey: ValidationSectionKey;
  generatedContent: string;
  confidence: ValidationConfidence;
  evidenceSummary: string;
  assumptions: string[];
  missingInformation: string[];
  /** Unix ms timestamp of when this section was generated */
  generatedAt: number;
  providerVersion: string;
}

// ── ValidationResearchProvider ────────────────────────────────────────────────

/**
 * The provider contract every Validation research engine must satisfy.
 *
 * Implementations may include:
 *   - MockValidationResearchProvider
 *   - AtlasResearchEngineProvider
 *   - OpenAIResearchProvider
 *   - ClaudeResearchProvider
 *   - PerplexityResearchProvider
 *
 * Business logic must never reference a concrete provider — only this interface.
 */
export interface ValidationResearchProvider {
  /**
   * Generate a single validation section for the given invention context.
   * Sections must be generated and persisted independently (not batched).
   */
  generateSection(
    context: InventionContext,
    sectionKey: ValidationSectionKey
  ): Promise<SectionGenerationResult>;

  /**
   * Return the list of section keys this provider supports.
   */
  getSupportedSections(): ValidationSectionKey[];

  /**
   * Return the provider's semver string (e.g. "1.0.0").
   */
  getProviderVersion(): string;

  /**
   * Return a human-readable provider name
   * (e.g. "MockValidationResearchProvider", "AtlasResearchEngineProvider").
   */
  getProviderName(): string;
}
