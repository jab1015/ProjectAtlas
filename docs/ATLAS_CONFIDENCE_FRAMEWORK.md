# ATLAS CONFIDENCE FRAMEWORK

**Version 1.0 — July 2026**
**Classification: Internal Engineering Reference**
**Status: Active — Applies to All Atlas Subsystems**
**Scope: Universal — Patent Intelligence, Market Research, Competitor Research, and all future Atlas research domains**

---

## Document Purpose

This document defines the universal Atlas Confidence Framework.

Every recommendation Atlas produces must include a transparent confidence assessment. This framework governs how that assessment is computed, expressed, and presented to founders across every Atlas research domain — not only Patent Intelligence.

This document does not specify UI, frontend implementation, caching, cost controls, API management, or approval workflow. It defines the framework that all subsystems implement.

---

## Table of Contents

- [Section 1 — Confidence Philosophy](#section-1--confidence-philosophy)
- [Section 2 — Confidence Calculation](#section-2--confidence-calculation)
- [Section 3 — Evidence Weighting](#section-3--evidence-weighting)
- [Section 4 — Source Reliability](#section-4--source-reliability)
- [Section 5 — Freshness Scoring](#section-5--freshness-scoring)
- [Section 6 — Completeness Scoring](#section-6--completeness-scoring)
- [Section 7 — Conflict Detection](#section-7--conflict-detection)
- [Section 8 — Assumption Tracking](#section-8--assumption-tracking)
- [Section 9 — Missing Information Penalties](#section-9--missing-information-penalties)
- [Section 10 — Manual Overrides](#section-10--manual-overrides)
- [Section 11 — Founder Review Thresholds](#section-11--founder-review-thresholds)
- [Section 12 — Confidence Levels](#section-12--confidence-levels)
- [Section 13 — Scoring Model](#section-13--scoring-model)
- [Section 14 — Outputs](#section-14--outputs)
- [Section 15 — Cross-System Applicability](#section-15--cross-system-applicability)
- [Section 16 — Engineering Principles](#section-16--engineering-principles)

---

## Section 1 — Confidence Philosophy

### 1.1 Why Confidence Transparency Matters for Inventors

Inventors making decisions about their products, IP strategy, manufacturing, and market approach are taking real financial and personal risk. Atlas must never let a founder make a high-stakes decision under the false impression that the evidence behind that decision is stronger than it actually is.

- **Misplaced confidence causes real harm** — an inventor who files a patent believing prior art was fully clear, only to discover a key reference was missed, loses time, money, and possibly market position
- **Transparency builds trust** — founders who understand *why* Atlas is uncertain are equipped to decide whether to act on a recommendation or gather more evidence first
- **Every Atlas recommendation carries evidence quality risk** — there is no perfect research; confidence scoring makes that risk visible and explicit rather than hidden
- **Founders are the decision-makers** — Atlas provides research and recommendations; founders approve, redirect, or override; confidence scores are how Atlas communicates the strength of its basis for each recommendation

### 1.2 How Atlas Uses Confidence to Guide (Not Replace) Founder Judgment

- Atlas presents confidence scores **with every recommendation**, not as a final verdict but as a transparent signal about evidence quality
- Atlas **explains the reason** behind each confidence level — what evidence is present, what is missing, and what assumptions were made
- Atlas **never withholds a recommendation** solely because confidence is low — it surfaces the finding with an accurate confidence level and flags the gaps, so the founder can choose how to proceed
- At low confidence levels, Atlas **recommends specific follow-on research** to improve the evidence base before the founder acts
- The founder retains full authority to act at any confidence level — confidence is informational, not a gate that Atlas controls unilaterally (except where Founder Review Thresholds apply — see Section 11)

### 1.3 Atlas Never Overstates Certainty

This principle is non-negotiable across all Atlas subsystems:

- **Every ConfidenceAssessment must reflect the actual evidence** — Atlas never inflates confidence to appear more authoritative
- **Missing evidence is always declared**, not silently ignored — if Atlas could not find a data point it needed, the ConfidenceAssessment must say so
- **Assumptions must be disclosed** — when Atlas fills a gap with an inference, that inference is labeled as an assumption and weighted accordingly
- **Confidence scores are bounded by the quality of available evidence** — a well-executed search across unreliable sources does not produce high confidence; source reliability is factored in
- **Positive findings do not override risk signals** — when conflicting evidence exists, confidence reflects the conflict rather than suppressing the weaker signal

### 1.4 How Confidence Differs from Probability and Legal Opinion

**Confidence is not probability:**
- Probability is a statistical statement about the likelihood of an outcome
- Confidence is an assessment of how well the available evidence supports a finding or recommendation
- A confidence score of 0.90 does not mean Atlas is 90% certain a claim will hold — it means the evidence Atlas found is strong, broad, and internally consistent

**Confidence is not legal opinion:**
- Atlas is not a law firm; Atlas confidence assessments are not legal opinions
- Patent Research confidence scores describe the quality of the prior art and FTO evidence Atlas gathered — they do not constitute legal advice
- Where Atlas research touches legal matters (patent landscape, regulatory status, trademark), every ConfidenceAssessment must include a `legalDisclaimer` field
- Founders must consult qualified legal counsel for decisions that carry legal consequences

**Confidence is an evidence quality signal:**
- It tells founders how thoroughly Atlas researched a question
- It tells founders how reliable the sources Atlas consulted are
- It tells founders what assumptions Atlas made when evidence was absent
- It tells founders what gaps remain and how significant those gaps are

---

## Section 2 — Confidence Calculation

### 2.1 Overview

A final confidence score is a composite of seven sub-scores, each measuring a different dimension of evidence quality. The sub-scores are weighted and combined into a single `confidenceScore` between 0.0 and 1.0.

### 2.2 Sub-Scores

| Sub-Score | Symbol | Weight | Description |
|---|---|---|---|
| Evidence Quality Score | EQ | 0.30 | Quality of individual evidence items |
| Independent Source Count Score | IS | 0.15 | Number of corroborating independent sources |
| Freshness Score | FS | 0.15 | Age-adjusted relevance of evidence |
| Agreement Score | AG | 0.20 | Degree of agreement between sources |
| Research Completeness Score | RC | 0.10 | Coverage of required evidence items |
| Known Assumptions Penalty | KA | −variable | Reduction per documented assumption |
| Known Unknowns Penalty | KU | −variable | Reduction per identified evidence gap |

### 2.3 Final Score Formula

```
rawScore = (EQ × 0.30) + (IS × 0.15) + (FS × 0.15) + (AG × 0.20) + (RC × 0.10)

penaltyTotal = sum(KA_penalties) + sum(KU_penalties)

confidenceScore = max(0.0, min(1.0, rawScore − penaltyTotal))
```

The raw sub-score weights sum to 0.90 rather than 1.00. The remaining 0.10 budget is implicitly consumed by penalties. When penalties are zero, the maximum achievable score is 0.90, indicating that some residual uncertainty always exists — Atlas never claims perfect certainty.

> **Design principle:** The formula ensures that even the strongest evidence base with zero assumptions and no gaps cannot produce a score above 0.90. This enforces the "Atlas never overstates certainty" principle at the mathematical level.

---

## Section 3 — Evidence Weighting

### 3.1 How Individual Evidence Items Are Weighted

Each evidence item has a base weight determined by:

- **Evidence type** (primary vs. secondary)
- **Directness** (direct vs. inferred)
- **Specificity** (specific to the research question vs. general/background)
- **Verifiability** (independently verifiable vs. unverifiable claim)

### 3.2 Primary vs. Secondary Evidence

**Primary evidence** — direct, original source material:
- Patent documents (claims, specifications, drawings)
- Official regulatory filings and approvals
- Audited financial reports
- Government databases (USPTO, FDA, Census, etc.)
- Direct customer interviews or survey results
- Published manufacturer specifications
- Peer-reviewed research

**Secondary evidence** — derived, aggregated, or reported from primary sources:
- News articles and press coverage
- Analyst reports and market research publications
- Third-party databases
- Trade publication estimates
- Investor press releases
- Industry association statistics

**Weight differential:**
- Primary evidence receives full weight as specified in the source reliability tier
- Secondary evidence receives a 0.70 multiplier applied to its tier weight

### 3.3 Direct Evidence vs. Inferred Evidence

**Direct evidence** — explicitly states the finding Atlas is using:
- A patent claim that explicitly covers a specific mechanism
- A competitor's published price list
- A regulatory clearance letter

**Inferred evidence** — implies the finding through indirect means:
- Market size inferred from demographic data and assumed penetration rates
- Competitor pricing inferred from product positioning and review comments
- Regulatory requirement inferred from category precedent

**Weight differential:**
- Direct evidence receives its full assigned weight
- Inferred evidence receives a 0.60 multiplier — and the inference is automatically recorded as an assumption (see Section 8)

---

## Section 4 — Source Reliability

### 4.1 How Atlas Rates Source Reliability

Source reliability is determined by the type of source, not the content of any individual record from that source. Atlas assigns a reliability tier to each source before evaluating the evidence it contains. The tier determines the maximum evidence quality contribution that source can make.

### 4.2 Reliability Tiers

**Tier 1 — Authoritative (weight: 1.00)**
Official government databases, primary legal records, and peer-reviewed scientific literature. These sources are accurate by institutional authority.

| Domain | Examples |
|---|---|
| Patent | USPTO Patent Full-Text Database, EPO Register, WIPO PATENTSCOPE, JPO J-PlatPat |
| Market | U.S. Census Bureau, BLS Industry Statistics, Eurostat |
| Regulatory | FDA.gov filings, EU MDR database, CPSC recall database |
| Legal | Federal Register, PACER (court records), SEC EDGAR |
| Scientific | PubMed, IEEE Xplore, NBER Working Papers |

**Tier 2 — Strong (weight: 0.85)**
Established commercial databases, major news organizations, and verified industry sources with documented methodologies.

| Domain | Examples |
|---|---|
| Patent | Google Patents, Espacenet, Derwent Innovation |
| Market | IBISWorld, Statista (cited reports), Mintel, Nielsen |
| Competitor | Company official websites (pricing, product specs), S-1/10-K filings |
| Manufacturer | Verified manufacturer spec sheets, Thomas Net verified listings |
| Retail | Amazon category data, major retail chain published data |

**Tier 3 — Moderate (weight: 0.65)**
Reputable secondary sources, industry trade publications, and well-regarded analyst firms. Methodology may not be published or independently verified.

| Domain | Examples |
|---|---|
| Market | Trade publication market reports, industry association estimates |
| Competitor | Tech Crunch, TechRadar, Wired (reported facts about products) |
| Manufacturer | Alibaba verified suppliers, Maker's Row verified listings |
| Customer | Published consumer surveys from reputable firms |
| Pricing | Retail aggregator sites (PriceGrabber, Google Shopping) |

**Tier 4 — Weak (weight: 0.40)**
User-generated content, unverified claims, and low-methodology sources. Useful as corroborating context but not as primary evidence.

| Domain | Examples |
|---|---|
| Market | Reddit threads, Quora discussions, social media posts |
| Competitor | Blog posts, startup blog announcements |
| Customer | Amazon review summaries, app store reviews |
| Pricing | Crowdsourced pricing sites |
| Manufacturer | Unverified supplier profiles |

**Tier 5 — Unknown (weight: 0.20)**
Sources whose provenance, methodology, or authority Atlas cannot determine. Evidence from unknown sources is tracked but penalized.

- Unattributed statistics cited in secondary sources
- Data scraped from sites without verifiable authorship
- AI-generated summaries without source attribution
- Any source where Atlas cannot trace the original data

### 4.3 Provider Independence

Source reliability tiers must be defined by source type, not by which data provider Atlas happens to use. A USPTO patent record is Tier 1 regardless of whether it was retrieved via USPTO's own API, Google Patents, or a licensed database. The tier follows the origin of the data, not the pipe that delivered it.

---

## Section 5 — Freshness Scoring

### 5.1 How Age Affects Confidence

Evidence ages at different rates depending on the domain. A patent granted three years ago is still highly relevant; a competitor pricing data point from three years ago may be completely outdated. Atlas applies a freshness multiplier to each evidence item based on its data type and age.

### 5.2 Freshness Decay by Data Type

**Patent Data**

| Age | Freshness Multiplier | Rationale |
|---|---|---|
| 0–2 years | 1.00 | Fully current |
| 2–5 years | 0.95 | Minor staleness; legal status may have changed |
| 5–10 years | 0.85 | Moderate staleness; some competitors may have lapsed or been acquired |
| 10–20 years | 0.75 | Significant staleness; landscape likely changed materially |
| 20+ years | 0.60 | High staleness; likely expired or superseded, but still relevant as prior art reference |

> Patent prior art never becomes irrelevant — it just ages. A 1985 patent is still valid prior art. The multiplier applies to landscape analysis, not to whether a patent counts as prior art for novelty purposes.

**Market Research Data**

| Age | Freshness Multiplier | Rationale |
|---|---|---|
| 0–6 months | 1.00 | Current |
| 6–12 months | 0.90 | Slightly dated; acceptable for strategic purposes |
| 1–2 years | 0.75 | Materially dated; growth rates and TAM figures may be significantly off |
| 2–3 years | 0.55 | Substantially dated; use only as directional context |
| 3+ years | 0.30 | Likely obsolete; flag as requiring refresh |

**Competitor Data**

| Age | Freshness Multiplier | Rationale |
|---|---|---|
| 0–3 months | 1.00 | Current |
| 3–6 months | 0.85 | Minor staleness; product lines and pricing may have shifted |
| 6–12 months | 0.65 | Moderate staleness; significant product or pricing changes likely |
| 1–2 years | 0.40 | High staleness; competitive landscape may be materially different |
| 2+ years | 0.20 | Treat as historical context only |

**Regulatory Data**

| Age | Freshness Multiplier | Rationale |
|---|---|---|
| 0–6 months | 1.00 | Current |
| 6–12 months | 0.90 | Acceptable; regulations rarely change rapidly |
| 1–2 years | 0.75 | Moderate staleness; confirm no rule changes |
| 2–5 years | 0.55 | Significant staleness; regulations may have been updated |
| 5+ years | 0.30 | Likely obsolete; requires fresh authoritative source |

**Manufacturer and Pricing Data**

| Age | Freshness Multiplier | Rationale |
|---|---|---|
| 0–3 months | 1.00 | Current |
| 3–6 months | 0.80 | Minor staleness |
| 6–12 months | 0.55 | Materially dated |
| 1+ years | 0.25 | Treat as rough directional only |

**Customer Research Data**

| Age | Freshness Multiplier | Rationale |
|---|---|---|
| 0–6 months | 1.00 | Current |
| 6–12 months | 0.85 | Acceptable |
| 1–2 years | 0.60 | Moderate staleness |
| 2+ years | 0.35 | Likely outdated; behavior patterns may have shifted |

### 5.3 Freshness Score Calculation

```
freshnessScore = average(freshnessMultiplier_i for each evidence item i)
```

The freshness score is a weighted average across all evidence items contributing to the ConfidenceAssessment. Items with higher source reliability tier weights contribute proportionally more to the freshness average.

---

## Section 6 — Completeness Scoring

### 6.1 How Atlas Measures Evidence Completeness

Each research type defines a set of **required evidence items** and **optional evidence items**. Completeness measures the fraction of required items that Atlas was able to gather for a given research run.

### 6.2 Completeness Formula

```
completenessScore = (requiredItemsFound / requiredItemsTotal) + (optionalItemsFound / optionalItemsTotal × 0.10)

completenessScore = min(1.0, completenessScore)
```

The optional items bonus is capped at 0.10, ensuring that optional evidence cannot compensate for missing required evidence.

### 6.3 Minimum Completeness Thresholds by Research Type

| Research Type | Minimum Completeness to Proceed | Required Items Examples |
|---|---|---|
| Patent Research | 0.60 | Prior art search executed, claims reviewed, search coverage documented |
| Market Research | 0.55 | TAM/SAM estimate, at least one market size source, competitor landscape |
| Competitor Research | 0.50 | At least 3 competitors identified, product/pricing for each |
| Manufacturer Research | 0.60 | At least 3 manufacturers identified, MOQ and lead time for each |
| Retail Research | 0.50 | Channel margin structure, at least 2 comparable products in channel |
| Pricing Research | 0.55 | Cost-plus baseline, at least 2 competitive price points, margin analysis |
| Customer Research | 0.50 | At least one customer segment defined, pain intensity evidence |
| Regulatory Research | 0.65 | Applicable regulatory body identified, primary requirement category confirmed |

### 6.4 What Happens Below Threshold

When `completenessScore` is below the minimum threshold:

- The `requiresFounderReview` flag is set to `true`
- The `reviewReason` field includes: "Completeness below minimum threshold for this research type"
- The `missingInformation` array enumerates exactly which required items were not found
- The `confidenceScore` is automatically capped at 0.49 (Moderate or below) regardless of sub-scores, because insufficient coverage of required evidence is structurally incompatible with High or Very High confidence
- Atlas presents the finding with a `suggestedNextResearch` list to help the founder close the gap

---

## Section 7 — Conflict Detection

### 7.1 How Atlas Identifies Conflicting Sources

Conflicts occur when two or more evidence items make materially different claims about the same fact. Atlas detects conflicts by:

- Comparing quantitative values from different sources for the same metric (e.g., two sources citing different market sizes for the same year)
- Identifying contradictory status claims (e.g., one source shows a patent as active, another shows it as abandoned)
- Detecting logical incompatibility between evidence items (e.g., a competitor described as both a startup and a $50M revenue company by different sources)

**Conflict detection is automatic** — Atlas compares evidence items against each other during the evidence assembly step and flags pairs or groups that contradict.

### 7.2 How Conflicts Affect Confidence Score

Conflicts are quantified through the **Agreement Score** (see Section 13.4). Conflicts reduce confidence by:

- Reducing the Agreement Score proportionally to the severity and number of conflicts
- Adding a conflict entry to the `conflictsDetected` array in the ConfidenceAssessment
- Triggering the `requiresFounderReview` flag when a critical conflict is detected

**Conflict severity levels:**

| Level | Definition | Agreement Score Impact |
|---|---|---|
| Critical | Two sources directly contradict each other on a fact that materially affects the recommendation | −0.30 to −0.50 |
| Significant | Sources disagree materially but do not fully contradict (e.g., market size differs by more than 2×) | −0.15 to −0.30 |
| Minor | Sources differ in ways that don't materially affect the finding (e.g., minor price variation) | −0.05 to −0.15 |

### 7.3 How Conflicts Are Surfaced to Founders

- Every detected conflict appears in the `conflictsDetected` array of the ConfidenceAssessment
- Each conflict entry includes: source A, source B, the conflicting claim, severity level, and Atlas's resolution approach
- Atlas never silently resolves a critical or significant conflict — it must always surface the conflict and explain how it was handled
- **Resolution approaches:**
  - `HIGHER_TIER_WINS` — when two sources conflict and one has a higher reliability tier, the higher-tier source is weighted more heavily
  - `MOST_RECENT_WINS` — when sources from different time periods conflict, the more recent source is weighted more heavily
  - `PRESENTED_AS_RANGE` — when the conflict cannot be cleanly resolved, Atlas presents the range and flags it for founder resolution
  - `FOUNDER_RESOLUTION_REQUIRED` — for critical conflicts where Atlas cannot determine which source is correct

---

## Section 8 — Assumption Tracking

### 8.1 The Requirement to Document All Assumptions

Every inference Atlas makes that is not directly supported by a retrieved evidence item must be documented as an assumption. No assumption is too small to record. The complete set of assumptions in a ConfidenceAssessment defines exactly where Atlas filled gaps with inference rather than fact.

### 8.2 Types of Assumptions

**INFERRED** — drawn from available evidence by logical inference, but not explicitly stated in any source:
- "Competitor likely prices above $50 based on product category and positioning signals"
- "Market growth rate assumed to continue at historical pace since no forward projections were found"

**DEFAULT** — a standard value Atlas applies when no specific data is available, drawn from domain knowledge:
- "Standard retail margin of 40% applied because no channel-specific data was found"
- "USPTO processing time of 18–24 months assumed based on category averages"

**EXTRAPOLATED** — a value derived by extending a trend or model beyond its documented range:
- "TAM extrapolated from 2022 data adjusted for 3-year category growth rate"
- "International market size extrapolated from US share using GDP ratio"

**ESTIMATED** — an approximate value assigned where exact data was unavailable:
- "Manufacturer MOQ estimated at 500 units based on category norms; no specific quote obtained"
- "Addressable customer segment estimated at 15% of TAM based on behavioral profile"

### 8.3 How Assumption Weight Affects Confidence

Each assumption type carries a default penalty that is applied to the final confidence score via the Known Assumptions Penalty sub-score (see Section 13.6):

| Assumption Type | Default Penalty (per assumption) | Notes |
|---|---|---|
| INFERRED | −0.03 | Logical inference from real evidence — low penalty |
| DEFAULT | −0.04 | Standard value applied without specific data — moderate penalty |
| EXTRAPOLATED | −0.05 | Extension beyond data range — higher penalty |
| ESTIMATED | −0.06 | Approximate value without specific evidence — highest penalty |

Penalties are cumulative but capped at −0.25 total from assumptions (across all assumption types). This prevents a large number of minor inferences from driving confidence to zero in situations where the primary evidence is strong.

---

## Section 9 — Missing Information Penalties

### 9.1 How Missing Inputs Reduce Confidence

Missing information is distinct from assumptions. An assumption is Atlas filling a gap; missing information is a gap Atlas could not fill at all. Missing information reduces confidence through the Known Unknowns Penalty.

### 9.2 Penalty Table by Input Type

| Input Type | Gap Severity | Penalty |
|---|---|---|
| Core invention description | Critical | −0.20 |
| Primary market size source | Critical | −0.15 |
| At least one authoritative prior art search executed | Critical | −0.20 |
| Legal status of key patents identified | Critical | −0.15 |
| Applicable regulatory body identified | Critical | −0.15 |
| Competitor pricing data | Significant | −0.10 |
| Manufacturer MOQ and lead time | Significant | −0.10 |
| Technology classification (CPC/IPC) | Significant | −0.08 |
| Customer segment definition | Significant | −0.08 |
| Competitive landscape (3+ competitors) | Significant | −0.10 |
| Secondary market size corroboration | Minor | −0.04 |
| International patent coverage | Minor | −0.03 |
| Historical pricing trends | Minor | −0.03 |
| Influencer / channel data | Minor | −0.02 |

### 9.3 How Atlas Signals Missing Information to Founders

- All identified gaps appear in the `missingInformation` array of the ConfidenceAssessment with severity labeled
- The `suggestedNextResearch` array includes at least one specific research action for every critical or significant gap
- Atlas does not block progress for significant or minor gaps — it flags and recommends
- Atlas does block progress past Founder Review for any ConfidenceAssessment where a **critical gap** is present AND the `confidenceScore` falls below 0.30

---

## Section 10 — Manual Overrides

### 10.1 When and How a Founder Can Override

A founder may override Atlas's confidence assessment when:

- The founder has personal knowledge or access to information that Atlas could not obtain
- The founder disagrees with how Atlas weighted a specific source or assumption
- The founder wants to proceed at a lower confidence level than Atlas recommends
- The founder believes a detected conflict has been resolved based on their own research

**Override mechanism:**
- The founder sets `manualOverride: true` on the ConfidenceAssessment
- The founder provides an `overrideRationale` string explaining the basis for the override
- The founder sets `founderConfidenceOverride` (0.0–1.0) — their stated confidence level
- The founder's override is recorded in the audit trail alongside the Atlas-generated score

### 10.2 What Happens When an Override Is Applied

- The `confidenceScore` displayed to the founder changes to `founderConfidenceOverride`
- The `confidenceLevel` is recalculated from the overridden score
- The `requiresFounderReview` flag may be cleared if the overridden score is above the threshold — but Atlas logs that review was waived by override
- All downstream recommendations continue to use the overridden confidence level for display
- The original Atlas-computed score is preserved in `atlasOriginalConfidenceScore` and is never deleted
- A `ManualOverrideRecord` is appended to the audit log

### 10.3 Audit Trail Requirements

Every override must be permanently stored with:

```typescript
type ManualOverrideRecord = {
  overrideId: string;
  inventionId: string;
  assessmentId: string;
  atlasOriginalScore: number;
  founderOverrideScore: number;
  overrideRationale: string;
  founderId: string;
  overriddenAt: string; // ISO 8601 timestamp
  frameworkVersion: string;
};
```

Overrides are append-only. They cannot be deleted or retroactively modified.

---

## Section 11 — Founder Review Thresholds

### 11.1 When Atlas Requires Founder Review

Founder review is triggered automatically when any of the following conditions are met:

| Condition | Threshold | Action |
|---|---|---|
| Confidence score below threshold | Domain-specific (see below) | Set `requiresFounderReview: true` |
| Critical gap in required evidence | Any critical gap present | Set `requiresFounderReview: true` |
| Critical conflict detected | Any critical conflict present | Set `requiresFounderReview: true` |
| Completeness below minimum threshold | Domain-specific (see Section 6.3) | Set `requiresFounderReview: true` |
| Legal domain finding present | Always on legal-touching domains | Set `requiresFounderReview: true` |

### 11.2 What "Requires Review" Means Operationally

When `requiresFounderReview: true`:

- Atlas surfaces the ConfidenceAssessment to the founder with a clear explanation of why review is required
- Atlas provides the `reviewReason` — a plain-language explanation the founder can read and act on
- Atlas provides `suggestedNextResearch` — specific steps the founder can take to improve the evidence base
- Atlas does NOT prevent the founder from proceeding — the founder can override (see Section 10) or accept the finding at its current confidence level

### 11.3 Confidence Thresholds by Research Domain and Risk Level

**Standard domains (market, competitor, pricing, customer, retail):**

| Confidence Level | Score Range | Founder Review Required |
|---|---|---|
| Very High | 0.85–1.00 | No — proceed |
| High | 0.70–0.84 | No — proceed |
| Moderate | 0.50–0.69 | Recommended — flagged but not required |
| Low | 0.30–0.49 | Yes — required |
| Very Low | 0.00–0.29 | Yes — required; Atlas blocks automatic progression |

**High-stakes domains (patent, regulatory, manufacturer selection, funding):**

| Confidence Level | Score Range | Founder Review Required |
|---|---|---|
| Very High | 0.85–1.00 | No — proceed |
| High | 0.70–0.84 | Recommended — flagged but not required |
| Moderate | 0.50–0.69 | Yes — required |
| Low | 0.30–0.49 | Yes — required; Atlas blocks automatic progression |
| Very Low | 0.00–0.29 | Yes — required; Atlas blocks automatic progression |

**Legal-touching outputs (FTO indicators, regulatory compliance, trademark clearance):**

| Condition | Action |
|---|---|
| Any confidence level | Always requires founder review + legal disclaimer acknowledgment |

---

## Section 12 — Confidence Levels

### 12.1 Very High (0.85–1.00)

**Evidence quality:**
- Multiple Tier 1 or Tier 2 sources corroborate the finding
- No significant conflicts detected
- Evidence is fresh (within freshness thresholds)
- All required evidence items found
- Assumptions are few and of INFERRED or DEFAULT type only
- No critical or significant gaps

**Atlas behavior:**
- Proceeds automatically in standard domains
- Flags for recommended review in high-stakes domains
- Surfaces findings with confidence level but no block

**Example scenarios:**
- *Patent:* Three independent Tier 1 searches (USPTO, Espacenet, WIPO) all completed; top prior art references identified, claims reviewed, legal status confirmed; novelty assessment supported by absence of claim overlap across all three databases
- *Market:* TAM corroborated by two Tier 1 government sources and one Tier 2 commercial report; competitive landscape confirmed across multiple verified sources; all required market items found
- *Competitor:* Competitor identified with confirmed product listing, public pricing, and active website; S-1 or 10-K available confirming financial scale
- *Manufacturer:* Three or more verified suppliers with confirmed MOQ, lead time, and certification documentation

---

### 12.2 High (0.70–0.84)

**Evidence quality:**
- Multiple Tier 2 or better sources corroborate; at least one Tier 1 source present
- No critical conflicts; minor conflicts present and resolved
- Evidence is mostly fresh; some moderate staleness acceptable
- Most required evidence items found; minor gaps only
- Moderate assumption count; assumptions are well-documented

**Atlas behavior:**
- Proceeds in standard domains
- Flags for recommended (not required) review in high-stakes domains
- Surfaces confidence level with summary reasoning

**Example scenarios:**
- *Patent:* Two database searches completed; relevant prior art identified and reviewed; one assumption made about claim scope interpretation
- *Market:* TAM from one Tier 1 and one Tier 2 source; one competitor missing pricing data; market growth rate extrapolated from most recent year available
- *Regulatory:* Primary regulatory body confirmed; key requirement categories identified; specific compliance thresholds not yet verified

---

### 12.3 Moderate (0.50–0.69)

**Evidence quality:**
- Evidence present but incomplete; Tier 2 and Tier 3 sources without Tier 1 corroboration in some areas
- Some conflicts detected; significant conflicts possible
- Evidence freshness mixed; some data points materially dated
- Several required evidence items missing; completeness approaching or below threshold
- Multiple assumptions including EXTRAPOLATED or ESTIMATED types

**Atlas behavior:**
- Flags for recommended review in standard domains
- Requires review before proceeding in high-stakes domains
- Presents findings with explicit gap and assumption disclosures
- Provides `suggestedNextResearch` to improve the evidence base

**Example scenarios:**
- *Patent:* Only one database searched; prior art found but claim mapping incomplete; one potential overlap identified but not fully analyzed
- *Market:* TAM from secondary sources only; competitor landscape partial (fewer than 3 confirmed competitors); market size data 18+ months old
- *Competitor:* Competitor identified but pricing unconfirmed; product spec inferred from marketing materials only; financial scale unknown
- *Manufacturer:* One manufacturer found; MOQ and lead time estimated from category averages rather than confirmed quotes

---

### 12.4 Low (0.30–0.49)

**Evidence quality:**
- Evidence sparse or of low reliability
- Conflicts unresolved or significant
- Evidence substantially dated
- Multiple required items missing; completeness below threshold
- High assumption count including multiple ESTIMATED types
- One or more significant gaps in evidence

**Atlas behavior:**
- Requires founder review in all domains
- Automatically blocks downstream progression in high-stakes domains
- Presents findings as preliminary and explicitly incomplete
- Prioritizes `suggestedNextResearch` to close critical gaps

**Example scenarios:**
- *Patent:* No structured database search executed; prior art assessment based on keyword scanning only; claim analysis not possible without full text
- *Market:* TAM based on single Tier 3 source with no corroboration; competitive landscape based on founder-provided names only
- *Competitor:* Competitor identified by name only; no product, pricing, or positioning data found
- *Regulatory:* General category identified; no specific requirements confirmed; applicable body uncertain

---

### 12.5 Very Low (0.00–0.29)

**Evidence quality:**
- Minimal or no evidence found
- No corroboration between sources
- Evidence unreliable, contradicted, or severely dated
- Most or all required items missing
- Primarily assumption-based with multiple critical gaps
- Finding is speculative

**Atlas behavior:**
- Requires founder review in all domains without exception
- Blocks automatic progression in all domains
- Presents result as insufficient for decision-making
- Recommends full evidence-gathering effort before proceeding

**Example scenarios:**
- *Patent:* Atlas could not execute searches due to provider unavailability; no prior art assessment possible
- *Market:* No market size data found; competitive landscape completely unknown; TAM entirely estimated
- *Any domain:* Research just started; fewer than 20% of required evidence items found

---

## Section 13 — Scoring Model

### 13.1 Evidence Quality Score (EQ)

The Evidence Quality Score measures the average quality of individual evidence items used in the assessment.

**Quality factors per evidence item:**

| Factor | Weight | Scoring |
|---|---|---|
| Source Reliability Tier | 0.40 | Tier 1 = 1.0, Tier 2 = 0.85, Tier 3 = 0.65, Tier 4 = 0.40, Tier 5 = 0.20 |
| Directness | 0.25 | Direct = 1.0, Inferred = 0.60 |
| Specificity | 0.20 | Highly specific = 1.0, Moderately specific = 0.65, General = 0.30 |
| Verifiability | 0.15 | Independently verifiable = 1.0, Partially verifiable = 0.60, Unverifiable = 0.20 |

**Per-item quality score:**
```
itemQuality = (tierWeight × 0.40) + (directness × 0.25) + (specificity × 0.20) + (verifiability × 0.15)
```

**Evidence Quality Score:**
```
EQ = average(itemQuality_i for all evidence items i)
```

**Range: 0.0–1.0**

---

### 13.2 Independent Source Count Score (IS)

Reflects the number of independent corroborating sources — with diminishing returns.

**Diminishing returns model:**

| Independent Source Count | IS Score |
|---|---|
| 0 | 0.00 |
| 1 | 0.40 |
| 2 | 0.65 |
| 3 | 0.80 |
| 4 | 0.88 |
| 5 | 0.93 |
| 6+ | 0.96 |

Two sources are "independent" if they are operated by different organizations and derived their data independently. A database that aggregates from a single primary source counts as one source, not two.

**Range: 0.0–0.96**

---

### 13.3 Freshness Score (FS)

Per-data-type freshness decay tables are defined in Section 5. The Freshness Score is the weighted average of all evidence items' freshness multipliers.

```
FS = sum(freshnessMultiplier_i × reliabilityWeight_i) / sum(reliabilityWeight_i)
```

Higher-tier sources have proportionally more influence on the freshness score.

**Range: 0.0–1.00**

---

### 13.4 Agreement Score (AG)

Measures the degree to which evidence items agree with each other.

**Agreement scale:**

| Agreement Level | AG Contribution | Definition |
|---|---|---|
| Full Corroboration | 1.00 | All sources agree; no conflicts detected |
| Minor Variation | 0.85 | Small quantitative differences within acceptable range |
| Moderate Divergence | 0.65 | Sources differ materially but in the same direction |
| Significant Conflict | 0.40 | Sources materially contradict each other on a significant point |
| Direct Contradiction | 0.15 | Two or more sources directly contradict on a critical fact |
| Irreconcilable Conflict | 0.00 | Conflicts cannot be resolved and affect the core finding |

**AG formula:**

When no conflicts exist:
```
AG = 1.00
```

When conflicts are detected:
```
AG = 1.00 − sum(conflictPenalty_j for each conflict j)
```

Where `conflictPenalty_j` is drawn from the conflict severity table in Section 7.2.

`AG` is clamped to a minimum of 0.00.

**Range: 0.00–1.00**

---

### 13.5 Research Completeness Score (RC)

Calculated per the formula in Section 6.2:
```
RC = (requiredItemsFound / requiredItemsTotal) + (optionalItemsFound / optionalItemsTotal × 0.10)
RC = min(1.0, RC)
```

**Range: 0.00–1.00**

---

### 13.6 Known Assumptions Penalty (KA)

Each documented assumption reduces the confidence score. Penalties are cumulative and capped.

```
KA_total = min(0.25, sum(assumptionPenalty_k for each assumption k))
```

Penalty by type (from Section 8.3):

| Assumption Type | Penalty per Instance |
|---|---|
| INFERRED | −0.03 |
| DEFAULT | −0.04 |
| EXTRAPOLATED | −0.05 |
| ESTIMATED | −0.06 |

KA is subtracted from the raw score in the final formula.

---

### 13.7 Known Unknowns Penalty (KU)

Each identified evidence gap with a documented severity reduces confidence.

```
KU_total = min(0.25, sum(gapPenalty_m for each gap m))
```

Penalty by gap severity (from Section 9.2):

| Gap Severity | Penalty per Instance |
|---|---|
| Critical | −0.15 |
| Significant | −0.08 |
| Minor | −0.03 |

KU is subtracted from the raw score in the final formula.

---

### 13.8 Final Score Composition

**Sub-score weights:**

| Sub-Score | Weight |
|---|---|
| Evidence Quality (EQ) | 0.30 |
| Independent Sources (IS) | 0.15 |
| Freshness (FS) | 0.15 |
| Agreement (AG) | 0.20 |
| Research Completeness (RC) | 0.10 |
| **Total positive weight** | **0.90** |

**Final formula:**

```
rawScore = (EQ × 0.30) + (IS × 0.15) + (FS × 0.15) + (AG × 0.20) + (RC × 0.10)

penaltyTotal = min(0.50, KA_total + KU_total)

confidenceScore = max(0.0, min(1.0, rawScore − penaltyTotal))
```

The combined penalty cap is 0.50 — Atlas never forces a score below 0.00 from penalties alone, and the minimum score is always 0.00.

The maximum achievable raw score before penalties is 0.90. A perfect score requires:
- All evidence items from Tier 1 sources, direct, highly specific, and verifiable (EQ = 1.00)
- Six or more independent sources (IS = 0.96)
- All evidence fresh (FS = 1.00)
- Full corroboration across all sources (AG = 1.00)
- All required and optional evidence items found (RC = 1.00)

Even under these conditions, `rawScore = 0.90`, and any assumptions or gaps reduce it further.

---

## Section 14 — Outputs

### 14.1 ConfidenceAssessment Schema

Every Atlas recommendation must include a `ConfidenceAssessment` object.

```typescript
type ConfidenceAssessment = {
  // Identity
  assessmentId: string;             // Unique identifier for this assessment
  inventionId: string;              // The invention this assessment belongs to
  researchDomain: ResearchDomain;   // e.g., "patent", "market", "competitor"
  researchRunId: string;            // Links to the research run that generated evidence

  // Core scores
  confidenceScore: number;          // 0.0–1.0 — final composite score
  confidenceLevel: ConfidenceLevel; // "Very High" | "High" | "Moderate" | "Low" | "Very Low"
  completenessScore: number;        // 0.0–1.0

  // Sub-scores (for transparency and debugging)
  subScores: {
    evidenceQuality: number;        // EQ — 0.0–1.0
    independentSourceCount: number; // IS — 0.0–0.96
    freshness: number;              // FS — 0.0–1.0
    agreement: number;              // AG — 0.0–1.0
    researchCompleteness: number;   // RC — 0.0–1.0
    assumptionsPenalty: number;     // KA — negative value
    knownUnknownsPenalty: number;   // KU — negative value
  };

  // Evidence
  evidenceSummary: string;          // Human-readable summary of what evidence was found
  sourcesConsulted: SourceRecord[]; // All sources consulted with reliability tier
  freshnessProfile: FreshnessRecord[]; // Per-source freshness score

  // Gaps and assumptions
  assumptionsMade: AssumptionRecord[];   // All documented assumptions
  missingInformation: GapRecord[];       // All identified evidence gaps
  conflictsDetected: ConflictRecord[];   // All detected source conflicts

  // Founder guidance
  requiresFounderReview: boolean;   // Whether review is required before proceeding
  reviewReason: string | null;      // Plain-language reason for review requirement
  suggestedNextResearch: ResearchAction[]; // Ordered list of recommended follow-on research

  // Legal
  legalDisclaimer: string | null;   // Present if domain touches legal matters
  disclaimerAcknowledged: boolean;  // Founder must set to true before proceeding on legal-touching findings

  // Override (populated only if founder override applied)
  manualOverride: boolean;
  founderConfidenceOverride: number | null;
  atlasOriginalConfidenceScore: number | null;
  overrideRationale: string | null;

  // Audit
  generatedAt: string;              // ISO 8601 timestamp
  frameworkVersion: string;         // e.g., "1.0" — must match the version of this document
};
```

---

### 14.2 Supporting Type Definitions

```typescript
type ConfidenceLevel =
  | "Very High"   // 0.85–1.00
  | "High"        // 0.70–0.84
  | "Moderate"    // 0.50–0.69
  | "Low"         // 0.30–0.49
  | "Very Low";   // 0.00–0.29

type ResearchDomain =
  | "market"
  | "competitor"
  | "patent"
  | "manufacturer"
  | "retail"
  | "pricing"
  | "customer"
  | "regulatory";

type SourceRecord = {
  sourceId: string;
  sourceName: string;
  sourceUrl: string | null;
  reliabilityTier: 1 | 2 | 3 | 4 | 5;
  dataType: string;           // e.g., "patent_database", "market_report", "competitor_website"
  retrievedAt: string;        // ISO 8601
  freshnessScore: number;     // 0.0–1.0
  itemsContributed: number;   // How many evidence items came from this source
};

type FreshnessRecord = {
  sourceId: string;
  dataType: string;
  dataAge: string;            // Human-readable, e.g., "14 months"
  freshnessMultiplier: number; // 0.0–1.0
};

type AssumptionRecord = {
  assumptionId: string;
  assumptionType: "INFERRED" | "DEFAULT" | "EXTRAPOLATED" | "ESTIMATED";
  description: string;        // Plain-language description of the assumption
  affectedField: string;      // Which evidence field this assumption fills
  penalty: number;            // The negative value applied to confidence
  basis: string | null;       // What evidence or domain knowledge the assumption is based on
};

type GapRecord = {
  gapId: string;
  inputType: string;          // What evidence item is missing
  severity: "critical" | "significant" | "minor";
  penalty: number;            // The negative value applied to confidence
  description: string;        // Plain-language description of what is missing
  suggestedResolution: string; // How this gap can be addressed
};

type ConflictRecord = {
  conflictId: string;
  sourceA: string;            // sourceId of first source
  sourceB: string;            // sourceId of second source
  conflictingFact: string;    // What they disagree about
  claimA: string;             // Source A's claim
  claimB: string;             // Source B's claim
  severity: "critical" | "significant" | "minor";
  resolutionApproach: "HIGHER_TIER_WINS" | "MOST_RECENT_WINS" | "PRESENTED_AS_RANGE" | "FOUNDER_RESOLUTION_REQUIRED";
  resolution: string | null;  // How Atlas resolved it (null if founder resolution required)
};

type ResearchAction = {
  actionId: string;
  priority: "urgent" | "high" | "medium" | "low";
  description: string;        // What research action to take
  expectedImpact: string;     // How this would improve confidence
  estimatedConfidenceGain: number; // Approximate improvement if action is completed
};
```

---

## Section 15 — Cross-System Applicability

The Confidence Framework applies uniformly across all Atlas research domains. Each domain has distinct evidence types, freshness concerns, and typical confidence trajectories.

---

### 15.1 Market Research

**Primary evidence types:**
- Government market statistics (Tier 1)
- Commercial market research reports (Tier 2)
- Industry association data (Tier 3)
- Search trend data and digital signals (Tier 3–4)

**Key freshness concerns:**
- TAM/SAM figures dated faster than 12 months become materially unreliable
- Consumer behavior data should not be older than 24 months for sizing decisions
- Growth rate projections from pre-pandemic data must be flagged as extrapolated

**Common assumption types:**
- EXTRAPOLATED — extending historical growth rate forward
- DEFAULT — applying standard penetration rate when founder-specific data is absent
- ESTIMATED — assigning a TAM based on adjacent market data

**Typical confidence ranges:**
- Early stage (idea / validation): 0.25–0.45 (Very Low to Low) — limited data, high assumptions
- Mid-stage (market research complete): 0.55–0.70 (Moderate to High) — multiple sources, some gaps
- Mature stage (full research with primary data): 0.70–0.85 (High) — well-corroborated, mostly fresh

---

### 15.2 Competitor Research

**Primary evidence types:**
- Competitor websites (Tier 2)
- SEC filings for public companies (Tier 1)
- Product listings and published pricing (Tier 2–3)
- News coverage and press releases (Tier 3)

**Key freshness concerns:**
- Competitor pricing goes stale within 3–6 months
- Product feature lists go stale within 6 months
- Funding and revenue data degrades within 12 months

**Common assumption types:**
- INFERRED — estimating revenue from headcount and pricing model
- ESTIMATED — pricing for unconfirmed products
- DEFAULT — applying standard market share distribution when no data is available

**Typical confidence ranges:**
- Early stage: 0.30–0.50 (Low to Moderate) — competitors identified but data sparse
- Mid-stage: 0.55–0.70 (Moderate to High) — multiple confirmed competitors with product data
- Mature stage: 0.70–0.80 (High) — comprehensive landscape with pricing and positioning confirmed

---

### 15.3 Patent Research

**Primary evidence types:**
- Official patent databases (Tier 1: USPTO, EPO, WIPO)
- Patent full text including claims (Tier 1)
- Legal status records (Tier 1)
- Citation graphs from official sources (Tier 1)

**Key freshness concerns:**
- Patent legal status changes require monthly verification for active prosecution
- Patent applications from the last 18 months may not yet be published (stealth filings)
- Competitor patent activity requires quarterly monitoring in active technology spaces

**Common assumption types:**
- INFERRED — claim scope interpretation for complex claim language
- ESTIMATED — likelihood of claim overlap based on technology proximity
- DEFAULT — assumed claim construction when prosecution history is unavailable

**Typical confidence ranges:**
- Early stage (keyword search only): 0.25–0.40 (Very Low to Low) — limited coverage
- Mid-stage (structured search, partial analysis): 0.45–0.65 (Low to Moderate)
- Mature stage (comprehensive multi-database search with claim analysis): 0.65–0.85 (High)

> Note: Patent Research confidence never reaches Very High because there is always residual uncertainty from unpublished applications, claim construction ambiguity, and jurisdictional variance. This is by design.

---

### 15.4 Manufacturer Research

**Primary evidence types:**
- Verified manufacturer profiles (Tier 2)
- Confirmed RFQ responses (Tier 1 when directly received)
- Certification documentation (Tier 1–2)
- Industry directories (Tier 2–3)

**Key freshness concerns:**
- MOQ and pricing data go stale within 3 months for high-volume categories
- Certification status should be re-confirmed before order placement
- Supplier capacity data is highly volatile

**Common assumption types:**
- DEFAULT — applying category-average MOQ when no quote received
- ESTIMATED — lead time estimated from country-of-origin averages
- INFERRED — quality inference from certification type and review patterns

**Typical confidence ranges:**
- Before RFQ: 0.20–0.40 (Very Low to Low) — largely assumption-based
- After preliminary quotes: 0.50–0.65 (Moderate)
- After confirmed quotes and references: 0.70–0.82 (High)

---

### 15.5 Retail Research

**Primary evidence types:**
- Published retailer margin guides (Tier 2)
- Buyer contact databases (Tier 2–3)
- Product sell-through data from retailers (Tier 2)
- Channel-specific performance data (Tier 2–3)

**Key freshness concerns:**
- Retail margin structures are relatively stable but should be re-confirmed annually
- Buyer contact data degrades quickly (buyer role turnover is high)
- Category sell-through data should not be more than 12 months old for merchandising decisions

**Common assumption types:**
- DEFAULT — applying standard category margin when no channel-specific data found
- ESTIMATED — buyer contact details estimated from directory sources
- INFERRED — sell-through potential inferred from comparable product performance

**Typical confidence ranges:**
- Early stage: 0.30–0.50 (Low to Moderate)
- After channel research complete: 0.55–0.72 (Moderate to High)

---

### 15.6 Pricing Research

**Primary evidence types:**
- Competitor published pricing (Tier 2–3)
- Retailer price lists (Tier 2)
- Manufacturing cost confirmed quotes (Tier 1 when direct)
- Consumer willingness-to-pay data (Tier 2–3)

**Key freshness concerns:**
- Pricing data has the shortest freshness window of any domain (3–6 months)
- Retail prices should be checked within 30 days of a pricing decision
- Manufacturing cost should be re-quoted within the current production cycle

**Common assumption types:**
- DEFAULT — standard retail margin applied when channel-specific data absent
- EXTRAPOLATED — price trend projection from 12-month historical data
- ESTIMATED — willingness-to-pay estimated from product category and segment profiles

**Typical confidence ranges:**
- Early stage: 0.35–0.50 (Low to Moderate)
- After competitor pricing confirmed and unit economics modeled: 0.60–0.78 (Moderate to High)

---

### 15.7 Customer Research

**Primary evidence types:**
- Direct customer interviews (Tier 1 when conducted by founder)
- Published consumer surveys from reputable firms (Tier 2–3)
- Behavioral data from digital channels (Tier 2–3)
- Review and sentiment data (Tier 3–4)

**Key freshness concerns:**
- Direct interview data is highly time-sensitive for fast-moving markets (< 12 months)
- Published consumer behavior studies can be used up to 24 months if the market is stable
- Review sentiment data should not be older than 6 months for active product categories

**Common assumption types:**
- INFERRED — segment behavior pattern inferred from adjacent category research
- DEFAULT — standard segment size ratio applied when no specific data found
- ESTIMATED — pain intensity estimated from review sentiment analysis

**Typical confidence ranges:**
- Before interviews: 0.25–0.40 (Very Low to Low)
- After 5+ interviews with consistent findings: 0.55–0.72 (Moderate to High)
- After 15+ interviews with pattern confirmation: 0.70–0.82 (High)

---

### 15.8 Regulatory Research

**Primary evidence types:**
- Official regulatory body guidance (Tier 1: FDA, FCC, CPSC, CE, etc.)
- Federal Register and official rulemaking documents (Tier 1)
- Regulatory attorney opinion letters (Tier 1–2)
- Industry association compliance guides (Tier 2–3)

**Key freshness concerns:**
- Regulatory guidance changes can be sudden and material; always verify from primary source
- Guidance dated more than 12 months should be re-confirmed before compliance decisions
- International regulatory requirements change at different rates by jurisdiction

**Common assumption types:**
- DEFAULT — applying product category standard when specific guidance not found
- INFERRED — regulatory class inferred from product mechanism and comparable approvals
- ESTIMATED — compliance timeline estimated from category precedent

**Typical confidence ranges:**
- Before regulatory research: 0.15–0.30 (Very Low)
- After regulatory body confirmed and primary requirements identified: 0.50–0.65 (Moderate)
- After regulatory counsel review: 0.70–0.82 (High)

> Regulatory Research requires founder review at all confidence levels below Very High. Legal disclaimer is mandatory in every Regulatory Research ConfidenceAssessment.

---

## Section 16 — Engineering Principles

### 16.1 Never Overstate Certainty

**How this is enforced:**

- The scoring model has a mathematical ceiling of 0.90 for the raw score before penalties — Atlas physically cannot compute a score of 1.00 under any conditions
- Every assumption and gap reduces the score — there is no way to report a high confidence score while hiding assumptions or gaps
- The `confidenceScore` field in `ConfidenceAssessment` is computed on the backend, never on the frontend
- Any deviation between the displayed confidence and the backend-computed confidence is a system error, not a valid state
- `frameworkVersion` is stored with every assessment — if the scoring model changes, historical assessments can be recomputed for comparison

---

### 16.2 Separate Facts from Assumptions

**How this is enforced:**

- Every `AssumptionRecord` is explicitly typed and disclosed — there is no anonymous assumption
- Evidence items sourced from inference are tagged as `directness: "inferred"` and automatically generate an `AssumptionRecord` of type `INFERRED`
- The `assumptionsMade` array is always populated even if empty — an empty array is a positive signal, not a missing field
- The engineering requirement is that the `AssumptionRecord[]` and `GapRecord[]` arrays must be complete and accurate at time of assessment generation; incomplete arrays are invalid

---

### 16.3 Explain WHY Confidence Is High or Low

**How this is enforced:**

- Every `ConfidenceAssessment` must include a non-empty `evidenceSummary` string — a human-readable explanation of what was found and why the score is what it is
- The `reviewReason` field is required whenever `requiresFounderReview: true` — it cannot be null in that state
- `subScores` are included in every assessment so founders and engineers can inspect which dimension drove the score
- Assessments that lack a human-readable explanation are invalid by framework specification

---

### 16.4 Be Provider Independent

**How this is enforced:**

- Source reliability tiers are assigned by source type (e.g., "USPTO patent database"), not by the provider API used to access it
- The confidence scoring logic must not contain any references to specific provider names in its tier assignments
- Changing from Provider A to Provider B for patent data does not change the reliability tier of the retrieved data — the tier follows the data origin
- Provider-specific metadata (API version, response quality flags) is stored separately and does not directly enter the confidence formula

---

### 16.5 Support Future AI Improvements

**How this is enforced:**

- `frameworkVersion` is stored on every `ConfidenceAssessment` as a string (e.g., `"1.0"`)
- When the scoring model is updated, the new version gets a new version string
- Historical assessments retain their original `frameworkVersion` and `confidenceScore` — they are not retroactively updated
- Recomputation of historical assessments at the new version is possible by re-running the scoring formula against stored inputs
- The scoring model is fully deterministic — given the same inputs, the same score is always produced; this allows meaningful before/after comparison across framework versions

---

### 16.6 Remain Transparent

**How this is enforced:**

- Every factor that contributed to the final score is present in the `ConfidenceAssessment` object and inspectable by the founder
- There are no hidden weighting factors, secret adjustments, or black-box components in the scoring model
- The sub-score weights (defined in Section 13.8) are versioned and documented in this framework document — they are not configuration values that can be changed without a version bump
- Founders can always trace a confidence score to its component inputs by reading the `subScores`, `assumptionsMade`, `missingInformation`, `conflictsDetected`, and `sourcesConsulted` fields

---

### 16.7 Follow Atlas Owns Execution

**How this is enforced:**

- Confidence scoring runs entirely on the Atlas backend
- No confidence logic — scoring formulas, tier assignments, penalty calculations — may be implemented in frontend code
- The frontend receives a complete, pre-computed `ConfidenceAssessment` object from the backend and renders it
- If the frontend needs to filter or display assessments by confidence level, it does so by reading the `confidenceLevel` string from the object — not by computing a score client-side

---

### 16.8 Support Auditability

**How this is enforced:**

- Every `ConfidenceAssessment` is stored with its full input set at generation time: all `SourceRecord[]`, `AssumptionRecord[]`, `GapRecord[]`, `ConflictRecord[]`, and `subScores`
- Stored assessments are never deleted — they are append-only
- If a research run is re-executed, the new assessment is a new record; the previous assessment is not modified
- Manual overrides are stored as `ManualOverrideRecord` entries that reference the original assessment but do not modify it
- The `generatedAt` timestamp and `frameworkVersion` on every assessment make it possible to reconstruct exactly what was known and what model was used at any point in time

---

*End of ATLAS CONFIDENCE FRAMEWORK — Version 1.0*
*Issued: July 2026*
*Scope: Universal — applies to all Atlas research subsystems*
*Status: Active*
